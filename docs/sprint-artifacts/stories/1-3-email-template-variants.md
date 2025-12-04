# Story 1.3: Email Template Variants

## Story Info
- **Epic:** 1 - Email Infrastructure Foundation
- **Story ID:** 1.3
- **Title:** Email Template Variants
- **Status:** review
- **Dependencies:** Story 1.2

## User Story

As a **developer**,
I want **specific email templates for each email type**,
So that **each transactional email has appropriate content and formatting**.

## Acceptance Criteria

### AC1: Verification Email
**Given** an email verification needs to be sent
**When** calling `sendVerificationEmail(to, token)`
**Then** the email contains a verification link with the token
**And** the link expires message is included (24 hours)
**And** the subject line is "Verify your ZeeVerify account"

### AC2: Password Reset Email
**Given** a password reset needs to be sent
**When** calling `sendPasswordResetEmail(to, token)`
**Then** the email contains a password reset link with the token
**And** the link expires message is included (1 hour)
**And** security notice about not sharing the link is included
**And** the subject line is "Reset your ZeeVerify password"

### AC3: Welcome Email
**Given** a welcome email needs to be sent
**When** calling `sendWelcomeEmail(to, firstName)`
**Then** the email welcomes the user by name
**And** includes getting started tips
**And** the subject line is "Welcome to ZeeVerify, {firstName}!"

## Technical Notes

### Files to Create/Modify
- **Modify:** `server/services/email.ts`

### Implementation Details
```typescript
// Add to EmailService class in server/services/email.ts

async sendVerificationEmail(to: string, token: string): Promise<boolean> {
  const verifyUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/verify-email?token=${token}`;

  const content = `
    <h2 style="color: #1a1f36; margin-bottom: 20px;">Verify Your Email</h2>
    <p>Thanks for signing up for ZeeVerify! Please verify your email address by clicking the button below.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${verifyUrl}" style="background-color: #c9a962; color: #1a1f36; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
        Verify Email
      </a>
    </p>
    <p style="font-size: 14px; color: #666;">This link will expire in 24 hours.</p>
    <p style="font-size: 14px; color: #666;">If you didn't create an account, you can safely ignore this email.</p>
  `;

  return this.sendEmail(to, 'Verify your ZeeVerify account', this.wrapInTemplate(content, false));
}

async sendPasswordResetEmail(to: string, token: string): Promise<boolean> {
  const resetUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/reset-password?token=${token}`;

  const content = `
    <h2 style="color: #1a1f36; margin-bottom: 20px;">Reset Your Password</h2>
    <p>We received a request to reset your password. Click the button below to choose a new one.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background-color: #c9a962; color: #1a1f36; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
        Reset Password
      </a>
    </p>
    <p style="font-size: 14px; color: #666;"><strong>This link will expire in 1 hour.</strong></p>
    <p style="font-size: 14px; color: #666;">⚠️ Never share this link with anyone. ZeeVerify will never ask for your password.</p>
    <p style="font-size: 14px; color: #666;">If you didn't request this reset, you can safely ignore this email.</p>
  `;

  return this.sendEmail(to, 'Reset your ZeeVerify password', this.wrapInTemplate(content, false));
}

async sendWelcomeEmail(to: string, firstName: string): Promise<boolean> {
  const safeFirstName = this.escapeHtml(firstName);

  const content = `
    <h2 style="color: #1a1f36; margin-bottom: 20px;">Welcome to ZeeVerify, ${safeFirstName}!</h2>
    <p>We're excited to have you on board. ZeeVerify helps you make informed franchise investment decisions through authentic, verified reviews.</p>

    <h3 style="color: #1a1f36; margin-top: 30px;">Getting Started</h3>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li><strong>Browse Franchises:</strong> Explore our directory of 4,000+ franchise brands</li>
      <li><strong>Compare Options:</strong> Use our comparison tool to evaluate up to 4 brands side-by-side</li>
      <li><strong>Read Reviews:</strong> Get insights from verified franchisees</li>
      <li><strong>Share Your Experience:</strong> Help others by submitting your own review</li>
    </ul>

    <p style="text-align: center; margin: 30px 0;">
      <a href="${process.env.BASE_URL || 'http://localhost:5000'}" style="background-color: #c9a962; color: #1a1f36; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
        Start Exploring
      </a>
    </p>
  `;

  return this.sendEmail(to, `Welcome to ZeeVerify, ${safeFirstName}!`, this.wrapInTemplate(content, true));
}
```

### Environment Variables
- `BASE_URL` - Application base URL for generating links

### Token Format
- Use URL-safe base64 encoding
- 32 bytes of crypto-random data
- Example: `crypto.randomBytes(32).toString('base64url')`

## Definition of Done
- [x] `sendVerificationEmail()` method implemented
- [x] `sendPasswordResetEmail()` method implemented
- [x] `sendWelcomeEmail()` method implemented
- [x] All emails use branded template
- [x] Dynamic content properly escaped
- [x] Expiration messages included where appropriate
- [x] TypeScript compiles without errors

## Test Scenarios
1. **Verification Email:** Contains verify link, 24hr expiry message
2. **Password Reset:** Contains reset link, 1hr expiry, security warning
3. **Welcome Email:** Personalized greeting, getting started tips
4. **XSS Prevention:** User names with special chars escaped

## Dev Agent Record

### Agent Model Used
Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List
- Implemented `sendVerificationEmail()` with 24-hour expiry message
- Implemented `sendPasswordResetEmail()` with 1-hour expiry and security warning
- Implemented `sendWelcomeEmail()` with getting started tips and XSS-safe name handling
- All templates use `wrapInTemplate()` for consistent branding
- Added BASE_URL environment variable documentation to .env.example
- TypeScript compiles without errors

### File List
**Files Modified:**
- `server/services/email.ts` - Added sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail methods
- `.env.example` - Added BASE_URL environment variable

### Change Log
- 2025-12-04: Implemented all email template variants
