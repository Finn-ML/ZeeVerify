import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/star-rating";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  MessageSquare,
  Flag,
  Star,
  TrendingUp,
  Settings,
  LogOut,
  Building2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Review, ReviewResponse } from "@shared/schema";
import logoImage from "@assets/Fractional Franchise Business Coach (1)_1764591066959.png";

export default function FranchiseePortal() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please sign in to access the franchisee portal.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [authLoading, isAuthenticated, toast]);

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery<{
    reviews: (Review & { responses?: ReviewResponse[] })[];
  }>({
    queryKey: ["/api/franchisee/reviews"],
    enabled: isAuthenticated,
  });

  const reviews = reviewsData?.reviews || [];

  const stats = {
    totalReviews: reviews.length,
    approvedReviews: reviews.filter((r) => r.status === "approved").length,
    pendingReviews: reviews.filter((r) => r.status === "pending").length,
    averageRating: reviews.length
      ? reviews.reduce((acc, r) => acc + r.overallRating, 0) / reviews.length
      : 0,
  };

  const getInitials = () => {
    const first = user?.firstName?.charAt(0) || "";
    const last = user?.lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  const getVerificationBadge = () => {
    if (user?.isVerified) {
      return (
        <Badge variant="secondary" className="gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
          <CheckCircle2 className="h-3 w-3" />
          Verified
        </Badge>
      );
    }
    if (user?.verificationStatus === "pending") {
      return (
        <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        Unverified
      </Badge>
    );
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
                  isActive={activeTab === "reviews"}
                  onClick={() => setActiveTab("reviews")}
                  data-testid="nav-reviews"
                >
                  <FileText className="h-4 w-4" />
                  <span>My Reviews</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "verification"}
                  onClick={() => setActiveTab("verification")}
                  data-testid="nav-verification"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Verification</span>
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
              <h1 className="font-semibold">Franchisee Portal</h1>
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
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Welcome back, {user.firstName}!</h2>
                    <div className="flex items-center gap-2 mt-1">
                      {getVerificationBadge()}
                    </div>
                  </div>
                  <Button asChild className="gap-2" data-testid="button-write-review">
                    <Link href="/franchisee/review/new">
                      <Plus className="h-4 w-4" />
                      Write a Review
                    </Link>
                  </Button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                      <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalReviews}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                      <CardTitle className="text-sm font-medium">Approved</CardTitle>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.approvedReviews}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                      <CardTitle className="text-sm font-medium">Pending</CardTitle>
                      <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.pendingReviews}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                      <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                      <Star className="h-4 w-4 text-amber-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Reviews</CardTitle>
                    <CardDescription>Your latest submitted reviews</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {reviewsLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-20" />
                        ))}
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="font-medium mb-2">No reviews yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Share your franchise experience to help others
                        </p>
                        <Button asChild>
                          <Link href="/franchisee/review/new">Write Your First Review</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.slice(0, 5).map((review) => (
                          <div
                            key={review.id}
                            className="flex items-start justify-between p-4 border rounded-lg"
                          >
                            <div className="space-y-1">
                              <h4 className="font-medium">{review.title}</h4>
                              <div className="flex items-center gap-2">
                                <StarRating rating={review.overallRating} size="sm" />
                                <Badge
                                  variant={
                                    review.status === "approved"
                                      ? "default"
                                      : review.status === "pending"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                  className="capitalize"
                                >
                                  {review.status}
                                </Badge>
                              </div>
                              {review.responses && review.responses.length > 0 && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <MessageSquare className="h-3 w-3" />
                                  {review.responses.length} response(s)
                                </div>
                              )}
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/franchisee/review/${review.id}`}>View</Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">My Reviews</h2>
                  <Button asChild className="gap-2" data-testid="button-new-review">
                    <Link href="/franchisee/review/new">
                      <Plus className="h-4 w-4" />
                      New Review
                    </Link>
                  </Button>
                </div>

                {reviewsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-24" />
                    ))}
                  </div>
                ) : reviews.length === 0 ? (
                  <Card className="py-16">
                    <CardContent className="text-center">
                      <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Start sharing your franchise experience
                      </p>
                      <Button asChild>
                        <Link href="/franchisee/review/new">Write a Review</Link>
                      </Button>
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
                                    review.status === "approved"
                                      ? "default"
                                      : review.status === "pending"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                  className="capitalize"
                                >
                                  {review.status}
                                </Badge>
                                {review.sentiment && (
                                  <Badge variant="outline" className="capitalize">
                                    {review.sentiment}
                                  </Badge>
                                )}
                              </div>
                              <StarRating rating={review.overallRating} size="sm" />
                              <p className="text-muted-foreground line-clamp-2">{review.content}</p>
                              {review.responses && review.responses.length > 0 && (
                                <div className="flex items-center gap-1 text-sm text-primary">
                                  <MessageSquare className="h-4 w-4" />
                                  {review.responses.length} franchisor response(s)
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/franchisee/review/${review.id}`}>View</Link>
                              </Button>
                              <Button variant="ghost" size="sm" className="gap-1">
                                <Flag className="h-3 w-3" />
                                Report Issue
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

            {activeTab === "verification" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Verification Status</h2>

                <Card>
                  <CardHeader>
                    <CardTitle>Identity Verification</CardTitle>
                    <CardDescription>
                      Verify your identity to unlock all features and add credibility to your reviews
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      {user.isVerified ? (
                        <>
                          <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">Verified Franchisee</h3>
                            <p className="text-muted-foreground">
                              Your identity has been verified. Your reviews are marked as verified.
                            </p>
                          </div>
                        </>
                      ) : user.verificationStatus === "pending" ? (
                        <>
                          <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <Clock className="h-8 w-8 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">Verification Pending</h3>
                            <p className="text-muted-foreground">
                              Your documents are being reviewed. This usually takes 1-2 business days.
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">Not Yet Verified</h3>
                            <p className="text-muted-foreground">
                              Complete verification to add credibility to your reviews
                            </p>
                          </div>
                          <Button data-testid="button-start-verification">Start Verification</Button>
                        </>
                      )}
                    </div>

                    <div className="border-t pt-6">
                      <h4 className="font-medium mb-4">Verification Benefits</h4>
                      <ul className="space-y-3">
                        {[
                          "Verified badge on all your reviews",
                          "Higher visibility in search results",
                          "Access to exclusive franchisee community",
                          "Priority support from our team",
                        ].map((benefit, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span className="text-muted-foreground">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
