# Story 3.2: Email Change

## Story Info
- **Epic:** 3 - Account Management
- **Story ID:** 3.2
- **Title:** Email Change
- **Status:** Ready for Review
- **Dependencies:** Story 3.1

## User Story

As a **logged-in user**,
I want **to change my email address**,
So that **I can update my contact information**.

## Acceptance Criteria

### AC1: Change Email Form
**Given** I am on account settings
**When** I click "Change Email"
**Then** I see a form requesting:
- New email address
- Current password (confirmation)

### AC2: Submit Email Change
**Given** I submit a valid new email and correct password
**When** the form is submitted
**Then** `POST /api/user/change-email` is called
**And** a verification email is sent to the NEW email
**And** I see "Verification email sent to {new email}"
**And** my email is NOT changed until verified

### AC3: Verify New Email
**Given** I click the verification link in the new email
**When** the verification is processed
**Then** my email is updated to the new address
**And** a confirmation email is sent to the OLD email
**And** I see "Email changed successfully"

### AC4: Incorrect Password
**Given** I enter an incorrect current password
**When** submitting the form
**Then** I see "Current password is incorrect" error

## Technical Notes

### Files to Create/Modify
- **Create:** `client/src/components/change-email-dialog.tsx`
- **Modify:** `server/routes.ts` - Add email change routes
- **Modify:** `shared/schema.ts` - Add pending email columns
- **Modify:** `server/services/email.ts` - Add email change notifications

### Schema Update
```typescript
// Add to users table in shared/schema.ts
pendingEmail: varchar("pending_email", { length: 255 }),
pendingEmailToken: varchar("pending_email_token", { length: 255 }),
pendingEmailExpires: timestamp("pending_email_expires"),
```

### Frontend Implementation
```typescript
// client/src/components/change-email-dialog.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
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

interface ChangeEmailForm {
  newEmail: string;
  currentPassword: string;
}

export function ChangeEmailDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<ChangeEmailForm>();

  const changeMutation = useMutation({
    mutationFn: async (data: ChangeEmailForm) => {
      const res = await fetch("/api/user/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: `Verification email sent to ${data.newEmail}` });
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
        <Button variant="outline">Change Email</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Email Address</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((data) => changeMutation.mutate(data))}>
          {/* Form fields */}
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### Backend Implementation
```typescript
// Add to server/routes.ts

app.post("/api/user/change-email", isAuthenticated, async (req, res) => {
  const { newEmail, currentPassword } = req.body;
  const userId = req.user!.id;

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

  // Check if email already exists
  const existing = await storage.getUserByEmail(newEmail);
  if (existing) {
    return res.status(400).json({ message: "Email already in use" });
  }

  // Generate verification token
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Store pending email change
  await storage.setPendingEmail(userId, newEmail, token, expires);

  // Send verification to new email
  await emailService.sendEmailChangeVerification(newEmail, token);

  res.json({ message: "Verification email sent", newEmail });
});

app.post("/api/user/verify-new-email", async (req, res) => {
  const { token } = req.body;

  const user = await storage.getUserByPendingEmailToken(token);
  if (!user || !user.pendingEmail) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  if (user.pendingEmailExpires && new Date() > user.pendingEmailExpires) {
    return res.status(400).json({ message: "Token expired" });
  }

  const oldEmail = user.email;
  const newEmail = user.pendingEmail;

  // Update email
  await storage.confirmEmailChange(user.id, newEmail);

  // Notify old email (security)
  await emailService.sendEmailChangedNotification(oldEmail, newEmail);

  res.json({ message: "Email changed successfully" });
});
```

### Email Service Methods
```typescript
// Add to server/services/email.ts

async sendEmailChangeVerification(to: string, token: string): Promise<boolean> {
  const verifyUrl = `${process.env.BASE_URL}/verify-new-email?token=${token}`;
  const content = `
    <h2>Verify Your New Email Address</h2>
    <p>Click the button below to confirm this as your new email address for ZeeVerify.</p>
    <a href="${verifyUrl}" style="...">Verify New Email</a>
    <p>This link expires in 24 hours.</p>
  `;
  return this.sendEmail(to, "Verify your new email address", this.wrapInTemplate(content, false));
}

async sendEmailChangedNotification(oldEmail: string, newEmail: string): Promise<boolean> {
  const content = `
    <h2>Your Email Address Was Changed</h2>
    <p>The email address for your ZeeVerify account was changed to ${this.escapeHtml(newEmail)}.</p>
    <p>If you did not make this change, please contact support immediately.</p>
  `;
  return this.sendEmail(oldEmail, "Your ZeeVerify email was changed", this.wrapInTemplate(content, false));
}
```

## Definition of Done
- [x] Change email dialog component created (`client/src/components/change-email-dialog.tsx`)
- [x] `POST /api/user/change-email` route added
- [x] `POST /api/user/verify-new-email` route added
- [x] Pending email columns added to schema (pendingEmail, pendingEmailToken, pendingEmailExpires)
- [x] Password verification implemented (bcrypt compare)
- [x] Verification email sent to new address (`sendEmailChangeVerification`)
- [x] Notification sent to old address (`sendEmailChangedNotification`)
- [x] Email only changes after verification (via `confirmEmailChange` storage method)
- [x] TypeScript compiles without errors

## Dev Agent Record

### Implementation Notes
- Created `ChangeEmailDialog` component with password confirmation
- Added pending email columns to users table schema
- Added storage methods: `setPendingEmail`, `getUserByPendingEmailToken`, `confirmEmailChange`
- Added email service methods: `sendEmailChangeVerification`, `sendEmailChangedNotification`
- Created `verify-new-email` page for token verification
- Integrated dialog into settings page with email field
- Security: password required, email uniqueness check, token expiration (24h)

### Files Created
- `client/src/components/change-email-dialog.tsx`
- `client/src/pages/verify-new-email.tsx`

### Files Modified
- `shared/schema.ts:84-87` - Added pending email columns
- `server/storage.ts:52-55` - Added interface methods
- `server/storage.ts:205-233` - Added implementation methods
- `server/services/email.ts:227-268` - Added email methods
- `server/routes.ts:338-427` - Added email change routes
- `client/src/App.tsx:20,35` - Added route import and registration
- `client/src/pages/settings.tsx:39,248-263` - Added dialog import and integration

### Date
2025-12-04

## Test Scenarios
1. **Valid Request:** Verification email sent
2. **Wrong Password:** Error shown
3. **Email In Use:** Error shown
4. **Verify Success:** Email updated, old notified
5. **Expired Token:** Error shown
