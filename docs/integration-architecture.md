# Integration Architecture

> ZeeVerify Multi-Part Communication and Data Flow

## System Overview

ZeeVerify is a three-part TypeScript monorepo where each part has specific responsibilities and integrates through well-defined interfaces.

```
┌─────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SERVICES                          │
├──────────────────┬─────────────────────┬────────────────────────────┤
│   Replit OIDC    │    Neon PostgreSQL  │      (Future: Stripe)      │
│   (Auth)         │    (Database)       │      (Payments)            │
└────────┬─────────┴──────────┬──────────┴────────────────────────────┘
         │                    │
         │                    │
┌────────▼────────────────────▼────────────────────────────────────────┐
│                            SERVER                                     │
│                         (Express.js)                                  │
│                                                                       │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                │
│  │ replitAuth  │   │   routes    │   │   storage   │                │
│  │  (OIDC)     │◄──│  (REST API) │──►│ (Drizzle)   │                │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘                │
│         │                 │                 │                        │
│         │                 ▼                 ▼                        │
│         │          ┌─────────────────────────────┐                  │
│         │          │         db.ts               │                  │
│         │          │   (Neon + Drizzle ORM)      │                  │
│         │          └─────────────────────────────┘                  │
│         │                                                            │
│         ▼                 Uses                                       │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │                     @shared/schema                        │       │
│  │  - Table definitions  - Zod validation  - TypeScript     │       │
│  └──────────────────────────────────────────────────────────┘       │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
                         HTTP + JSON + Cookies
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│                            CLIENT                                     │
│                          (React SPA)                                  │
│                                                                       │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                │
│  │ queryClient │   │    hooks    │   │    pages    │                │
│  │ (TanStack)  │◄──│  (useAuth)  │──►│  (Router)   │                │
│  └──────┬──────┘   └─────────────┘   └─────────────┘                │
│         │                                                            │
│         │                 Uses                                       │
│         ▼          ┌──────────────────────────────────┐             │
│  fetch('/api/*')   │         @shared/schema           │             │
│                    │  - TypeScript types for API      │             │
│                    │  - Zod schemas for form valid    │             │
│                    └──────────────────────────────────┘             │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Part Responsibilities

### Client (React Frontend)

| Responsibility | Implementation |
|----------------|----------------|
| UI Rendering | React 18 components |
| Routing | Wouter (client-side) |
| Server State | TanStack Query |
| Form Handling | React Hook Form + Zod |
| Styling | Tailwind CSS |
| Theme | next-themes (light/dark) |

**Does NOT:**
- Directly access database
- Store sensitive data
- Handle authentication logic

### Server (Express Backend)

| Responsibility | Implementation |
|----------------|----------------|
| REST API | Express routes |
| Authentication | Passport + OIDC |
| Session Management | express-session + PostgreSQL |
| Database Access | Drizzle ORM |
| Authorization | Middleware guards |
| Business Logic | Storage layer |

**Does NOT:**
- Render UI
- Bundle frontend code (except in dev)
- Store state between requests

### Shared (Type Library)

| Responsibility | Implementation |
|----------------|----------------|
| Schema Definition | Drizzle pgTable |
| Runtime Validation | drizzle-zod |
| Type Contracts | TypeScript exports |
| Enum Constants | Centralized values |

**Does NOT:**
- Contain runtime logic
- Make network calls
- Depend on client/server

---

## Data Flow Patterns

### 1. Read Operation (Brand List)

```
Client                    Server                     Database
   │                         │                           │
   │  GET /api/brands        │                           │
   │────────────────────────►│                           │
   │                         │                           │
   │                         │  storage.getBrands()      │
   │                         │──────────────────────────►│
   │                         │                           │
   │                         │◄──────────────────────────│
   │                         │     Brand[]               │
   │◄────────────────────────│                           │
   │   { brands, total }     │                           │
   │                         │                           │
   ▼                         ▼                           ▼
