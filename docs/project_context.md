# Project Context for AI Agents

> ZeeVerify - Franchise Review & Verification Platform
> Use this document to maintain consistency across AI-assisted development sessions

---

## Technology Stack & Versions

| Technology | Version | Notes |
|------------|---------|-------|
| TypeScript | 5.6.3 | Strict mode enabled |
| React | 18.3.1 | With Vite 5.4.20 |
| Express | 4.21.2 | ESModules throughout |
| Drizzle ORM | 0.39.1 | With drizzle-zod for validation |
| Neon PostgreSQL | Serverless | Via `@neondatabase/serverless` |
| TanStack Query | 5.62.8 | Server state management |
| Tailwind CSS | 3.4.17 | With custom design tokens |
| Shadcn/ui | Latest | 48+ components installed |
| Wouter | 3.3.5 | Client-side routing |
| Zod | 3.24.1 | Schema validation |

---

## Critical Implementation Rules

### TypeScript
- All code must be TypeScript - no `.js` files
- Use ESModules (`import`/`export`) - never `require()`
- Strict mode is enabled - handle all nullability

### Monorepo Structure
- `client/` - React frontend (Vite)
- `server/` - Express backend
- `shared/` - Shared types and schemas

### Database & Schema
- **All schemas in `shared/schema.ts`** - Never create separate schema files
- Use Drizzle ORM patterns - see existing table definitions
- Run `npm run db:push` after schema changes
- Use `createInsertSchema`/`createSelectSchema` from drizzle-zod

### API Routes
- **All routes in `server/routes.ts`** - Never create separate route files
- Use `isAuthenticated` middleware for protected routes
- Follow RESTful patterns: `GET /api/resource`, `POST /api/resource`
- Return consistent JSON: `{ data }` or `{ error: string }`

### React Patterns
- Use TanStack Query for all server state
- Custom hooks in `client/src/hooks/`
- Pages in `client/src/pages/`
- Reusable components in `client/src/components/`

### Query Patterns
```typescript
// Fetching data
const { data, isLoading, error } = useQuery({
  queryKey: ['/api/endpoint'],
  queryFn: () => fetch('/api/endpoint').then(r => r.json())
});

// Mutations
const mutation = useMutation({
  mutationFn: (data) => apiRequest('/api/endpoint', 'POST', data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/endpoint'] })
});
```

### Styling
- Use Tailwind CSS utility classes - no inline styles
- Follow design system in `design_guidelines.md`
- Use CSS variables from `client/src/index.css`
- Dark mode: use `dark:` variants

### Forms
- Use React Hook Form with Zod validation
- Import schemas from `shared/schema.ts`
- Use Shadcn Form components

---

## Anti-Patterns to Avoid

❌ Never create new route files - add to `server/routes.ts`
❌ Never create new schema files - add to `shared/schema.ts`
❌ Never use `require()` - use ESModules `import`
❌ Never use inline styles - use Tailwind classes
❌ Never skip `isAuthenticated` middleware on protected routes
❌ Never use `any` type - define proper types
❌ Never hardcode URLs - use relative paths for API calls
❌ Never store secrets in code - use environment variables

---

## New Integration Patterns (Phase 1)

### Email (Postmark)
- Service: `server/services/email.ts`
- Transactional emails only
- Templates managed in Postmark dashboard
- Environment: `POSTMARK_API_TOKEN`

### Authentication (Passport Local)
- Replaces Replit OIDC
- Email/password with bcrypt hashing
- Session-based authentication
- Password reset via email tokens
- Routes: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`

### Payments (Stripe Embedded Checkout)
- Service: `server/services/stripe.ts`
- Embedded checkout for brand claiming
- Webhook handling for payment confirmation
- Environment: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

---

## Storage Layer Pattern

All database operations go through the storage layer:

```typescript
// server/storage.ts
export const storage = {
  // User operations
  getUser(id: number): Promise<User | undefined>
  getUserByEmail(email: string): Promise<User | undefined>
  createUser(data: InsertUser): Promise<User>

  // Brand operations
  getBrands(filters?: BrandFilters): Promise<Brand[]>
  getBrand(id: number): Promise<Brand | undefined>

  // Review operations
  getReviews(brandId: number): Promise<Review[]>
  createReview(data: InsertReview): Promise<Review>

  // ... etc
}
```

---

## Commands Reference

```bash
npm run dev      # Start development (client + server)
npm run build    # Production build
npm run start    # Run production build
npm run check    # TypeScript type checking
npm run db:push  # Push schema changes to database
```

---

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection | Yes |
| `SESSION_SECRET` | Express session encryption | Yes |
| `POSTMARK_API_TOKEN` | Email service | Phase 1 |
| `STRIPE_SECRET_KEY` | Payment processing | Phase 1 |
| `STRIPE_PUBLISHABLE_KEY` | Client-side Stripe | Phase 1 |
| `STRIPE_WEBHOOK_SECRET` | Webhook verification | Phase 1 |

---

*Generated by BMM generate-project-context workflow - 2025-12-04*
