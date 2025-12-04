# Story 3.1: Profile Settings Page

## Story Info
- **Epic:** 3 - Account Management
- **Story ID:** 3.1
- **Title:** Profile Settings Page
- **Status:** ready-for-dev
- **Dependencies:** Epic 2 complete

## User Story

As a **logged-in user**,
I want **to view and update my profile information**,
So that **my account reflects accurate information**.

## Acceptance Criteria

### AC1: View Profile
**Given** I am logged in
**When** I navigate to account settings
**Then** I see my current profile information:
- First name
- Last name
- Email (read-only, separate change flow)
- User type (read-only)
- Notification preferences

### AC2: Update Profile
**Given** I update my profile fields
**When** I click "Save Changes"
**Then** `PATCH /api/user/profile` is called
**And** my profile is updated
**And** I see "Profile updated successfully" toast

### AC3: Notification Preferences
**Given** I want to change notification preferences
**When** I toggle notification options
**Then** preferences are saved immediately
**And** options include:
- Email notifications for review responses
- Email notifications for moderation outcomes
- Marketing emails (opt-in)

## Technical Notes

### Files to Create/Modify
- **Create:** `client/src/pages/settings.tsx`
- **Modify:** `server/routes.ts` - Add profile update route
- **Modify:** `shared/schema.ts` - Add notification preferences column

### Schema Update
```typescript
// Add to shared/schema.ts - users table
notificationPreferences: json("notification_preferences").$type<{
  reviewResponses: boolean;
  moderationOutcomes: boolean;
  marketingEmails: boolean;
}>().default({
  reviewResponses: true,
  moderationOutcomes: true,
  marketingEmails: false,
}),
```

### Frontend Implementation
```typescript
// client/src/pages/settings.tsx
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string }) => {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Profile updated successfully" });
    },
  });

  // Notification toggle handler
  const toggleNotification = async (key: string, value: boolean) => {
    await fetch("/api/user/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  };

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      {/* Profile Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))}>
            {/* Form fields */}
          </form>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Notification toggles */}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline">Change Email</Button>
          <Button variant="outline">Change Password</Button>
          <Button variant="destructive">Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Backend Implementation
```typescript
// Add to server/routes.ts

app.patch("/api/user/profile", isAuthenticated, async (req, res) => {
  const { firstName, lastName } = req.body;
  const userId = req.user!.id;

  try {
    await storage.updateUserProfile(userId, { firstName, lastName });
    const updatedUser = await storage.getUser(userId);
    res.json({ user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

app.patch("/api/user/notifications", isAuthenticated, async (req, res) => {
  const userId = req.user!.id;
  const updates = req.body;

  try {
    await storage.updateNotificationPreferences(userId, updates);
    res.json({ message: "Preferences updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update preferences" });
  }
});
```

### Storage Methods Required
```typescript
updateUserProfile(userId: number, data: { firstName?: string; lastName?: string }): Promise<void>
updateNotificationPreferences(userId: number, prefs: Partial<NotificationPreferences>): Promise<void>
```

## Definition of Done
- [ ] `client/src/pages/settings.tsx` created
- [ ] `PATCH /api/user/profile` route added
- [ ] `PATCH /api/user/notifications` route added
- [ ] `notificationPreferences` column added to schema
- [ ] Profile form displays current values
- [ ] Profile updates show success toast
- [ ] Notification toggles save immediately
- [ ] Email and user type shown as read-only
- [ ] TypeScript compiles without errors

## Test Scenarios
1. **View Profile:** Current values displayed
2. **Update Name:** Changes saved, toast shown
3. **Toggle Notifications:** Preferences saved immediately
4. **Read-Only Fields:** Email/type not editable
5. **Unauthenticated Access:** Redirects to login
