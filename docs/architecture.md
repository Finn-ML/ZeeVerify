---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: 'complete'
completedAt: '2025-12-04'
inputDocuments:
  - docs/prd.md
  - docs/index.md
  - docs/project-overview.md
  - docs/api-contracts-server.md
  - docs/data-models.md
  - docs/component-inventory-client.md
  - docs/integration-architecture.md
  - docs/development-guide.md
  - docs/source-tree-analysis.md
  - replit.md
  - design_guidelines.md
workflowType: 'architecture'
lastStep: 8
project_name: 'ZeeVerify'
user_name: 'Runner'
date: '2025-12-04'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
The PRD specifies 10 feature modules across 4 user roles (Browser, Franchisee, Franchisor, Admin). Core functionality includes:
- User authentication with email/password (currently Replit OIDC)
- Brand directory with search, filtering, and comparison (implemented)
- Review submission with manual moderation workflow (implemented)
- Lead capture and routing (implemented)
- Admin moderation queue and user management (implemented)
- Stripe checkout for brand claiming (integration ready)
- Email notifications via SendGrid/Postmark (not yet implemented)

**Non-Functional Requirements:**
- Performance: Dashboard < 3s, search < 2s, filters < 1s
- Security: PCI compliance (Stripe), HTTPS, role-based access
- Email: Transactional delivery within 2-5 minutes
- Accessibility: All interactive elements 44x44px minimum

**Scale & Complexity:**
- Primary domain: Full-Stack Web (React SPA + Express REST API)
- Complexity level: Medium
- Estimated new architectural components: 3-4 (email, auth evolution, Stripe flow)

### Technical Constraints & Dependencies

- **Replit Deployment:** OIDC auth requires Replit environment for full functionality
- **Neon PostgreSQL:** Serverless connection pooling, WebSocket-based
- **Stripe:** Payment processing and Identity verification APIs
- **Email Provider:** SendGrid or Postmark (not yet selected)

### Cross-Cutting Concerns Identified

1. **Authentication Strategy:** Reconcile PRD email/password with existing Replit OIDC
2. **Email Infrastructure:** Password reset, verification, notifications, lead alerts
3. **Moderation Notifications:** Hook into review status changes for email alerts
4. **Brand Claiming Flow:** End-to-end Stripe checkout → verification → listing activation

## Starter Template Evaluation

### Primary Technology Domain

Full-Stack Web (React SPA + Express REST API) - **Existing Brownfield Project**

### Starter Template Assessment

**N/A - Brownfield Project**

This is an existing, functional codebase. No starter template required.

**Existing Stack (Already Established):**
- **Frontend:** React 18, Vite 5, TypeScript 5.6
- **Backend:** Express 4, TypeScript 5.6
- **Database:** Neon PostgreSQL with Drizzle ORM
- **Auth:** Replit OIDC
- **UI:** Shadcn/ui (48+ components), Tailwind CSS 3
- **State:** TanStack Query (server state), React hooks (local)

**Architectural Patterns Already Established:**
- Monorepo with shared types (`@shared/*`)
- Storage layer pattern for database operations
- Route registration pattern for API endpoints
- Query client with typed fetch wrapper
- Role-based access control middleware

### Integration Decisions Required

New architectural decisions needed for PRD features not yet implemented:

1. **Email Infrastructure:** SendGrid or Postmark integration
2. **Authentication Evolution:** Email/password alongside or replacing OIDC
3. **Stripe Integration:** Complete checkout → verification → activation flow

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1. Authentication replacement (blocks all authenticated features)
2. Email infrastructure (blocks password reset, verification)
3. Stripe checkout integration (blocks brand claiming monetization)

**Important Decisions (Shape Architecture):**
- Email template structure and service pattern
- Authentication flow UI/UX
- Webhook handling patterns

**Deferred Decisions (Post-MVP):**
- AI-powered review moderation (Phase 2)
- Stripe Identity verification automation
- Subscription/recurring payments

### Authentication & Security

**Decision: Replace Replit OIDC with Email/Password Authentication**

