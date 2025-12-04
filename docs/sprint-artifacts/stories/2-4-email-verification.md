# Story 2.4: Email Verification

## Story Info
- **Epic:** 2 - User Authentication & Onboarding
- **Story ID:** 2.4
- **Title:** Email Verification
- **Status:** ready-for-dev
- **Dependencies:** Story 2.2

## User Story

As a **newly registered user**,
I want **to verify my email address**,
So that **I can activate my account**.

## Acceptance Criteria

### AC1: Verification Link Click
**Given** I have received a verification email
**When** I click the verification link
**Then** I am taken to `/verify-email?token=xxx`
**And** `POST /api/auth/verify-email` is called with the token

### AC2: Valid Token
**Given** the verification token is valid and not expired
**When** the verification request is processed
**Then** my `email_verified` is set to true
**And** the verification token is cleared
**And** I see "Email verified successfully! You can now log in."
**And** I am redirected to the login page

### AC3: Invalid/Expired Token
**Given** the verification token is invalid or expired
**When** the verification request is processed
**Then** I see "Invalid or expired verification link"
**And** I see a "Request new verification email" button

### AC4: Resend Verification
**Given** I request a new verification email
**When** clicking "Resend verification email"
**Then** a new token is generated and sent
**And** I see "Verification email sent" confirmation

## Technical Notes

### Files to Create/Modify
- **Create:** `client/src/pages/verify-email.tsx`
- **Create:** `client/src/pages/verify-email-sent.tsx`
- **Modify:** `server/routes.ts` - Add verification routes

### Frontend Implementation
```typescript
// client/src/pages/verify-email.tsx
import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const search = useSearch();
  const token = new URLSearchParams(search).get("token");
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  const verifyMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error("Verification failed");
      return res.json();
    },
    onSuccess: () => setStatus("success"),
    onError: () => setStatus("error"),
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    } else {
      setStatus("error");
    }
  }, [token]);

  // Render based on status...
}
```

### Backend Implementation
```typescript
// Add to server/routes.ts

app.post("/api/auth/verify-email", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  const user = await storage.getUserByVerificationToken(token);

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired verification link" });
  }

  if (user.emailVerificationExpires && new Date() > user.emailVerificationExpires) {
    return res.status(400).json({ message: "Invalid or expired verification link" });
  }

  await storage.verifyUserEmail(user.id);

  res.json({ message: "Email verified successfully" });
});

app.post("/api/auth/resend-verification", async (req, res) => {
  const { email } = req.body;

  const user = await storage.getUserByEmail(email);

  if (!user) {
    // Don't reveal if email exists
    return res.json({ message: "If an account exists, a verification email will be sent" });
  }

  if (user.emailVerified) {
    return res.status(400).json({ message: "Email is already verified" });
  }

  // Rate limit check (1 per 5 minutes)
  if (user.emailVerificationExpires) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const tokenAge = new Date(user.emailVerificationExpires.getTime() - 24 * 60 * 60 * 1000);
    if (tokenAge > fiveMinutesAgo) {
      return res.status(429).json({ message: "Please wait before requesting another email" });
    }
  }

  // Generate new token
  const newToken = crypto.randomBytes(32).toString("base64url");
  const newExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await storage.updateVerificationToken(user.id, newToken, newExpires);
  await emailService.sendVerificationEmail(user.email, newToken);

  res.json({ message: "Verification email sent" });
});
```

### Storage Methods Required
```typescript
// Add to server/storage.ts
getUserByVerificationToken(token: string): Promise<User | undefined>
verifyUserEmail(userId: number): Promise<void>
updateVerificationToken(userId: number, token: string, expires: Date): Promise<void>
```

### Token Lifecycle
- Generated on registration (32 bytes, base64url)
- Expires after 24 hours
- Cleared on successful verification
- Rate limited: 1 resend per 5 minutes

## Definition of Done
- [ ] `client/src/pages/verify-email.tsx` created
- [ ] `client/src/pages/verify-email-sent.tsx` created
- [ ] `POST /api/auth/verify-email` route added
- [ ] `POST /api/auth/resend-verification` route added
- [ ] Storage methods for verification implemented
- [ ] Token expiration checked
- [ ] Rate limiting for resend (1 per 5 min)
- [ ] Success/error states displayed
- [ ] Redirect to login on success
- [ ] TypeScript compiles without errors

## Test Scenarios
1. **Valid Token:** Email verified, redirected to login
2. **Invalid Token:** Error shown, resend option
3. **Expired Token:** Error shown, resend option
4. **Resend Success:** New email sent
5. **Resend Rate Limit:** Error when too frequent
6. **Already Verified:** Error message
