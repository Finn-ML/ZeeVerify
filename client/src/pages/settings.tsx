import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Bell,
  Shield,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Camera,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User as UserType } from "@shared/schema";

export default function Settings() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState({
    newReviews: true,
    responses: true,
    leads: true,
    marketing: false,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please sign in to access settings.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  }, [authLoading, isAuthenticated, toast]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      if (user.notificationPreferences) {
        setNotifications({
          ...notifications,
          ...(user.notificationPreferences as object),
        });
      }
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserType>) => {
      return apiRequest("PATCH", "/api/users/me", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Profile updated", description: "Your profile has been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    },
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: async (prefs: typeof notifications) => {
      return apiRequest("PATCH", "/api/users/me/notifications", { preferences: prefs });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Notifications updated", description: "Your preferences have been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update notifications.", variant: "destructive" });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/users/me");
    },
    onSuccess: () => {
      toast({ title: "Account deleted", description: "Your account has been permanently deleted." });
      window.location.href = "/";
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete account.", variant: "destructive" });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ firstName, lastName });
  };

  const handleNotificationChange = (key: keyof typeof notifications, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    updateNotificationsMutation.mutate(updated);
  };

  const getInitials = () => {
    const first = firstName?.charAt(0) || user?.firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || user?.lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account preferences and settings
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="gap-2" data-testid="tab-profile">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2" data-testid="tab-notifications">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2" data-testid="tab-security">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and profile picture
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={user.profileImageUrl || undefined} className="object-cover" />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium">{firstName} {lastName}</h3>
                        <p className="text-sm text-muted-foreground">{email}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="capitalize">
                            {user.role === "browser" ? "Member" : user.role}
                          </Badge>
                          {user.isVerified && (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          data-testid="input-firstname"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          data-testid="input-lastname"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="bg-muted"
                        data-testid="input-email"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed. Contact support if you need to update it.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-save-profile"
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>
                    Choose what email notifications you'd like to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Reviews</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when new reviews are posted on brands you follow
                      </p>
                    </div>
                    <Switch
                      checked={notifications.newReviews}
                      onCheckedChange={(checked) => handleNotificationChange("newReviews", checked)}
                      data-testid="switch-new-reviews"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Response Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when franchisors respond to reviews
                      </p>
                    </div>
                    <Switch
                      checked={notifications.responses}
                      onCheckedChange={(checked) => handleNotificationChange("responses", checked)}
                      data-testid="switch-responses"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Lead Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about new leads and inquiries
                      </p>
                    </div>
                    <Switch
                      checked={notifications.leads}
                      onCheckedChange={(checked) => handleNotificationChange("leads", checked)}
                      data-testid="switch-leads"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive tips, product updates, and promotional content
                      </p>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => handleNotificationChange("marketing", checked)}
                      data-testid="switch-marketing"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Status</CardTitle>
                  <CardDescription>
                    Your account verification status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    {user.isVerified ? (
                      <>
                        <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium">Verified Account</p>
                          <p className="text-sm text-muted-foreground">
                            Your identity has been verified
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <AlertTriangle className="h-6 w-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Not Verified</p>
                          <p className="text-sm text-muted-foreground">
                            Verify your identity to unlock additional features
                          </p>
                        </div>
                        <Button data-testid="button-verify">Verify Now</Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible actions for your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="font-medium">Delete Account</p>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="gap-2" data-testid="button-delete-account">
                          <Trash2 className="h-4 w-4" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            account and remove all your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteAccountMutation.mutate()}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
