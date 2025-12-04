# Development Guide

> ZeeVerify Local Development Setup and Workflow

## Prerequisites

- **Node.js** 20.x or higher
- **npm** (comes with Node.js)
- **PostgreSQL** database (or Neon account)
- **Replit account** (for authentication in development)

## Environment Variables

Create a `.env` file in project root (or configure in Replit Secrets):

```bash
# Required
DATABASE_URL=postgresql://user:password@host:5432/database
SESSION_SECRET=your-random-session-secret

# Replit Auth (auto-populated on Replit)
REPL_ID=your-repl-id
ISSUER_URL=https://replit.com/oidc

# Optional
NODE_ENV=development
```

---

## Installation

```bash
# Install all dependencies
npm install

# Push database schema to PostgreSQL
npm run db:push
```

---

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm run check` | TypeScript type checking |
| `npm run db:push` | Push Drizzle schema to database |

---

## Development Workflow

### Starting Development Server

```bash
npm run dev
```

This starts:
1. **Vite dev server** - HMR for React frontend
2. **Express server** - API with hot reload via tsx
3. **Replit plugins** - Dev banner, cartographer, error modal

Access at: `http://localhost:5000` (or Replit URL)

### Building for Production

```bash
npm run build
```

This runs `script/build.ts` which:
1. Bundles server with esbuild → `dist/index.cjs`
2. Builds client with Vite → `dist/public/`

### Running Production Build

```bash
npm run start
```

Serves the bundled application from `dist/`.

---

## Project Structure

```
/
├── client/src/      # React frontend
├── server/          # Express backend
├── shared/          # Shared schema/types
├── docs/            # Documentation
└── dist/            # Build output
```

See [Source Tree Analysis](./source-tree-analysis.md) for details.

---

## Database Operations

### Viewing Schema

Schema is defined in `shared/schema.ts` using Drizzle ORM.

### Pushing Schema Changes

```bash
npm run db:push
```

This uses Drizzle Kit to sync schema to database.

### Configuration

Database configuration is in `drizzle.config.ts`:

```typescript
export default {
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
```

---

## Authentication Flow

ZeeVerify uses Replit Auth (OIDC):

1. User clicks login → `/api/login`
2. Redirect to Replit OIDC → User authenticates
3. Callback to `/api/callback` → Session created
4. User data upserted to database
5. Session stored in PostgreSQL

**Local Development Note:** Full auth requires running on Replit.

---

## Adding New Features

### 1. Adding a New API Endpoint

Edit `server/routes.ts`:

```typescript
app.get("/api/my-endpoint", isAuthenticated, async (req, res) => {
  // Implementation
});
```

### 2. Adding a New Database Table

Edit `shared/schema.ts`:

```typescript
export const myTable = pgTable("my_table", {
  id: varchar("id").primaryKey(),
  // ... columns
});

export const insertMyTableSchema = createInsertSchema(myTable);
export type MyTable = typeof myTable.$inferSelect;
```

Then run:
```bash
npm run db:push
```

### 3. Adding a New Page

Create `client/src/pages/my-page.tsx`:

```typescript
export default function MyPage() {
  return <div>My Page</div>;
}
```

Add route in `App.tsx`:

```typescript
<Route path="/my-page" component={MyPage} />
```

### 4. Adding a New Component

Create in `client/src/components/`:

```typescript
export function MyComponent({ prop }: { prop: string }) {
  return <div>{prop}</div>;
}
```

---

## Code Style

- **TypeScript** for all source files
- **ESModules** (`type: "module"` in package.json)
- **Tailwind CSS** for styling
- **Shadcn/ui** component patterns

### Path Aliases

Use path aliases instead of relative imports:

```typescript
// Good
import { Button } from "@/components/ui/button";
import { User } from "@shared/schema";

// Avoid
import { Button } from "../../components/ui/button";
```

---

## Testing

Currently no automated test suite. Consider:

- **Vitest** for unit/component tests
- **Playwright** for E2E tests
- **MSW** for API mocking

---

## Troubleshooting

### Database Connection Errors

Verify `DATABASE_URL` is correct and database is accessible.

### Session Errors

Ensure `SESSION_SECRET` is set and consistent across restarts.

### Auth Redirect Issues

Replit Auth requires running on Replit domain for full functionality.

### Type Errors

Run `npm run check` to see all TypeScript errors.

---

## Deployment

ZeeVerify is designed for Replit deployment:

1. Push to main branch
2. Replit auto-builds with `npm run build`
3. Runs `npm run start` in production
4. Uses Replit's proxy for HTTPS
