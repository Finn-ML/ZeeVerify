import {
  users,
  sessions,
  brands,
  reviews,
  reviewResponses,
  reviewReports,
  leads,
  brandDocuments,
  wordFrequencies,
  savedComparisons,
  moderationLogs,
  payments,
  type User,
  type UpsertUser,
  type Brand,
  type InsertBrand,
  type Review,
  type InsertReview,
  type ReviewResponse,
  type InsertReviewResponse,
  type Lead,
  type InsertLead,
  type BrandDocument,
  type InsertBrandDocument,
  type SavedComparison,
  type InsertSavedComparison,
  type ReviewReport,
  type WordFrequency,
  type ModerationLog,
  type Payment,
  type InsertPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike, desc, asc, sql, inArray, count } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: Partial<UpsertUser>): Promise<User>;
  updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  getUsers(params: { search?: string; limit?: number; offset?: number }): Promise<{ users: User[]; total: number }>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByPasswordResetToken(token: string): Promise<User | undefined>;
  verifyUserEmail(userId: string): Promise<void>;
  updateVerificationToken(userId: string, token: string, expires: Date): Promise<void>;
  updatePasswordResetToken(userId: string, token: string, expires: Date): Promise<void>;
  clearPasswordResetToken(userId: string): Promise<void>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
  invalidateUserSessions(userId: string): Promise<void>;

  // Brand operations
  getBrand(id: string): Promise<Brand | undefined>;
  getBrandBySlug(slug: string): Promise<Brand | undefined>;
  getBrands(params: {
    search?: string;
    categories?: string[];
    ids?: string[];
    sortBy?: string;
    onlyVerified?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ brands: Brand[]; total: number }>;
  createBrand(brand: InsertBrand): Promise<Brand>;
  updateBrand(id: string, data: Partial<InsertBrand>): Promise<Brand | undefined>;
  getBrandsByClaimedUser(userId: string): Promise<Brand[]>;

  // Review operations
  getReview(id: string): Promise<Review | undefined>;
  getReviewsByBrand(brandId: string): Promise<Review[]>;
  getReviewsByUser(userId: string): Promise<Review[]>;
  getReviewsForModeration(status?: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, data: Partial<InsertReview>): Promise<Review | undefined>;
  moderateReview(id: string, action: string, moderatorId: string, notes?: string): Promise<Review | undefined>;

  // Review response operations
  getReviewResponses(reviewId: string): Promise<ReviewResponse[]>;
  createReviewResponse(response: InsertReviewResponse): Promise<ReviewResponse>;

  // Lead operations
  getLead(id: string): Promise<Lead | undefined>;
  getLeadsByBrand(brandId: string): Promise<Lead[]>;
  getLeadsForFranchisor(userId: string): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, data: Partial<InsertLead>): Promise<Lead | undefined>;

  // Document operations
  getDocumentsByBrand(brandId: string): Promise<BrandDocument[]>;
  createDocument(doc: InsertBrandDocument): Promise<BrandDocument>;

  // Comparison operations
  getSavedComparison(id: string): Promise<SavedComparison | undefined>;
  getSavedComparisonByToken(token: string): Promise<SavedComparison | undefined>;
  getSavedComparisonsByUser(userId: string): Promise<SavedComparison[]>;
  createSavedComparison(comparison: InsertSavedComparison): Promise<SavedComparison>;

  // Report operations
  getReports(status?: string): Promise<ReviewReport[]>;
  createReport(report: Partial<ReviewReport>): Promise<ReviewReport>;

  // Word frequency operations
  getWordFrequencies(brandId: string): Promise<WordFrequency[]>;

  // Payment operations
  getPaymentBySessionId(sessionId: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  claimBrand(brandId: string, userId: string): Promise<void>;

  // Stats
  getAdminStats(): Promise<{
    totalUsers: number;
    totalReviews: number;
    totalBrands: number;
    pendingModeration: number;
    newLeads: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.emailVerificationToken, token));
    return user;
  }

  async getUserByPasswordResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.passwordResetToken, token));
    return user;
  }

  async verifyUserEmail(userId: string): Promise<void> {
    await db
      .update(users)
      .set({
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async updateVerificationToken(userId: string, token: string, expires: Date): Promise<void> {
    await db
      .update(users)
      .set({
        emailVerificationToken: token,
        emailVerificationExpires: expires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async updatePasswordResetToken(userId: string, token: string, expires: Date): Promise<void> {
    await db
      .update(users)
      .set({
        passwordResetToken: token,
        passwordResetExpires: expires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    await db
      .update(users)
      .set({
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async invalidateUserSessions(userId: string): Promise<void> {
    // Delete all sessions for this user from the sessions table
    // Sessions store user ID in sess.passport.user
    await db.delete(sessions).where(
      sql`sess->'passport'->>'user' = ${userId}`
    );
  }

  async createUser(userData: Partial<UpsertUser>): Promise<User> {
    const [user] = await db.insert(users).values(userData as UpsertUser).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getUsers(params: { search?: string; limit?: number; offset?: number }): Promise<{ users: User[]; total: number }> {
    const { search, limit = 50, offset = 0 } = params;

    let query = db.select().from(users);

    if (search) {
      query = query.where(
        or(
          ilike(users.email, `%${search}%`),
          ilike(users.firstName, `%${search}%`),
          ilike(users.lastName, `%${search}%`)
        )
      ) as any;
    }

    const results = await query.limit(limit).offset(offset).orderBy(desc(users.createdAt));

    const [countResult] = await db.select({ count: count() }).from(users);

    return { users: results, total: countResult?.count || 0 };
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Brand operations
  async getBrand(id: string): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.id, id));
    return brand;
  }

  async getBrandBySlug(slug: string): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.slug, slug));
    return brand;
  }

  async getBrands(params: {
    search?: string;
    categories?: string[];
    ids?: string[];
    sortBy?: string;
    onlyVerified?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ brands: Brand[]; total: number }> {
    const { search, categories, ids, sortBy = "z-score", onlyVerified, limit = 12, offset = 0 } = params;

    let conditions: any[] = [];

    if (search) {
      conditions.push(
        or(
          ilike(brands.name, `%${search}%`),
          ilike(brands.description, `%${search}%`)
        )
      );
    }

    if (categories && categories.length > 0) {
      conditions.push(inArray(brands.category, categories));
    }

    if (ids && ids.length > 0) {
      conditions.push(inArray(brands.id, ids));
    }

    if (onlyVerified) {
      conditions.push(eq(brands.isClaimed, true));
    }

    let orderBy: any;
    switch (sortBy) {
      case "rating":
        orderBy = desc(brands.averageRating);
        break;
      case "reviews":
        orderBy = desc(brands.totalReviews);
        break;
      case "newest":
        orderBy = desc(brands.createdAt);
        break;
      case "name":
        orderBy = asc(brands.name);
        break;
      default:
        orderBy = desc(brands.zScore);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select()
      .from(brands)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const [countResult] = await db
      .select({ count: count() })
      .from(brands)
      .where(whereClause);

    return { brands: results, total: countResult?.count || 0 };
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    const [newBrand] = await db.insert(brands).values(brand).returning();
    return newBrand;
  }

  async updateBrand(id: string, data: Partial<InsertBrand>): Promise<Brand | undefined> {
    const [brand] = await db
      .update(brands)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(brands.id, id))
      .returning();
    return brand;
  }

  async getBrandsByClaimedUser(userId: string): Promise<Brand[]> {
    return db.select().from(brands).where(eq(brands.claimedById, userId));
  }

  // Review operations
  async getReview(id: string): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }

  async getReviewsByBrand(brandId: string): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(and(eq(reviews.brandId, brandId), eq(reviews.status, "approved")))
      .orderBy(desc(reviews.createdAt));
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  async getReviewsForModeration(status: string = "pending"): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.status, status))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async updateReview(id: string, data: Partial<InsertReview>): Promise<Review | undefined> {
    const [review] = await db
      .update(reviews)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();
    return review;
  }

  async moderateReview(id: string, action: string, moderatorId: string, notes?: string): Promise<Review | undefined> {
    const review = await this.getReview(id);
    if (!review) return undefined;

    const newStatus = action === "approve" ? "approved" : "rejected";

    const [updated] = await db
      .update(reviews)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();

    // Log the moderation action
    await db.insert(moderationLogs).values({
      reviewId: id,
      moderatorId,
      action,
      previousStatus: review.status,
      newStatus,
      notes,
    });

    // Update brand scores if approved
    if (action === "approve" && review.brandId) {
      await this.recalculateBrandScores(review.brandId);
    }

    return updated;
  }

  private async recalculateBrandScores(brandId: string): Promise<void> {
    const brandReviews = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.brandId, brandId), eq(reviews.status, "approved")));

    if (brandReviews.length === 0) return;

    const avgOverall = brandReviews.reduce((acc, r) => acc + r.overallRating, 0) / brandReviews.length;
    const avgSupport = brandReviews.filter(r => r.supportRating).reduce((acc, r) => acc + (r.supportRating || 0), 0) / (brandReviews.filter(r => r.supportRating).length || 1);
    const avgTraining = brandReviews.filter(r => r.trainingRating).reduce((acc, r) => acc + (r.trainingRating || 0), 0) / (brandReviews.filter(r => r.trainingRating).length || 1);
    const avgProfitability = brandReviews.filter(r => r.profitabilityRating).reduce((acc, r) => acc + (r.profitabilityRating || 0), 0) / (brandReviews.filter(r => r.profitabilityRating).length || 1);
    const avgCulture = brandReviews.filter(r => r.cultureRating).reduce((acc, r) => acc + (r.cultureRating || 0), 0) / (brandReviews.filter(r => r.cultureRating).length || 1);

    // Z Score is weighted average
    const zScore = (avgOverall * 0.4 + avgSupport * 0.15 + avgTraining * 0.15 + avgProfitability * 0.15 + avgCulture * 0.15);

    await db
      .update(brands)
      .set({
        totalReviews: brandReviews.length,
        averageRating: avgOverall.toFixed(2),
        zScore: zScore.toFixed(2),
        supportScore: avgSupport.toFixed(2),
        trainingScore: avgTraining.toFixed(2),
        profitabilityScore: avgProfitability.toFixed(2),
        cultureScore: avgCulture.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(brands.id, brandId));
  }

  // Review response operations
  async getReviewResponses(reviewId: string): Promise<ReviewResponse[]> {
    return db
      .select()
      .from(reviewResponses)
      .where(eq(reviewResponses.reviewId, reviewId))
      .orderBy(desc(reviewResponses.createdAt));
  }

  async createReviewResponse(response: InsertReviewResponse): Promise<ReviewResponse> {
    const [newResponse] = await db.insert(reviewResponses).values(response).returning();
    return newResponse;
  }

  // Lead operations
  async getLead(id: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async getLeadsByBrand(brandId: string): Promise<Lead[]> {
    return db.select().from(leads).where(eq(leads.brandId, brandId)).orderBy(desc(leads.createdAt));
  }

  async getLeadsForFranchisor(userId: string): Promise<Lead[]> {
    const userBrands = await this.getBrandsByClaimedUser(userId);
    if (userBrands.length === 0) return [];

    const brandIds = userBrands.map(b => b.id);
    return db
      .select()
      .from(leads)
      .where(inArray(leads.brandId, brandIds))
      .orderBy(desc(leads.createdAt));
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).returning();
    return newLead;
  }

  async updateLead(id: string, data: Partial<InsertLead>): Promise<Lead | undefined> {
    const [lead] = await db
      .update(leads)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return lead;
  }

  // Document operations
  async getDocumentsByBrand(brandId: string): Promise<BrandDocument[]> {
    return db.select().from(brandDocuments).where(eq(brandDocuments.brandId, brandId));
  }

  async createDocument(doc: InsertBrandDocument): Promise<BrandDocument> {
    const [newDoc] = await db.insert(brandDocuments).values(doc).returning();
    return newDoc;
  }

  // Comparison operations
  async getSavedComparison(id: string): Promise<SavedComparison | undefined> {
    const [comparison] = await db.select().from(savedComparisons).where(eq(savedComparisons.id, id));
    return comparison;
  }

  async getSavedComparisonByToken(token: string): Promise<SavedComparison | undefined> {
    const [comparison] = await db.select().from(savedComparisons).where(eq(savedComparisons.shareToken, token));
    return comparison;
  }

  async getSavedComparisonsByUser(userId: string): Promise<SavedComparison[]> {
    return db.select().from(savedComparisons).where(eq(savedComparisons.userId, userId));
  }

  async createSavedComparison(comparison: InsertSavedComparison): Promise<SavedComparison> {
    const [newComparison] = await db.insert(savedComparisons).values(comparison).returning();
    return newComparison;
  }

  // Report operations
  async getReports(status?: string): Promise<ReviewReport[]> {
    if (status) {
      return db.select().from(reviewReports).where(eq(reviewReports.status, status)).orderBy(desc(reviewReports.createdAt));
    }
    return db.select().from(reviewReports).orderBy(desc(reviewReports.createdAt));
  }

  async createReport(report: Partial<ReviewReport>): Promise<ReviewReport> {
    const [newReport] = await db.insert(reviewReports).values(report as any).returning();
    return newReport;
  }

  // Word frequency operations
  async getWordFrequencies(brandId: string): Promise<WordFrequency[]> {
    return db
      .select()
      .from(wordFrequencies)
      .where(eq(wordFrequencies.brandId, brandId))
      .orderBy(desc(wordFrequencies.count))
      .limit(20);
  }

  // Payment operations
  async getPaymentBySessionId(sessionId: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.stripeSessionId, sessionId));
    return payment;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async claimBrand(brandId: string, userId: string): Promise<void> {
    await db
      .update(brands)
      .set({
        isClaimed: true,
        claimedById: userId,
        claimedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(brands.id, brandId));
  }

  // Stats
  async getAdminStats(): Promise<{
    totalUsers: number;
    totalReviews: number;
    totalBrands: number;
    pendingModeration: number;
    newLeads: number;
  }> {
    const [usersCount] = await db.select({ count: count() }).from(users);
    const [reviewsCount] = await db.select({ count: count() }).from(reviews);
    const [brandsCount] = await db.select({ count: count() }).from(brands);
    const [pendingCount] = await db.select({ count: count() }).from(reviews).where(eq(reviews.status, "pending"));
    const [leadsCount] = await db.select({ count: count() }).from(leads).where(eq(leads.status, "new"));

    return {
      totalUsers: usersCount?.count || 0,
      totalReviews: reviewsCount?.count || 0,
      totalBrands: brandsCount?.count || 0,
      pendingModeration: pendingCount?.count || 0,
      newLeads: leadsCount?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
