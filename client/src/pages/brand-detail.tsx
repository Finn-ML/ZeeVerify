import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ZScoreBadge } from "@/components/z-score-badge";
import { StarRating } from "@/components/star-rating";
import { ReviewCard } from "@/components/review-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Calendar,
  DollarSign,
  CheckCircle2,
  ExternalLink,
  Share2,
  TrendingUp,
  MessageSquare,
  BarChart3,
  FileText,
  Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Brand, Review, User, ReviewResponse, Lead } from "@shared/schema";

interface BrandDetailData {
  brand: Brand & { claimedBy?: User };
  reviews: (Review & { user?: User; responses?: (ReviewResponse & { user?: User })[] })[];
  wordFrequencies: { word: string; count: number; sentiment: string }[];
}

export default function BrandDetail() {
  const [, params] = useRoute("/brand/:slug");
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [hasSubmittedLead, setHasSubmittedLead] = useState(false);

  const { data, isLoading } = useQuery<BrandDetailData>({
    queryKey: ["/api/brands", params?.slug],
    enabled: !!params?.slug,
  });

  const leadMutation = useMutation({
    mutationFn: async (leadData: Partial<Lead>) => {
      return apiRequest("POST", "/api/leads", leadData);
    },
    onSuccess: () => {
      toast({ title: "Request submitted!", description: "We'll be in touch soon." });
      setLeadFormOpen(false);
      setHasSubmittedLead(true);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit request.", variant: "destructive" });
    },
  });

  const handleLeadSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    leadMutation.mutate({
      brandId: data?.brand.id,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      investmentRange: formData.get("investmentRange") as string,
      timeline: formData.get("timeline") as string,
      message: formData.get("message") as string,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <div className="grid md:grid-cols-3 gap-6">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!data?.brand) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Brand Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The franchise brand you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link href="/directory">Browse Directory</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { brand, reviews, wordFrequencies } = data;

  const formatCurrency = (value: string | null) => {
    if (!value) return "N/A";
    const num = parseFloat(value);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const categoryScores = [
    { name: "Support", score: parseFloat(brand.supportScore || "0"), key: "supportScore" },
    { name: "Training", score: parseFloat(brand.trainingScore || "0"), key: "trainingScore" },
    { name: "Profitability", score: parseFloat(brand.profitabilityScore || "0"), key: "profitabilityScore" },
    { name: "Culture", score: parseFloat(brand.cultureScore || "0"), key: "cultureScore" },
  ];

  const positiveWords = wordFrequencies?.filter((w) => w.sentiment === "positive").slice(0, 10) || [];
  const negativeWords = wordFrequencies?.filter((w) => w.sentiment === "negative").slice(0, 10) || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="bg-gradient-to-br from-primary/10 to-cyan-500/5 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-xl bg-card border flex items-center justify-center shrink-0">
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="h-full w-full object-cover rounded-xl"
                  />
                ) : (
                  <Building2 className="h-12 w-12 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-start gap-3">
                  <h1 className="text-3xl md:text-4xl font-bold">{brand.name}</h1>
                  {brand.isClaimed && (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      Verified
                    </Badge>
                  )}
                </div>

                <p className="text-muted-foreground max-w-2xl">
                  {brand.description || "No description available."}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {brand.category && (
                    <Badge variant="outline">{brand.category}</Badge>
                  )}
                  {brand.industry && (
                    <Badge variant="outline">{brand.industry}</Badge>
                  )}
                  {brand.headquarters && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {brand.headquarters}
                    </span>
                  )}
                  {brand.yearFounded && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Founded {brand.yearFounded}
                    </span>
                  )}
                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Dialog open={leadFormOpen} onOpenChange={setLeadFormOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2" data-testid="button-request-info">
                        <MessageSquare className="h-4 w-4" />
                        Request Information
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Request More Information</DialogTitle>
                        <DialogDescription>
                          Fill out this form to receive detailed information about {brand.name}.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleLeadSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" name="firstName" required data-testid="input-lead-firstname" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" name="lastName" required data-testid="input-lead-lastname" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" name="email" type="email" required data-testid="input-lead-email" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input id="phone" name="phone" type="tel" data-testid="input-lead-phone" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="investmentRange">Investment Range</Label>
                            <Select name="investmentRange">
                              <SelectTrigger data-testid="select-investment">
                                <SelectValue placeholder="Select range" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="under-50k">Under $50K</SelectItem>
                                <SelectItem value="50k-100k">$50K - $100K</SelectItem>
                                <SelectItem value="100k-250k">$100K - $250K</SelectItem>
                                <SelectItem value="250k-500k">$250K - $500K</SelectItem>
                                <SelectItem value="over-500k">Over $500K</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="timeline">Timeline</Label>
                            <Select name="timeline">
                              <SelectTrigger data-testid="select-timeline">
                                <SelectValue placeholder="Select timeline" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="immediately">Immediately</SelectItem>
                                <SelectItem value="1-3-months">1-3 Months</SelectItem>
                                <SelectItem value="3-6-months">3-6 Months</SelectItem>
                                <SelectItem value="6-12-months">6-12 Months</SelectItem>
                                <SelectItem value="over-1-year">Over 1 Year</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="message">Message (Optional)</Label>
                          <Textarea
                            id="message"
                            name="message"
                            placeholder="Tell us about your interest..."
                            data-testid="textarea-lead-message"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={leadMutation.isPending}
                          data-testid="button-submit-lead"
                        >
                          {leadMutation.isPending ? "Submitting..." : "Submit Request"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" className="gap-2" data-testid="button-share">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>

                  <Button variant="outline" asChild className="gap-2" data-testid="button-compare">
                    <Link href={`/compare?brands=${brand.id}`}>
                      <BarChart3 className="h-4 w-4" />
                      Compare
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <ZScoreBadge score={parseFloat(brand.zScore || "0")} size="lg" showLabel />
                <p className="text-xs text-muted-foreground">Z Score</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Tabs defaultValue="reviews" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="reviews" data-testid="tab-reviews">
                    Reviews ({brand.totalReviews || 0})
                  </TabsTrigger>
                  <TabsTrigger value="insights" data-testid="tab-insights">
                    Insights
                  </TabsTrigger>
                  <TabsTrigger value="documents" data-testid="tab-documents">
                    Documents
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="reviews" className="mt-6 space-y-4">
                  {!hasSubmittedLead && reviews && reviews.length > 2 ? (
                    <>
                      {reviews.slice(0, 2).map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                      <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                          <Lock className="h-12 w-12 text-muted-foreground/30 mb-4" />
                          <h3 className="font-semibold text-lg mb-2">
                            Unlock All Reviews
                          </h3>
                          <p className="text-muted-foreground text-center mb-4 max-w-md">
                            Submit your information to access all {brand.totalReviews} reviews
                            and detailed insights.
                          </p>
                          <Button onClick={() => setLeadFormOpen(true)} data-testid="button-unlock-reviews">
                            Request Access
                          </Button>
                        </CardContent>
                      </Card>
                    </>
                  ) : reviews && reviews.length > 0 ? (
                    reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <h3 className="font-semibold text-lg mb-2">No Reviews Yet</h3>
                        <p className="text-muted-foreground text-center mb-4">
                          Be the first to share your experience with {brand.name}.
                        </p>
                        {isAuthenticated ? (
                          <Button asChild>
                            <Link href={`/franchisee/review/${brand.id}`}>Write a Review</Link>
                          </Button>
                        ) : (
                          <Button asChild>
                            <a href="/api/login">Sign in to Review</a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="insights" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Category Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {categoryScores.map((category) => (
                        <div key={category.key} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{category.name}</span>
                            <span className="font-medium">{category.score.toFixed(1)}/5</span>
                          </div>
                          <Progress value={category.score * 20} className="h-2" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {(positiveWords.length > 0 || negativeWords.length > 0) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Key Terms Mentioned
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          {positiveWords.length > 0 && (
                            <div>
                              <h4 className="font-medium text-emerald-600 dark:text-emerald-400 mb-3">
                                Positive Mentions
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {positiveWords.map((word) => (
                                  <Badge
                                    key={word.word}
                                    variant="outline"
                                    className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                                  >
                                    {word.word} ({word.count})
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {negativeWords.length > 0 && (
                            <div>
                              <h4 className="font-medium text-red-600 dark:text-red-400 mb-3">
                                Areas of Concern
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {negativeWords.map((word) => (
                                  <Badge
                                    key={word.word}
                                    variant="outline"
                                    className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                  >
                                    {word.word} ({word.count})
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="documents" className="mt-6">
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                      <h3 className="font-semibold text-lg mb-2">Documents</h3>
                      <p className="text-muted-foreground text-center">
                        {brand.isClaimed
                          ? "No documents have been uploaded yet."
                          : "Documents will be available once this brand is claimed."}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Investment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Franchise Fee</span>
                    <span className="font-semibold">
                      {formatCurrency(brand.franchiseFee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Investment Range</span>
                    <span className="font-semibold">
                      {formatCurrency(brand.totalInvestmentMin)} -{" "}
                      {formatCurrency(brand.totalInvestmentMax)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Units</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {brand.unitCount?.toLocaleString() || "N/A"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rating Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold">
                      {parseFloat(brand.averageRating || "0").toFixed(1)}
                    </div>
                    <div>
                      <StarRating rating={parseFloat(brand.averageRating || "0")} size="md" />
                      <p className="text-sm text-muted-foreground mt-1">
                        Based on {brand.totalReviews || 0} reviews
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {!brand.isClaimed && (
                <Card className="border-primary/50 bg-primary/5">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">Own this franchise?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Claim your profile to respond to reviews, upload documents,
                      and access leads.
                    </p>
                    <Button className="w-full" asChild>
                      <a href="/api/login">Claim Profile</a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
