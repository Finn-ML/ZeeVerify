import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/star-rating";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  LayoutDashboard,
  Users,
  FileText,
  Building2,
  Shield,
  Settings,
  LogOut,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Flag,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/theme-toggle";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import type { User, Review, Brand, ReviewReport } from "@shared/schema";
import logoImage from "@assets/Fractional Franchise Business Coach (1)_1764591066959.png";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [moderationDialogOpen, setModerationDialogOpen] = useState(false);
  const [moderationNotes, setModerationNotes] = useState("");

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      toast({
        title: "Unauthorized",
        description: "Admin access required.",
        variant: "destructive",
      });
      setTimeout(() => {
        navigate("/");
      }, 500);
    }
  }, [authLoading, isAuthenticated, user, toast, navigate]);

  const { data: statsData } = useQuery<{
    totalUsers: number;
    totalReviews: number;
    totalBrands: number;
    pendingModeration: number;
    newLeads: number;
  }>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: usersData, isLoading: usersLoading } = useQuery<{ users: User[] }>({
    queryKey: ["/api/admin/users", { search: searchQuery }],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery<{
    reviews: (Review & { user?: User })[];
  }>({
    queryKey: ["/api/admin/reviews", { status: "pending" }],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: reportsData, isLoading: reportsLoading } = useQuery<{
    reports: (ReviewReport & { review?: Review })[];
  }>({
    queryKey: ["/api/admin/reports"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const moderateMutation = useMutation({
    mutationFn: async ({
      reviewId,
      action,
      notes,
    }: {
      reviewId: string;
      action: "approve" | "reject";
      notes?: string;
    }) => {
      return apiRequest("POST", `/api/admin/reviews/${reviewId}/moderate`, { action, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Review moderated", description: "The review status has been updated." });
      setModerationDialogOpen(false);
      setSelectedReview(null);
      setModerationNotes("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to moderate review.", variant: "destructive" });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated", description: "User role has been changed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update user.", variant: "destructive" });
    },
  });

  const stats = statsData || {
    totalUsers: 0,
    totalReviews: 0,
    totalBrands: 0,
    pendingModeration: 0,
    newLeads: 0,
  };

  const users_list = usersData?.users || [];
  const pendingReviews = reviewsData?.reviews || [];
  const reports = reportsData?.reports || [];

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  const handleModerate = (review: Review, action: "approve" | "reject") => {
    if (action === "reject") {
      setSelectedReview(review);
      setModerationDialogOpen(true);
    } else {
      moderateMutation.mutate({ reviewId: review.id, action });
    }
  };

  const submitModeration = () => {
    if (selectedReview) {
      moderateMutation.mutate({
        reviewId: selectedReview.id,
        action: "reject",
        notes: moderationNotes,
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

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
                  isActive={activeTab === "moderation"}
                  onClick={() => setActiveTab("moderation")}
                  data-testid="nav-moderation"
                >
                  <Shield className="h-4 w-4" />
                  <span>Moderation</span>
                  {stats.pendingModeration > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {stats.pendingModeration}
                    </Badge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "users"}
                  onClick={() => setActiveTab("users")}
                  data-testid="nav-users"
                >
                  <Users className="h-4 w-4" />
                  <span>Users</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "brands"}
                  onClick={() => setActiveTab("brands")}
                  data-testid="nav-brands"
                >
                  <Building2 className="h-4 w-4" />
                  <span>Brands</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "reports"}
                  onClick={() => setActiveTab("reports")}
                  data-testid="nav-reports"
                >
                  <Flag className="h-4 w-4" />
                  <span>Reports</span>
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
              <h1 className="font-semibold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Badge variant="destructive">Admin</Badge>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Dashboard Overview</h2>

                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    </CardContent>
                  </Card>
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
                      <CardTitle className="text-sm font-medium">Total Brands</CardTitle>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalBrands}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-amber-500/50">
                    <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                      <CardTitle className="text-sm font-medium">Pending</CardTitle>
                      <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-amber-500">
                        {stats.pendingModeration}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                      <CardTitle className="text-sm font-medium">New Leads</CardTitle>
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.newLeads}</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pending Moderation</CardTitle>
                      <CardDescription>Reviews requiring approval</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {reviewsLoading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-16" />
                          ))}
                        </div>
                      ) : pendingReviews.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No pending reviews
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {pendingReviews.slice(0, 5).map((review) => (
                            <div
                              key={review.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="space-y-1">
                                <p className="font-medium text-sm line-clamp-1">{review.title}</p>
                                <div className="flex items-center gap-2">
                                  <StarRating rating={review.overallRating} size="sm" />
                                  {review.moderationCategory && (
                                    <Badge
                                      variant={
                                        review.moderationCategory === "needs_review"
                                          ? "secondary"
                                          : "outline"
                                      }
                                    >
                                      {review.moderationCategory}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleModerate(review, "approve")}
                                >
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleModerate(review, "reject")}
                                >
                                  <XCircle className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Reported Content</CardTitle>
                      <CardDescription>Flagged reviews needing attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {reportsLoading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-16" />
                          ))}
                        </div>
                      ) : reports.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No reported content
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {reports.slice(0, 5).map((report) => (
                            <div
                              key={report.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="space-y-1">
                                <p className="font-medium text-sm">{report.reason}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {report.description}
                                </p>
                              </div>
                              <Button variant="outline" size="sm">
                                Review
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "moderation" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Content Moderation</h2>

                <Tabs defaultValue="pending">
                  <TabsList>
                    <TabsTrigger value="pending">
                      Pending ({stats.pendingModeration})
                    </TabsTrigger>
                    <TabsTrigger value="flagged">AI Flagged</TabsTrigger>
                    <TabsTrigger value="reported">Reported</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pending" className="mt-6 space-y-4">
                    {reviewsLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Skeleton key={i} className="h-32" />
                        ))}
                      </div>
                    ) : pendingReviews.length === 0 ? (
                      <Card className="py-16">
                        <CardContent className="text-center">
                          <CheckCircle2 className="h-16 w-16 text-emerald-500/30 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                          <p className="text-muted-foreground">
                            No reviews pending moderation
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      pendingReviews.map((review) => (
                        <Card key={review.id}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold">{review.title}</h3>
                                  {review.sentiment && (
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
                                      {review.sentiment}
                                    </Badge>
                                  )}
                                  {review.moderationCategory === "needs_review" && (
                                    <Badge variant="secondary" className="gap-1">
                                      <AlertTriangle className="h-3 w-3" />
                                      Needs Review
                                    </Badge>
                                  )}
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
                                {review.aiFlags && (review.aiFlags as string[]).length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {(review.aiFlags as string[]).map((flag, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        {flag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-2">
                                <Button
                                  onClick={() => handleModerate(review, "approve")}
                                  className="gap-2"
                                  data-testid={`button-approve-${review.id}`}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleModerate(review, "reject")}
                                  className="gap-2"
                                  data-testid={`button-reject-${review.id}`}
                                >
                                  <XCircle className="h-4 w-4" />
                                  Reject
                                </Button>
                                <Button variant="outline" className="gap-2">
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="flagged" className="mt-6">
                    <Card className="py-16">
                      <CardContent className="text-center">
                        <Shield className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">AI Flagged Content</h3>
                        <p className="text-muted-foreground">
                          Content automatically flagged by AI for review
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="reported" className="mt-6">
                    {reports.length === 0 ? (
                      <Card className="py-16">
                        <CardContent className="text-center">
                          <Flag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No Reports</h3>
                          <p className="text-muted-foreground">
                            No content has been reported
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {reports.map((report) => (
                          <Card key={report.id}>
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="destructive">{report.reason}</Badge>
                                    <Badge variant="outline" className="capitalize">
                                      {report.status}
                                    </Badge>
                                  </div>
                                  <p className="text-muted-foreground">{report.description}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Reported{" "}
                                    {report.createdAt &&
                                      formatDistanceToNow(new Date(report.createdAt), {
                                        addSuffix: true,
                                      })}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    View Review
                                  </Button>
                                  <Button size="sm">Take Action</Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">User Management</h2>
                  <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-users"
                    />
                  </div>
                </div>

                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersLoading ? (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <div className="space-y-4 p-4">
                              {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-12" />
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : users_list.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <p className="text-muted-foreground">No users found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        users_list.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={u.profileImageUrl || undefined} />
                                  <AvatarFallback>
                                    {getInitials(u.firstName, u.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {u.firstName} {u.lastName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>
                              <Select
                                value={u.role || "browser"}
                                onValueChange={(role) =>
                                  updateUserRoleMutation.mutate({ userId: u.id, role })
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="browser">Browser</SelectItem>
                                  <SelectItem value="franchisee">Franchisee</SelectItem>
                                  <SelectItem value="franchisor">Franchisor</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              {u.isVerified ? (
                                <Badge className="gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Unverified</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {u.createdAt &&
                                formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Suspend
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            {activeTab === "brands" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Brand Management</h2>

                <Card className="py-16">
                  <CardContent className="text-center">
                    <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Brand Management</h3>
                    <p className="text-muted-foreground mb-6">
                      Manage franchise brands, bulk import, and category taxonomy
                    </p>
                    <div className="flex justify-center gap-3">
                      <Button variant="outline">Import Brands</Button>
                      <Button>Add Brand</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "reports" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Reported Content</h2>

                {reports.length === 0 ? (
                  <Card className="py-16">
                    <CardContent className="text-center">
                      <Flag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Reports</h3>
                      <p className="text-muted-foreground">
                        No content has been reported by users
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <Card key={report.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="destructive">{report.reason}</Badge>
                                <Badge variant="outline" className="capitalize">
                                  {report.status}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground">{report.description}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Dismiss
                              </Button>
                              <Button size="sm">Take Action</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </SidebarInset>
      </div>

      <Dialog open={moderationDialogOpen} onOpenChange={setModerationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Review</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this review
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter moderation notes..."
              value={moderationNotes}
              onChange={(e) => setModerationNotes(e.target.value)}
              rows={4}
              data-testid="textarea-moderation-notes"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModerationDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={submitModeration}
                disabled={moderateMutation.isPending}
                data-testid="button-confirm-reject"
              >
                {moderateMutation.isPending ? "Rejecting..." : "Reject Review"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