```

### 2. Write Operation (Submit Review)

```
Client                    Server                     Database
   │                         │                           │
   │  POST /api/reviews      │                           │
   │  { brandId, content }   │                           │
   │────────────────────────►│                           │
   │                         │                           │
   │                         │ isAuthenticated()         │
   │                         │ insertReviewSchema.parse()│
   │                         │                           │
   │                         │  storage.createReview()   │
   │                         │──────────────────────────►│
   │                         │                           │
   │                         │◄──────────────────────────│
   │                         │     Review                │
   │◄────────────────────────│                           │
   │   { id, status }        │                           │
   │                         │                           │
   ▼                         ▼                           ▼
```

### 3. Authentication Flow

```
Browser                   Server                     Replit OIDC
   │                         │                           │
   │  GET /api/login         │                           │
   │────────────────────────►│                           │
   │                         │                           │
   │                         │  passport.authenticate()  │
   │◄────────────────────────│                           │
   │   302 Redirect          │                           │
   │                         │                           │
   │──────────────────────────────────────────────────────►│
   │  User authenticates with Replit                      │
   │◄──────────────────────────────────────────────────────│
   │                         │                           │
   │  GET /api/callback      │                           │
   │  ?code=xxx              │                           │
   │────────────────────────►│                           │
   │                         │                           │
   │                         │  Token exchange           │
   │                         │──────────────────────────►│
   │                         │◄──────────────────────────│
   │                         │  Access token             │
   │                         │                           │
   │                         │  storage.upsertUser()     │
   │                         │───────────────►           │
   │                         │                Database   │
   │◄────────────────────────│                           │
   │  Set-Cookie + Redirect  │                           │
   │                         │                           │
   ▼                         ▼                           ▼
```

---

## Shared Schema Contract

The `shared/schema.ts` file serves as the contract between client and server:

### Used by Server

```typescript
import { users, brands, reviews, insertReviewSchema } from "@shared/schema";

// Drizzle queries
const result = await db.select().from(brands);

// Zod validation
const data = insertReviewSchema.parse(req.body);
```

### Used by Client

```typescript
import type { User, Brand, Review } from "@shared/schema";
import { insertLeadSchema } from "@shared/schema";

// Type-safe API response
const { data } = useQuery<{ brands: Brand[] }>();

// Form validation
const form = useForm({ resolver: zodResolver(insertLeadSchema) });
```

---

## Cross-Part Communication

| From | To | Method |
|------|-----|--------|
| Client → Server | HTTP fetch with JSON | Via queryClient |
| Server → Database | Drizzle ORM | Via storage layer |
| Server → External | HTTP/OIDC | Via passport/openid-client |
| Client ↔ Server Types | Import @shared/* | Build-time |

---

## Security Boundaries

### Client-Side

- No secrets stored
- All sensitive ops via API
- HTTPS enforced (Replit proxy)

### Server-Side

- Session-based auth (httpOnly cookies)
- Token refresh handling
- Role-based access control
- Input validation (Zod)

### Database

- Connection via SSL (Neon)
- Credentials in environment only
- Session storage in PostgreSQL

---

## External Integrations

### Current

| Service | Purpose | Module |
|---------|---------|--------|
| Neon PostgreSQL | Database | `server/db.ts` |
| Replit OIDC | Authentication | `server/replitAuth.ts` |

### Planned

| Service | Purpose | Status |
|---------|---------|--------|
| Stripe | Payments | Integration ready |
| Stripe Identity | Verification | Integration ready |
| SendGrid/Postmark | Email | Not started |

---

## Error Handling

### Client

```typescript
// TanStack Query handles errors automatically
const { error } = useQuery(...);

// Toast notifications for user feedback
toast({ title: "Error", description: error.message });
```

### Server

```typescript
try {
  // Operation
} catch (error) {
  console.error("Error:", error);
  res.status(500).json({ message: "Failed to..." });
}
```

### Database

```typescript
// Drizzle throws on constraint violations
// Storage methods propagate errors to routes
```
