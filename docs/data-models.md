# Data Models

> ZeeVerify PostgreSQL Database Schema (Drizzle ORM)

## Overview

The database uses Neon serverless PostgreSQL with Drizzle ORM for type-safe queries. All schema definitions are in `shared/schema.ts` with Zod validation via `drizzle-zod`.

## Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│   users     │────<│   reviews   │>────│     brands      │
└─────────────┘     └─────────────┘     └─────────────────┘
      │                   │                     │
      │                   │                     │
      ▼                   ▼                     ▼
┌─────────────┐     ┌─────────────────┐  ┌─────────────────┐
│   leads     │     │reviewResponses  │  │ brandDocuments  │
└─────────────┘     └─────────────────┘  └─────────────────┘
      │                   │                     │
      │                   │                     │
      ▼                   ▼                     ▼
┌─────────────────┐ ┌─────────────────┐  ┌─────────────────┐
│savedComparisons │ │ reviewReports   │  │ wordFrequencies │
└─────────────────┘ └─────────────────┘  └─────────────────┘
                          │
                          ▼
                   ┌─────────────────┐
                   │ moderationLogs  │
                   └─────────────────┘
```

---

## Tables

### sessions
Stores session data for Replit Auth (required for OIDC).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| sid | varchar | PRIMARY KEY | Session ID |
| sess | jsonb | NOT NULL | Session data |
| expire | timestamp | NOT NULL, INDEXED | Expiration time |

---

### users
User accounts supporting multiple roles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar | PRIMARY KEY, UUID default | User ID (from OIDC) |
| email | varchar | UNIQUE | User email |
| firstName | varchar | - | First name |
| lastName | varchar | - | Last name |
| profileImageUrl | varchar | - | Avatar URL |
| role | varchar(20) | DEFAULT 'browser' | browser/franchisee/franchisor/admin |
| isVerified | boolean | DEFAULT false | Identity verified |
| verificationStatus | varchar(20) | DEFAULT 'pending' | pending/verified/rejected |
| notificationPreferences | jsonb | DEFAULT {} | Email preferences |
| createdAt | timestamp | DEFAULT NOW() | Account creation |
| updatedAt | timestamp | DEFAULT NOW() | Last update |

**Roles Enum:**
- `browser` - Public user browsing directory
- `franchisee` - Verified franchise owner (can submit reviews)
- `franchisor` - Brand representative (can claim listings, respond)
- `admin` - Platform administrator (full access)

---

### brands
Franchise brand directory (~4,000 entries).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar | PRIMARY KEY, UUID | Brand ID |
| name | varchar(255) | NOT NULL | Brand name |
| slug | varchar(255) | NOT NULL, UNIQUE | URL-safe identifier |
| description | text | - | Brand description |
| logoUrl | varchar | - | Logo image URL |
| bannerUrl | varchar | - | Banner image URL |
| website | varchar | - | Official website |
| category | varchar(100) | - | Industry category |
| industry | varchar(100) | - | Industry sector |
| yearFounded | integer | - | Founding year |
| headquarters | varchar | - | HQ location |
| franchiseFee | decimal(12,2) | - | Initial franchise fee |
| totalInvestmentMin | decimal(12,2) | - | Min investment required |
| totalInvestmentMax | decimal(12,2) | - | Max investment required |
| unitCount | integer | - | Number of locations |
| isClaimed | boolean | DEFAULT false | Has franchisor claimed? |
| claimedById | varchar | FK → users.id | Claiming franchisor |
| zScore | decimal(4,2) | DEFAULT 0 | Proprietary rating (0-5) |
| totalReviews | integer | DEFAULT 0 | Approved review count |
| averageRating | decimal(3,2) | DEFAULT 0 | Average overall rating |
| supportScore | decimal(3,2) | - | Avg support rating |
| trainingScore | decimal(3,2) | - | Avg training rating |
| profitabilityScore | decimal(3,2) | - | Avg profitability rating |
| cultureScore | decimal(3,2) | - | Avg culture rating |
| createdAt | timestamp | DEFAULT NOW() | Record creation |
| updatedAt | timestamp | DEFAULT NOW() | Last update |

**Z Score Formula:**
```
zScore = (overallRating * 0.4) + (supportScore * 0.15) +
         (trainingScore * 0.15) + (profitabilityScore * 0.15) +
         (cultureScore * 0.15)
```

---

### reviews
Franchisee reviews of brands.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar | PRIMARY KEY, UUID | Review ID |
| brandId | varchar | FK → brands.id, NOT NULL | Target brand |
| userId | varchar | FK → users.id, NOT NULL | Review author |
| title | varchar(255) | NOT NULL | Review title |
| content | text | NOT NULL | Review body |
| overallRating | integer | NOT NULL | 1-5 stars |
| supportRating | integer | - | Franchisor support |
| trainingRating | integer | - | Training quality |
| profitabilityRating | integer | - | Financial viability |
| cultureRating | integer | - | Corporate culture |
| yearsAsFranchisee | integer | - | Experience duration |
| status | varchar(20) | DEFAULT 'pending' | pending/approved/rejected/flagged |
| moderationCategory | varchar(20) | DEFAULT 'pending' | Moderation state |
| sentiment | varchar(20) | - | AI sentiment (future) |
| sentimentScore | decimal(3,2) | - | Sentiment confidence |
| aiFlags | jsonb | DEFAULT [] | AI moderation flags |
| isVerified | boolean | DEFAULT false | Verified franchisee |
| createdAt | timestamp | DEFAULT NOW() | Submission time |
| updatedAt | timestamp | DEFAULT NOW() | Last update |

**Review Status Flow:**
```
pending → approved (published)
        → rejected (with notes)
        → flagged (reported content)
