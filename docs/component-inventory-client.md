# Component Inventory - Client

> ZeeVerify React Component Library

## Overview

The client uses a combination of custom components and Shadcn/ui primitives built on Radix UI. All components are TypeScript-first with Tailwind CSS styling following the "Financial Editorial Luxury" design system.

## Component Categories

### 1. Layout Components

| Component | Path | Description |
|-----------|------|-------------|
| Header | `components/header.tsx` | Sticky navigation with logo, search, auth controls |
| Footer | `components/footer.tsx` | Site footer with links and branding |

### 2. Theme Components

| Component | Path | Description |
|-----------|------|-------------|
| ThemeProvider | `components/theme-provider.tsx` | next-themes wrapper for light/dark mode |
| ThemeToggle | `components/theme-toggle.tsx` | Sun/moon toggle button |

### 3. Business Components

| Component | Path | Description |
|-----------|------|-------------|
| BrandCard | `components/brand-card.tsx` | Card display for brand directory listings |
| ZScoreBadge | `components/z-score-badge.tsx` | Color-coded Z Score indicator |
| ReviewCard | `components/review-card.tsx` | Review display with ratings and responses |
| StarRating | `components/star-rating.tsx` | 5-star rating display/input |

### 4. Page Components

| Component | Path | Description |
|-----------|------|-------------|
| Landing | `pages/landing.tsx` | Marketing homepage with hero, features, CTAs |
| Directory | `pages/directory.tsx` | Searchable/filterable brand directory |
| BrandDetail | `pages/brand-detail.tsx` | Single brand page with reviews and lead form |
| Compare | `pages/compare.tsx` | Side-by-side brand comparison (up to 4) |
| Settings | `pages/settings.tsx` | User account settings |
| NotFound | `pages/not-found.tsx` | 404 error page |

### 5. Portal Components

| Component | Path | Description |
|-----------|------|-------------|
| FranchiseePortal | `pages/franchisee/index.tsx` | Franchisee dashboard |
| FranchisorPortal | `pages/franchisor/index.tsx` | Franchisor brand management |
| AdminDashboard | `pages/admin/index.tsx` | Admin moderation and stats |

---

## Shadcn/ui Components (48 total)

All located in `client/src/components/ui/`:

### Form Controls
- `button.tsx` - Primary/secondary/outline button variants
- `input.tsx` - Text input field
- `textarea.tsx` - Multi-line text input
- `checkbox.tsx` - Checkbox with label
- `radio-group.tsx` - Radio button group
- `select.tsx` - Dropdown select
- `switch.tsx` - Toggle switch
- `slider.tsx` - Range slider
- `calendar.tsx` - Date picker calendar
- `input-otp.tsx` - OTP verification input
- `form.tsx` - React Hook Form integration

### Display
- `card.tsx` - Content container card
- `badge.tsx` - Status/category badge
- `avatar.tsx` - User avatar image
- `skeleton.tsx` - Loading placeholder
- `progress.tsx` - Progress bar
- `separator.tsx` - Horizontal/vertical divider
- `aspect-ratio.tsx` - Fixed aspect ratio container
- `table.tsx` - Data table components

### Navigation
- `navigation-menu.tsx` - Desktop navigation
- `menubar.tsx` - Menu bar navigation
- `breadcrumb.tsx` - Breadcrumb trail
- `pagination.tsx` - Page navigation
- `tabs.tsx` - Tabbed content

### Overlays
- `dialog.tsx` - Modal dialog
- `sheet.tsx` - Slide-out panel
- `drawer.tsx` - Mobile-friendly drawer (vaul)
- `alert-dialog.tsx` - Confirmation dialog
- `popover.tsx` - Floating popover
- `tooltip.tsx` - Hover tooltip
- `hover-card.tsx` - Rich hover preview
- `dropdown-menu.tsx` - Dropdown menu
- `context-menu.tsx` - Right-click menu
- `command.tsx` - Command palette (cmdk)

### Feedback
- `toast.tsx` - Toast notifications
- `toaster.tsx` - Toast container
- `alert.tsx` - Alert messages

### Layout
- `scroll-area.tsx` - Custom scrollbar area
- `resizable.tsx` - Resizable panels
- `collapsible.tsx` - Expand/collapse section
- `accordion.tsx` - Accordion panels
- `sidebar.tsx` - Navigation sidebar
- `carousel.tsx` - Image/content carousel (embla)

### Data Visualization
- `chart.tsx` - Recharts wrapper

### Other
- `label.tsx` - Form field label
- `toggle.tsx` - Toggle button
- `toggle-group.tsx` - Toggle button group

---

## Hooks

| Hook | Path | Description |
|------|------|-------------|
| useAuth | `hooks/useAuth.ts` | Authentication state (user, isAuthenticated) |
| useToast | `hooks/use-toast.ts` | Toast notification API |
| useMobile | `hooks/use-mobile.tsx` | Mobile breakpoint detection |

---

## Utilities

| Utility | Path | Description |
|---------|------|-------------|
| cn() | `lib/utils.ts` | clsx + tailwind-merge helper |
| authUtils | `lib/authUtils.ts` | Auth helper functions |
| queryClient | `lib/queryClient.ts` | TanStack Query configuration |
| apiRequest() | `lib/queryClient.ts` | Typed fetch wrapper |
| getQueryFn() | `lib/queryClient.ts` | Query function factory with 401 handling |

---

## Design System Classes

Custom Tailwind classes from `tailwind.config.ts`:

### Typography
- `font-display` - Playfair Display (headlines)
- `font-sans` - DM Sans (body)
- `font-mono` - JetBrains Mono (data)
- `data-ticker` - Tabular numbers for metrics

### Effects
- `glass-card` - Glassmorphism with backdrop blur
- `grain-overlay` - Subtle noise texture
- `btn-glow` - Shimmer effect on buttons
- `headline-accent` - Gold underline accent
- `editorial-rule` - Magazine-style divider

### Animations
- `animate-fade-in-up` - Entrance from below
- `animate-fade-in` - Simple fade in
- `animate-slide-in-right` - Slide from right
- `animate-slide-in-left` - Slide from left
- `animate-float` - Floating animation
- `animate-pulse-glow` - Pulsing glow effect
- `animate-shimmer` - Shimmer sweep
- `animate-scale-in` - Scale up entrance
- `animate-rotate-in` - Rotation entrance

### Stagger Delays
- `stagger-1` through `stagger-6` - Animation delay classes

### Shadows
- `shadow-glow` - Accent color glow
- `shadow-glow-lg` - Large glow effect

---

## Component Patterns

### Query Pattern
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["/api/brands", { search, categories }],
  // Query function builds URL from queryKey
});
```

### Form Pattern
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLeadSchema } from "@shared/schema";

const form = useForm({
  resolver: zodResolver(insertLeadSchema),
});
```

### Auth Guard Pattern
```typescript
const { isAuthenticated, isLoading } = useAuth();

if (isLoading) return <Skeleton />;
if (!isAuthenticated) return <Navigate to="/api/login" />;
```

---

## Routing Structure

Wouter routes defined in `App.tsx`:

| Path | Component | Auth |
|------|-----------|------|
| `/` | Landing or Directory | Conditional |
| `/directory` | Directory | None |
| `/brand/:slug` | BrandDetail | None |
| `/compare` | Compare | None |
| `/settings` | Settings | Required |
| `/franchisee/*` | FranchiseePortal | Required |
| `/franchisor/*` | FranchisorPortal | Required |
| `/admin/*` | AdminDashboard | Admin |
| `*` | NotFound | None |
