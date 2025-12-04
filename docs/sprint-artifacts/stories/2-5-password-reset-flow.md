# Story 2.5: Password Reset Flow

## Story Info
- **Epic:** 2 - User Authentication & Onboarding
- **Story ID:** 2.5
- **Title:** Password Reset Flow
- **Status:** ready-for-dev
- **Dependencies:** Story 1.3, Story 2.1

## User Story

As a **user who forgot my password**,
I want **to reset my password via email**,
So that **I can regain access to my account**.

## Acceptance Criteria

### AC1: Forgot Password Link
**Given** I am on the login page
**When** I click "Forgot Password"
**Then** a modal or page opens for password reset

### AC2: Request Reset Email
**Given** I enter my email on the forgot password form
**When** I submit the form
**Then** `POST /api/auth/forgot-password` is called
**And** if the email exists, a reset token is generated
**And** a password reset email is sent
**And** I see "If an account exists, you'll receive a reset email" (security message)

### AC3: Reset Link Click
**Given** I click the reset link in my email
**When** the page loads at `/reset-password?token=xxx`
**Then** I see a new password form

### AC4: Successful Reset
**Given** I enter a valid new password
**When** I submit the reset form
**Then** `POST /api/auth/reset-password` is called
**And** my password is updated (bcrypt hashed)
**And** the reset token is cleared
**And** all my other sessions are invalidated
**And** I see "Password reset successfully"
**And** I am redirected to login

### AC5: Invalid/Expired Reset Token
**Given** the reset token is invalid or expired
**When** the reset page loads
**Then** I see "Invalid or expired reset link"
**And** I see a "Request new reset email" button

## Technical Notes

### Files to Create/Modify
- **Create:** `client/src/pages/forgot-password.tsx`
- **Create:** `client/src/pages/reset-password.tsx`
- **Modify:** `server/routes.ts` - Add password reset routes

### Frontend - Forgot Password
```typescript
// client/src/pages/forgot-password.tsx
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const { register, handleSubmit } = useForm<{ email: string }>();
  const [submitted, setSubmitted] = useState(false);

  const forgotMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => setSubmitted(true),
  });

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>If an account exists with that email, you'll receive a password reset link.</p>
        </CardContent>
      </Card>
    );
  }

  // Form JSX...
}
```

### Frontend - Reset Password
```typescript
// client/src/pages/reset-password.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const resetSchema = z.object({
  password: z.string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const search = useSearch();
  const token = new URLSearchParams(search).get("token");
  const [, setLocation] = useLocation();

  const resetMutation = useMutation({
    mutationFn: async (data: { password: string }) => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });
      if (!res.ok) throw new Error("Reset failed");
      return res.json();
    },
    onSuccess: () => setLocation("/login?reset=success"),
  });

  // Form JSX with password strength indicator...
}
```

### Backend Implementation
```typescript
// Add to server/routes.ts

// Rate limit tracking (in production, use Redis)
const resetAttempts = new Map<string, { count: number; lastAttempt: Date }>();

app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;

  // Rate limit: 3 requests per hour per email
  const attempts = resetAttempts.get(email);
  if (attempts) {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (attempts.lastAttempt > hourAgo && attempts.count >= 3) {
      return res.status(429).json({ message: "Too many reset attempts. Please try again later." });
    }
  }

  // Always return success (don't reveal if email exists)
  const user = await storage.getUserByEmail(email);

  if (user) {
    const resetToken = crypto.randomBytes(32).toString("base64url");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await storage.setPasswordResetToken(user.id, resetToken, resetExpires);
    await emailService.sendPasswordResetEmail(email, resetToken);

    // Track attempt
    const current = resetAttempts.get(email) || { count: 0, lastAttempt: new Date() };
    resetAttempts.set(email, { count: current.count + 1, lastAttempt: new Date() });
  }

  res.json({ message: "If an account exists, you'll receive a reset email" });
});

app.post("/api/auth/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "Token and password are required" });
  }

  const user = await storage.getUserByResetToken(token);

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired reset link" });
  }

  if (user.passwordResetExpires && new Date() > user.passwordResetExpires) {
    return res.status(400).json({ message: "Invalid or expired reset link" });
  }

  // Validate password strength
  const passwordSchema = z.string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/);

  try {
    passwordSchema.parse(password);
  } catch {
    return res.status(400).json({ message: "Password does not meet requirements" });
  }

  // Hash and update password
  const passwordHash = await bcrypt.hash(password, 12);
  await storage.updatePassword(user.id, passwordHash);
  await storage.clearPasswordResetToken(user.id);

  // TODO: Invalidate other sessions for this user

  res.json({ message: "Password reset successfully" });
});
```

### Storage Methods Required
```typescript
getUserByResetToken(token: string): Promise<User | undefined>
setPasswordResetToken(userId: number, token: string, expires: Date): Promise<void>
updatePassword(userId: number, passwordHash: string): Promise<void>
clearPasswordResetToken(userId: number): Promise<void>
```

### Security Considerations
- Reset token expires in 1 hour
- Rate limit: 3 requests per hour per email
- Generic success message (don't reveal if email exists)
- Password requirements enforced on reset
- Other sessions invalidated on reset

## Definition of Done
- [ ] `client/src/pages/forgot-password.tsx` created
- [ ] `client/src/pages/reset-password.tsx` created
- [ ] `POST /api/auth/forgot-password` route added
- [ ] `POST /api/auth/reset-password` route added
- [ ] Storage methods for reset tokens implemented
- [ ] Rate limiting (3 per hour per email)
- [ ] 1-hour token expiration
- [ ] Password strength validation on reset
- [ ] Security-conscious success messages
- [ ] TypeScript compiles without errors

## Test Scenarios
1. **Valid Email:** Reset email sent
2. **Invalid Email:** Generic success (security)
3. **Rate Limit Exceeded:** Error after 3 attempts
4. **Valid Reset:** Password updated, redirected
5. **Expired Token:** Error with retry option
6. **Weak Password:** Validation error
