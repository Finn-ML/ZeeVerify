import Stripe from "stripe";

/**
 * StripeService - Stripe integration for payment processing
 *
 * Requires STRIPE_SECRET_KEY environment variable.
 * Gracefully degrades when credentials are missing - methods return null instead of throwing.
 */
export class StripeService {
  private stripe: Stripe | null = null;
  private priceId: string | null = null;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_BRAND_CLAIM_PRICE_ID;

    if (secretKey) {
      this.stripe = new Stripe(secretKey);
      this.priceId = priceId || null;
    } else {
      console.error("STRIPE_SECRET_KEY not configured - payment service disabled");
    }
  }

  /**
   * Check if the Stripe service is available and configured
   * @returns true if Stripe is configured with API key and price ID
   */
  isAvailable(): boolean {
    return this.stripe !== null && this.priceId !== null;
  }

  /**
   * Create an embedded checkout session for brand claiming
   * @param options - Checkout session options
   * @returns Client secret for embedded checkout, or null on failure
   */
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

  /**
   * Retrieve a checkout session by ID
   * @param sessionId - The Stripe session ID
   * @returns The checkout session, or null on failure
   */
  async retrieveSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
    if (!this.stripe) return null;

    try {
      return await this.stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      console.error("Failed to retrieve session:", error);
      return null;
    }
  }

  /**
   * Construct and verify a webhook event from Stripe
   * @param payload - Raw request body as Buffer
   * @param signature - Stripe-Signature header value
   * @returns Verified Stripe event, or null on failure
   */
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

// Singleton instance for use across the application
export const stripeService = new StripeService();
