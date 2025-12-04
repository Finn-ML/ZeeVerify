# Story 2.2: User Registration

## Story Info
- **Epic:** 2 - User Authentication & Onboarding
- **Story ID:** 2.2
- **Title:** User Registration
- **Status:** review
- **Dependencies:** Story 1.3, Story 2.1

## User Story

As a **new user**,
I want **to create an account using my email and password**,
So that **I can access ZeeVerify features**.

## Acceptance Criteria

### AC1: Registration Form Validation
**Given** I am on the registration page
**When** I enter my email, password, first name, last name, and select user type
**Then** I see real-time validation feedback:
- Email format validation (RFC 5322)
- Password strength indicator (min 8 chars, 1 uppercase, 1 number, 1 special)
- Required field indicators

### AC2: Successful Registration
**Given** I submit valid registration data
**When** the form is submitted
**Then** `POST /api/auth/register` is called
**And** my password is hashed using bcrypt (12 rounds)
**And** a verification token is generated and stored
**And** a verification email is sent via EmailService
**And** I see "Check your email for verification link" message
**And** I am redirected to a "verify your email" instruction page

### AC3: Duplicate Email
**Given** I try to register with an existing email
**When** submitting the registration form
**Then** I see "An account with this email already exists" error
**And** the form is not submitted

### AC4: Invalid Data
**Given** I try to register with invalid data
**When** submitting the registration form
**Then** I see specific validation error messages
**And** the form is not submitted

## Technical Notes

### Files to Create/Modify
- **Create:** `client/src/pages/register.tsx`
- **Modify:** `server/routes.ts` - Add registration route
- **Modify:** `server/storage.ts` - Add user creation with password

### Frontend Implementation
```typescript
// client/src/pages/register.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterInput) => {
      const res = await fetch("/api/auth/register", {
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
    onSuccess: () => {
      setLocation("/verify-email-sent");
    },
  });

  // ... form JSX with Shadcn components
}
```

### Backend Implementation
```typescript
// Add to server/routes.ts
import bcrypt from "bcrypt";
import crypto from "crypto";

app.post("/api/auth/register", async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if email exists
    const existing = await storage.getUserByEmail(data.email);
    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("base64url");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await storage.createUser({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.userType,
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Send verification email
    await emailService.sendVerificationEmail(data.email, verificationToken);

    res.status(201).json({ message: "Registration successful. Please check your email." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});
```

### Dependencies to Install
```bash
npm install bcrypt @types/bcrypt
```

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character

## Definition of Done
- [x] `client/src/pages/register.tsx` created
- [x] `POST /api/auth/register` route added
- [x] `bcrypt` package installed
- [x] Password hashed with 12 rounds
- [x] Verification token generated (32 bytes, base64url)
- [x] Verification email sent on registration
- [x] Duplicate email check implemented
- [x] Form validation with real-time feedback
- [x] User type selection (franchisee/franchisor)
- [x] TypeScript compiles without errors

## Test Scenarios
1. **Valid Registration:** User created, email sent, redirected
2. **Duplicate Email:** Error shown, no user created
3. **Weak Password:** Validation errors shown
4. **Invalid Email:** Format validation error
5. **Missing Fields:** Required field errors

## Dev Agent Record

### Agent Model Used
Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List
- Installed bcrypt and @types/bcrypt packages
- Created RegisterPage with full form validation and password strength indicator
- Created VerifyEmailSentPage for post-registration flow
- Added POST /api/auth/register route with bcrypt hashing (12 rounds)
- Added getUserByEmail, getUserByVerificationToken, getUserByPasswordResetToken, createUser to storage
- Added routes to App.tsx router
- Form uses react-hook-form with zodResolver for real-time validation
- Radio group for franchisee/franchisor selection
- TypeScript compiles (pre-existing errors in unrelated files)

### File List
**Files Created:**
- `client/src/pages/register.tsx` - Registration form with validation
- `client/src/pages/verify-email-sent.tsx` - Post-registration confirmation page

**Files Modified:**
- `server/routes.ts` - Added registration route with bcrypt and email verification
- `server/storage.ts` - Added user lookup and creation methods
- `client/src/App.tsx` - Added register and verify-email-sent routes
- `package.json` - Added bcrypt dependency

### Change Log
- 2025-12-04: Implemented user registration with email verification