- **Strategy:** Passport.js Local Strategy
- **Packages:** `passport` + `passport-local` + `bcrypt`
- **Rationale:** PRD requires email/password; enables deployment outside Replit
- **Pattern:** Email as usernameField, bcrypt for password hashing
- **Session Store:** Keep existing PostgreSQL session store

**Schema Changes Required:**
```sql
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN email_verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN password_reset_expires TIMESTAMP;
```

**Implementation Sequence:**
1. Update schema with new columns
2. Create auth service (register, login, verify, reset)
3. Implement Passport Local strategy
4. Build login/register UI pages
5. Remove Replit OIDC code

### Email Infrastructure

**Decision: Postmark for Transactional Email**

- **Provider:** Postmark
- **Package:** `postmark` v4.0.5
- **Rationale:** Fast delivery, excellent for transactional, simple API
- **Pattern:** Server-side EmailService class

**Email Templates Required:**
- Email verification (registration)
- Password reset
- Review status notifications (approved/rejected)
- Lead notification (to franchisor)
- Welcome email

**Service Pattern:**
```typescript
// server/services/email.ts
import { ServerClient } from 'postmark';

export class EmailService {
  private client: ServerClient;

  constructor() {
    this.client = new ServerClient(process.env.POSTMARK_API_TOKEN!);
  }

  async sendVerificationEmail(to: string, token: string): Promise<void>;
  async sendPasswordResetEmail(to: string, token: string): Promise<void>;
  async sendReviewStatusEmail(to: string, status: string, brandName: string): Promise<void>;
  async sendLeadNotification(to: string, lead: Lead): Promise<void>;
}
```

### Payment Integration

**Decision: Stripe Embedded Checkout**

- **Mode:** Embedded Checkout (stays on site)
- **Packages:** `@stripe/stripe-js`, `@stripe/react-stripe-js`
- **Rationale:** Premium UX matching "Financial Editorial Luxury" design
- **Pattern:** EmbeddedCheckoutProvider + EmbeddedCheckout components

**Backend Pattern:**
```typescript
// POST /api/checkout/brand-claim
const session = await stripe.checkout.sessions.create({
  ui_mode: 'embedded',
  mode: 'payment',
  line_items: [{ price: BRAND_CLAIM_PRICE_ID, quantity: 1 }],
  metadata: { brandId, userId },
  return_url: `${BASE_URL}/franchisor/claim-success?session_id={CHECKOUT_SESSION_ID}`,
});
return { clientSecret: session.client_secret };
```

**Webhook Handler:**
```typescript
// POST /api/webhooks/stripe
// Event: checkout.session.completed
// Action: Update brand.isClaimed = true, brand.claimedById = userId
```

### Decision Impact Analysis

**Implementation Sequence:**
1. Email Infrastructure (Postmark) - foundation for auth
2. Authentication (Passport Local) - depends on email
3. Stripe Embedded Checkout - independent, can parallel

**Cross-Component Dependencies:**
- Auth → Email (verification, password reset)
- Brand Claiming → Auth (must be logged in) + Stripe
- Notifications → Email (review status, leads)

## Implementation Patterns & Consistency Rules

### Established Patterns (Brownfield)

These patterns are already in the codebase and MUST be followed:

| Category | Pattern | Example |
|----------|---------|---------|
| Database Tables | snake_case plural | `users`, `brands`, `reviews` |
| Database Columns | camelCase | `userId`, `createdAt`, `brandId` |
| API Endpoints | `/api/{resource}` plural | `/api/brands`, `/api/reviews` |
| React Components | PascalCase | `BrandCard.tsx`, `ZScoreBadge.tsx` |
| React Hooks | `use` prefix camelCase | `useAuth.ts`, `useToast.ts` |
| API Errors | `{ message: string }` | `{ message: "Not found" }` |
| Query Keys | Array with path first | `["/api/brands", { search }]` |

### New Integration Patterns

**Service Layer Pattern:**
```typescript
// server/services/{service}.ts
export class EmailService {
  private client: ServerClient;
  constructor() { ... }
  async sendVerificationEmail(to: string, token: string): Promise<void> { ... }
}

// Instantiate as singleton
export const emailService = new EmailService();
```

