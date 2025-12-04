# Source Tree Analysis

> ZeeVerify Multi-Part Project Structure

## Overview

ZeeVerify is a **multi-part TypeScript monorepo** with three main components:
- **client/** - React frontend (web)
- **server/** - Express API (backend)
- **shared/** - Shared types and schema (library)

## Project Root Structure

```
zeeverify/
├── client/                     # React Frontend (Part: client)
│   ├── index.html              # HTML entry point
│   └── src/
│       ├── main.tsx            # ⚡ React entry point
│       ├── App.tsx             # Router and providers
│       ├── index.css           # Global styles + CSS variables
│       ├── components/         # UI components
│       │   ├── ui/             # Shadcn/ui primitives (48 components)
│       │   ├── header.tsx      # Site navigation
│       │   ├── footer.tsx      # Site footer
│       │   ├── brand-card.tsx  # Brand directory card
│       │   ├── z-score-badge.tsx  # Z Score indicator
│       │   ├── review-card.tsx # Review display
│       │   ├── star-rating.tsx # Rating stars
│       │   ├── theme-provider.tsx # Dark mode
│       │   └── theme-toggle.tsx   # Theme switch
│       ├── pages/              # Route components
│       │   ├── landing.tsx     # Marketing homepage
│       │   ├── directory.tsx   # Brand search/filter
│       │   ├── brand-detail.tsx # Single brand page
│       │   ├── compare.tsx     # Brand comparison
│       │   ├── settings.tsx    # User settings
│       │   ├── not-found.tsx   # 404 page
│       │   ├── franchisee/     # Franchisee portal
│       │   ├── franchisor/     # Franchisor portal
│       │   └── admin/          # Admin dashboard
│       ├── hooks/              # Custom React hooks
│       │   ├── useAuth.ts      # Authentication state
│       │   ├── use-toast.ts    # Toast notifications
│       │   └── use-mobile.tsx  # Responsive detection
│       └── lib/                # Utilities
│           ├── utils.ts        # cn() helper
│           ├── authUtils.ts    # Auth helpers
│           └── queryClient.ts  # TanStack Query config
│
├── server/                     # Express Backend (Part: server)
│   ├── index.ts                # ⚡ Server entry point
│   ├── routes.ts               # API route definitions
│   ├── storage.ts              # Database operations (IStorage)
│   ├── db.ts                   # Drizzle ORM + Neon connection
│   ├── replitAuth.ts           # OIDC authentication
│   ├── static.ts               # Static file serving
│   └── vite.ts                 # Vite dev middleware
│
├── shared/                     # Shared Types (Part: shared)
│   └── schema.ts               # Drizzle schema + Zod validation
│
├── script/                     # Build scripts
│   └── build.ts                # esbuild production bundler
│
├── docs/                       # Generated documentation
│   ├── prd.md                  # Product Requirements
│   ├── api-contracts-server.md # API documentation
│   ├── data-models.md          # Database schema
│   ├── component-inventory-client.md # UI components
│   └── project-scan-report.json # Workflow state
│
├── .bmad/                      # BMad Method framework (excluded)
├── .claude/                    # Claude Code commands
├── attached_assets/            # Static assets from Replit
│
├── package.json                # Monorepo dependencies
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite build configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── drizzle.config.ts           # Drizzle Kit configuration
├── postcss.config.js           # PostCSS plugins
├── components.json             # Shadcn/ui configuration
│
├── replit.md                   # 📚 Project architecture docs
├── design_guidelines.md        # 📚 Design system docs
├── .replit                     # Replit configuration
└── .gitignore                  # Git exclusions
```

---

## Part: client (React Frontend)

**Project Type:** web
**Framework:** React 18 + Vite 5
**Entry Point:** `client/src/main.tsx`

### Critical Directories

| Directory | Purpose |
|-----------|---------|
| `src/components/ui/` | Shadcn/ui component library (48 primitives) |
| `src/components/` | Custom business components |
| `src/pages/` | Route-based page components |
| `src/hooks/` | Custom React hooks |
| `src/lib/` | Utility functions and configuration |

### Key Files

| File | Purpose |
|------|---------|
| `main.tsx` | React DOM render entry |
| `App.tsx` | Router + QueryClient + Theme providers |
| `index.css` | CSS variables, custom classes, animations |
| `lib/queryClient.ts` | TanStack Query + API request utilities |
| `hooks/useAuth.ts` | Authentication state hook |

### Dependencies

- **React 18** - UI framework
- **Wouter** - Lightweight routing
- **TanStack Query** - Server state management
- **Radix UI** - Accessible primitives
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations
- **React Hook Form + Zod** - Form handling

---

## Part: server (Express Backend)

**Project Type:** backend
**Framework:** Express 4.x
**Entry Point:** `server/index.ts`

### Critical Directories

| Directory | Purpose |
|-----------|---------|
| `server/` | All backend code (flat structure) |

### Key Files

| File | Purpose |
|------|---------|
| `index.ts` | Express app initialization, middleware, startup |
| `routes.ts` | All REST API endpoints |
| `storage.ts` | Database access layer (IStorage interface) |
| `db.ts` | Drizzle ORM + Neon PostgreSQL connection |
| `replitAuth.ts` | OIDC passport strategy + session management |
| `static.ts` | Production static file serving |
| `vite.ts` | Development hot reload middleware |

### API Route Groups

| Prefix | Auth | Purpose |
|--------|------|---------|
| `/api/auth/*` | Mixed | Authentication (login, logout, callback) |
| `/api/users/*` | Required | User profile management |
| `/api/brands/*` | None | Brand directory and detail |
| `/api/reviews/*` | Required | Review submission and responses |
| `/api/leads` | None | Lead capture form |
| `/api/comparisons/*` | Mixed | Saved comparisons |
| `/api/franchisee/*` | Required | Franchisee portal |
| `/api/franchisor/*` | Required | Franchisor portal |
| `/api/admin/*` | Admin | Admin moderation and management |

---

## Part: shared (Type Library)

**Project Type:** library
**Entry Point:** `shared/schema.ts`

### Purpose

Provides type-safe contracts between client and server:

1. **Drizzle ORM Schema** - Table definitions with PostgreSQL types
2. **Zod Validation** - Runtime validation via drizzle-zod
3. **TypeScript Types** - Inferred types for all entities
4. **Enum Constants** - UserRole, ReviewStatus, etc.

### Exports

```typescript
// Tables
export { users, brands, reviews, reviewResponses, ... }

// Validation schemas
export { insertUserSchema, insertBrandSchema, insertReviewSchema, ... }

// Types
export type { User, Brand, Review, Lead, ... }

// Enums
export { UserRole, ReviewStatus, VerificationStatus, ... }
```

---

## Integration Points

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT                                  │
│  React + TanStack Query                                         │
│                                                                 │
│  queryClient.ts ─────────┐                                      │
│       │                  │                                      │
│  fetch('/api/...')       │  Uses @shared/* types                │
└───────────────────────────┼─────────────────────────────────────┘
                           │
                    HTTP + JSON
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                          │     SERVER                           │
│                          ▼                                      │
│  routes.ts ─────────► storage.ts ─────────► db.ts              │
│       │                  │                    │                 │
│  Uses @shared/*          │                    │                 │
│  for validation          │                    │                 │
└──────────────────────────┼────────────────────┼─────────────────┘
                           │                    │
                           │                    │ Drizzle ORM
                           │                    │
┌──────────────────────────┼────────────────────┼─────────────────┐
│                          │                    ▼                 │
│                       SHARED              PostgreSQL            │
│                                          (Neon)                 │
│  schema.ts                                                      │
│    ├── Table definitions                                        │
│    ├── Zod schemas                                              │
│    └── TypeScript types                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Build Output

```
dist/
├── index.cjs              # Bundled server (esbuild)
└── public/                # Vite client build
    ├── index.html
    ├── assets/
    └── ...
```

---

## Path Aliases

Defined in `tsconfig.json`:

| Alias | Target |
|-------|--------|
| `@/*` | `./client/src/*` |
| `@shared/*` | `./shared/*` |

Also in `vite.config.ts`:
| Alias | Target |
|-------|--------|
| `@` | `client/src` |
| `@shared` | `shared` |
| `@assets` | `attached_assets` |
