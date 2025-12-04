# ZeeVerify Design Guidelines

## Design Approach
**Financial Editorial Luxury** - A sophisticated design aesthetic inspired by Bloomberg and luxury magazines, optimized for franchise investment decisions. The design prioritizes trust, authority, and data presentation with a premium feel that conveys the seriousness of franchise investment.

## Typography System

### Font Families
- **Display (Headlines):** Playfair Display - Editorial elegance for headlines and emphasis
- **Body (Content):** DM Sans - Modern, clean sans-serif for excellent legibility
- **Mono (Data):** JetBrains Mono - Precision typography for numbers and statistics

### Hierarchy
- H1: 4rem-5rem (64-80px), Display font, Bold - Hero headlines
- H2: 2.5rem-3rem (40-48px), Display font, Bold - Section headers
- H3: 1.5rem (24px), Display font, SemiBold - Card titles, subsection headers
- H4: 1.25rem (20px), Body font, SemiBold - List items, feature titles
- Body Large: 1.125rem (18px), Body font, Regular - Primary content, descriptions
- Body: 1rem (16px), Body font, Regular - Secondary content
- Small: 0.875rem (14px), Body font, Regular - Metadata, timestamps
- Data: Various sizes, Mono font - Statistics, scores, financial figures

## Color System

### Light Mode
| Token | HSL Value | Usage |
|-------|-----------|-------|
| **Primary (Deep Navy)** | 222 47% 11% | Primary buttons, text, authority elements |
| **Primary Foreground** | 48 96% 89% | Text on primary backgrounds |
| **Accent (Warm Gold)** | 45 93% 47% | CTAs, highlights, premium indicators |
| **Success (Emerald)** | 160 84% 29% | Positive metrics, growth, verified badges |
| **Background** | 220 20% 98% | Page backgrounds |
| **Card** | 0 0% 100% | Card backgrounds |
| **Muted** | 220 14% 96% | Secondary backgrounds, disabled states |
| **Border** | 220 13% 91% | Borders, dividers |
| **Destructive** | 0 84% 60% | Errors, negative actions |

### Dark Mode
| Token | HSL Value | Usage |
|-------|-----------|-------|
| **Primary** | 48 96% 89% | Light text on dark backgrounds |
| **Accent (Warm Gold)** | 45 93% 58% | Brighter gold for dark mode |
| **Success** | 160 84% 39% | Brighter emerald |
| **Background** | 222 47% 6% | Dark page backgrounds |
| **Card** | 222 40% 8% | Dark card backgrounds |

## Layout & Spacing System

### Spacing Scale
Use Tailwind units: 1, 2, 3, 4, 6, 8, 12, 16, 20, 24, 32

### Common Patterns
- Component padding: p-6 (cards), p-8 (major sections)
- Section spacing: py-24 to py-32 between major sections
- Gap between items: gap-4 (tight), gap-6 (cards), gap-8 (major components)
- Container max-width: max-w-7xl for main content

### Grid System
- Public directory: 4-column grid (lg:grid-cols-4) for brand cards
- Comparison tools: 2-4 column comparison tables
- Hero sections: 12-column grid with asymmetric layouts (7/5 splits)
- Features: 4-column grid (sm:grid-cols-2 lg:grid-cols-4)

## Component Library

### Navigation
**Header:**
- Sticky with backdrop blur (bg-background/80 backdrop-blur-xl)
- Height: h-16
- Gold accent line at top (gradient via-accent/50)
- Logo with animated gold dot indicator
- Navigation pills in muted/50 container
- Search bar with animated focus states

### Cards & Containers
**Brand Cards:**
- Hover accent line at top (scale-x-0 → scale-x-100)
- Glassmorphism effect on featured cards (glass-card class)
- Sophisticated shadows (shadow-lg on hover)
- Gold accent borders on hover (border-accent/30)

**Feature Cards:**
- Gradient icon backgrounds (from-accent/20 to-accent/5)
- Bottom accent line animation on hover
- Data ticker style for statistics

**Glass Cards:**
- backdrop-blur-xl bg-card/80
- Subtle border (border-card-border)
- Shadow-lg for depth

### Buttons
**Primary:**
- h-14, px-8 for large CTAs
- Shadow with primary color glow (shadow-lg shadow-primary/20)
- btn-glow class for shimmer effect on hover

**Secondary/Outline:**
- border-2 for definition
- Hover states with muted backgrounds

### Data Display
**Z Score Badge:**
- Gradient backgrounds based on score tier
- Glow effect (blur-md shadow)
- Ring for definition
- Color-coded: 4.5+ green, 4+ emerald, 3+ gold, 2+ amber, <2 red

**Statistics:**
- data-ticker class for monospace numbers
- Large display font for key metrics
- Uppercase tracking-wider labels

### Visual Effects

**Grain Texture:**
- Subtle noise overlay (grain-overlay class)
- 3% opacity in light mode, 1.5% in dark mode
- Adds sophistication and depth

**Gradient Mesh:**
- Multi-point radial gradients (bg-gradient-mesh)
- Used in hero backgrounds
- Accent and primary color combinations

**Animations:**
- fade-in-up: 0.6s ease-out with stagger delays
- Stagger classes: stagger-1 through stagger-6 (0.1s increments)
- float: 6s ease-in-out infinite for floating elements
- pulse-glow: 2s ease-in-out infinite for attention CTAs

### Shadows
```css
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
--shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03);
--shadow-md: 0 6px 12px rgba(0, 0, 0, 0.06), 0 4px 6px rgba(0, 0, 0, 0.03);
--shadow-lg: 0 12px 24px rgba(0, 0, 0, 0.08), 0 6px 12px rgba(0, 0, 0, 0.04);
--shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.05);
```

## Section Patterns

### Hero Sections
- Asymmetric 7/5 or 8/4 column splits
- Large editorial headlines with highlight underlines
- Floating badges and social proof elements
- Gradient mesh backgrounds with geometric accents
- Staggered reveal animations

### Stats Sections
- Border-y with muted background
- 4-column grid with centered content
- Large data-ticker numbers with accent suffixes
- Icon badges above numbers

### Feature Sections
- Editorial-style section headers (eyebrow + headline + description)
- Gold accent underlines on key words
- 4-column card grids
- Bottom accent lines on cards

### CTA Sections
- Full-width primary background
- Gradient overlay with grain texture
- Decorative circles/geometric shapes
- Centered content with max-w-4xl

## Accessibility
- All interactive elements: Minimum 44x44px touch target
- Form validation: Inline error messages
- Color contrast: All text meets WCAG AA standards
- Focus indicators: ring-2 ring-accent with offset
- Keyboard navigation support

## Key Utility Classes

| Class | Purpose |
|-------|---------|
| `font-display` | Playfair Display headlines |
| `data-ticker` | Monospace numbers with tabular-nums |
| `glass-card` | Glassmorphism card effect |
| `grain-overlay` | Subtle texture overlay |
| `btn-glow` | Shimmer effect on buttons |
| `headline-accent` | Gold underline on text |
| `editorial-rule` | Magazine-style divider line |
| `animate-fade-in-up` | Entrance animation |
| `stagger-{1-6}` | Animation delay classes |

This design system prioritizes trust, sophistication, and data clarity for franchise investment decisions while maintaining a distinctive, premium aesthetic that differentiates ZeeVerify from generic SaaS platforms.
