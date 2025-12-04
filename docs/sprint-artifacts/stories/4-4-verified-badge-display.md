# Story 4.4: Verified Badge Display

## Story Info
- **Epic:** 4 - Brand Claiming with Stripe
- **Story ID:** 4.4
- **Title:** Verified Badge Display
- **Status:** ready-for-dev
- **Dependencies:** Story 4.3

## User Story

As a **visitor**,
I want **to see which brands are verified/claimed**,
So that **I know which franchisors are actively managing their presence**.

## Acceptance Criteria

### AC1: Badge on Claimed Brand
**Given** a brand has been claimed
**When** viewing the brand card or detail page
**Then** a verified badge is displayed prominently
**And** the badge follows design system (gold accent color)

### AC2: No Badge on Unclaimed
**Given** a brand is not claimed
**When** viewing the brand
**Then** no verified badge is shown
**And** franchisors see "Claim This Brand" CTA

### AC3: Detail Page Info
**Given** a brand was claimed
**When** viewing the brand detail page
**Then** I can see:
- Verified badge
- "Claimed by {company name}" indicator
- Franchisor responses to reviews enabled

## Technical Notes

### Files to Create/Modify
- **Create:** `client/src/components/verified-badge.tsx`
- **Modify:** `client/src/components/brand-card.tsx` - Add badge
- **Modify:** Brand detail page - Add badge and claimed info

### Component Implementation
```typescript
// client/src/components/verified-badge.tsx
import { Shield, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function VerifiedBadge({
  size = "md",
  showTooltip = true,
  className,
}: VerifiedBadgeProps) {
  const badge = (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-[#c9a962] p-1",
        className
      )}
    >
      <CheckCircle className={cn("text-[#1a1f36]", sizeClasses[size])} />
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">Verified Brand</p>
          <p className="text-xs text-muted-foreground">
            This franchisor has claimed and verified their listing
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Text badge variant for detail pages
export function VerifiedBadgeText({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-[#c9a962]/10 px-3 py-1 text-sm font-medium text-[#c9a962]",
        className
      )}
    >
      <Shield className="h-4 w-4" />
      Verified Franchisor
    </div>
  );
}
```

### Brand Card Update
```typescript
// Update client/src/components/brand-card.tsx

import { VerifiedBadge } from "./verified-badge";

export function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Card className="relative">
      {brand.isClaimed && (
        <div className="absolute top-3 right-3">
          <VerifiedBadge />
        </div>
      )}

      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{brand.name}</CardTitle>
          {brand.isClaimed && <VerifiedBadge size="sm" showTooltip={false} />}
        </div>
      </CardHeader>

      <CardContent>
        {/* Existing content */}

        {/* Claim CTA for unclaimed brands (shown to franchisors) */}
        {!brand.isClaimed && (
          <Link href={`/franchisor/claim/${brand.id}`}>
            <Button variant="outline" size="sm" className="mt-4">
              Claim This Brand
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
```

### Brand Detail Page Update
```typescript
// Update brand detail page

import { VerifiedBadge, VerifiedBadgeText } from "@/components/verified-badge";
import { useAuth } from "@/hooks/useAuth";

export function BrandDetailPage() {
  const { user } = useAuth();
  const isFranchisor = user?.role === "franchisor";

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-4xl font-bold">{brand.name}</h1>
        {brand.isClaimed && <VerifiedBadgeText />}
      </div>

      {brand.isClaimed ? (
        <div className="bg-muted rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <VerifiedBadge size="lg" />
            <div>
              <p className="font-medium">Verified Franchisor</p>
              <p className="text-sm text-muted-foreground">
                This brand is actively managed by the official franchisor
              </p>
            </div>
          </div>
        </div>
      ) : (
        isFranchisor && (
          <Card className="mb-6 border-dashed">
            <CardContent className="py-6 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">Is this your brand?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Claim this listing to respond to reviews and get a verified badge
              </p>
              <Link href={`/franchisor/claim/${brand.id}`}>
                <Button>Claim This Brand</Button>
              </Link>
            </CardContent>
          </Card>
        )
      )}

      {/* Reviews section - show responses only if claimed */}
      <ReviewsList
        brandId={brand.id}
        showResponses={brand.isClaimed}
        canRespond={brand.isClaimed && brand.claimedById === user?.id}
      />
    </div>
  );
}
```

### Design System Reference
- Badge background: Gold accent `#c9a962`
- Icon color: Navy `#1a1f36`
- Text badge uses gold at 10% opacity for background

## Definition of Done
- [ ] `VerifiedBadge` component created
- [ ] `VerifiedBadgeText` variant created
- [ ] Brand cards show badge for claimed brands
- [ ] Brand detail shows badge and verified section
- [ ] Unclaimed brands show "Claim This Brand" CTA
- [ ] CTA only visible to franchisors
- [ ] Badge uses design system colors
- [ ] Tooltip explains verification
- [ ] TypeScript compiles without errors

## Test Scenarios
1. **Claimed Brand Card:** Badge visible
2. **Unclaimed Brand Card:** No badge, CTA shown to franchisors
3. **Claimed Detail Page:** Badge, verified section
4. **Unclaimed Detail (Franchisor):** Claim CTA shown
5. **Unclaimed Detail (Non-Franchisor):** No CTA
6. **Badge Tooltip:** Explanation on hover
