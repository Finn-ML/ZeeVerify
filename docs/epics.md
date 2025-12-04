# ZeeVerify - Epic Breakdown

**Author:** Runner
**Date:** 2025-12-04
**Project Type:** Brownfield - Franchise Intelligence Platform
**Phase:** Phase 1 Integration Features

---

## Overview

This document provides the complete epic and story breakdown for ZeeVerify Phase 1, decomposing the requirements from the [PRD](./prd.md) into implementable stories. The epics focus on integrating new functionality (Authentication, Email, Stripe) with the existing brownfield codebase.

**Epics Summary:**

| Epic | Title | Stories | New FRs |
|------|-------|---------|---------|
| 1 | Email Infrastructure Foundation | 3 | 3 |
| 2 | User Authentication & Onboarding | 6 | 9 |
| 3 | Account Management | 4 | 6 |
| 4 | Brand Claiming with Stripe | 5 | 11 |
| 5 | Notification System | 4 | 4 |
| 6 | Admin Enhancements | 3 | 3 |

**Total: 6 Epics, 25 Stories, 25 New FRs (+ 42 existing brownfield FRs)**

---

## Functional Requirements Inventory

| FR ID | Feature Module | Description | Status |
|-------|----------------|-------------|--------|
| **FR-4.1.1** | Login & Signup | Users can create account with email/password | New |
| **FR-4.1.2** | Login & Signup | Users select user type during registration | New |
| **FR-4.1.3** | Login & Signup | Users can log in with email/password | New |
| **FR-4.1.4** | Login & Signup | Forgot Password popup functionality | New |
| **FR-4.1.5** | Login & Signup | Password reset emails | New |
| **FR-4.1.6** | Login & Signup | Email format and password strength validation | New |
| **FR-4.1.7** | Login & Signup | Error messages for failed login | New |
| **FR-4.2.1** | Account Settings | Update email address | New |
| **FR-4.2.2** | Account Settings | Change password | New |
| **FR-4.2.3** | Account Settings | Update profile information | New |
| **FR-4.2.4** | Account Settings | Manage notification preferences | New |
| **FR-4.2.5** | Account Settings | Current password confirmation for sensitive changes | New |
| **FR-4.2.6** | Account Settings | Account deletion | New |
| **FR-4.3.1** | Notifications | HTML-formatted transactional emails | New |
| **FR-4.3.2** | Notifications | Postmark integration | New |
| **FR-4.3.3** | Notifications | Password reset notification emails | New |
| **FR-4.3.4** | Notifications | Account verification emails | New |
| **FR-4.3.5** | Notifications | Notify franchisors of new reviews | New |
| **FR-4.3.6** | Notifications | Notify franchisees of franchisor responses | New |
| **FR-4.3.7** | Notifications | Moderation outcome notifications | New |
| **FR-4.3.8** | Notifications | Customizable branded email templates | New |
| **FR-4.5.1** | Franchisor Portal | Claim brand listing | New |
| **FR-4.5.2** | Franchisor Portal | Stripe payment for claiming | New |
| **FR-4.5.9** | Franchisor Portal | Verified badge on claimed listings | New |
| **FR-4.7.5** | Admin Dashboard | Revenue/payment metrics | New |
| **FR-4.8.7** | Admin User Management | Send password reset emails | New |
| **FR-4.8.9** | Admin User Management | Audit logging | New |
| **FR-4.9.7** | Trust & Verification | Moderation outcome notifications | New |
| **FR-4.10.1** | Stripe Checkout | Stripe Checkout integration | New |
| **FR-4.10.2** | Stripe Checkout | Credit/debit card payments | New |
| **FR-4.10.3** | Stripe Checkout | One-time payments for claims | New |
| **FR-4.10.4** | Stripe Checkout | Embedded Stripe checkout | New |
| **FR-4.10.5** | Stripe Checkout | Handle successful payments | New |
| **FR-4.10.6** | Stripe Checkout | Handle failed payments | New |
| **FR-4.10.7** | Stripe Checkout | Payment confirmation emails | New |
| **FR-4.10.8** | Stripe Checkout | Admin view payment history | New |

---

## FR Coverage Map

