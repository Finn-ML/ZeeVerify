# Story 4.2: Brand Claim Checkout Flow

## Story Info
- **Epic:** 4 - Brand Claiming with Stripe
- **Story ID:** 4.2
- **Title:** Brand Claim Checkout Flow
- **Status:** ready-for-dev
- **Dependencies:** Story 4.1, Epic 2 complete

## User Story

As a **franchisor**,
I want **to pay to claim my brand listing**,
So that **I get a verified badge and can respond to reviews**.

## Acceptance Criteria

### AC1: Claim Button
**Given** I am a logged-in franchisor viewing an unclaimed brand
**When** I click "Claim This Brand"
**Then** I see the claim benefits and price
**And** I can proceed to checkout

### AC2: Checkout Page
**Given** I proceed to checkout
**When** the checkout page loads
**Then** `POST /api/checkout/create-session` is called
**And** Stripe Embedded Checkout renders on the page
**And** I see the brand name and claim price

### AC3: Successful Payment
**Given** I complete payment successfully
**When** Stripe processes the payment
**Then** I see a success message on the return URL
**And** the brand claim is pending webhook confirmation

### AC4: Failed Payment
**Given** payment fails
**When** Stripe returns an error
**Then** I see appropriate error message
**And** I can retry the payment

## Technical Notes

### Files to Create/Modify
- **Create:** `client/src/pages/franchisor/claim-brand.tsx`
- **Modify:** `server/routes.ts` - Add checkout route

### Client Dependencies
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### Frontend Implementation
```typescript
// client/src/pages/franchisor/claim-brand.tsx
import { useEffect, useState, useCallback } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, Shield, MessageSquare, BarChart } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function ClaimBrandPage() {
  const params = useParams<{ brandId: string }>();
  const brandId = parseInt(params.brandId);
  const [showCheckout, setShowCheckout] = useState(false);

  // Fetch brand details
  const { data: brand, isLoading } = useQuery({
    queryKey: ["/api/brands", brandId],
    queryFn: async () => {
      const res = await fetch(`/api/brands/${brandId}`);
      if (!res.ok) throw new Error("Brand not found");
      return res.json();
    },
  });

  // Create checkout session
  const fetchClientSecret = useCallback(async () => {
    const res = await fetch("/api/checkout/create-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId }),
    });
    if (!res.ok) throw new Error("Failed to create session");
    const data = await res.json();
    return data.clientSecret;
  }, [brandId]);

  if (isLoading) return <div>Loading...</div>;
  if (!brand) return <div>Brand not found</div>;
  if (brand.isClaimed) return <div>This brand is already claimed</div>;

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">Claim {brand.name}</h1>

      {!showCheckout ? (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Benefits Card */}
          <Card>
            <CardHeader>
              <CardTitle>Claim Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Verified Badge</p>
                  <p className="text-sm text-muted-foreground">
                    Show visitors your brand is officially claimed
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Respond to Reviews</p>
                  <p className="text-sm text-muted-foreground">
                    Engage with franchisee feedback directly
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BarChart className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Analytics Dashboard</p>
                  <p className="text-sm text-muted-foreground">
                    View your brand's review metrics and sentiment
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Card */}
          <Card>
            <CardHeader>
              <CardTitle>Claim Your Listing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-4xl font-bold">$299</p>
                <p className="text-muted-foreground">One-time payment</p>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={() => setShowCheckout(true)}
              >
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ fetchClientSecret }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### Backend Implementation
```typescript
// Add to server/routes.ts

app.post("/api/checkout/create-session", isAuthenticated, async (req, res) => {
  const { brandId } = req.body;
  const user = req.user!;

  // Verify user is a franchisor
  if (user.role !== "franchisor") {
    return res.status(403).json({ message: "Only franchisors can claim brands" });
  }

  // Get brand
  const brand = await storage.getBrand(brandId);
  if (!brand) {
    return res.status(404).json({ message: "Brand not found" });
  }

  if (brand.isClaimed) {
    return res.status(400).json({ message: "Brand is already claimed" });
  }

  // Check Stripe availability
  if (!stripeService.isAvailable()) {
    return res.status(503).json({ message: "Payment temporarily unavailable" });
  }

  // Create checkout session
  const baseUrl = process.env.BASE_URL || "http://localhost:5000";
  const session = await stripeService.createCheckoutSession({
    brandId: brand.id,
    brandName: brand.name,
    userId: user.id,
    userEmail: user.email,
    returnUrl: `${baseUrl}/franchisor/claim-success?session_id={CHECKOUT_SESSION_ID}`,
  });

  if (!session) {
    return res.status(500).json({ message: "Failed to create checkout session" });
  }

  res.json({ clientSecret: session.clientSecret });
});
```

### Environment Variables (Client)
```bash
# .env or vite config
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

## Definition of Done
- [x] `client/src/pages/franchisor/claim-brand.tsx` created
- [x] `@stripe/stripe-js` and `@stripe/react-stripe-js` installed
- [x] `POST /api/checkout/create-session` route added
- [x] Benefits displayed before checkout
- [x] Stripe Embedded Checkout renders
- [x] Brand ID and user ID in session metadata
- [x] Franchisor role check
- [x] Already claimed check
- [x] TypeScript compiles without errors

## Test Scenarios
1. **Non-Franchisor:** Access denied
2. **Already Claimed:** Error shown
3. **Valid Request:** Checkout renders
4. **Payment Success:** Redirected to success page
5. **Payment Failed:** Error shown, can retry
6. **Stripe Unavailable:** Graceful error message

---

## Dev Agent Record

### Files Created
- `client/src/pages/franchisor/claim-brand.tsx` - Claim brand page with embedded checkout

### Files Modified
- `client/src/App.tsx` - Added routes for claim-brand and claim-success
- `server/routes.ts` - Added POST /api/checkout/create-session endpoint
- `package.json` - Installed @stripe/stripe-js, @stripe/react-stripe-js

### Implementation Notes
- Uses EmbeddedCheckoutProvider for Stripe integration
- Displays benefits card before showing checkout
- Validates franchisor role and brand not already claimed
- Returns client secret for embedded checkout

| Date | Change | Author |
|------|--------|--------|
| 2025-12-05 | Implemented brand claim checkout flow | Dev Agent |
