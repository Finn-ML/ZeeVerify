# Story 3.4: Account Deletion

## Story Info
- **Epic:** 3 - Account Management
- **Story ID:** 3.4
- **Title:** Account Deletion
- **Status:** ready-for-dev
- **Dependencies:** Story 3.1

## User Story

As a **logged-in user**,
I want **to delete my account**,
So that **I can remove my data from the platform**.

## Acceptance Criteria

### AC1: Deletion Confirmation
**Given** I am on account settings
**When** I click "Delete Account"
**Then** I see a confirmation modal explaining:
- What data will be deleted
- That this action is permanent
- A text input to type "DELETE" for confirmation

### AC2: Successful Deletion
**Given** I confirm account deletion
**When** I type "DELETE" and enter my password
**Then** `DELETE /api/user/account` is called
**And** my session is destroyed
**And** my user record is soft-deleted (or anonymized per legal requirements)
**And** my reviews remain but are anonymized
**And** I am redirected to the homepage
**And** I see "Account deleted successfully"

### AC3: Incorrect Password
**Given** I enter incorrect password for deletion
**When** submitting the deletion form
**Then** I see "Password incorrect" error
**And** the account is NOT deleted

## Technical Notes

### Files to Create/Modify
- **Create:** `client/src/components/delete-account-dialog.tsx`
- **Modify:** `server/routes.ts` - Add account deletion route
- **Modify:** `shared/schema.ts` - Add deleted_at column

### Schema Update
```typescript
// Add to users table in shared/schema.ts
deletedAt: timestamp("deleted_at"),
```

### Frontend Implementation
```typescript
// client/src/components/delete-account-dialog.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface DeleteAccountForm {
  confirmation: string;
  password: string;
}

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const form = useForm<DeleteAccountForm>();

  const deleteMutation = useMutation({
    mutationFn: async (data: DeleteAccountForm) => {
      const res = await fetch("/api/user/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: data.password }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Account deleted successfully" });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const confirmation = form.watch("confirmation");
  const isConfirmed = confirmation === "DELETE";

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete Account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Your Account</AlertDialogTitle>
          <AlertDialogDescription>
            This action is permanent and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
            <h4 className="font-semibold text-destructive mb-2">What will be deleted:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Your account and profile information</li>
              <li>• Your notification preferences</li>
              <li>• Your saved comparisons</li>
            </ul>
            <h4 className="font-semibold text-destructive mt-4 mb-2">What will be preserved:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Your reviews (anonymized as "Former User")</li>
              <li>• Brand claims will be released</li>
            </ul>
          </div>

          <form onSubmit={form.handleSubmit((data) => deleteMutation.mutate(data))} className="space-y-4">
            <div>
              <Label htmlFor="confirmation">Type DELETE to confirm</Label>
              <Input
                id="confirmation"
                {...form.register("confirmation")}
                placeholder="DELETE"
              />
            </div>
            <div>
              <Label htmlFor="password">Enter your password</Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={!isConfirmed || deleteMutation.isPending}
                className="flex-1"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </form>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### Backend Implementation
```typescript
// Add to server/routes.ts

app.delete("/api/user/account", isAuthenticated, async (req, res) => {
  const { password } = req.body;
  const userId = req.user!.id;

  try {
    // Get current user
    const user = await storage.getUser(userId);
    if (!user || !user.passwordHash) {
      return res.status(400).json({ message: "Invalid account state" });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({ message: "Password incorrect" });
    }

    // Soft delete user (set deletedAt, anonymize PII)
    await storage.softDeleteUser(userId);

    // Anonymize reviews (change authorId display name)
    await storage.anonymizeUserReviews(userId);

    // Release brand claims
    await storage.releaseUserBrandClaims(userId);

    // Destroy session
    req.logout((err) => {
      if (err) {
        console.error("Logout error during deletion:", err);
      }
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
        res.json({ message: "Account deleted successfully" });
      });
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    res.status(500).json({ message: "Failed to delete account" });
  }
});
```

### Storage Methods Required
```typescript
softDeleteUser(userId: number): Promise<void>
// Sets deletedAt timestamp, nullifies PII (email, name)

anonymizeUserReviews(userId: number): Promise<void>
// Updates reviews to show "Former User" instead of actual name

releaseUserBrandClaims(userId: number): Promise<void>
// Sets isClaimed=false, claimedById=null for user's claimed brands
```

### Data Handling
| Data Type | Action |
|-----------|--------|
| User record | Soft delete (set deletedAt) |
| Email, name | Anonymized (nullified or hashed) |
| Reviews | Preserved, attribution changed to "Former User" |
| Brand claims | Released (unclaimed) |
| Payment history | Preserved for accounting |
| Sessions | Destroyed |

## Definition of Done
- [ ] Delete account dialog component created
- [ ] `DELETE /api/user/account` route added
- [ ] `deleted_at` column added to schema
- [ ] Password verification required
- [ ] "DELETE" text confirmation required
- [ ] User record soft-deleted
- [ ] Reviews anonymized
- [ ] Brand claims released
- [ ] Session destroyed
- [ ] Redirect to homepage
- [ ] TypeScript compiles without errors

## Test Scenarios
1. **Valid Deletion:** Account deleted, redirected
2. **Wrong Password:** Error shown, account preserved
3. **Missing Confirmation:** Button disabled
4. **Reviews After Deletion:** Show "Former User"
5. **Brand Claims Released:** Brands unclaimed
6. **Session Destroyed:** User logged out