```

---

### reviewResponses
Franchisor responses to reviews.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar | PRIMARY KEY, UUID | Response ID |
| reviewId | varchar | FK → reviews.id, NOT NULL | Parent review |
| userId | varchar | FK → users.id, NOT NULL | Responding franchisor |
| content | text | NOT NULL | Response text |
| status | varchar(20) | DEFAULT 'pending' | Moderation status |
| createdAt | timestamp | DEFAULT NOW() | Creation time |
| updatedAt | timestamp | DEFAULT NOW() | Last update |

---

### reviewReports
User-submitted reports for inappropriate content.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar | PRIMARY KEY, UUID | Report ID |
| reviewId | varchar | FK → reviews.id, NOT NULL | Reported review |
| reporterId | varchar | FK → users.id, NOT NULL | Reporting user |
| reason | varchar(100) | NOT NULL | Report category |
| description | text | - | Additional details |
| status | varchar(20) | DEFAULT 'pending' | Resolution status |
| createdAt | timestamp | DEFAULT NOW() | Report time |
| resolvedAt | timestamp | - | Resolution time |

---

### leads
Prospective buyer inquiries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar | PRIMARY KEY, UUID | Lead ID |
| brandId | varchar | FK → brands.id, NOT NULL | Interested brand |
| firstName | varchar(100) | NOT NULL | Contact first name |
| lastName | varchar(100) | NOT NULL | Contact last name |
| email | varchar(255) | NOT NULL | Contact email |
| phone | varchar(50) | - | Contact phone |
| investmentRange | varchar(100) | - | Budget range |
| timeline | varchar(100) | - | Purchase timeline |
| message | text | - | Custom message |
| status | varchar(20) | DEFAULT 'new' | new/contacted/qualified/closed |
| source | varchar(50) | DEFAULT 'website' | Lead origin |
| routedTo | varchar | FK → users.id | Assigned franchisor |
| createdAt | timestamp | DEFAULT NOW() | Submission time |
| updatedAt | timestamp | DEFAULT NOW() | Last update |

---

### brandDocuments
Franchisor-uploaded supporting documents.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar | PRIMARY KEY, UUID | Document ID |
| brandId | varchar | FK → brands.id, NOT NULL | Parent brand |
| uploadedById | varchar | FK → users.id, NOT NULL | Uploader |
| name | varchar(255) | NOT NULL | File name |
| type | varchar(50) | NOT NULL | Document type |
| url | varchar | NOT NULL | Storage URL |
| description | text | - | Document description |
| createdAt | timestamp | DEFAULT NOW() | Upload time |

---

### wordFrequencies
Review text analysis for brand insights.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar | PRIMARY KEY, UUID | Record ID |
| brandId | varchar | FK → brands.id, NOT NULL | Parent brand |
| word | varchar(100) | NOT NULL | Extracted term |
| count | integer | DEFAULT 1, NOT NULL | Occurrence count |
| sentiment | varchar(20) | - | Word sentiment |
| lastUpdated | timestamp | DEFAULT NOW() | Last calculation |

---

### savedComparisons
User-saved brand comparison sets.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar | PRIMARY KEY, UUID | Comparison ID |
| userId | varchar | FK → users.id, NOT NULL | Owner |
| name | varchar(255) | - | Comparison name |
| brandIds | jsonb | NOT NULL | Array of brand IDs |
| shareToken | varchar(64) | UNIQUE | Sharing link token |
| createdAt | timestamp | DEFAULT NOW() | Creation time |

---

### moderationLogs
Audit trail for content moderation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar | PRIMARY KEY, UUID | Log ID |
| reviewId | varchar | FK → reviews.id | Moderated review |
| moderatorId | varchar | FK → users.id, NOT NULL | Admin user |
| action | varchar(50) | NOT NULL | approve/reject/edit |
| previousStatus | varchar(20) | - | Status before action |
| newStatus | varchar(20) | - | Status after action |
| notes | text | - | Moderation notes |
| createdAt | timestamp | DEFAULT NOW() | Action time |

---

## Indexes

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| sessions | IDX_session_expire | expire | Session cleanup queries |

---

## Drizzle Relations

```typescript
// User has many reviews, responses, leads, comparisons
usersRelations = relations(users, ({ many }) => ({
  reviews: many(reviews),
  reviewResponses: many(reviewResponses),
  claimedBrands: many(brands),
  leads: many(leads),
  savedComparisons: many(savedComparisons),
}));

// Brand has one claimer, many reviews/leads/docs
brandsRelations = relations(brands, ({ one, many }) => ({
  claimedBy: one(users),
  reviews: many(reviews),
  leads: many(leads),
  documents: many(brandDocuments),
  wordFrequencies: many(wordFrequencies),
}));

// Review belongs to brand/user, has responses/reports
reviewsRelations = relations(reviews, ({ one, many }) => ({
  brand: one(brands),
  user: one(users),
  responses: many(reviewResponses),
  reports: many(reviewReports),
}));
```

---

## Validation Schemas

All insert schemas are generated via `drizzle-zod`:

```typescript
import { createInsertSchema } from "drizzle-zod";

export const insertUserSchema = createInsertSchema(users);
export const insertBrandSchema = createInsertSchema(brands);
export const insertReviewSchema = createInsertSchema(reviews);
export const insertLeadSchema = createInsertSchema(leads);
// etc.
```

---

## Migration Commands

```bash
# Push schema changes to database
npm run db:push
```

Uses Drizzle Kit with configuration in `drizzle.config.ts`.
