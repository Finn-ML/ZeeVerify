import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock Stripe module before importing the service
vi.mock("stripe", () => {
  const mockCheckoutSession = {
    id: "cs_test_123",
    client_secret: "cs_test_secret_123",
    status: "open",
    metadata: {
      brandId: "1",
      userId: "1",
      brandName: "Test Brand",
    },
  };

  // Create a mock class that mimics Stripe constructor
  class MockStripe {
    checkout = {
      sessions: {
        create: vi.fn().mockResolvedValue(mockCheckoutSession),
        retrieve: vi.fn().mockResolvedValue(mockCheckoutSession),
      },
    };
    webhooks = {
      constructEvent: vi.fn().mockReturnValue({
        id: "evt_test_123",
        type: "checkout.session.completed",
        data: { object: mockCheckoutSession },
      }),
    };
  }

  return { default: MockStripe };
});

describe("StripeService", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("Service Initialization", () => {
    it("should initialize when STRIPE_SECRET_KEY is configured", async () => {
      process.env.STRIPE_SECRET_KEY = "sk_test_123";
      process.env.STRIPE_BRAND_CLAIM_PRICE_ID = "price_123";

      const { StripeService } = await import("./stripe");
      const service = new StripeService();

      expect(service.isAvailable()).toBe(true);
    });

    it("should not be available when STRIPE_SECRET_KEY is missing", async () => {
      delete process.env.STRIPE_SECRET_KEY;
      delete process.env.STRIPE_BRAND_CLAIM_PRICE_ID;

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { StripeService } = await import("./stripe");
      const service = new StripeService();

      expect(service.isAvailable()).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "STRIPE_SECRET_KEY not configured - payment service disabled"
      );

      consoleErrorSpy.mockRestore();
    });

    it("should not be available when price ID is missing", async () => {
      process.env.STRIPE_SECRET_KEY = "sk_test_123";
      delete process.env.STRIPE_BRAND_CLAIM_PRICE_ID;

      const { StripeService } = await import("./stripe");
      const service = new StripeService();

      expect(service.isAvailable()).toBe(false);
    });
  });

  describe("createCheckoutSession", () => {
    it("should create a checkout session and return client secret", async () => {
      process.env.STRIPE_SECRET_KEY = "sk_test_123";
      process.env.STRIPE_BRAND_CLAIM_PRICE_ID = "price_123";

      const { StripeService } = await import("./stripe");
      const service = new StripeService();

      const result = await service.createCheckoutSession({
        brandId: "brand-uuid-1",
        brandName: "Test Brand",
        userId: "user-uuid-1",
        userEmail: "test@example.com",
        returnUrl: "http://localhost:5000/payment/success",
      });

      expect(result).toEqual({ clientSecret: "cs_test_secret_123" });
    });

    it("should return null when service is not configured", async () => {
      delete process.env.STRIPE_SECRET_KEY;
      delete process.env.STRIPE_BRAND_CLAIM_PRICE_ID;

      vi.spyOn(console, "error").mockImplementation(() => {});

      const { StripeService } = await import("./stripe");
      const service = new StripeService();

      const result = await service.createCheckoutSession({
        brandId: "brand-uuid-1",
        brandName: "Test Brand",
        userId: "user-uuid-1",
        userEmail: "test@example.com",
        returnUrl: "http://localhost:5000/payment/success",
      });

      expect(result).toBeNull();
    });
  });

  describe("retrieveSession", () => {
    it("should retrieve a checkout session by ID", async () => {
      process.env.STRIPE_SECRET_KEY = "sk_test_123";
      process.env.STRIPE_BRAND_CLAIM_PRICE_ID = "price_123";

      const { StripeService } = await import("./stripe");
      const service = new StripeService();

      const result = await service.retrieveSession("cs_test_123");

      expect(result).toBeDefined();
      expect(result?.id).toBe("cs_test_123");
    });

    it("should return null when service is not configured", async () => {
      delete process.env.STRIPE_SECRET_KEY;

      vi.spyOn(console, "error").mockImplementation(() => {});

      const { StripeService } = await import("./stripe");
      const service = new StripeService();

      const result = await service.retrieveSession("cs_test_123");

      expect(result).toBeNull();
    });
  });

  describe("constructWebhookEvent", () => {
    it("should construct and verify a webhook event", async () => {
      process.env.STRIPE_SECRET_KEY = "sk_test_123";
      process.env.STRIPE_BRAND_CLAIM_PRICE_ID = "price_123";
      process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_123";

      const { StripeService } = await import("./stripe");
      const service = new StripeService();

      const payload = Buffer.from('{"type":"checkout.session.completed"}');
      const signature = "test_signature";

      const result = service.constructWebhookEvent(payload, signature);

      expect(result).toBeDefined();
      expect(result?.type).toBe("checkout.session.completed");
    });

    it("should return null when webhook secret is not configured", async () => {
      process.env.STRIPE_SECRET_KEY = "sk_test_123";
      process.env.STRIPE_BRAND_CLAIM_PRICE_ID = "price_123";
      delete process.env.STRIPE_WEBHOOK_SECRET;

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { StripeService } = await import("./stripe");
      const service = new StripeService();

      const payload = Buffer.from('{"type":"checkout.session.completed"}');
      const signature = "test_signature";

      const result = service.constructWebhookEvent(payload, signature);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith("STRIPE_WEBHOOK_SECRET not configured");

      consoleErrorSpy.mockRestore();
    });

    it("should return null when service is not configured", async () => {
      delete process.env.STRIPE_SECRET_KEY;

      vi.spyOn(console, "error").mockImplementation(() => {});

      const { StripeService } = await import("./stripe");
      const service = new StripeService();

      const payload = Buffer.from('{"type":"checkout.session.completed"}');
      const signature = "test_signature";

      const result = service.constructWebhookEvent(payload, signature);

      expect(result).toBeNull();
    });
  });

  describe("Graceful Degradation", () => {
    it("should log error and return graceful failures when not configured", async () => {
      delete process.env.STRIPE_SECRET_KEY;

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { StripeService } = await import("./stripe");
      const service = new StripeService();

      // All operations should return null/false gracefully
      expect(service.isAvailable()).toBe(false);
      expect(
        await service.createCheckoutSession({
          brandId: "brand-uuid-1",
          brandName: "Test",
          userId: "user-uuid-1",
          userEmail: "test@example.com",
          returnUrl: "http://localhost",
        })
      ).toBeNull();
      expect(await service.retrieveSession("cs_123")).toBeNull();
      expect(service.constructWebhookEvent(Buffer.from("{}"), "sig")).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Singleton Export", () => {
    it("should export a singleton stripeService instance", async () => {
      process.env.STRIPE_SECRET_KEY = "sk_test_123";
      process.env.STRIPE_BRAND_CLAIM_PRICE_ID = "price_123";

      const { stripeService } = await import("./stripe");

      expect(stripeService).toBeDefined();
      expect(typeof stripeService.isAvailable).toBe("function");
      expect(typeof stripeService.createCheckoutSession).toBe("function");
      expect(typeof stripeService.retrieveSession).toBe("function");
      expect(typeof stripeService.constructWebhookEvent).toBe("function");
    });
  });
});
