# ZeeVerify Design Guidelines

## Design Approach
**System-Based Approach** using principles from Material Design and Carbon Design System, optimized for data-dense review platforms with trust and verification as core values. The design prioritizes clarity, efficiency, and credibility over visual flair.

## Typography System
**Font Family:** Poppins throughout

**Hierarchy:**
- H1: 2.5rem (40px), SemiBold (600) - Page titles, brand names
- H2: 2rem (32px), SemiBold (600) - Section headers
- H3: 1.5rem (24px), Medium (500) - Card titles, subsection headers
- H4: 1.25rem (20px), Medium (500) - List items, feature titles
- Body Large: 1.125rem (18px), Regular (400) - Primary content, reviews
- Body: 1rem (16px), Regular (400) - Secondary content, descriptions
- Small: 0.875rem (14px), Regular (400) - Metadata, timestamps, captions
- Tiny: 0.75rem (12px), Medium (500) - Labels, badges

## Layout & Spacing System
**Spacing Scale:** Use Tailwind units of 1, 2, 3, 4, 6, 8, 12, 16, 20, 24

**Common Patterns:**
- Component padding: p-6 (forms, cards), p-8 (major sections)
- Section spacing: py-12 to py-20 between major sections
- Gap between items: gap-4 (tight lists), gap-6 (card grids), gap-8 (major components)
- Container max-width: max-w-7xl for main content, max-w-6xl for forms/dashboards

**Grid System:**
- Public directory: 3-column grid (lg:grid-cols-3) for brand cards
- Comparison tools: 2-4 column comparison tables
- Dashboards: Mixed layouts with sidebar (20% width) + main content (80%)
- Review lists: Single column, full-width cards with internal grid layouts

## Component Library

### Navigation
**Public Header:**
- Sticky top navigation with logo (left), search bar (center), login/signup CTAs (right)
- Height: h-16, backdrop blur effect
- Mobile: Hamburger menu collapsing to drawer

**Portal Sidebars:**
- Fixed left sidebar (w-64) with navigation menu
- Collapsible on mobile to hamburger
- Active state: Background fill with slightly darker treatment
- Icons: 1.25rem with 0.75rem gap to label text

### Cards & Containers
**Brand Directory Cards:**
- Aspect ratio: 4:3 or 16:9 for featured images
- Card padding: p-6
- Includes: Brand logo/image (top), title, category badge, Z score badge, metrics preview (3-4 key stats in grid)
- Hover: Subtle elevation increase (shadow-lg)

**Review Cards:**
- Full-width with internal 2-column layout: Left (reviewer info, verification badge) | Right (review content)
- Padding: p-8
- Border: border-b for separation, not full border
- Includes: Star rating, timestamp, franchisee name, verification status, review text, franchisor response (if exists)

**Stat Cards (Dashboard):**
- 4-column grid on desktop, 2-column tablet, 1-column mobile
- Padding: p-6
- Display: Large number (2.5rem) + label + trend indicator (icon + percentage)

### Forms
**Input Fields:**
- Height: h-12 for text inputs
- Padding: px-4
- Border: 2px solid with focus ring (ring-2)
- Label positioning: Above input with mb-2
- Spacing between fields: space-y-6

**Buttons:**
- Primary: h-12, px-8, rounded corners (rounded-lg)
- Secondary: Same dimensions with outline treatment
- Icon buttons: w-10 h-10, rounded-full for circular actions
- Button groups: gap-3 between adjacent buttons

### Data Display
**Tables:**
- Striped rows for readability (alternating background)
- Sticky header on scroll
- Column padding: px-4 py-3
- Minimum row height: h-16 for comfortable tap targets

**Badges:**
- Rounded-full, px-3 py-1, text-xs font-medium
- Types: Verification status (verified/pending/rejected), claimed/unclaimed, category tags
- Icon + text combination where applicable

**Z Score Display:**
- Large prominent number (3-4rem) in circular badge or prominent rectangular container
- Breakdown: Horizontal bar charts showing category scores
- Comparison: Side-by-side score displays in comparison view

### Moderation & Admin
**Moderation Queue:**
- List view with expandable rows
- Each row: Compact preview (left) + metadata + action buttons (right)
- Filters: Sticky filter bar above queue (category, status, date range)
- Batch actions: Checkbox selection with floating action bar

**Analytics Dashboard:**
- Top: 4-stat overview cards
- Middle: Large chart area (full-width) for trends
- Bottom: 2-column layout (review volume | sentiment breakdown)

### Public Features
**Directory/Search:**
- Search bar: h-14, prominent with search icon
- Filters: Sidebar (left, w-1/4) with checkbox groups and dropdowns
- Results: Main area (right, w-3/4) with sort dropdown (top-right)

**Comparison Tool:**
- Sticky header with selected brands (max 4)
- Scrollable comparison table with category groupings
- Metrics: Row-based comparison with visual indicators (bars, icons)

**Word Frequency Visualization:**
- Word cloud: Center area, larger size for higher frequency
- Bar chart: Alternative view showing top 20 terms with counts
- Toggle: Switch between cloud and chart views

## Images

**Hero Section (Public Landing):**
- Large hero image: Franchise business owners in positive setting (handshake, success meeting)
- Dimensions: Full-width, h-[500px] on desktop
- Overlay: Semi-transparent gradient for text readability
- CTA buttons on hero: Blurred background treatment (backdrop-blur-sm)

**Brand Logos/Images:**
- Brand cards: 16:9 aspect ratio placeholder for franchise logos
- Default: Generic franchise icon if no logo uploaded

**Verification Documents:**
- Thumbnails in gallery layout (grid-cols-4)
- Lightbox expansion on click
- File type indicators for PDFs

**Franchisor Portal:**
- Profile header: Brand banner image (full-width, h-48)
- Supporting images: Product/location photos in masonry grid

## Animations
**Minimal Motion:**
- Hover states: Subtle scale (scale-105) or shadow transitions
- Loading: Skeleton screens for data-heavy sections, simple spinner for actions
- Transitions: 200ms duration for most interactions
- No scroll-triggered animations or complex motion

## Accessibility
- All interactive elements: Minimum 44x44px touch target
- Form validation: Inline error messages below fields
- Color contrast: All text meets WCAG AA standards
- Focus indicators: Visible focus rings on all interactive elements
- Skip navigation link for keyboard users

This design system prioritizes trust, data clarity, and efficient navigation across complex multi-user workflows while maintaining visual consistency with the ZeeVerify brand.