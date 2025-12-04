# Story 4.3: Stripe Webhook Handler

## Story Info
- **Epic:** 4 - Brand Claiming with Stripe
- **Story ID:** 4.3
- **Title:** Stripe Webhook Handler
- **Status:** ready-for-dev
- **Dependencies:** Story 4.2

## User Story

As a **system**,
I want **to process Stripe webhooks**,
So that **brand claims are activated after successful payment**.

## Acceptance Criteria

### AC1: Successful Payment Webhook
**Given** a checkout.session.completed webhook is received
**When** the webhook is verified and processed
**Then** the brand is marked as claimed:
- `isClaimed` = true
- `claimedById` = userId from metadata
- `claimedAt` = current timestamp
**And** the payment is recorded in payments table
**And** a confirmation email is sent to the franchisor

### AC2: Invalid Signature
**Given** a webhook with invalid signature
**When** the webhook endpoint receives it
**Then** the request is rejected with 400 status
**And** the event is logged for security monitoring

### AC3: Other Event Types
**Given** the webhook is for a different event type
**When** processing the webhook
**Then** it is acknowledged (200) but no action taken

## Technical Notes

### Files to Create/Modify
- **Modify:** `server/routes.ts` - Add webhook route
- **Modify:** `server/index.ts` - Add raw body parser for webhook
- **Modify:** `shared/schema.ts` - Create payments table

### Schema Update
```typescript
// Add to shared/schema.ts

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  brandId: integer("brand_id").notNull().references(() => brands.id),
  stripeSessionId: varchar("stripe_session_id", { length: 255 }).notNull().unique(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  amount: integer("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("usd").notNull(),
  status: varchar("status", { length: 50 }).default("completed").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
```

### Raw Body Parser Setup
```typescript
// server/index.ts - BEFORE json middleware
import express from "express";

// Webhook needs raw body for signature verification
app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }));

// Standard JSON parser for other routes
app.use(express.json());
```

### Backend Implementation
```typescript
// Add to server/routes.ts
import { stripeService } from "./services/stripe";

app.post("/api/webhooks/stripe", async (req, res) => {
  const signature = req.headers["stripe-signature"] as string;

  if (!signature) {
    console.error("Webhook missing signature");
    return res.status(400).json({ message: "Missing signature" });
  }

  // Verify webhook signature
  const event = stripeService.constructWebhookEvent(req.body, signature);

  if (!event) {
    console.error("Webhook signature verification failed");
    return res.status(400).json({ message: "Invalid signature" });
  }

  // Handle specific events
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // Extract metadata
      const brandId = parseInt(session.metadata?.brandId || "0");
      const userId = parseInt(session.metadata?.userId || "0");

      if (!brandId || !userId) {
        console.error("Webhook missing metadata:", session.id);
        return res.status(400).json({ message: "Invalid session metadata" });
      }

      // Idempotency check - has this payment already been processed?
      const existingPayment = await storage.getPaymentBySessionId(session.id);
      if (existingPayment) {
        console.log("Payment already processed:", session.id);
        return res.json({ received: true, status: "already_processed" });
      }

      try {
        // Record payment
        await storage.createPayment({
          userId,
          brandId,
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent as string,
          amount: session.amount_total || 0,
          currency: session.currency || "usd",
          status: "completed",
        });

        // Mark brand as claimed
        await storage.claimBrand(brandId, userId);

        // Send confirmation email
        const user = await storage.getUser(userId);
        const brand = await storage.getBrand(brandId);

        if (user && brand) {
          await emailService.sendPaymentConfirmation(
            user.email,
            brand.name,
            (session.amount_total || 0) / 100, // Convert cents to dollars
            session.id,
            session.receipt_url || undefined
          );
        }

        console.log(`Brand ${brandId} claimed by user ${userId}`);
        return res.json({ received: true, status: "success" });
      } catch (error) {
        console.error("Error processing payment:", error);
        return res.status(500).json({ message: "Processing failed" });
      }
    }

    case "checkout.session.expired": {
      console.log("Checkout session expired:", event.data.object.id);
      return res.json({ received: true });
    }

    default: {
      console.log("Unhandled webhook event:", event.type);
      return res.json({ received: true });
    }
  }
});
```

### Storage Methods Required
```typescript
// Add to server/storage.ts

getPaymentBySessionId(sessionId: string): Promise<Payment | undefined>
createPayment(data: InsertPayment): Promise<Payment>
claimBrand(brandId: number, userId: number): Promise<void>
// Sets isClaimed=true, claimedById=userId, claimedAt=now()
```

### Webhook Event Types to Handle
| Event | Action |
|-------|--------|
| `checkout.session.completed` | Process payment, claim brand |
| `checkout.session.expired` | Log only |
| Others | Acknowledge, no action |

### Stripe Dashboard Webhook Setup
1. Go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `checkout.session.expired`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

## Definition of Done
- [ ] `POST /api/webhooks/stripe` route added
- [ ] Raw body parser configured for webhook route
- [ ] `payments` table created in schema
- [ ] Signature verification implemented
- [ ] `checkout.session.completed` handler works
- [ ] Brand marked as claimed on success
- [ ] Payment recorded in database
- [ ] Idempotency check prevents duplicate processing
- [ ] Confirmation email sent
- [ ] TypeScript compiles without errors

## Test Scenarios
1. **Valid Webhook:** Brand claimed, payment recorded
2. **Invalid Signature:** 400 error returned
3. **Missing Metadata:** Error logged, 400 returned
4. **Duplicate Event:** Idempotent, already_processed
5. **Unknown Event:** 200 returned, no action
6. **DB Error:** 500 returned, logged
