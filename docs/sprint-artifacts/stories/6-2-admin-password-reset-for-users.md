# Story 6.2: Admin Password Reset for Users

## Story Info
- **Epic:** 6 - Admin Enhancements
- **Story ID:** 6.2
- **Title:** Admin Password Reset for Users
- **Status:** ready-for-dev
- **Dependencies:** Epic 1 complete, Epic 2 complete

## User Story

As an **admin**,
I want **to trigger a password reset for any user**,
So that **I can help users who are locked out of their accounts**.

## Acceptance Criteria

### AC1: Trigger Password Reset
**Given** I am logged in as admin
**When** I click "Reset Password" on a user's profile
**Then** a password reset email is sent to that user
**And** I see a confirmation message

### AC2: Audit Trail
**Given** I trigger a password reset
**When** the action completes
**Then** an audit log entry is created with:
- Admin who initiated
- Target user
- Timestamp
- Action type

### AC3: User Notification
**Given** a password reset is triggered by admin
**When** the email is sent
**Then** the email indicates it was initiated by support
**And** includes instructions to contact support if unexpected

## Technical Notes

### Files to Create/Modify
- **Modify:** `server/routes.ts` - Add admin password reset endpoint
- **Modify:** `server/services/email.ts` - Add admin-initiated reset email
- **Create:** Admin user management UI (can be part of existing admin page)

### Backend - Admin Password Reset Endpoint
```typescript
// Add to server/routes.ts

app.post("/api/admin/users/:id/reset-password", isAuthenticated, isAdmin, async (req, res) => {
  const targetUserId = parseInt(req.params.id);
  const adminId = req.user!.id;

  try {
    // Get target user
    const targetUser = await storage.getUser(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cannot reset password for other admins (security)
    if (targetUser.isAdmin && targetUserId !== adminId) {
      return res.status(403).json({
        message: "Cannot reset password for other admin users"
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save token to user
    await storage.updateUser(targetUserId, {
      passwordResetToken: resetTokenHash,
      passwordResetExpires: resetTokenExpiry,
    });

    // Send admin-initiated reset email
    await emailService.sendAdminPasswordResetEmail(
      targetUser.email,
      resetToken
    );

    // Create audit log
    await storage.createAuditLog({
      adminId,
      action: "password_reset_initiated",
      targetUserId,
      targetUserEmail: targetUser.email,
      details: { initiatedBy: "admin" },
    });

    res.json({
      message: "Password reset email sent",
      sentTo: targetUser.email,
    });
  } catch (error) {
    console.error("Error initiating password reset:", error);
    res.status(500).json({ message: "Failed to initiate password reset" });
  }
});
```

### Email Service Method
```typescript
// Add to server/services/email.ts

async sendAdminPasswordResetEmail(
  to: string,
  resetToken: string
): Promise<boolean> {
  const resetUrl = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;

  const content = `
    <h2 style="color: #1a1f36; margin-bottom: 20px;">Password Reset Request</h2>

    <div style="background-color: #fef3cd; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 20px 0;">
      <p style="color: #856404; margin: 0;">
        <strong>Note:</strong> This password reset was initiated by ZeeVerify support on your behalf.
      </p>
    </div>

    <p>A password reset has been requested for your ZeeVerify account. If you requested help with your account, click the button below to set a new password:</p>

    <p style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background-color: #c9a962; color: #1a1f36; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
        Reset Your Password
      </a>
    </p>

    <p style="font-size: 14px; color: #666;">This link will expire in 24 hours.</p>

    <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px 20px; margin: 20px 0;">
      <p style="color: #721c24; margin: 0;">
        <strong>Didn't request this?</strong> If you did not contact our support team about your account, please ignore this email and contact us immediately at support@zeeverify.com. Your password will remain unchanged.
      </p>
    </div>

    <p style="font-size: 12px; color: #999; margin-top: 30px;">
      For security, we recommend using a unique password that you don't use on other websites.
    </p>
  `;

  return this.sendEmail(
    to,
    "Password Reset - ZeeVerify Support",
    this.wrapInTemplate(content, false) // No unsubscribe for security emails
  );
}
```

### Audit Log Schema
```typescript
// Add to shared/schema.ts (if not exists from Story 6.3)

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull().references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  targetUserId: integer("target_user_id").references(() => users.id),
  targetUserEmail: varchar("target_user_email", { length: 255 }),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Storage Method
```typescript
// Add to server/storage.ts

async createAuditLog(data: {
  adminId: number;
  action: string;
  targetUserId?: number;
  targetUserEmail?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}): Promise<AuditLog> {
  const [log] = await db
    .insert(auditLogs)
    .values(data)
    .returning();
  return log;
}
```

### Frontend - User Row Action
```typescript
// Add to admin users table/list component

import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";

function ResetPasswordButton({ userId, userEmail }: { userId: number; userEmail: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Password Reset Sent",
        description: `Reset email sent to ${data.sentTo}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/audit-logs"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <KeyRound className="h-4 w-4 mr-1" />
          Reset Password
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset User Password</AlertDialogTitle>
          <AlertDialogDescription>
            This will send a password reset email to <strong>{userEmail}</strong>.
            The email will indicate this was initiated by support.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => resetMutation.mutate()}
            disabled={resetMutation.isPending}
          >
            {resetMutation.isPending ? "Sending..." : "Send Reset Email"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

## Definition of Done
- [ ] `POST /api/admin/users/:id/reset-password` endpoint created
- [ ] `sendAdminPasswordResetEmail()` method added to EmailService
- [ ] Audit log created on password reset
- [ ] Cannot reset password for other admins
- [ ] Email clearly indicates admin-initiated reset
- [ ] Email includes security warning
- [ ] Reset token expires in 24 hours
- [ ] Confirmation toast shown to admin
- [ ] TypeScript compiles without errors

## Test Scenarios
1. **Reset Normal User:** Email sent, audit logged
2. **Reset Own Account:** Works for admin resetting their own
3. **Reset Other Admin:** Returns 403 forbidden
4. **User Not Found:** Returns 404
5. **Email Content:** Clearly shows admin-initiated
6. **Audit Log:** Contains admin, target, timestamp
7. **Token Works:** User can reset password with token