| FR ID | Epic | Story |
|-------|------|-------|
| FR-4.1.1 | Epic 2 | Story 2.2 |
| FR-4.1.2 | Epic 2 | Story 2.2 |
| FR-4.1.3 | Epic 2 | Story 2.3 |
| FR-4.1.4 | Epic 2 | Story 2.5 |
| FR-4.1.5 | Epic 2 | Story 2.5 |
| FR-4.1.6 | Epic 2 | Story 2.2, 2.3 |
| FR-4.1.7 | Epic 2 | Story 2.3 |
| FR-4.2.1 | Epic 3 | Story 3.2 |
| FR-4.2.2 | Epic 3 | Story 3.3 |
| FR-4.2.3 | Epic 3 | Story 3.1 |
| FR-4.2.4 | Epic 3 | Story 3.1 |
| FR-4.2.5 | Epic 3 | Story 3.2, 3.3 |
| FR-4.2.6 | Epic 3 | Story 3.4 |
| FR-4.3.1 | Epic 1 | Story 1.1, 1.2 |
| FR-4.3.2 | Epic 1 | Story 1.1 |
| FR-4.3.3 | Epic 2 | Story 2.5 |
| FR-4.3.4 | Epic 2 | Story 2.4 |
| FR-4.3.5 | Epic 5 | Story 5.1 |
| FR-4.3.6 | Epic 5 | Story 5.2 |
| FR-4.3.7 | Epic 5 | Story 5.3 |
| FR-4.3.8 | Epic 1 | Story 1.3 |
| FR-4.5.1 | Epic 4 | Story 4.2 |
| FR-4.5.2 | Epic 4 | Story 4.2, 4.3 |
| FR-4.5.9 | Epic 4 | Story 4.4 |
| FR-4.7.5 | Epic 6 | Story 6.1 |
| FR-4.8.7 | Epic 6 | Story 6.2 |
| FR-4.8.9 | Epic 6 | Story 6.3 |
| FR-4.9.7 | Epic 5 | Story 5.3 |
| FR-4.10.1 | Epic 4 | Story 4.1 |
| FR-4.10.2 | Epic 4 | Story 4.2 |
| FR-4.10.3 | Epic 4 | Story 4.2 |
| FR-4.10.4 | Epic 4 | Story 4.2 |
| FR-4.10.5 | Epic 4 | Story 4.3 |
| FR-4.10.6 | Epic 4 | Story 4.2 |
| FR-4.10.7 | Epic 5 | Story 5.4 |
| FR-4.10.8 | Epic 6 | Story 6.1 |

---

## Epic 1: Email Infrastructure Foundation

**Goal:** Establish the email infrastructure that enables all email-based features including authentication, notifications, and transactional messages.

**User Value:** Foundation that enables password reset, email verification, and all notification features.

**FRs Covered:** FR-4.3.1, FR-4.3.2, FR-4.3.8

**Technical Context:** Postmark v4.0.5, EmailService class in `server/services/email.ts`

**Dependencies:** None (foundation epic)

---

### Story 1.1: Postmark Email Service Setup

As a **developer**,
I want **a configured email service using Postmark**,
So that **the application can send transactional emails**.

**Acceptance Criteria:**

**Given** the server is starting up
**When** the EmailService is initialized
**Then** it connects to Postmark using POSTMARK_API_TOKEN environment variable
**And** the service is available as a singleton `emailService` export

**Given** the POSTMARK_API_TOKEN is missing or invalid
**When** the EmailService attempts to initialize
**Then** the server logs an error but continues running (graceful degradation)
**And** email sending methods return false without throwing

**Given** an email needs to be sent
**When** calling any EmailService method
**Then** the email is sent via Postmark API
**And** the method returns true on success, false on failure
**And** failures are logged with error details

**Technical Notes:**
- Create `server/services/email.ts` (Architecture section: Email Infrastructure)
- Install `postmark` package v4.0.5
- Use ServerClient from postmark package
- Environment variables: `POSTMARK_API_TOKEN`, `POSTMARK_FROM_EMAIL`
- Export singleton instance for use across routes

**Prerequisites:** None

---

### Story 1.2: Base Email Template System

As a **developer**,
I want **a consistent HTML email template structure**,
So that **all emails have professional, branded appearance**.

**Acceptance Criteria:**

**Given** any email is being sent
**When** the EmailService generates the email content
**Then** the email uses ZeeVerify branding (logo, colors)
**And** the email is responsive for mobile viewing
**And** the email includes unsubscribe footer where appropriate
**And** the email renders correctly in major clients (Gmail, Outlook, Apple Mail)

**Given** the email template needs customization
**When** passing dynamic content to the template
**Then** variables are properly escaped to prevent injection
**And** the template renders the dynamic content correctly

