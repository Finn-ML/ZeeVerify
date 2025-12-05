import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  jsonb,
  decimal,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Passport.js session management
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User types enum
export const UserRole = {
  BROWSER: "browser",
  FRANCHISEE: "franchisee",
  FRANCHISOR: "franchisor",
  ADMIN: "admin",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// Verification status enum
export const VerificationStatus = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;

export type VerificationStatusType = (typeof VerificationStatus)[keyof typeof VerificationStatus];

// Review status enum
export const ReviewStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  FLAGGED: "flagged",
} as const;

export type ReviewStatusType = (typeof ReviewStatus)[keyof typeof ReviewStatus];

// Moderation category enum
export const ModerationCategory = {
  CLEAN: "clean",
  NEEDS_REVIEW: "needs_review",
  REJECTED: "rejected",
} as const;

export type ModerationCategoryType = (typeof ModerationCategory)[keyof typeof ModerationCategory];

// Users table (extended for local auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 20 }).default("browser").notNull(),
  isVerified: boolean("is_verified").default(false),
  verificationStatus: varchar("verification_status", { length: 20 }).default("pending"),
  notificationPreferences: jsonb("notification_preferences").default({}),
  // Authentication columns
  passwordHash: varchar("password_hash", { length: 255 }),
  emailVerified: boolean("email_verified").default(false).notNull(),
  emailVerificationToken: varchar("email_verification_token", { length: 255 }),
  emailVerificationExpires: timestamp("email_verification_expires"),
  passwordResetToken: varchar("password_reset_token", { length: 255 }),
  passwordResetExpires: timestamp("password_reset_expires"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Franchise brands table
export const brands = pgTable("brands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  logoUrl: varchar("logo_url"),
  bannerUrl: varchar("banner_url"),
  website: varchar("website"),
  category: varchar("category", { length: 100 }),
  industry: varchar("industry", { length: 100 }),
  yearFounded: integer("year_founded"),
  headquarters: varchar("headquarters"),
  franchiseFee: decimal("franchise_fee", { precision: 12, scale: 2 }),
  totalInvestmentMin: decimal("total_investment_min", { precision: 12, scale: 2 }),
  totalInvestmentMax: decimal("total_investment_max", { precision: 12, scale: 2 }),
  unitCount: integer("unit_count"),
  isClaimed: boolean("is_claimed").default(false),
  claimedById: varchar("claimed_by_id").references(() => users.id),
  zScore: decimal("z_score", { precision: 4, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  supportScore: decimal("support_score", { precision: 3, scale: 2 }),
  trainingScore: decimal("training_score", { precision: 3, scale: 2 }),
  profitabilityScore: decimal("profitability_score", { precision: 3, scale: 2 }),
  cultureScore: decimal("culture_score", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  brandId: varchar("brand_id").references(() => brands.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  overallRating: integer("overall_rating").notNull(),
  supportRating: integer("support_rating"),
  trainingRating: integer("training_rating"),
  profitabilityRating: integer("profitability_rating"),
  cultureRating: integer("culture_rating"),
  yearsAsFranchisee: integer("years_as_franchisee"),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  moderationCategory: varchar("moderation_category", { length: 20 }).default("pending"),
  sentiment: varchar("sentiment", { length: 20 }),
  sentimentScore: decimal("sentiment_score", { precision: 3, scale: 2 }),
  aiFlags: jsonb("ai_flags").default([]),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Review responses from franchisors
export const reviewResponses = pgTable("review_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewId: varchar("review_id").references(() => reviews.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Report flags for reviews
export const reviewReports = pgTable("review_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewId: varchar("review_id").references(() => reviews.id).notNull(),
  reporterId: varchar("reporter_id").references(() => users.id).notNull(),
  reason: varchar("reason", { length: 100 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Leads table
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  brandId: varchar("brand_id").references(() => brands.id).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  investmentRange: varchar("investment_range", { length: 100 }),
  timeline: varchar("timeline", { length: 100 }),
  message: text("message"),
  status: varchar("status", { length: 20 }).default("new").notNull(),
  source: varchar("source", { length: 50 }).default("website"),
  routedTo: varchar("routed_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Brand documents (for franchisor uploads)
export const brandDocuments = pgTable("brand_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  brandId: varchar("brand_id").references(() => brands.id).notNull(),
  uploadedById: varchar("uploaded_by_id").references(() => users.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  url: varchar("url").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Word frequency tracking for reviews
export const wordFrequencies = pgTable("word_frequencies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  brandId: varchar("brand_id").references(() => brands.id).notNull(),
  word: varchar("word", { length: 100 }).notNull(),
  count: integer("count").default(1).notNull(),
  sentiment: varchar("sentiment", { length: 20 }),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Saved comparisons
export const savedComparisons = pgTable("saved_comparisons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name", { length: 255 }),
  brandIds: jsonb("brand_ids").notNull(),
  shareToken: varchar("share_token", { length: 64 }).unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Moderation log
export const moderationLogs = pgTable("moderation_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewId: varchar("review_id").references(() => reviews.id),
  moderatorId: varchar("moderator_id").references(() => users.id).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  previousStatus: varchar("previous_status", { length: 20 }),
  newStatus: varchar("new_status", { length: 20 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  reviews: many(reviews),
  reviewResponses: many(reviewResponses),
  claimedBrands: many(brands),
  leads: many(leads),
  savedComparisons: many(savedComparisons),
}));

export const brandsRelations = relations(brands, ({ one, many }) => ({
  claimedBy: one(users, {
    fields: [brands.claimedById],
    references: [users.id],
  }),
  reviews: many(reviews),
  leads: many(leads),
  documents: many(brandDocuments),
  wordFrequencies: many(wordFrequencies),
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  brand: one(brands, {
    fields: [reviews.brandId],
    references: [brands.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  responses: many(reviewResponses),
  reports: many(reviewReports),
}));

export const reviewResponsesRelations = relations(reviewResponses, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewResponses.reviewId],
    references: [reviews.id],
  }),
  user: one(users, {
    fields: [reviewResponses.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBrandSchema = createInsertSchema(brands).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewResponseSchema = createInsertSchema(reviewResponses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBrandDocumentSchema = createInsertSchema(brandDocuments).omit({
  id: true,
  createdAt: true,
});

export const insertSavedComparisonSchema = createInsertSchema(savedComparisons).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type ReviewResponse = typeof reviewResponses.$inferSelect;
export type InsertReviewResponse = z.infer<typeof insertReviewResponseSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type BrandDocument = typeof brandDocuments.$inferSelect;
export type InsertBrandDocument = z.infer<typeof insertBrandDocumentSchema>;
export type SavedComparison = typeof savedComparisons.$inferSelect;
export type InsertSavedComparison = z.infer<typeof insertSavedComparisonSchema>;
export type ReviewReport = typeof reviewReports.$inferSelect;
export type WordFrequency = typeof wordFrequencies.$inferSelect;
export type ModerationLog = typeof moderationLogs.$inferSelect;

// Authentication validation schemas
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  userType: z.enum(["franchisee", "franchisor"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
