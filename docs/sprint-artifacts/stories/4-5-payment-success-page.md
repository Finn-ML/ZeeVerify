# Story 4.5: Payment Success Page

## Story Info
- **Epic:** 4 - Brand Claiming with Stripe
- **Story ID:** 4.5
- **Title:** Payment Success Page
- **Status:** ready-for-dev
- **Dependencies:** Story 4.3

## User Story

As a **franchisor who just completed payment**,
I want **to see confirmation of my brand claim**,
So that **I know the process completed successfully**.

## Acceptance Criteria

### AC1: Success Confirmation
**Given** I complete Stripe checkout
**When** I am redirected to the success page
**Then** I see:
- "Congratulations! You've claimed {Brand Name}"
- Verified badge preview
- Next steps (respond to reviews, update brand info)
- Link to franchisor dashboard

### AC2: Invalid Session
**Given** I visit the success page without valid session
**When** the page loads
**Then** I am redirected to my dashboard

## Technical Notes

### Files to Create/Modify
- **Create:** `client/src/pages/franchisor/claim-success.tsx`
- **Modify:** `server/routes.ts` - Add session verification endpoint

### Frontend Implementation
```typescript
// client/src/pages/franchisor/claim-success.tsx
import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/verified-badge";
import {
  CheckCircle,
  MessageSquare,
  Settings,
  BarChart,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function ClaimSuccessPage() {
  const search = useSearch();
  const sessionId = new URLSearchParams(search).get("session_id");
  const [, setLocation] = useLocation();

  // Verify session and get details
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/checkout/verify-session", sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error("No session ID");
      const res = await fetch(`/api/checkout/verify-session?session_id=${sessionId}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    enabled: !!sessionId,
    retry: false,
  });

  // Redirect if no valid session
  useEffect(() => {
    if (error || (!isLoading && !data)) {
      setLocation("/franchisor");
    }
  }, [error, isLoading, data, setLocation]);

  // Celebration confetti!
  useEffect(() => {
    if (data?.success) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#c9a962", "#1a1f36", "#ffffff"],
      });
    }
  }, [data?.success]);

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mx-auto mb-4" />
          <div className="h-4 w-64 bg-muted rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (!data?.success) {
    return null; // Will redirect
  }

  return (
    <div className="container max-w-2xl py-16">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Congratulations!</h1>
        <p className="text-xl text-muted-foreground">
          You've successfully claimed <strong>{data.brandName}</strong>
        </p>
      </div>

      {/* Badge Preview */}
      <Card className="mb-8">
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-4">
            <VerifiedBadge size="lg" />
            <div>
              <p className="font-semibold">{data.brandName}</p>
              <p className="text-sm text-muted-foreground">
                Now displays the verified badge
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
              1
            </div>
            <div className="flex-1">
              <p className="font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Respond to Reviews
              </p>
              <p className="text-sm text-muted-foreground">
                Engage with franchisee feedback to show you care about their experience
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
              2
            </div>
            <div className="flex-1">
              <p className="font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Update Brand Profile
              </p>
              <p className="text-sm text-muted-foreground">
                Add your logo, description, and videos to enhance your listing
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
              3
            </div>
            <div className="flex-1">
              <p className="font-medium flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Monitor Analytics
              </p>
              <p className="text-sm text-muted-foreground">
                Track your review metrics and overall sentiment score
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild className="flex-1">
          <a href={`/brands/${data.brandId}`}>
            View Your Listing
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <a href="/franchisor">
            Go to Dashboard
          </a>
        </Button>
      </div>

      {/* Receipt Info */}
      <p className="text-center text-sm text-muted-foreground mt-8">
        A receipt has been sent to your email. Transaction ID: {sessionId?.slice(-8)}
      </p>
    </div>
  );
}
```

### Backend - Session Verification
```typescript
// Add to server/routes.ts

app.get("/api/checkout/verify-session", isAuthenticated, async (req, res) => {
  const sessionId = req.query.session_id as string;
  const userId = req.user!.id;

  if (!sessionId) {
    return res.status(400).json({ message: "Session ID required" });
  }

  // Verify session with Stripe
  const session = await stripeService.retrieveSession(sessionId);

  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  // Verify this session belongs to the current user
  if (session.metadata?.userId !== userId.toString()) {
    return res.status(403).json({ message: "Access denied" });
  }

  // Check if payment was successful
  if (session.payment_status !== "paid") {
    return res.status(400).json({ message: "Payment not completed" });
  }

  // Get brand info
  const brandId = parseInt(session.metadata?.brandId || "0");
  const brand = await storage.getBrand(brandId);

  res.json({
    success: true,
    brandId,
    brandName: brand?.name || session.metadata?.brandName,
    amount: (session.amount_total || 0) / 100,
  });
});
```

### Optional: Confetti Package
```bash
npm install canvas-confetti @types/canvas-confetti
```

## Definition of Done
- [ ] `client/src/pages/franchisor/claim-success.tsx` created
- [ ] `GET /api/checkout/verify-session` route added
- [ ] Session verification with Stripe
- [ ] User ownership verification
- [ ] Brand name displayed
- [ ] Verified badge preview shown
- [ ] Next steps guidance
- [ ] Dashboard and listing links
- [ ] Invalid session redirects to dashboard
- [ ] Confetti celebration (optional)
- [ ] TypeScript compiles without errors

## Test Scenarios
1. **Valid Session:** Success page displays
2. **No Session ID:** Redirects to dashboard
3. **Invalid Session:** Redirects to dashboard
4. **Wrong User:** Access denied
5. **Unpaid Session:** Error shown
6. **Links Work:** Dashboard and listing accessible