**Route Registration Pattern:**
```typescript
// server/routes.ts - group by feature with comments
// === Authentication Routes ===
app.post("/api/auth/register", async (req, res) => { ... });
app.post("/api/auth/login", passport.authenticate("local"), async (req, res) => { ... });
```

**Schema Extension Pattern:**
```typescript
// shared/schema.ts - add new schemas alongside existing
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});
```

**New Page Pattern:**
```
client/src/pages/
├── login.tsx           # Public auth page
├── register.tsx        # Public auth page
├── forgot-password.tsx # Public auth page
└── verify-email.tsx    # Token verification page
```

### Enforcement Guidelines

**All AI Agents MUST:**
1. Use existing patterns from the codebase as reference
2. Add new routes to `server/routes.ts` (not new files)
3. Add new schemas to `shared/schema.ts` (not new files)
4. Follow the storage layer pattern for database operations
5. Use `isAuthenticated` middleware for protected routes

**Pattern Verification:**
- Check existing files before creating new patterns
- Match naming conventions of adjacent code
- Run TypeScript check (`npm run check`) after changes

### Anti-Patterns to Avoid

❌ Creating separate route files (use `routes.ts`)
❌ Using different error response formats
❌ Mixing snake_case and camelCase in same context
❌ Creating new state management solutions (use TanStack Query)
❌ Adding inline styles (use Tailwind classes)

## Project Structure & Boundaries

### Complete Project Directory Structure

```
zeeverify/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── drizzle.config.ts
│
├── client/src/
│   ├── App.tsx                     # Router + providers
│   ├── components/
│   │   ├── ui/                     # Shadcn/ui (48 components)
│   │   └── [business components]
│   ├── pages/
│   │   ├── login.tsx               # NEW
│   │   ├── register.tsx            # NEW
│   │   ├── forgot-password.tsx     # NEW
│   │   ├── verify-email.tsx        # NEW
│   │   ├── franchisor/
│   │   │   └── claim-brand.tsx     # NEW (Stripe)
│   │   └── [existing pages]
│   ├── hooks/
│   │   └── useAuth.ts              # UPDATE
│   └── lib/
│
├── server/
│   ├── index.ts                    # Entry point
│   ├── routes.ts                   # All API routes (UPDATE)
│   ├── storage.ts                  # Database ops (UPDATE)
│   ├── db.ts                       # Drizzle connection
│   ├── localAuth.ts                # NEW (replaces replitAuth.ts)
│   └── services/                   # NEW directory
│       ├── email.ts                # NEW (Postmark)
│       └── stripe.ts               # NEW (Stripe)
│
├── shared/
│   └── schema.ts                   # UPDATE (add auth columns)
│
└── docs/
    └── architecture.md             # This document
```

### Architectural Boundaries

**API Route Groups:**

| Prefix | Auth | Middleware |
|--------|------|------------|
| `/api/auth/*` | None | - |
| `/api/brands/*` | None (read) | - |
| `/api/reviews/*` | Required | `isAuthenticated` |
| `/api/franchisee/*` | Required | `isAuthenticated` |
| `/api/franchisor/*` | Required | `isAuthenticated` |
| `/api/admin/*` | Admin | `isAuthenticated`, `isAdmin` |
| `/api/checkout/*` | Required | `isAuthenticated` |
| `/api/webhooks/stripe` | Stripe | Raw body, signature verify |

**Service Layer:**

| Service | Responsibility | External Dependency |
|---------|----------------|---------------------|
| `storage.ts` | Database operations | Neon PostgreSQL |
| `services/email.ts` | Transactional email | Postmark API |
| `services/stripe.ts` | Payment processing | Stripe API |
| `localAuth.ts` | Authentication | Passport.js |

### Requirements to Structure Mapping

**Authentication Feature:**
- Schema: `shared/schema.ts` (new columns)
- Routes: `server/routes.ts` (auth routes)
- Service: `server/localAuth.ts` (Passport setup)
- Pages: `client/src/pages/login.tsx`, `register.tsx`, etc.
- Hook: `client/src/hooks/useAuth.ts`

**Email Infrastructure:**
- Service: `server/services/email.ts`
- Called from: routes.ts (register, reset, notifications)

