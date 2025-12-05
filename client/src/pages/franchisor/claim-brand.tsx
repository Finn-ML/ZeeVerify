import { useState, useCallback, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, MessageSquare, BarChart, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

export default function ClaimBrandPage() {
  const params = useParams<{ brandId: string }>();
  const brandId = params.brandId;
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Redirect non-franchisors
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "franchisor")) {
      setLocation("/login");
    }
  }, [authLoading, isAuthenticated, user, setLocation]);

  // Fetch brand details
  const { data: brandData, isLoading, error } = useQuery({
    queryKey: ["/api/brands", brandId],
    queryFn: async () => {
      const res = await fetch(`/api/brands/${brandId}`);
      if (!res.ok) throw new Error("Brand not found");
      return res.json();
    },
  });

  const brand = brandData?.brand;

  // Create checkout session
  const fetchClientSecret = useCallback(async () => {
    setCheckoutError(null);
    const res = await fetch("/api/checkout/create-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ brandId }),
    });
    if (!res.ok) {
      const error = await res.json();
      setCheckoutError(error.message || "Failed to create checkout session");
      throw new Error(error.message || "Failed to create session");
    }
    const data = await res.json();
    return data.clientSecret;
  }, [brandId]);

  if (authLoading || isLoading) {
    return (
      <div className="container max-w-4xl py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Don't render if not authenticated franchisor (will redirect)
  if (!isAuthenticated || user?.role !== "franchisor") {
    return null;
  }

  if (error || !brand) {
    return (
      <div className="container max-w-4xl py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Brand not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (brand.isClaimed) {
    return (
      <div className="container max-w-4xl py-8">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            This brand has already been claimed and verified.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="container max-w-4xl py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Payment system is not configured. Please contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container max-w-4xl py-8">
          <h1 className="text-3xl font-bold mb-8">Claim {brand.name}</h1>

          {checkoutError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{checkoutError}</AlertDescription>
            </Alert>
          )}

          {!showCheckout ? (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Benefits Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Claim Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-[#c9a962] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Verified Badge</p>
                      <p className="text-sm text-muted-foreground">
                        Show visitors your brand is officially claimed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-[#c9a962] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Respond to Reviews</p>
                      <p className="text-sm text-muted-foreground">
                        Engage with franchisee feedback directly
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BarChart className="h-5 w-5 text-[#c9a962] mt-0.5 flex-shrink-0" />
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
      </main>
      <Footer />
    </div>
  );
}
