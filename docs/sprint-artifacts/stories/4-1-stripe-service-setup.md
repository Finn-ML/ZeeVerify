# Story 4.1: Stripe Service Setup

## Story Info
- **Epic:** 4 - Brand Claiming with Stripe
- **Story ID:** 4.1
- **Title:** Stripe Service Setup
- **Status:** Ready for Review
- **Dependencies:** None

## User Story

As a **developer**,
I want **a Stripe service configured for payments**,
So that **the application can process brand claiming payments**.

## Acceptance Criteria

### AC1: Service Initialization
**Given** the server is starting up
**When** the StripeService is initialized
**Then** it connects using STRIPE_SECRET_KEY environment variable
**And** the service is available for creating checkout sessions

### AC2: Graceful Degradation
**Given** Stripe environment variables are missing
**When** attempting payment operations
**Then** the service logs errors and returns graceful failures
**And** users see "Payment temporarily unavailable" message

## Technical Notes

### Files to Create/Modify
- **Create:** `server/services/stripe.ts`

### Implementation Details
```typescript
// server/services/stripe.ts
import Stripe from "stripe";

export class StripeService {
  private stripe: Stripe | null = null;
  private priceId: string | null = null;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_BRAND_CLAIM_PRICE_ID;

    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: "2023-10-16",
      });
      this.priceId = priceId || null;
    } else {
      console.error("STRIPE_SECRET_KEY not configured - payment service disabled");
    }
  }

  isAvailable(): boolean {
    return this.stripe !== null && this.priceId !== null;
  }

  async createCheckoutSession(options: {
    brandId: number;
    brandName: string;
    userId: number;
    userEmail: string;
    returnUrl: string;
  }): Promise<{ clientSecret: string } | null> {
    if (!this.stripe || !this.priceId) {
      console.error("Stripe not configured");
      return null;
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        ui_mode: "embedded",
        mode: "payment",
        line_items: [
          {
            price: this.priceId,
            quantity: 1,
          },
        ],
        metadata: {
          brandId: options.brandId.toString(),
          userId: options.userId.toString(),
          brandName: options.brandName,
        },
        customer_email: options.userEmail,
        return_url: options.returnUrl,
      });

      return { clientSecret: session.client_secret! };
    } catch (error) {
      console.error("Failed to create checkout session:", error);
      return null;
    }
  }

  async retrieveSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
    if (!this.stripe) return null;

    try {
      return await this.stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      console.error("Failed to retrieve session:", error);
      return null;
    }
  }

  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event | null {
    if (!this.stripe) return null;

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return null;
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return null;
    }
  }
}

export const stripeService = new StripeService();
```

### Dependencies to Install
```bash
npm install stripe
```

### Environment Variables
| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret API key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (for client) |
| `STRIPE_WEBHOOK_SECRET` | Webhook endpoint signing secret |
| `STRIPE_BRAND_CLAIM_PRICE_ID` | Price ID for brand claiming product |

### Stripe Dashboard Setup
1. Create a product "Brand Claim" in Stripe Dashboard
2. Create a one-time price for the product
3. Copy the price ID (price_xxx) to env variable
4. Set up webhook endpoint for checkout.session.completed

## Definition of Done
- [x] `server/services/stripe.ts` created
- [x] `stripe` package installed
- [x] Service exports singleton `stripeService`
- [x] `createCheckoutSession()` method works
- [x] `retrieveSession()` method works
- [x] `constructWebhookEvent()` method works
- [x] Graceful degradation when not configured
- [x] TypeScript compiles without errors

## Test Scenarios
1. **Config Present:** Service initializes successfully
2. **Config Missing:** Service logs error, methods return null
3. **Create Session:** Returns client secret
4. **Invalid Price:** Error handled gracefully
5. **Webhook Verification:** Valid signatures pass

---

## Dev Agent Record

### Implementation Plan
1. Install stripe package (v20.0.0)
2. Create StripeService class with constructor that initializes Stripe client
3. Implement `isAvailable()` method for configuration check
4. Implement `createCheckoutSession()` for embedded checkout
5. Implement `retrieveSession()` for session retrieval
6. Implement `constructWebhookEvent()` for webhook verification
7. Export singleton `stripeService` instance
8. Set up vitest testing framework
9. Write comprehensive unit tests with mocked Stripe

### Debug Log
- Updated Stripe API version: Removed explicit `apiVersion` parameter to use SDK default (2025-11-17.clover) since Stripe SDK v20.0.0 expects the latest version
- Created vitest.config.ts to configure test runner for server directory

### Completion Notes
- All 12 unit tests passing
- Service gracefully degrades when STRIPE_SECRET_KEY is missing
- Service gracefully degrades when STRIPE_BRAND_CLAIM_PRICE_ID is missing
- Webhook verification gracefully degrades when STRIPE_WEBHOOK_SECRET is missing
- TypeScript compiles without errors (pre-existing errors in admin/index.tsx and compare.tsx are unrelated)

---

## File List

### Created
- `server/services/stripe.ts` - Stripe service implementation
- `server/services/stripe.test.ts` - Unit tests for Stripe service
- `vitest.config.ts` - Vitest test runner configuration

### Modified
- `package.json` - Added stripe dependency, vitest devDependency, test scripts

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-04 | Initial implementation of Stripe service with full test coverage | Dev Agent |