**Technical Notes:**
- Create base HTML template with ZeeVerify branding
- Use inline CSS for email compatibility
- Design system colors: Deep navy primary (#1a1f36), warm gold accent (#c9a962)
- Include ZeeVerify logo in header
- Add footer with company info and unsubscribe link
- Template methods: `wrapInTemplate(content: string): string`

**Prerequisites:** Story 1.1

---

### Story 1.3: Email Template Variants

As a **developer**,
I want **specific email templates for each email type**,
So that **each transactional email has appropriate content and formatting**.

**Acceptance Criteria:**

**Given** an email verification needs to be sent
**When** calling `sendVerificationEmail(to, token)`
**Then** the email contains a verification link with the token
**And** the link expires message is included (24 hours)
**And** the subject line is "Verify your ZeeVerify account"

**Given** a password reset needs to be sent
**When** calling `sendPasswordResetEmail(to, token)`
**Then** the email contains a password reset link with the token
**And** the link expires message is included (1 hour)
**And** security notice about not sharing the link is included
**And** the subject line is "Reset your ZeeVerify password"

**Given** a welcome email needs to be sent
**When** calling `sendWelcomeEmail(to, firstName)`
**Then** the email welcomes the user by name
**And** includes getting started tips
**And** the subject line is "Welcome to ZeeVerify, {firstName}!"

**Technical Notes:**
- EmailService methods to implement:
  - `sendVerificationEmail(to: string, token: string): Promise<boolean>`
  - `sendPasswordResetEmail(to: string, token: string): Promise<boolean>`
  - `sendWelcomeEmail(to: string, firstName: string): Promise<boolean>`
- Use base URL from environment for links
- Tokens should be URL-safe (base64url encoding)

**Prerequisites:** Story 1.2

---

## Epic 2: User Authentication & Onboarding

**Goal:** Enable users to register, log in, verify their email, and reset their passwords using email/password authentication.

**User Value:** Users can create accounts and securely access the platform without relying on third-party OAuth.

**FRs Covered:** FR-4.1.1, FR-4.1.2, FR-4.1.3, FR-4.1.4, FR-4.1.5, FR-4.1.6, FR-4.1.7, FR-4.3.3, FR-4.3.4

**Technical Context:** Passport.js Local Strategy, bcrypt hashing, session-based auth

**Dependencies:** Epic 1 (Email Infrastructure)

---

### Story 2.1: User Schema Authentication Columns

As a **developer**,
I want **authentication-related columns added to the users table**,
So that **the database can store password hashes and verification tokens**.

**Acceptance Criteria:**

**Given** the database schema is being updated
**When** running `npm run db:push`
**Then** the users table has the following new columns:
- `password_hash` (VARCHAR 255, nullable for migration)
- `email_verified` (BOOLEAN, default false)
- `email_verification_token` (VARCHAR 255, nullable)
- `email_verification_expires` (TIMESTAMP, nullable)
- `password_reset_token` (VARCHAR 255, nullable)
- `password_reset_expires` (TIMESTAMP, nullable)

**Given** existing users from Replit OIDC
**When** they attempt to use the new auth system
**Then** they can use "Forgot Password" to set a password
**And** their existing user data is preserved

**Technical Notes:**
- Update `shared/schema.ts` with new columns
- Use Drizzle ORM column definitions
- Add corresponding Zod schemas for validation
- Indexes on email_verification_token and password_reset_token for lookup performance

**Prerequisites:** None

---

### Story 2.2: User Registration

As a **new user**,
I want **to create an account using my email and password**,
So that **I can access ZeeVerify features**.

**Acceptance Criteria:**

**Given** I am on the registration page
**When** I enter my email, password, first name, last name, and select user type
**Then** I see real-time validation feedback:
- Email format validation (RFC 5322)
- Password strength indicator (min 8 chars, 1 uppercase, 1 number, 1 special)
- Required field indicators

**Given** I submit valid registration data
**When** the form is submitted
**Then** `POST /api/auth/register` is called
**And** my password is hashed using bcrypt (12 rounds)
**And** a verification token is generated and stored
**And** a verification email is sent via EmailService
**And** I see "Check your email for verification link" message
**And** I am redirected to a "verify your email" instruction page

**Given** I try to register with an existing email
**When** submitting the registration form
**Then** I see "An account with this email already exists" error
**And** the form is not submitted

**Given** I try to register with invalid data
**When** submitting the registration form
**Then** I see specific validation error messages
**And** the form is not submitted

**Technical Notes:**
- Create `client/src/pages/register.tsx`
- Add `POST /api/auth/register` route to `server/routes.ts`
- Use `registerSchema` from `shared/schema.ts` for validation
- Generate crypto-random verification token (32 bytes, base64url)
- Token expires in 24 hours
- User type options: "franchisee" or "franchisor"

**Prerequisites:** Story 1.3, Story 2.1

---

### Story 2.3: User Login

As a **registered user**,
I want **to log in with my email and password**,
So that **I can access my account**.

**Acceptance Criteria:**

**Given** I am on the login page
**When** I enter my email and password
**Then** I see validation for required fields

**Given** I submit valid credentials for a verified account
**When** the login form is submitted
**Then** `POST /api/auth/login` authenticates via Passport Local
**And** a session is created
**And** I am redirected to my dashboard based on user type:
- Franchisee → `/franchisee`
- Franchisor → `/franchisor`
- Admin → `/admin`

**Given** I submit valid credentials for an unverified account
**When** the login form is submitted
**Then** I see "Please verify your email before logging in" message
**And** I see a "Resend verification email" link

**Given** I submit invalid credentials
**When** the login form is submitted
**Then** I see "Invalid email or password" error (generic for security)
**And** the form remains on the page

**Given** I am already logged in
**When** I navigate to the login page
**Then** I am redirected to my dashboard

**Technical Notes:**
- Create `client/src/pages/login.tsx`
- Create `server/localAuth.ts` with Passport Local strategy
- Add `POST /api/auth/login` route using `passport.authenticate('local')`
- Add `POST /api/auth/logout` route to destroy session
- Add `GET /api/auth/me` route to check current user
- Update `client/src/hooks/useAuth.ts` to use new endpoints

**Prerequisites:** Story 2.1

---

### Story 2.4: Email Verification

As a **newly registered user**,
I want **to verify my email address**,
So that **I can activate my account**.

**Acceptance Criteria:**

**Given** I have received a verification email
**When** I click the verification link
**Then** I am taken to `/verify-email?token=xxx`
**And** `POST /api/auth/verify-email` is called with the token

**Given** the verification token is valid and not expired
**When** the verification request is processed
**Then** my `email_verified` is set to true
**And** the verification token is cleared
**And** I see "Email verified successfully! You can now log in."
**And** I am redirected to the login page

**Given** the verification token is invalid or expired
**When** the verification request is processed
**Then** I see "Invalid or expired verification link"
**And** I see a "Request new verification email" button

**Given** I request a new verification email
**When** clicking "Resend verification email"
**Then** a new token is generated and sent
**And** I see "Verification email sent" confirmation

**Technical Notes:**
- Create `client/src/pages/verify-email.tsx`
- Add `POST /api/auth/verify-email` route
- Add `POST /api/auth/resend-verification` route
- Verification token expires after 24 hours
- Rate limit resend to 1 per 5 minutes

**Prerequisites:** Story 2.2

---

### Story 2.5: Password Reset Flow

As a **user who forgot my password**,
I want **to reset my password via email**,
So that **I can regain access to my account**.

**Acceptance Criteria:**

**Given** I am on the login page
**When** I click "Forgot Password"
**Then** a modal or page opens for password reset

**Given** I enter my email on the forgot password form
**When** I submit the form
**Then** `POST /api/auth/forgot-password` is called
**And** if the email exists, a reset token is generated
**And** a password reset email is sent
**And** I see "If an account exists, you'll receive a reset email" (security message)

**Given** I click the reset link in my email
**When** the page loads at `/reset-password?token=xxx`
**Then** I see a new password form

**Given** I enter a valid new password
**When** I submit the reset form
**Then** `POST /api/auth/reset-password` is called
**And** my password is updated (bcrypt hashed)
**And** the reset token is cleared
**And** all my other sessions are invalidated
**And** I see "Password reset successfully"
**And** I am redirected to login

**Given** the reset token is invalid or expired
**When** the reset page loads
**Then** I see "Invalid or expired reset link"
**And** I see a "Request new reset email" button

**Technical Notes:**
- Create `client/src/pages/forgot-password.tsx`
- Create `client/src/pages/reset-password.tsx`
- Add routes: `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
- Reset token expires in 1 hour (security)
- Rate limit forgot-password to 3 requests per hour per email

**Prerequisites:** Story 1.3, Story 2.1

---

### Story 2.6: Remove Replit OIDC Authentication

As a **developer**,
I want **to remove the Replit OIDC authentication code**,
So that **the codebase uses only the new email/password auth**.

**Acceptance Criteria:**

**Given** the new authentication system is complete
**When** deploying the application
**Then** Replit OIDC code is removed from:
- `server/replitAuth.ts` (delete file)
- Auth middleware references
- Client-side Replit auth components

**Given** existing users authenticated via Replit OIDC
**When** they visit the platform
**Then** they are prompted to set a password via "Forgot Password"
**And** their existing user data (reviews, etc.) is preserved

**Given** the application runs outside Replit
**When** accessing authentication features
**Then** all auth features work correctly without Replit dependencies

**Technical Notes:**
- Delete `server/replitAuth.ts`
- Update `server/index.ts` to use `localAuth.ts`
- Remove `@replit/` auth packages from dependencies
- Update environment variable documentation
- Existing users can claim accounts via password reset

**Prerequisites:** Stories 2.2-2.5 complete and tested

---

## Epic 3: Account Management

**Goal:** Enable users to manage their account settings including profile, password, email, and notifications.

**User Value:** Users have control over their account information and preferences.

**FRs Covered:** FR-4.2.1, FR-4.2.2, FR-4.2.3, FR-4.2.4, FR-4.2.5, FR-4.2.6

**Technical Context:** Protected routes with `isAuthenticated` middleware

**Dependencies:** Epic 2 (Authentication)

---

### Story 3.1: Profile Settings Page

As a **logged-in user**,
I want **to view and update my profile information**,
So that **my account reflects accurate information**.

**Acceptance Criteria:**

**Given** I am logged in
**When** I navigate to account settings
**Then** I see my current profile information:
- First name
- Last name
- Email (read-only, separate change flow)
- User type (read-only)
- Notification preferences

**Given** I update my profile fields
**When** I click "Save Changes"
**Then** `PATCH /api/user/profile` is called
**And** my profile is updated
**And** I see "Profile updated successfully" toast

**Given** I want to change notification preferences
**When** I toggle notification options
**Then** preferences are saved immediately
**And** options include:
- Email notifications for review responses
- Email notifications for moderation outcomes
- Marketing emails (opt-in)

**Technical Notes:**
- Create `client/src/pages/settings.tsx` or update existing
- Add `PATCH /api/user/profile` route
- Add `notificationPreferences` JSON column to users table if not exists
- Use React Hook Form for form management

**Prerequisites:** Epic 2 complete

---

### Story 3.2: Email Change

As a **logged-in user**,
I want **to change my email address**,
So that **I can update my contact information**.

**Acceptance Criteria:**

**Given** I am on account settings
**When** I click "Change Email"
**Then** I see a form requesting:
- New email address
- Current password (confirmation)

**Given** I submit a valid new email and correct password
**When** the form is submitted
**Then** `POST /api/user/change-email` is called
**And** a verification email is sent to the NEW email
**And** I see "Verification email sent to {new email}"
**And** my email is NOT changed until verified

**Given** I click the verification link in the new email
**When** the verification is processed
**Then** my email is updated to the new address
**And** a confirmation email is sent to the OLD email
**And** I see "Email changed successfully"

**Given** I enter an incorrect current password
**When** submitting the form
**Then** I see "Current password is incorrect" error

**Technical Notes:**
- Add `pending_email` and `pending_email_token` columns to users
- Email change only completes after verification
- Old email receives notification of change (security)
- Add `POST /api/user/change-email` and `POST /api/user/verify-new-email` routes

**Prerequisites:** Story 3.1

---

### Story 3.3: Password Change

As a **logged-in user**,
I want **to change my password**,
So that **I can maintain account security**.

**Acceptance Criteria:**

**Given** I am on account settings
**When** I click "Change Password"
**Then** I see a form requesting:
- Current password
- New password
- Confirm new password

**Given** I submit valid password change data
**When** the form is submitted
**Then** `POST /api/user/change-password` is called
**And** current password is verified
**And** new password is hashed and saved
**And** I see "Password changed successfully"
**And** I remain logged in (current session preserved)

**Given** I enter an incorrect current password
**When** submitting the form
**Then** I see "Current password is incorrect" error

**Given** new password doesn't meet requirements
**When** submitting the form
**Then** I see password strength validation errors

**Technical Notes:**
- Add `POST /api/user/change-password` route
- Verify current password with bcrypt.compare
- Same password requirements as registration
- Optionally invalidate other sessions

**Prerequisites:** Story 3.1

---

### Story 3.4: Account Deletion

As a **logged-in user**,
I want **to delete my account**,
So that **I can remove my data from the platform**.

**Acceptance Criteria:**

**Given** I am on account settings
**When** I click "Delete Account"
**Then** I see a confirmation modal explaining:
- What data will be deleted
- That this action is permanent
- A text input to type "DELETE" for confirmation

**Given** I confirm account deletion
**When** I type "DELETE" and enter my password
**Then** `DELETE /api/user/account` is called
**And** my session is destroyed
**And** my user record is soft-deleted (or anonymized per legal requirements)
**And** my reviews remain but are anonymized
**And** I am redirected to the homepage
**And** I see "Account deleted successfully"

**Given** I enter incorrect password for deletion
**When** submitting the deletion form
**Then** I see "Password incorrect" error
**And** the account is NOT deleted

**Technical Notes:**
- Add `DELETE /api/user/account` route
- Require password confirmation for security
- Soft delete: set `deleted_at` timestamp, anonymize PII
- Reviews remain with "Former Franchisee" attribution
- Comply with data retention requirements

**Prerequisites:** Story 3.1

---

## Epic 4: Brand Claiming with Stripe

**Goal:** Enable franchisors to claim their brand listings by completing a Stripe payment.

**User Value:** Franchisors can officially claim their brand, get verified badge, and respond to reviews.

**FRs Covered:** FR-4.5.1, FR-4.5.2, FR-4.5.9, FR-4.10.1-8

**Technical Context:** Stripe Embedded Checkout, webhook handling

**Dependencies:** Epic 2 (Authentication)

---

### Story 4.1: Stripe Service Setup

As a **developer**,
I want **a Stripe service configured for payments**,
So that **the application can process brand claiming payments**.

**Acceptance Criteria:**

**Given** the server is starting up
**When** the StripeService is initialized
**Then** it connects using STRIPE_SECRET_KEY environment variable
**And** the service is available for creating checkout sessions

**Given** Stripe environment variables are missing
**When** attempting payment operations
**Then** the service logs errors and returns graceful failures
**And** users see "Payment temporarily unavailable" message

**Technical Notes:**
- Create `server/services/stripe.ts`
- Install `stripe` package
- Environment variables: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- Create price in Stripe dashboard for brand claiming
- Store `STRIPE_BRAND_CLAIM_PRICE_ID` in environment

**Prerequisites:** None

---

### Story 4.2: Brand Claim Checkout Flow

As a **franchisor**,
I want **to pay to claim my brand listing**,
So that **I get a verified badge and can respond to reviews**.

**Acceptance Criteria:**

**Given** I am a logged-in franchisor viewing an unclaimed brand
**When** I click "Claim This Brand"
**Then** I see the claim benefits and price
**And** I can proceed to checkout

**Given** I proceed to checkout
**When** the checkout page loads
**Then** `POST /api/checkout/create-session` is called
**And** Stripe Embedded Checkout renders on the page
**And** I see the brand name and claim price

**Given** I complete payment successfully
**When** Stripe processes the payment
**Then** I see a success message on the return URL
**And** the brand claim is pending webhook confirmation

**Given** payment fails
**When** Stripe returns an error
**Then** I see appropriate error message
**And** I can retry the payment

**Technical Notes:**
- Create `client/src/pages/franchisor/claim-brand.tsx`
- Add `POST /api/checkout/create-session` route
- Use Stripe Embedded Checkout with `ui_mode: 'embedded'`
- Include `brandId` and `userId` in session metadata
- Return URL: `/franchisor/claim-success?session_id={CHECKOUT_SESSION_ID}`
- Install `@stripe/stripe-js` and `@stripe/react-stripe-js` for client

**Prerequisites:** Story 4.1, Epic 2 complete

---

### Story 4.3: Stripe Webhook Handler

As a **system**,
I want **to process Stripe webhooks**,
So that **brand claims are activated after successful payment**.

**Acceptance Criteria:**

**Given** a checkout.session.completed webhook is received
**When** the webhook is verified and processed
**Then** the brand is marked as claimed:
- `isClaimed` = true
- `claimedById` = userId from metadata
- `claimedAt` = current timestamp
**And** the payment is recorded in payments table
**And** a confirmation email is sent to the franchisor

**Given** a webhook with invalid signature
**When** the webhook endpoint receives it
**Then** the request is rejected with 400 status
**And** the event is logged for security monitoring

**Given** the webhook is for a different event type
**When** processing the webhook
**Then** it is acknowledged (200) but no action taken

**Technical Notes:**
- Add `POST /api/webhooks/stripe` route
- Use raw body parser for webhook verification
- Verify signature using `stripe.webhooks.constructEvent`
- Handle `checkout.session.completed` event
- Create `payments` table if not exists: id, userId, brandId, stripeSessionId, amount, status, createdAt
- Use idempotency: check if payment already processed

**Prerequisites:** Story 4.2

---

### Story 4.4: Verified Badge Display

As a **visitor**,
I want **to see which brands are verified/claimed**,
So that **I know which franchisors are actively managing their presence**.

**Acceptance Criteria:**

**Given** a brand has been claimed
**When** viewing the brand card or detail page
**Then** a verified badge is displayed prominently
**And** the badge follows design system (gold accent color)

**Given** a brand is not claimed
**When** viewing the brand
**Then** no verified badge is shown
**And** franchisors see "Claim This Brand" CTA

**Given** a brand was claimed
**When** viewing the brand detail page
**Then** I can see:
- Verified badge
- "Claimed by {company name}" indicator
- Franchisor responses to reviews enabled

**Technical Notes:**
- Update `BrandCard` component to show verified badge
- Update brand detail page
- Badge design: Shield icon with checkmark, gold accent (#c9a962)
- Query `isClaimed` field from brand data

**Prerequisites:** Story 4.3

---

### Story 4.5: Payment Success Page

As a **franchisor who just completed payment**,
I want **to see confirmation of my brand claim**,
So that **I know the process completed successfully**.

**Acceptance Criteria:**

**Given** I complete Stripe checkout
**When** I am redirected to the success page
**Then** I see:
- "Congratulations! You've claimed {Brand Name}"
- Verified badge preview
- Next steps (respond to reviews, update brand info)
- Link to franchisor dashboard

**Given** I visit the success page without valid session
**When** the page loads
**Then** I am redirected to my dashboard

**Technical Notes:**
- Create `client/src/pages/franchisor/claim-success.tsx`
- Verify session_id with Stripe API
- Show brand information from session metadata
- Provide clear next-step CTAs

**Prerequisites:** Story 4.3

---

## Epic 5: Notification System

**Goal:** Send timely email notifications for platform events.

**User Value:** Users stay informed about reviews, responses, and moderation outcomes.

**FRs Covered:** FR-4.3.5, FR-4.3.6, FR-4.3.7, FR-4.9.7, FR-4.10.7

**Technical Context:** EmailService integration with existing routes

**Dependencies:** Epic 1 (Email Infrastructure), Epic 2 (Authentication)

---

### Story 5.1: New Review Notification for Franchisors

As a **franchisor with a claimed brand**,
I want **to receive email notifications when new reviews are approved**,
So that **I can respond promptly to franchisee feedback**.

**Acceptance Criteria:**

**Given** a review is approved by an admin
**When** the review belongs to a claimed brand
**Then** the franchisor receives an email notification containing:
- Brand name
- Review summary (first 100 chars)
- Overall rating
- Link to respond
**And** the email is sent within 2 minutes of approval

**Given** the franchisor has disabled review notifications
**When** a review is approved
**Then** no email is sent

**Given** the brand is not claimed
**When** a review is approved
**Then** no notification is sent

**Technical Notes:**
- Add EmailService method: `sendNewReviewNotification(to, brandName, reviewSummary, rating, reviewId)`
- Hook into review approval in moderation routes
- Check franchisor notification preferences
- Add review notification template

**Prerequisites:** Epic 1 complete, Epic 2 complete

---

### Story 5.2: Franchisor Response Notification

As a **franchisee**,
I want **to be notified when a franchisor responds to my review**,
So that **I can read their response**.

**Acceptance Criteria:**

**Given** a franchisor responds to my review
**When** the response is submitted
**Then** I receive an email notification containing:
- Brand name
- Response preview (first 100 chars)
- Link to view full response
**And** the email is sent within 2 minutes

**Given** I have disabled response notifications
**When** a response is posted
**Then** no email is sent

**Technical Notes:**
- Add EmailService method: `sendResponseNotification(to, brandName, responsePreview, reviewId)`
- Hook into review response submission route
- Check franchisee notification preferences
- Add response notification template

**Prerequisites:** Epic 1 complete, Epic 2 complete

---

### Story 5.3: Moderation Outcome Notification

As a **franchisee who submitted a review**,
I want **to be notified of the moderation outcome**,
So that **I know if my review was published or rejected**.

**Acceptance Criteria:**

**Given** my review is approved
**When** the admin approves it
**Then** I receive an email:
- Subject: "Your review has been published"
- Content: Brand name, link to view review

**Given** my review is rejected
**When** the admin rejects it
**Then** I receive an email:
- Subject: "Update on your review submission"
- Content: Brand name, rejection reason, option to resubmit

**Given** I have disabled moderation notifications
**When** a moderation decision is made
**Then** no email is sent

**Technical Notes:**
- Add EmailService methods: `sendReviewApprovedEmail`, `sendReviewRejectedEmail`
- Hook into moderation approval/rejection routes
- Include rejection reason in rejected email
- Check notification preferences

**Prerequisites:** Epic 1 complete, Epic 2 complete

---

### Story 5.4: Payment Confirmation Email

As a **franchisor who completed a brand claim payment**,
I want **to receive a payment confirmation email**,
So that **I have a record of my transaction**.

**Acceptance Criteria:**

**Given** my payment is successfully processed
**When** the Stripe webhook confirms the payment
**Then** I receive a confirmation email containing:
- Subject: "Payment confirmed - {Brand Name} claimed"
- Transaction ID
- Amount paid
- Date
- Brand name
- Receipt link (Stripe hosted)

**Technical Notes:**
- Add EmailService method: `sendPaymentConfirmation(to, brandName, amount, transactionId, receiptUrl)`
- Call from webhook handler after successful payment
- Include Stripe receipt URL for detailed receipt
- Always send regardless of notification preferences (transactional)

**Prerequisites:** Epic 1 complete, Story 4.3

---

## Epic 6: Admin Enhancements

**Goal:** Provide admins with payment visibility, user management tools, and audit logging.

**User Value:** Admins can effectively manage the platform and track important actions.

**FRs Covered:** FR-4.7.5, FR-4.8.7, FR-4.8.9

**Technical Context:** Admin-only routes with `isAdmin` middleware

**Dependencies:** Epic 4 (Stripe), Epic 2 (Authentication)

---

### Story 6.1: Admin Payment Dashboard

As an **admin**,
I want **to view payment history and revenue metrics**,
So that **I can track platform monetization**.

**Acceptance Criteria:**

**Given** I am logged in as admin
**When** I view the admin dashboard
**Then** I see payment metrics:
- Total revenue
- Number of claimed brands
- Recent payments (last 10)

**Given** I click "View All Payments"
**When** the payments page loads
**Then** I see a paginated list of all payments:
- Date
- Franchisor email
- Brand name
- Amount
- Status
- Stripe session link

**Given** I want to filter payments
**When** I use the filter options
**Then** I can filter by:
- Date range
- Status (completed, refunded)
- Minimum/maximum amount

**Technical Notes:**
- Add `GET /api/admin/payments` route with pagination
- Add payment metrics to admin dashboard endpoint
- Link to Stripe dashboard for detailed transaction management
- Include `isAdmin` middleware

**Prerequisites:** Story 4.3

---

### Story 6.2: Admin Password Reset for Users

As an **admin**,
I want **to trigger password reset emails for users**,
So that **I can help users who need account assistance**.

**Acceptance Criteria:**

**Given** I am viewing a user in admin user management
**When** I click "Send Password Reset"
**Then** a confirmation modal appears

**Given** I confirm the action
**When** the reset is triggered
**Then** `POST /api/admin/users/{id}/reset-password` is called
**And** a password reset email is sent to the user
**And** I see "Password reset email sent" confirmation
**And** the action is logged

**Given** the user's email is invalid or bounced
**When** triggering the reset
**Then** I see an appropriate error message

**Technical Notes:**
- Add `POST /api/admin/users/:id/reset-password` route
- Reuse password reset token generation logic
- Log admin action with admin user ID, target user ID, action type

**Prerequisites:** Story 2.5, Story 6.3

---

### Story 6.3: Admin Audit Logging

As an **admin**,
I want **all admin actions to be logged**,
So that **there is accountability and audit trail**.

**Acceptance Criteria:**

**Given** an admin performs any sensitive action
**When** the action is executed
**Then** an audit log entry is created with:
- Timestamp
- Admin user ID
- Action type
- Target entity (user ID, review ID, etc.)
- Details (old value, new value if applicable)
- IP address

**Given** I want to review audit logs
**When** I access the audit log page
**Then** I see a searchable, filterable list of admin actions

**Actions to log:**
- User role changes
- User suspensions/deletions
- Review approvals/rejections
- Password reset triggers
- Content edits

**Technical Notes:**
- Create `admin_audit_log` table: id, adminId, action, targetType, targetId, details (JSON), ipAddress, createdAt
- Add `storage.logAdminAction()` helper
- Call from all admin routes
- Add `GET /api/admin/audit-log` route with pagination and filters

**Prerequisites:** Story 2.1 (schema patterns)

---

## FR Coverage Matrix

| FR ID | Description | Epic | Story | Status |
|-------|-------------|------|-------|--------|
| FR-4.1.1 | Users can create account with email/password | 2 | 2.2 | Planned |
| FR-4.1.2 | Users select user type during registration | 2 | 2.2 | Planned |
| FR-4.1.3 | Users can log in with email/password | 2 | 2.3 | Planned |
| FR-4.1.4 | Forgot Password popup functionality | 2 | 2.5 | Planned |
| FR-4.1.5 | Password reset emails | 2 | 2.5 | Planned |
| FR-4.1.6 | Email format and password strength validation | 2 | 2.2, 2.3 | Planned |
| FR-4.1.7 | Error messages for failed login | 2 | 2.3 | Planned |
| FR-4.2.1 | Update email address | 3 | 3.2 | Planned |
| FR-4.2.2 | Change password | 3 | 3.3 | Planned |
| FR-4.2.3 | Update profile information | 3 | 3.1 | Planned |
| FR-4.2.4 | Manage notification preferences | 3 | 3.1 | Planned |
| FR-4.2.5 | Current password confirmation | 3 | 3.2, 3.3 | Planned |
| FR-4.2.6 | Account deletion | 3 | 3.4 | Planned |
| FR-4.3.1 | HTML-formatted transactional emails | 1 | 1.1, 1.2 | Planned |
| FR-4.3.2 | Postmark integration | 1 | 1.1 | Planned |
| FR-4.3.3 | Password reset notification emails | 2 | 2.5 | Planned |
| FR-4.3.4 | Account verification emails | 2 | 2.4 | Planned |
| FR-4.3.5 | Notify franchisors of new reviews | 5 | 5.1 | Planned |
| FR-4.3.6 | Notify franchisees of franchisor responses | 5 | 5.2 | Planned |
| FR-4.3.7 | Moderation outcome notifications | 5 | 5.3 | Planned |
| FR-4.3.8 | Customizable branded email templates | 1 | 1.3 | Planned |
| FR-4.5.1 | Claim brand listing | 4 | 4.2 | Planned |
| FR-4.5.2 | Stripe payment for claiming | 4 | 4.2, 4.3 | Planned |
| FR-4.5.9 | Verified badge on claimed listings | 4 | 4.4 | Planned |
| FR-4.7.5 | Revenue/payment metrics | 6 | 6.1 | Planned |
| FR-4.8.7 | Send password reset emails (admin) | 6 | 6.2 | Planned |
| FR-4.8.9 | Audit logging | 6 | 6.3 | Planned |
| FR-4.9.7 | Moderation outcome notifications | 5 | 5.3 | Planned |
| FR-4.10.1 | Stripe Checkout integration | 4 | 4.1 | Planned |
| FR-4.10.2 | Credit/debit card payments | 4 | 4.2 | Planned |
| FR-4.10.3 | One-time payments for claims | 4 | 4.2 | Planned |
| FR-4.10.4 | Embedded Stripe checkout | 4 | 4.2 | Planned |
| FR-4.10.5 | Handle successful payments | 4 | 4.3 | Planned |
| FR-4.10.6 | Handle failed payments | 4 | 4.2 | Planned |
| FR-4.10.7 | Payment confirmation emails | 5 | 5.4 | Planned |
| FR-4.10.8 | Admin view payment history | 6 | 6.1 | Planned |

---

## Summary

### Epic Breakdown Complete

| Epic | Title | Stories | Status |
|------|-------|---------|--------|
| 1 | Email Infrastructure Foundation | 3 | Planned |
| 2 | User Authentication & Onboarding | 6 | Planned |
| 3 | Account Management | 4 | Planned |
| 4 | Brand Claiming with Stripe | 5 | Planned |
| 5 | Notification System | 4 | Planned |
| 6 | Admin Enhancements | 3 | Planned |

**Total Stories:** 25
**New FRs Covered:** 25/25 (100%)
**Existing FRs (Brownfield):** 42 (already implemented)

### Implementation Priority

1. **Epic 1** - Email Infrastructure (foundation for all auth)
2. **Epic 2** - Authentication (blocks all user features)
3. **Epic 4** - Stripe (can parallel with Epic 3)
4. **Epic 3** - Account Management
5. **Epic 5** - Notifications
6. **Epic 6** - Admin Enhancements

### Technical Dependencies Graph

```
Epic 1 (Email)
    ↓
Epic 2 (Auth) ──────────────────┐
    ↓                           ↓
Epic 3 (Account)          Epic 4 (Stripe)
    ↓                           ↓
Epic 5 (Notifications) ←────────┘
    ↓
Epic 6 (Admin)
```

---

_For implementation: Use the `create-story` workflow to generate individual story implementation plans from this epic breakdown._

_This document was generated by the BMad Method create-epics-and-stories workflow._
