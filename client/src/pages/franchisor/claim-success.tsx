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
  Loader2,
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
      const res = await fetch(`/api/checkout/verify-session?session_id=${sessionId}`, {
        credentials: "include",
      });
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
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Verifying your payment...</p>
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
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
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
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
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
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
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