**Stripe Integration:**
- Service: `server/services/stripe.ts`
- Routes: `server/routes.ts` (checkout, webhooks)
- Page: `client/src/pages/franchisor/claim-brand.tsx`

### Environment Variables

```bash
# Existing
DATABASE_URL=
SESSION_SECRET=

# New - Email
POSTMARK_API_TOKEN=
POSTMARK_FROM_EMAIL=

# New - Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_BRAND_CLAIM_PRICE_ID=
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices (Postmark, Passport.js, Stripe) are independent services that integrate cleanly with the existing Express/PostgreSQL stack. No version conflicts detected.

**Pattern Consistency:**
Service layer pattern is consistent across all new integrations. Naming conventions and structure patterns align with existing brownfield codebase.

**Structure Alignment:**
Project structure supports all architectural decisions. New `server/services/` directory provides clear service isolation.

### Requirements Coverage ✅

**PRD Feature Coverage:**
All 10 PRD feature modules have architectural support. The three new integrations (Email, Auth, Stripe) complete the gaps identified in the brownfield analysis.

**Non-Functional Requirements:**
- Performance: Existing patterns maintained
- Security: bcrypt + session auth + RBAC
- Email: Postmark transactional delivery
- PCI: Stripe handles all card data

### Implementation Readiness ✅

**Decision Completeness:**
All critical decisions documented with package versions, code patterns, and examples.

**Structure Completeness:**
8 new files, 6 file updates, 1 file deletion clearly specified with locations.

**Pattern Completeness:**
Existing patterns documented for AI agent reference. New patterns aligned with codebase conventions.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed (brownfield)
- [x] Scale and complexity assessed (medium)
- [x] Technical constraints identified (Replit deployment)
- [x] Cross-cutting concerns mapped (auth, email, Stripe)

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
1. Brownfield patterns well-documented for AI consistency
2. Clear separation of concerns (services layer)
3. Minimal disruption to existing codebase
4. Independent integrations can be parallelized

**Implementation Priority:**
1. Email Infrastructure (Postmark) - foundation
2. Authentication (Passport Local) - depends on email
3. Stripe Embedded Checkout - independent

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2025-12-04
**Document Location:** docs/architecture.md

### Final Architecture Deliverables

**Complete Architecture Document**
- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**Implementation Ready Foundation**
- 3 critical architectural decisions made (Email, Auth, Stripe)
- 7 implementation patterns defined
- 3 service components specified
- 10 PRD feature modules fully supported

**AI Agent Implementation Guide**
- Technology stack with verified versions
- Consistency rules that prevent implementation conflicts
- Project structure with clear boundaries
- Integration patterns and communication standards

### Implementation Handoff

**For AI Agents:**
This architecture document is your complete guide for implementing ZeeVerify Phase 1 integrations. Follow all decisions, patterns, and structures exactly as documented.

**First Implementation Priority:**
```bash
npm install postmark passport passport-local bcrypt @types/passport @types/passport-local @types/bcrypt
```

**Development Sequence:**
1. Add auth columns to `shared/schema.ts` and run `npm run db:push`
2. Create `server/services/email.ts` (Postmark EmailService)
3. Create `server/localAuth.ts` (Passport Local strategy)
4. Add auth routes to `server/routes.ts`
5. Create auth pages in `client/src/pages/`
6. Create Stripe checkout flow

### Quality Assurance Checklist

**✅ Architecture Coherence**
- [x] All decisions work together without conflicts
- [x] Technology choices are compatible
- [x] Patterns support the architectural decisions
- [x] Structure aligns with all choices

**✅ Requirements Coverage**
- [x] All functional requirements are supported
- [x] All non-functional requirements are addressed
- [x] Cross-cutting concerns are handled
- [x] Integration points are defined

**✅ Implementation Readiness**
- [x] Decisions are specific and actionable
- [x] Patterns prevent agent conflicts
- [x] Structure is complete and unambiguous
- [x] Examples are provided for clarity

---

**Architecture Status:** READY FOR IMPLEMENTATION ✅

**Next Phase:** Begin implementation using the architectural decisions and patterns documented herein.

**Document Maintenance:** Update this architecture when major technical decisions are made during implementation.

