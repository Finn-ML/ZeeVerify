import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/star-rating";
import { ZScoreBadge } from "@/components/z-score-badge";
import { Textarea } from "@/components/ui/textarea";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Users,
  Upload,
  Building2,
  TrendingUp,
  Mail,
  CheckCircle2,
  Clock,
  XCircle,
  Settings,
  LogOut,
  Send,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/theme-toggle";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import type { Brand, Review, Lead, User } from "@shared/schema";
import logoImage from "@assets/Fractional Franchise Business Coach (1)_1764591066959.png";

export default function FranchisorPortal() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please sign in to access the franchisor portal.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [authLoading, isAuthenticated, toast]);

  const { data: brandsData, isLoading: brandsLoading } = useQuery<{ brands: Brand[] }>({
    queryKey: ["/api/franchisor/brands"],
    enabled: isAuthenticated,
  });

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery<{
    reviews: (Review & { user?: User })[];
  }>({
    queryKey: ["/api/franchisor/reviews"],
    enabled: isAuthenticated,
  });

  const { data: leadsData, isLoading: leadsLoading } = useQuery<{ leads: Lead[] }>({
    queryKey: ["/api/franchisor/leads"],
    enabled: isAuthenticated,
  });

  const respondMutation = useMutation({
    mutationFn: async ({ reviewId, content }: { reviewId: string; content: string }) => {
      return apiRequest("POST", `/api/reviews/${reviewId}/respond`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/franchisor/reviews"] });
      toast({ title: "Response submitted", description: "Your response is pending moderation." });
      setResponseDialogOpen(false);
      setResponseText("");
      setSelectedReview(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit response.", variant: "destructive" });
    },
  });

  const brands = brandsData?.brands || [];
  const reviews = reviewsData?.reviews || [];
  const leads = leadsData?.leads || [];

  const stats = {
    totalBrands: brands.length,
    totalReviews: reviews.length,
    pendingReviews: reviews.filter((r) => !r.status || r.status === "pending").length,
    newLeads: leads.filter((l) => l.status === "new").length,
    averageRating: reviews.length
      ? reviews.reduce((acc, r) => acc + r.overallRating, 0) / reviews.length
      : 0,
  };

  const getInitials = () => {
    const first = user?.firstName?.charAt(0) || "";
    const last = user?.lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  const handleRespond = (review: Review) => {
    setSelectedReview(review);
    setResponseDialogOpen(true);
  };

  const submitResponse = () => {
    if (selectedReview && responseText.trim()) {
      respondMutation.mutate({ reviewId: selectedReview.id, content: responseText });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4 border-b">
            <Link href="/" className="flex items-center gap-2">
              <img src={logoImage} alt="ZeeVerify" className="h-8 w-8 object-contain" />
              <span className="font-semibold text-lg">ZeeVerify</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "overview"}
                  onClick={() => setActiveTab("overview")}
                  data-testid="nav-overview"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Overview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "brands"}
                  onClick={() => setActiveTab("brands")}
                  data-testid="nav-brands"
                >
                  <Building2 className="h-4 w-4" />
                  <span>My Brands</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "reviews"}
                  onClick={() => setActiveTab("reviews")}
                  data-testid="nav-reviews"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Reviews</span>
                  {stats.pendingReviews > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {stats.pendingReviews}
                    </Badge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "leads"}
                  onClick={() => setActiveTab("leads")}
                  data-testid="nav-leads"
                >
                  <Users className="h-4 w-4" />
                  <span>Lead Inbox</span>
                  {stats.newLeads > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {stats.newLeads}
                    </Badge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "documents"}
                  onClick={() => setActiveTab("documents")}
                  data-testid="nav-documents"
                >
                  <Upload className="h-4 w-4" />
                  <span>Documents</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/settings" data-testid="nav-settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/api/logout" data-testid="nav-logout">
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="flex h-14 items-center justify-between gap-4 border-b px-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="font-semibold">Franchisor Portal</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="flex items-center gap-2 ml-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileImageUrl || undefined} className="object-cover" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline">
                  {user.firstName || "User"}
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Welcome back, {user.firstName}!</h2>
                  <p className="text-muted-foreground">
                    Manage your franchise brands and engage with reviews
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                      <CardTitle className="text-sm font-medium">Claimed Brands</CardTitle>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalBrands}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                      <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalReviews}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                      <CardTitle className="text-sm font-medium">New Leads</CardTitle>
                      <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">{stats.newLeads}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                      <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Reviews</CardTitle>
                      <CardDescription>Reviews needing your attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {reviewsLoading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-16" />
                          ))}
                        </div>
                      ) : reviews.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No reviews yet
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {reviews.slice(0, 5).map((review) => (
                            <div
                              key={review.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="space-y-1">
                                <p className="font-medium text-sm">{review.title}</p>
                                <StarRating rating={review.overallRating} size="sm" />
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRespond(review)}
                              >
                                Respond
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>New Leads</CardTitle>
                      <CardDescription>Recent inquiries about your brands</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {leadsLoading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-16" />
                          ))}
                        </div>
                      ) : leads.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No leads yet
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {leads.slice(0, 5).map((lead) => (
                            <div
                              key={lead.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="space-y-1">
                                <p className="font-medium text-sm">
                                  {lead.firstName} {lead.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">{lead.email}</p>
                              </div>
                              <Badge variant={lead.status === "new" ? "default" : "secondary"}>
                                {lead.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "brands" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">My Brands</h2>
                  <Button className="gap-2">
                    <Building2 className="h-4 w-4" />
                    Claim New Brand
                  </Button>
                </div>

                {brandsLoading ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-48" />
                    ))}
                  </div>
                ) : brands.length === 0 ? (
                  <Card className="py-16">
                    <CardContent className="text-center">
                      <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No claimed brands</h3>
                      <p className="text-muted-foreground mb-6">
                        Claim your franchise brand to manage its profile
                      </p>
                      <Button>Claim a Brand</Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {brands.map((brand) => (
                      <Card key={brand.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                              {brand.logoUrl ? (
                                <img
                                  src={brand.logoUrl}
                                  alt={brand.name}
                                  className="h-full w-full object-cover rounded-lg"
                                />
                              ) : (
                                <Building2 className="h-8 w-8 text-muted-foreground" />
                              )}
                            </div>
                            <ZScoreBadge score={parseFloat(brand.zScore || "0")} size="sm" />
                          </div>
                          <h3 className="font-semibold text-lg mb-1">{brand.name}</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {brand.totalReviews || 0} reviews
                          </p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1" asChild>
                              <Link href={`/brand/${brand.slug}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                            <Button size="sm" className="flex-1">Manage</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Reviews</h2>

                {reviewsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-24" />
                    ))}
                  </div>
                ) : reviews.length === 0 ? (
                  <Card className="py-16">
                    <CardContent className="text-center">
                      <MessageSquare className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                      <p className="text-muted-foreground">
                        Reviews for your brands will appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold">{review.title}</h3>
                                <Badge
                                  variant={
                                    review.sentiment === "positive"
                                      ? "default"
                                      : review.sentiment === "negative"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                  className="capitalize"
                                >
                                  {review.sentiment || "neutral"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3">
                                <StarRating rating={review.overallRating} size="sm" />
                                <span className="text-sm text-muted-foreground">
                                  by {review.user?.firstName || "Anonymous"}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {review.createdAt &&
                                    formatDistanceToNow(new Date(review.createdAt), {
                                      addSuffix: true,
                                    })}
                                </span>
                              </div>
                              <p className="text-muted-foreground">{review.content}</p>
                            </div>
                            <Button
                              onClick={() => handleRespond(review)}
                              className="gap-2"
                            >
                              <Send className="h-4 w-4" />
                              Respond
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "leads" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Lead Inbox</h2>

                {leadsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-24" />
                    ))}
                  </div>
                ) : leads.length === 0 ? (
                  <Card className="py-16">
                    <CardContent className="text-center">
                      <Mail className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No leads yet</h3>
                      <p className="text-muted-foreground">
                        Inquiries from potential franchisees will appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {leads.map((lead) => (
                      <Card key={lead.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">
                                  {lead.firstName} {lead.lastName}
                                </h3>
                                <Badge
                                  variant={lead.status === "new" ? "default" : "secondary"}
                                  className="capitalize"
                                >
                                  {lead.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-4 w-4" />
                                  {lead.email}
                                </span>
                                {lead.phone && <span>{lead.phone}</span>}
                              </div>
                              {lead.investmentRange && (
                                <p className="text-sm">
                                  <span className="text-muted-foreground">Investment: </span>
                                  {lead.investmentRange}
                                </p>
                              )}
                              {lead.message && (
                                <p className="text-muted-foreground">{lead.message}</p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {lead.createdAt &&
                                  formatDistanceToNow(new Date(lead.createdAt), {
                                    addSuffix: true,
                                  })}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button size="sm" className="gap-1">
                                <Mail className="h-3 w-3" />
                                Contact
                              </Button>
                              <Button variant="outline" size="sm">
                                Mark Contacted
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Documents</h2>

                <Card>
                  <CardHeader>
                    <CardTitle>Upload Documents</CardTitle>
                    <CardDescription>
                      Share verified performance data, FDDs, and other materials
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="font-medium mb-2">Drop files here or click to upload</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        PDFs, images, and videos up to 50MB
                      </p>
                      <Button>Select Files</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>

      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Review</DialogTitle>
            <DialogDescription>
              Your response will be publicly visible after moderation.
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-1">{selectedReview.title}</h4>
                <StarRating rating={selectedReview.overallRating} size="sm" />
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                  {selectedReview.content}
                </p>
              </div>
              <Textarea
                placeholder="Write your response..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={4}
                data-testid="textarea-response"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setResponseDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={submitResponse}
                  disabled={!responseText.trim() || respondMutation.isPending}
                  data-testid="button-submit-response"
                >
                  {respondMutation.isPending ? "Submitting..." : "Submit Response"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
