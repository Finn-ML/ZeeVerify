# Story 4.1: Stripe Service Setup

## Story Info
- **Epic:** 4 - Brand Claiming with Stripe
- **Story ID:** 4.1
- **Title:** Stripe Service Setup
- **Status:** ready-for-dev
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
- [ ] `server/services/stripe.ts` created
- [ ] `stripe` package installed
- [ ] Service exports singleton `stripeService`
- [ ] `createCheckoutSession()` method works
- [ ] `retrieveSession()` method works
- [ ] `constructWebhookEvent()` method works
- [ ] Graceful degradation when not configured
- [ ] TypeScript compiles without errors

## Test Scenarios
1. **Config Present:** Service initializes successfully
2. **Config Missing:** Service logs error, methods return null
3. **Create Session:** Returns client secret
4. **Invalid Price:** Error handled gracefully
5. **Webhook Verification:** Valid signatures pass
