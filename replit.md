# ZeeVerify - Franchise Review Platform

## Overview

ZeeVerify is a comprehensive franchise review platform that enables verified franchisees to share authentic experiences while helping prospective franchise investors make informed decisions. The platform features a directory of approximately 4,000 franchise brands, AI-powered content moderation, a proprietary Z Score rating system, and distinct portals for franchisees, franchisors, and administrators.

The application serves multiple user types:
- **Browsers**: Public users exploring franchise opportunities
- **Franchisees**: Verified franchise owners submitting reviews
- **Franchisors**: Brand representatives managing profiles and responding to reviews
- **Admins**: Platform administrators moderating content and managing the system

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack TypeScript Architecture

**Architectural Decision**: Monorepo structure with shared TypeScript types
- Frontend (React/Vite), backend (Express), and database schema share type definitions via a `/shared` directory
- Eliminates type mismatches between client and server
- Single source of truth for data models using Drizzle ORM schema definitions
- Build process bundles server dependencies to reduce cold start times

### Frontend Architecture

**Framework**: React with Vite build tooling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state, React hooks for local state
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system based on Material Design and Carbon Design principles
- **Typography**: Poppins font family throughout (specified in design guidelines)

**Design System Approach**:
- System-based design optimized for data-dense review platforms
- Custom spacing scale and grid system for consistent layouts
- Color system with semantic tokens for light/dark mode support
- Component library emphasizes trust and verification as core values

### Backend Architecture

**Framework**: Express.js server with TypeScript
- **API Pattern**: RESTful endpoints under `/api` prefix
- **Session Management**: express-session with PostgreSQL store (connect-pg-simple)
- **File Structure**: Route registration pattern separates concerns (routes.ts, storage.ts)
- **Middleware**: Custom logging, JSON parsing, raw body capture for webhooks

**Authentication Strategy**: Replit Auth (OpenID Connect)
- Passport.js integration with openid-client strategy
- Session-based authentication with automatic token refresh
- Role-based access control (browser, franchisee, franchisor, admin)
- Middleware guards: `isAuthenticated`, `isAdmin` for route protection

**Alternative Considered**: Custom JWT authentication
- **Pros of Replit Auth**: Zero-configuration SSO for Replit users, automatic token management
- **Cons**: Vendor lock-in, requires Replit environment for full functionality
- **Chosen because**: Faster development, built-in security best practices, seamless Replit deployment

### Data Layer

**ORM**: Drizzle ORM with PostgreSQL
- Type-safe query builder with IntelliSense support
- Schema-first approach with migrations in `/migrations` directory
- Validation layer using drizzle-zod for runtime type checking

**Database Provider**: Neon serverless PostgreSQL
- WebSocket-based connection pooling via @neondatabase/serverless
- Connection string configured via DATABASE_URL environment variable

**Schema Design Patterns**:
1. **User Management**: Central users table with role enumeration (browser, franchisee, franchisor, admin)
2. **Brand Directory**: Brands table with slug-based URLs, claimed status, and aggregate metrics
3. **Review System**: Reviews with AI moderation fields (sentiment, flags, category), relationship to responses
4. **Verification**: Stripe Identity integration for franchisee verification status tracking
5. **Lead Routing**: Leads table connects brands to interested users, enables subscription-based routing

**Indexing Strategy**: Indexes on frequently queried fields (expire time for sessions, foreign keys, slug lookups)

### AI Integration

**OpenAI Integration** (GPT-4):
- **Content Moderation**: Automated analysis of review submissions
- **Sentiment Analysis**: Classifies reviews as positive/negative/neutral with score (-1.0 to 1.0)
- **Flag Detection**: Identifies profanity, spam, defamatory content, personal attacks
- **Keyword Extraction**: Powers word frequency visualization feature
- **Moderation Categories**: "clean" (auto-approve), "needs_review" (manual queue), "rejected" (auto-block)

**Implementation Pattern**: 
- Structured JSON responses for consistent parsing
- Temperature set to 0.3 for deterministic moderation
- System prompts define clear violation guidelines

**Alternative Considered**: Rule-based moderation
- **Pros of AI**: Nuanced understanding of context, handles edge cases, reduces manual work
- **Cons**: API costs, latency, potential for inconsistent decisions
- **Chosen because**: Higher accuracy, scales with volume, improves over time

### Payment Processing

**Stripe Integration**:
1. **Checkout**: One-time claim fee processing for franchisors
2. **Identity Verification**: Document upload and verification for franchisees
3. **Subscriptions**: Premium lead generation routing (future feature)
4. **Webhooks**: Raw body preservation for signature verification

**Security Pattern**: Stripe webhook signature validation using raw request body

## External Dependencies

### Third-Party Services

1. **Neon Database** (PostgreSQL)
   - Serverless PostgreSQL hosting
   - WebSocket connection pooling
   - Automatic scaling and backups

2. **OpenAI API**
   - GPT-4 model for content analysis
   - JSON response format for structured data
   - Rate limiting considerations for production

3. **Stripe**
   - Payment processing infrastructure
   - Identity verification service
   - Subscription management (planned)
   - Webhook event handling

4. **Replit Auth/OIDC**
   - User authentication provider
   - Session management
   - Token refresh handling

### Key NPM Dependencies

**Frontend Core**:
- `react` & `react-dom`: UI framework
- `wouter`: Lightweight routing
- `@tanstack/react-query`: Server state management
- `tailwindcss`: Utility-first CSS framework

**UI Components**:
- `@radix-ui/*`: Accessible component primitives (20+ components)
- `class-variance-authority`: Component variant management
- `lucide-react`: Icon library

**Backend Core**:
- `express`: Web server framework
- `passport` & `passport-local`: Authentication middleware
- `drizzle-orm`: Type-safe ORM
- `openid-client`: OIDC authentication

**Validation & Types**:
- `zod`: Runtime type validation
- `drizzle-zod`: Schema-to-Zod conversion
- `@hookform/resolvers`: Form validation integration

**Development Tools**:
- `vite`: Build tool and dev server
- `tsx`: TypeScript execution for scripts
- `esbuild`: Server bundling for production

### Data Sources

**Brand Directory**: 
- Initial dataset of ~4,000 franchise brands
- Bulk import capability via admin content management
- Category/industry taxonomy system

**Email Notifications** (Planned):
- Postmark or SendGrid integration for transactional emails
- Password reset, verification, review notifications
- Lead routing notifications

### Environment Configuration

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `OPENAI_API_KEY`: OpenAI API authentication
- `ISSUER_URL`: OIDC issuer (defaults to Replit)
- `REPL_ID`: Replit environment identifier

## Recent Changes

**December 2024**:
- Fixed query client to properly handle 401 responses and build URLs from queryKey parameters
- Resolved Compare page search functionality by fixing Command component filtering (added `shouldFilter={false}` and set `value={brand.name}` to align with display text)
- Successfully seeded database with 12 sample franchise brands for testing
- All end-to-end tests passing: landing page, directory search/filtering, brand detail pages, and comparison functionality verified working

## Project Status

**Current State**: MVP Complete and Functional
- All core features implemented and tested
- Landing page with hero section and CTAs
- Directory with search, filtering, and brand cards
- Brand detail pages with reviews, Z Score, and lead capture
- Comparison tool for up to 4 brands side-by-side
- Authentication with Replit Auth
- AI-powered content moderation ready (OpenAI integration)
- Full dark mode support with theme toggle