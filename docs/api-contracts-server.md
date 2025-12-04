# API Contracts - Server

> ZeeVerify Express API - RESTful endpoints for franchise review platform

## Overview

All API endpoints are prefixed with `/api` and use JSON for request/response bodies. Authentication is handled via Replit Auth (OIDC) with session-based cookies.

## Authentication

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/login` | GET | No | Initiates Replit Auth OIDC flow |
| `/api/callback` | GET | No | OIDC callback handler |
| `/api/logout` | GET | Yes | Ends session and redirects to OIDC logout |
| `/api/auth/user` | GET | Yes | Returns current authenticated user |

### Auth Middleware

- `isAuthenticated` - Validates session, auto-refreshes expired tokens
- `isAdmin` - Checks user role is "admin" in database

---

## User Endpoints

### Get Current User
```
GET /api/auth/user
Auth: Required
Response: User object
```

### Update User Profile
```
PATCH /api/users/me
Auth: Required
Body: { firstName?: string, lastName?: string }
Response: Updated User object
```

### Update Notification Preferences
```
PATCH /api/users/me/notifications
Auth: Required
Body: { preferences: object }
Response: Updated User object
```

### Delete Account
```
DELETE /api/users/me
Auth: Required
Response: { message: "Account deleted" }
```

---

## Brand Endpoints

### List Brands
```
GET /api/brands
Auth: None
Query Parameters:
  - search: string - Search in name/description
  - categories: string - Comma-separated category filter
  - ids: string - Comma-separated brand IDs
  - sortBy: string - "z-score" | "rating" | "reviews" | "newest" | "name"
  - onlyVerified: boolean - Filter to claimed brands only
  - page: number - Page number (default: 1)
  - limit: number - Results per page (default: 12)
Response: { brands: Brand[], total: number }
```

### Get Brand by Slug
```
GET /api/brands/:slug
Auth: None
Response: {
  brand: Brand,
  reviews: ReviewWithUser[],
  wordFrequencies: WordFrequency[]
}
```

---

## Review Endpoints

### Create Review
```
POST /api/reviews
Auth: Required (Franchisee)
Body: InsertReview schema
  - brandId: string (required)
  - title: string (required)
  - content: string (required)
  - overallRating: number 1-5 (required)
  - supportRating?: number 1-5
  - trainingRating?: number 1-5
  - profitabilityRating?: number 1-5
  - cultureRating?: number 1-5
  - yearsAsFranchisee?: number
Response: Review (status: "pending")
Note: All reviews enter moderation queue
```

### Respond to Review
```
POST /api/reviews/:id/respond
Auth: Required (Franchisor only)
Body: { content: string }
Response: ReviewResponse
```

### Report Review
```
POST /api/reviews/:id/report
Auth: Required
Body: { reason: string, description?: string }
Response: ReviewReport
```

---

## Lead Endpoints

### Create Lead
```
POST /api/leads
Auth: None
Body: InsertLead schema
  - brandId: string (required)
  - firstName: string (required)
  - lastName: string (required)
  - email: string (required)
  - phone?: string
  - investmentRange?: string
  - timeline?: string
  - message?: string
Response: Lead
```

---

## Comparison Endpoints

### Save Comparison
```
POST /api/comparisons
Auth: Required
Body: { name?: string, brandIds: string[] }
Response: SavedComparison (includes shareToken)
```

### Get Shared Comparison
```
GET /api/comparisons/:token
Auth: None
Response: { comparison: SavedComparison, brands: Brand[] }
```

---

## Franchisee Portal Endpoints

### Get My Reviews
```
GET /api/franchisee/reviews
Auth: Required
Response: { reviews: ReviewWithResponses[] }
```

---

## Franchisor Portal Endpoints

### Get My Claimed Brands
```
GET /api/franchisor/brands
Auth: Required
Response: { brands: Brand[] }
```

### Get Reviews for My Brands
```
GET /api/franchisor/reviews
Auth: Required
Response: { reviews: ReviewWithUser[] }
```

### Get Leads for My Brands
```
GET /api/franchisor/leads
Auth: Required
Response: { leads: Lead[] }
```

---

## Admin Endpoints

All admin endpoints require `isAuthenticated` + `isAdmin` middleware.

### Get Dashboard Stats
```
GET /api/admin/stats
Response: {
  totalUsers: number,
  totalReviews: number,
  totalBrands: number,
  pendingModeration: number,
  newLeads: number
}
```

### List Users
```
GET /api/admin/users
Query: { search?: string, page?: number, limit?: number }
Response: { users: User[], total: number }
```

### Update User Role
```
PATCH /api/admin/users/:id/role
Body: { role: "browser" | "franchisee" | "franchisor" | "admin" }
Response: User
```

### Get Reviews for Moderation
```
GET /api/admin/reviews
Query: { status?: string } (default: "pending")
Response: { reviews: ReviewWithUser[] }
```

### Moderate Review
```
POST /api/admin/reviews/:id/moderate
Body: { action: "approve" | "reject", notes?: string }
Response: Review
Side Effects:
  - Creates ModerationLog entry
  - If approved: Recalculates brand Z Score
```

### Get Reports
```
GET /api/admin/reports
Query: { status?: string }
Response: { reports: ReviewReport[] }
```

---

## Error Responses

All endpoints return errors in format:
```json
{
  "message": "Error description"
}
```

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Not authenticated |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Type Definitions

See `shared/schema.ts` for complete Drizzle ORM schema definitions and Zod validation schemas.
