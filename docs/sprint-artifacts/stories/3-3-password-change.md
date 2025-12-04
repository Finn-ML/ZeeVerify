# Story 3.3: Password Change

## Story Info
- **Epic:** 3 - Account Management
- **Story ID:** 3.3
- **Title:** Password Change
- **Status:** ready-for-dev
- **Dependencies:** Story 3.1

## User Story

As a **logged-in user**,
I want **to change my password**,
So that **I can maintain account security**.

## Acceptance Criteria

### AC1: Change Password Form
**Given** I am on account settings
**When** I click "Change Password"
**Then** I see a form requesting:
- Current password
- New password
- Confirm new password

### AC2: Successful Change
**Given** I submit valid password change data
**When** the form is submitted
**Then** `POST /api/user/change-password` is called
**And** current password is verified
**And** new password is hashed and saved
**And** I see "Password changed successfully"
**And** I remain logged in (current session preserved)

### AC3: Incorrect Current Password
**Given** I enter an incorrect current password
**When** submitting the form
**Then** I see "Current password is incorrect" error

### AC4: Password Requirements
**Given** new password doesn't meet requirements
**When** submitting the form
**Then** I see password strength validation errors

## Technical Notes

### Files to Create/Modify
- **Create:** `client/src/components/change-password-dialog.tsx`
- **Modify:** `server/routes.ts` - Add password change route

### Frontend Implementation
```typescript
// client/src/components/change-password-dialog.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[^A-Za-z0-9]/, "Must contain special character"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different",
  path: ["newPassword"],
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  const changeMutation = useMutation({
    mutationFn: async (data: ChangePasswordForm) => {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Password changed successfully" });
      setOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Change Password</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((data) => changeMutation.mutate(data))} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              {...form.register("currentPassword")}
            />
            {form.formState.errors.currentPassword && (
              <p className="text-sm text-destructive">{form.formState.errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              {...form.register("newPassword")}
            />
            {form.formState.errors.newPassword && (
              <p className="text-sm text-destructive">{form.formState.errors.newPassword.message}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Min 8 characters, 1 uppercase, 1 number, 1 special character
            </p>
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={changeMutation.isPending}>
            {changeMutation.isPending ? "Changing..." : "Change Password"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### Backend Implementation
```typescript
// Add to server/routes.ts

app.post("/api/user/change-password", isAuthenticated, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.id;

  try {
    // Get current user
    const user = await storage.getUser(userId);
    if (!user || !user.passwordHash) {
      return res.status(400).json({ message: "Invalid account state" });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Validate new password strength
    const passwordSchema = z.string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[0-9]/)
      .regex(/[^A-Za-z0-9]/);

    try {
      passwordSchema.parse(newPassword);
    } catch {
      return res.status(400).json({ message: "New password does not meet requirements" });
    }

    // Ensure new password is different
    const isSame = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSame) {
      return res.status(400).json({ message: "New password must be different from current password" });
    }

    // Hash and save new password
    const newHash = await bcrypt.hash(newPassword, 12);
    await storage.updatePassword(userId, newHash);

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
});
```

### Password Requirements (Same as Registration)
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character
- Must be different from current password

## Definition of Done
- [ ] Change password dialog component created
- [ ] `POST /api/user/change-password` route added
- [ ] Current password verification implemented
- [ ] Password strength validation on new password
- [ ] Confirmation password matching
- [ ] Same password check (must be different)
- [ ] Success toast on completion
- [ ] Session preserved after change
- [ ] TypeScript compiles without errors

## Test Scenarios
1. **Valid Change:** Password updated, toast shown
2. **Wrong Current:** Error shown
3. **Weak New Password:** Validation errors
4. **Passwords Don't Match:** Error shown
5. **Same Password:** Error shown
6. **Session Preserved:** Still logged in after change
