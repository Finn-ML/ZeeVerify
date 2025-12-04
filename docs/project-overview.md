# ZeeVerify Project Overview

> Franchise Review & Verification Platform - Brownfield Documentation

## Executive Summary

ZeeVerify is a franchise review platform that enables verified franchisees to share authentic experiences while helping prospective franchise investors make informed decisions. The platform features a directory of ~4,000 franchise brands, manual content moderation, a proprietary Z Score rating system, and distinct portals for franchisees, franchisors, and administrators.

**Status:** MVP Complete and Functional (December 2024)

---

## Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| Brand Directory | Searchable directory of ~4,000 franchise brands | Complete |
| Z Score System | Proprietary weighted rating algorithm | Complete |
| Review System | Franchisee reviews with moderation | Complete |
| Comparison Tool | Side-by-side brand comparison (up to 4) | Complete |
| Lead Capture | Prospective buyer inquiry forms | Complete |
| Franchisee Portal | Submit and manage reviews | Complete |
| Franchisor Portal | Claim listings, respond to reviews | Complete |
| Admin Dashboard | Moderation queue, user management | Complete |
| Dark Mode | Full theme support | Complete |

---

## Technical Architecture

### Stack Overview

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + TypeScript |
| Routing | Wouter |
| State | TanStack Query |
| UI Library | Shadcn/ui + Radix UI |
| Styling | Tailwind CSS |
| Backend | Express.js + TypeScript |
| ORM | Drizzle ORM |
| Database | Neon PostgreSQL |
| Auth | Replit OIDC |
| Deployment | Replit |

### Design System

"**Financial Editorial Luxury**" - Bloomberg-inspired aesthetic:
- **Typography:** Playfair Display (headlines), DM Sans (body), JetBrains Mono (data)
- **Colors:** Deep navy primary, warm gold accent, emerald success
- **Effects:** Grain textures, glassmorphism, editorial shadows

---

## User Roles

| Role | Capabilities |
|------|--------------|
| **Browser** | View directory, compare brands, submit leads |
| **Franchisee** | Submit reviews, view responses, flag content |
| **Franchisor** | Claim listings, respond to reviews, view leads |
| **Admin** | Moderate reviews, manage users, view stats |

---

## Project Structure

```
zeeverify/
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types/schema
├── docs/            # Documentation (you are here)
└── script/          # Build scripts
```

---

## Quick Links

### Development

- [Development Guide](./development-guide.md) - Setup and workflow
- [Source Tree Analysis](./source-tree-analysis.md) - Project structure

### API & Data

- [API Contracts](./api-contracts-server.md) - REST endpoints
- [Data Models](./data-models.md) - Database schema

### Architecture

- [Integration Architecture](./integration-architecture.md) - System communication
- [Component Inventory](./component-inventory-client.md) - UI components

### Requirements

- [PRD](./prd.md) - Product requirements document

### Existing Docs (Root)

- [replit.md](../replit.md) - Original architecture documentation
- [design_guidelines.md](../design_guidelines.md) - Design system reference

---

## Key Business Concepts

### Z Score

The Z Score is a proprietary weighted rating:

```
Z Score = (overall * 0.4) + (support * 0.15) + (training * 0.15)
        + (profitability * 0.15) + (culture * 0.15)
```

Color coding:
- 4.5+ = Green (Excellent)
- 4.0-4.49 = Emerald (Great)
- 3.0-3.99 = Gold (Good)
- 2.0-2.99 = Amber (Fair)
- <2.0 = Red (Poor)

### Review Moderation Flow

```
Franchisee submits → Pending queue → Admin reviews
                                   → Approve (published)
                                   → Reject (with notes)
```

### Brand Claiming

Franchisors pay to claim listings:
1. Payment via Stripe
2. Verified badge displayed
3. Can respond to reviews
4. Access to lead generation

---

## Environment Requirements

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection |
| `SESSION_SECRET` | Session encryption |
| `REPL_ID` | Replit environment |
| `ISSUER_URL` | OIDC provider (Replit) |

---

## Out of Scope (Phase 1)

- Mobile native apps
- AI-powered sentiment analysis
- Embeddable widgets
- Subscription/recurring payments
- Blue Collar Bureau integration

---

## Recent Changes (December 2024)

- Fixed query client 401 handling
- Resolved Compare page Command filtering
- Seeded database with 12 sample brands
- All E2E tests passing
- Dark mode fully implemented
