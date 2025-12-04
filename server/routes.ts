import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { insertReviewSchema, insertLeadSchema, insertSavedComparisonSchema } from "@shared/schema";
import { randomBytes } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.patch("/api/users/me", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const { preferences } = req.body;
      const user = await storage.updateUser(userId, { notificationPreferences: preferences });
      res.json(user);
    } catch (error) {
      console.error("Error updating notifications:", error);
      res.status(500).json({ message: "Failed to update notifications" });
    }
  });

  app.delete("/api/users/me", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteUser(userId);
      req.logout(() => {
        res.json({ message: "Account deleted" });
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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

      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating response:", error);
      res.status(500).json({ message: "Failed to create response" });
    }
  });

  app.post("/api/reviews/:id/report", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const brands = await storage.getBrandsByClaimedUser(userId);
      res.json({ brands });
    } catch (error) {
      console.error("Error fetching franchisor brands:", error);
      res.status(500).json({ message: "Failed to fetch brands" });
    }
  });

  app.get("/api/franchisor/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const moderatorId = req.user.claims.sub;

      const review = await storage.moderateReview(id, action, moderatorId, notes);
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

  const httpServer = createServer(app);
  return httpServer;
}
