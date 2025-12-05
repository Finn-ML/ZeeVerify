import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupLocalAuth, isAuthenticated, isAdmin, passport } from "./localAuth";
import { insertReviewSchema, insertLeadSchema, insertSavedComparisonSchema, registerSchema } from "@shared/schema";
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import { z } from "zod";
import { emailService } from "./services/email";
import { stripeService } from "./services/stripe";
import type Stripe from "stripe";

// Security constants
const BCRYPT_ROUNDS = 12;

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - session and passport setup
  await setupLocalAuth(app);

  // Registration route
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);

      // Check if email exists
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

      // Generate verification token
      const verificationToken = randomBytes(32).toString("base64url");
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user
      const user = await storage.createUser({
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.userType,
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      });

      // Send verification email
      await emailService.sendVerificationEmail(data.email, verificationToken);

      res.status(201).json({ message: "Registration successful. Please check your email." });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login route
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        // Check if unverified
        if (info?.message === "unverified") {
          return res.status(403).json({
            message: "Please verify your email before logging in",
            code: "UNVERIFIED",
          });
        }
        return res.status(401).json({ message: info?.message || "Login failed" });
      }
      req.logIn(user, (err: any) => {
        if (err) {
          return next(err);
        }
        res.json({
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        });
      });
    })(req, res, next);
  });

  // Logout route
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          emailVerified: user.emailVerified,
          isVerified: user.isVerified,
          profileImageUrl: user.profileImageUrl,
          notificationPreferences: user.notificationPreferences || {
            reviewResponses: true,
            moderationOutcomes: true,
            marketingEmails: false,
          },
        },
      });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Email verification route
  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }

      const user = await storage.getUserByVerificationToken(token);

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification link" });
      }

      if (user.emailVerificationExpires && new Date() > user.emailVerificationExpires) {
        return res.status(400).json({ message: "Invalid or expired verification link" });
      }

      await storage.verifyUserEmail(user.id);

      // Send welcome email after successful verification
      if (user.email && user.firstName) {
        await emailService.sendWelcomeEmail(user.email, user.firstName);
      }

      res.json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Verification failed" });
    }
  });

  // Resend verification email route
  app.post("/api/auth/resend-verification", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);

      if (!user) {
        // Don't reveal if email exists - security best practice
        return res.json({ message: "If an account exists, a verification email will be sent" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }

      // Rate limit check (1 per 5 minutes based on when token was created)
      if (user.emailVerificationExpires) {
        const tokenCreatedAt = new Date(user.emailVerificationExpires.getTime() - 24 * 60 * 60 * 1000);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (tokenCreatedAt > fiveMinutesAgo) {
          return res.status(429).json({ message: "Please wait before requesting another email" });
        }
      }

      // Generate new token
      const newToken = randomBytes(32).toString("base64url");
      const newExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await storage.updateVerificationToken(user.id, newToken, newExpires);
      await emailService.sendVerificationEmail(user.email!, newToken);

      res.json({ message: "Verification email sent" });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  });

  // Rate limit tracking for password reset
  // WARNING: In-memory Map - resets on server restart and doesn't work with multiple instances
  // TODO: For production horizontal scaling, migrate to Redis or database-backed rate limiting
  const resetAttempts = new Map<string, { count: number; lastAttempt: Date }>();

  // Forgot password route
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Rate limit: 3 requests per hour per email
      const attempts = resetAttempts.get(email);
      if (attempts) {
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (attempts.lastAttempt > hourAgo && attempts.count >= 3) {
          return res.status(429).json({ message: "Too many reset attempts. Please try again later." });
        }
        // Reset counter if over an hour
        if (attempts.lastAttempt <= hourAgo) {
          resetAttempts.delete(email);
        }
      }

      const user = await storage.getUserByEmail(email);

      if (user && user.email) {
        const resetToken = randomBytes(32).toString("base64url");
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await storage.updatePasswordResetToken(user.id, resetToken, resetExpires);
        await emailService.sendPasswordResetEmail(user.email, resetToken);

        // Track attempt
        const current = resetAttempts.get(email) || { count: 0, lastAttempt: new Date() };
        resetAttempts.set(email, { count: current.count + 1, lastAttempt: new Date() });
      }

      // Always return success (don't reveal if email exists)
      res.json({ message: "If an account exists, you'll receive a reset email" });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  // Reset password route
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }

      const user = await storage.getUserByPasswordResetToken(token);

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset link" });
      }

      if (user.passwordResetExpires && new Date() > user.passwordResetExpires) {
        return res.status(400).json({ message: "Invalid or expired reset link" });
      }

      // Validate password strength
      const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: "Password does not meet requirements" });
      }

      // Hash and update password
      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      await storage.updatePassword(user.id, passwordHash);
      await storage.clearPasswordResetToken(user.id);

      // Invalidate all existing sessions for security
      await storage.invalidateUserSessions(user.id);

      // Mark email as verified since user proved ownership via reset link
      if (!user.emailVerified) {
        await storage.verifyUserEmail(user.id);
      }

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // User routes
  app.patch("/api/users/me", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName } = req.body;
      const user = await storage.updateUser(userId, { firstName, lastName });
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.patch("/api/users/me/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { preferences } = req.body;
      const user = await storage.updateUser(userId, { notificationPreferences: preferences });
      res.json(user);
    } catch (error) {
      console.error("Error updating notifications:", error);
      res.status(500).json({ message: "Failed to update notifications" });
    }
  });

  // Account deletion with soft delete
  app.delete("/api/users/me", isAuthenticated, async (req: any, res) => {
    try {
      const { password } = req.body;
      const userId = req.user.id;

      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }

      // Get current user
      const user = await storage.getUser(userId);
      if (!user || !user.passwordHash) {
        return res.status(400).json({ message: "Invalid account state" });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(400).json({ message: "Password incorrect" });
      }

      // Soft delete user (set deletedAt, anonymize PII)
      await storage.softDeleteUser(userId);

      // Release brand claims
      await storage.releaseUserBrandClaims(userId);

      // Invalidate all sessions
      await storage.invalidateUserSessions(userId);

      // Destroy current session
      req.logout((err: any) => {
        if (err) {
          console.error("Logout error during deletion:", err);
        }
        req.session.destroy((err: any) => {
          if (err) {
            console.error("Session destroy error:", err);
          }
          res.json({ message: "Account deleted successfully" });
        });
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Email change routes
  app.post("/api/user/change-email", isAuthenticated, async (req: any, res) => {
    try {
      const { newEmail, currentPassword } = req.body;
      const userId = req.user.id;

      if (!newEmail || !currentPassword) {
        return res.status(400).json({ message: "New email and current password are required" });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Get current user
      const user = await storage.getUser(userId);
      if (!user || !user.passwordHash) {
        return res.status(400).json({ message: "Invalid account state" });
      }

      // Check if same as current email (case-insensitive)
      if (user.email?.toLowerCase() === newEmail.toLowerCase()) {
        return res.status(400).json({ message: "New email must be different from current email" });
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Check if email already exists
      const existing = await storage.getUserByEmail(newEmail);
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // Generate verification token
      const token = randomBytes(32).toString("base64url");
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store pending email change
      await storage.setPendingEmail(userId, newEmail, token, expires);

      // Send verification to new email
      await emailService.sendEmailChangeVerification(newEmail, token);

      res.json({ message: "Verification email sent", newEmail });
    } catch (error) {
      console.error("Error changing email:", error);
      res.status(500).json({ message: "Failed to initiate email change" });
    }
  });

  app.post("/api/user/verify-new-email", async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }

      const user = await storage.getUserByPendingEmailToken(token);
      if (!user || !user.pendingEmail) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      if (user.pendingEmailExpires && new Date() > user.pendingEmailExpires) {
        return res.status(400).json({ message: "Token expired" });
      }

      const oldEmail = user.email;
      const newEmail = user.pendingEmail;

      // Update email
      await storage.confirmEmailChange(user.id, newEmail);

      // Notify old email (security)
      if (oldEmail) {
        await emailService.sendEmailChangedNotification(oldEmail, newEmail);
      }

      res.json({ message: "Email changed successfully" });
    } catch (error) {
      console.error("Error verifying new email:", error);
      res.status(500).json({ message: "Failed to verify email change" });
    }
  });

  // Password change route
  app.post("/api/user/change-password", isAuthenticated, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new password are required" });
      }

      // Get current user
      const user = await storage.getUser(userId);
      if (!user || !user.passwordHash) {
        return res.status(400).json({ message: "Invalid account state" });
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Validate new password strength
      const hasUppercase = /[A-Z]/.test(newPassword);
      const hasNumber = /[0-9]/.test(newPassword);
      const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
      const hasMinLength = newPassword.length >= 8;

      if (!hasMinLength || !hasUppercase || !hasNumber || !hasSpecial) {
        return res.status(400).json({
          message: "Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character"
        });
      }

      // Ensure new password is different
      const isSame = await bcrypt.compare(newPassword, user.passwordHash);
      if (isSame) {
        return res.status(400).json({ message: "New password must be different from current password" });
      }

      // Hash and save new password
      const newHash = await bcrypt.hash(newPassword, 12);
      await storage.updatePassword(userId, newHash);

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Brand routes
  app.get("/api/brands", async (req, res) => {
    try {
      const {
        search,
        categories,
        ids,
        sortBy,
        onlyVerified,
        page = "1",
        limit = "12",
      } = req.query;

      const result = await storage.getBrands({
        search: search as string,
        categories: categories ? (categories as string).split(",") : undefined,
        ids: ids ? (ids as string).split(",") : undefined,
        sortBy: sortBy as string,
        onlyVerified: onlyVerified === "true",
        limit: parseInt(limit as string),
        offset: (parseInt(page as string) - 1) * parseInt(limit as string),
      });

      res.json(result);
    } catch (error) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ message: "Failed to fetch brands" });
    }
  });

  app.get("/api/brands/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const brand = await storage.getBrandBySlug(slug);

      if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
      }

      const reviews = await storage.getReviewsByBrand(brand.id);
      const wordFrequencies = await storage.getWordFrequencies(brand.id);

      // Get user info for each review
      const reviewsWithUsers = await Promise.all(
        reviews.map(async (review) => {
          const user = await storage.getUser(review.userId);
          const responses = await storage.getReviewResponses(review.id);
          const responsesWithUsers = await Promise.all(
            responses.map(async (resp) => {
              const respUser = await storage.getUser(resp.userId);
              return { ...resp, user: respUser };
            })
          );
          return { ...review, user, responses: responsesWithUsers };
        })
      );

      res.json({ brand, reviews: reviewsWithUsers, wordFrequencies });
    } catch (error) {
      console.error("Error fetching brand:", error);
      res.status(500).json({ message: "Failed to fetch brand" });
    }
  });

  // Review routes
  app.post("/api/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const reviewData = insertReviewSchema.parse({ ...req.body, userId });

      // All reviews go to pending for manual moderation
      const review = await storage.createReview({
        ...reviewData,
        status: "pending",
        moderationCategory: "needs_review",
      });

      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.post("/api/reviews/:id/respond", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { content } = req.body;

      const review = await storage.getReview(id);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      // Verify user is franchisor of this brand
      const user = await storage.getUser(userId);
      if (!user || user.role !== "franchisor") {
        return res.status(403).json({ message: "Only franchisors can respond" });
      }

      const response = await storage.createReviewResponse({
        reviewId: id,
        userId,
        content,
        status: "pending",
      });

      // Send notification to review author about the response
      if (review.userId) {
        const author = await storage.getUser(review.userId);
        const brand = review.brandId ? await storage.getBrand(review.brandId) : null;

        if (author && author.email && brand) {
          // Check notification preferences - default to true if not explicitly false
          const prefs = author.notificationPreferences as { reviewResponses?: boolean } | null;

          if (prefs?.reviewResponses !== false) {
            emailService.sendResponseNotification(
              author.email,
              brand.name,
              content,
              brand.slug
            ).catch(err => console.error("Failed to send response notification:", err));
          }
        }
      }

      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating response:", error);
      res.status(500).json({ message: "Failed to create response" });
    }
  });

  app.post("/api/reviews/:id/report", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { reason, description } = req.body;

      const report = await storage.createReport({
        reviewId: id,
        reporterId: userId,
        reason,
        description,
        status: "pending",
      });

      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  // Lead routes
  app.post("/api/leads", async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData);
      res.status(201).json(lead);
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  // Comparison routes
  app.post("/api/comparisons", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { name, brandIds } = req.body;

      const shareToken = randomBytes(32).toString("hex");

      const comparison = await storage.createSavedComparison({
        userId,
        name,
        brandIds,
        shareToken,
      });

      res.status(201).json(comparison);
    } catch (error) {
      console.error("Error creating comparison:", error);
      res.status(500).json({ message: "Failed to create comparison" });
    }
  });

  app.get("/api/comparisons/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const comparison = await storage.getSavedComparisonByToken(token);

      if (!comparison) {
        return res.status(404).json({ message: "Comparison not found" });
      }

      const brandIds = comparison.brandIds as string[];
      const { brands } = await storage.getBrands({ ids: brandIds });

      res.json({ comparison, brands });
    } catch (error) {
      console.error("Error fetching comparison:", error);
      res.status(500).json({ message: "Failed to fetch comparison" });
    }
  });

  // Franchisee portal routes
  app.get("/api/franchisee/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const reviews = await storage.getReviewsByUser(userId);

      const reviewsWithResponses = await Promise.all(
        reviews.map(async (review) => {
          const responses = await storage.getReviewResponses(review.id);
          return { ...review, responses };
        })
      );

      res.json({ reviews: reviewsWithResponses });
    } catch (error) {
      console.error("Error fetching franchisee reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Franchisor portal routes
  app.get("/api/franchisor/brands", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const brands = await storage.getBrandsByClaimedUser(userId);
      res.json({ brands });
    } catch (error) {
      console.error("Error fetching franchisor brands:", error);
      res.status(500).json({ message: "Failed to fetch brands" });
    }
  });

  app.get("/api/franchisor/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const brands = await storage.getBrandsByClaimedUser(userId);

      const allReviews = await Promise.all(
        brands.map((brand) => storage.getReviewsByBrand(brand.id))
      );

      const reviews = allReviews.flat();
      const reviewsWithUsers = await Promise.all(
        reviews.map(async (review) => {
          const user = await storage.getUser(review.userId);
          return { ...review, user };
        })
      );

      res.json({ reviews: reviewsWithUsers });
    } catch (error) {
      console.error("Error fetching franchisor reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get("/api/franchisor/leads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const leads = await storage.getLeadsForFranchisor(userId);
      res.json({ leads });
    } catch (error) {
      console.error("Error fetching franchisor leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { search, page = "1", limit = "50" } = req.query;
      const result = await storage.getUsers({
        search: search as string,
        limit: parseInt(limit as string),
        offset: (parseInt(page as string) - 1) * parseInt(limit as string),
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id/role", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const user = await storage.updateUserRole(id, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.get("/api/admin/reviews", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { status = "pending" } = req.query;
      const reviews = await storage.getReviewsForModeration(status as string);

      const reviewsWithUsers = await Promise.all(
        reviews.map(async (review) => {
          const user = await storage.getUser(review.userId);
          return { ...review, user };
        })
      );

      res.json({ reviews: reviewsWithUsers });
    } catch (error) {
      console.error("Error fetching reviews for moderation:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/admin/reviews/:id/moderate", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { action, notes } = req.body;
      const moderatorId = req.user.id;

      // Get review before moderation to access brandId and content
      const reviewBefore = await storage.getReview(id);
      if (!reviewBefore) {
        return res.status(404).json({ message: "Review not found" });
      }

      const review = await storage.moderateReview(id, action, moderatorId, notes);

      // Get brand info for notifications
      const brand = reviewBefore.brandId ? await storage.getBrand(reviewBefore.brandId) : null;

      // Send notifications based on action
      if (action === "approve") {
        // Notify franchisor if brand is claimed
        if (brand?.isClaimed && brand.claimedById) {
          const franchisor = await storage.getUser(brand.claimedById);

          if (franchisor && franchisor.email) {
            const prefs = franchisor.notificationPreferences as { reviewResponses?: boolean } | null;

            if (prefs?.reviewResponses !== false) {
              emailService.sendNewReviewNotification(
                franchisor.email,
                brand.name,
                reviewBefore.content || '',
                reviewBefore.overallRating,
                brand.slug
              ).catch(err => console.error("Failed to send new review notification:", err));
            }
          }
        }

        // Notify review author of approval
        if (reviewBefore.userId) {
          const author = await storage.getUser(reviewBefore.userId);

          if (author && author.email) {
            const prefs = author.notificationPreferences as { moderationOutcomes?: boolean } | null;

            if (prefs?.moderationOutcomes !== false) {
              emailService.sendReviewApprovedEmail(
                author.email,
                brand?.name || 'Unknown Brand',
                brand?.slug || ''
              ).catch(err => console.error("Failed to send review approved email:", err));
            }
          }
        }
      } else if (action === "reject") {
        // Notify review author of rejection
        if (reviewBefore.userId) {
          const author = await storage.getUser(reviewBefore.userId);

          if (author && author.email) {
            const prefs = author.notificationPreferences as { moderationOutcomes?: boolean } | null;

            if (prefs?.moderationOutcomes !== false) {
              emailService.sendReviewRejectedEmail(
                author.email,
                brand?.name || 'Unknown Brand',
                notes || 'Your review did not meet our community guidelines.'
              ).catch(err => console.error("Failed to send review rejected email:", err));
            }
          }
        }
      }

      res.json(review);
    } catch (error) {
      console.error("Error moderating review:", error);
      res.status(500).json({ message: "Failed to moderate review" });
    }
  });

  app.get("/api/admin/reports", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      const reports = await storage.getReports(status as string);
      res.json({ reports });
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  // Stripe Checkout routes
  app.post("/api/checkout/create-session", isAuthenticated, async (req: any, res) => {
    try {
      const { brandId } = req.body;
      const user = req.user;

      // Verify user is a franchisor
      if (user.role !== "franchisor") {
        return res.status(403).json({ message: "Only franchisors can claim brands" });
      }

      // Get brand
      const brand = await storage.getBrand(brandId);
      if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
      }

      if (brand.isClaimed) {
        return res.status(400).json({ message: "Brand is already claimed" });
      }

      // Check Stripe availability
      if (!stripeService.isAvailable()) {
        return res.status(503).json({ message: "Payment temporarily unavailable" });
      }

      // Create checkout session
      const baseUrl = process.env.BASE_URL || "http://localhost:5000";
      const session = await stripeService.createCheckoutSession({
        brandId: brand.id,
        brandName: brand.name,
        userId: user.id,
        userEmail: user.email,
        returnUrl: `${baseUrl}/franchisor/claim-success?session_id={CHECKOUT_SESSION_ID}`,
      });

      if (!session) {
        return res.status(500).json({ message: "Failed to create checkout session" });
      }

      res.json({ clientSecret: session.clientSecret });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.get("/api/checkout/verify-session", isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = req.query.session_id as string;
      const userId = req.user.id;

      if (!sessionId) {
        return res.status(400).json({ message: "Session ID required" });
      }

      // Verify session with Stripe
      const session = await stripeService.retrieveSession(sessionId);

      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      // Verify this session belongs to the current user
      if (session.metadata?.userId !== userId.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check if payment was successful
      if (session.payment_status !== "paid") {
        return res.status(400).json({ message: "Payment not completed" });
      }

      // Get brand info
      const brandId = session.metadata?.brandId || "0";
      const brand = await storage.getBrand(brandId);

      res.json({
        success: true,
        brandId,
        brandName: brand?.name || session.metadata?.brandName,
        amount: (session.amount_total || 0) / 100,
      });
    } catch (error) {
      console.error("Error verifying session:", error);
      res.status(500).json({ message: "Failed to verify session" });
    }
  });

  // Stripe Webhook handler
  app.post("/api/webhooks/stripe", async (req: any, res) => {
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      console.error("Webhook missing signature");
      return res.status(400).json({ message: "Missing signature" });
    }

    // Use rawBody from express.json verify callback
    const payload = req.rawBody as Buffer;
    if (!payload) {
      console.error("Webhook missing raw body");
      return res.status(400).json({ message: "Missing body" });
    }

    // Verify webhook signature
    const event = stripeService.constructWebhookEvent(payload, signature);

    if (!event) {
      console.error("Webhook signature verification failed");
      return res.status(400).json({ message: "Invalid signature" });
    }

    // Handle specific events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Extract metadata
        const brandId = session.metadata?.brandId || "0";
        const userId = session.metadata?.userId || "0";

        if (!brandId || brandId === "0" || !userId || userId === "0") {
          console.error("Webhook missing metadata:", session.id);
          return res.status(400).json({ message: "Invalid session metadata" });
        }

        // Idempotency check - has this payment already been processed?
        const existingPayment = await storage.getPaymentBySessionId(session.id);
        if (existingPayment) {
          console.log("Payment already processed:", session.id);
          return res.json({ received: true, status: "already_processed" });
        }

        try {
          // Record payment
          await storage.createPayment({
            userId,
            brandId,
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent as string,
            amount: session.amount_total || 0,
            currency: session.currency || "usd",
            status: "completed",
          });

          // Mark brand as claimed
          await storage.claimBrand(brandId, userId);

          // Send confirmation email using Story 5.4's payment confirmation method
          const user = await storage.getUser(userId);
          const brand = await storage.getBrand(brandId);

          if (user && brand && user.email) {
            // Note: receipt_url is not available on Checkout.Session, only on Charge
            // User can access receipt from Stripe's email or their Stripe customer portal
            emailService.sendPaymentConfirmation(
              user.email,
              brand.name,
              (session.amount_total || 0) / 100, // Convert cents to dollars
              session.id
            ).catch(err => console.error("Failed to send payment confirmation:", err));
          }

          console.log(`Brand ${brandId} claimed by user ${userId}`);
          return res.json({ received: true, status: "success" });
        } catch (error) {
          console.error("Error processing payment:", error);
          return res.status(500).json({ message: "Processing failed" });
        }
      }

      case "checkout.session.expired": {
        console.log("Checkout session expired:", event.data.object.id);
        return res.json({ received: true });
      }

      default: {
        console.log("Unhandled webhook event:", event.type);
        return res.json({ received: true });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
