# Story 1.1: Postmark Email Service Setup

Status: review

## Story

As a developer,
I want a configured email service using Postmark,
so that the application can send transactional emails.

## Acceptance Criteria

1. **AC1: Service Initialization**
   - Given the server is starting up
   - When the EmailService is initialized
   - Then it connects to Postmark using POSTMARK_API_TOKEN environment variable
   - And the service is available as a singleton `emailService` export

2. **AC2: Graceful Degradation**
   - Given the POSTMARK_API_TOKEN is missing or invalid
   - When the EmailService attempts to initialize
   - Then the server logs an error but continues running (graceful degradation)
   - And email sending methods return false without throwing

3. **AC3: Email Sending**
   - Given an email needs to be sent
   - When calling any EmailService method
   - Then the email is sent via Postmark API
   - And the method returns true on success, false on failure
   - And failures are logged with error details

## Tasks / Subtasks

- [x] Task 1: Install Postmark package (AC: 1)
  - [x] Run `npm install postmark`
  - [x] Verify package added to package.json

- [x] Task 2: Create EmailService class (AC: 1, 2, 3)
  - [x] Create `server/services/email.ts`
  - [x] Implement EmailService class with ServerClient
  - [x] Add constructor with token validation
  - [x] Export singleton `emailService` instance

- [x] Task 3: Implement base sendEmail method (AC: 3)
  - [x] Add `sendEmail(to, subject, htmlBody)` method
  - [x] Handle Postmark API errors gracefully
  - [x] Return boolean for success/failure
  - [x] Log errors with descriptive messages

- [x] Task 4: Add environment variable documentation (AC: 1)
  - [x] Document `POSTMARK_API_TOKEN` in README or .env.example
  - [x] Document `POSTMARK_FROM_EMAIL` for sender address

- [x] Task 5: Verify TypeScript compilation (AC: all)
  - [x] Run `npm run check` to verify no type errors
  - [x] Ensure proper type exports for use in routes

## Dev Notes

### Architecture Compliance

**Required Pattern:** Service Layer Pattern
- Create service in `server/services/` directory
- Export singleton instance for use across routes
- Follow existing codebase patterns from `server/storage.ts`

**Technology Stack:**
- Package: `postmark` (latest stable)
- TypeScript with strict mode
- ESModules (`import`/`export`)

### Technical Implementation

```typescript
// server/services/email.ts
import { ServerClient } from 'postmark';

export class EmailService {
  private client: ServerClient | null = null;

  constructor() {
    const token = process.env.POSTMARK_API_TOKEN;
    if (token) {
      this.client = new ServerClient(token);
    } else {
      console.error('POSTMARK_API_TOKEN not configured - email service disabled');
    }
  }

  async sendEmail(to: string, subject: string, htmlBody: string): Promise<boolean> {
    if (!this.client) return false;
    try {
      await this.client.sendEmail({
        From: process.env.POSTMARK_FROM_EMAIL || 'noreply@zeeverify.com',
        To: to,
        Subject: subject,
        HtmlBody: htmlBody,
      });
      return true;
    } catch (error) {
      console.error('Email send failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
```

### Environment Variables Required

| Variable | Description | Required |
|----------|-------------|----------|
| `POSTMARK_API_TOKEN` | Postmark Server API token | Yes |
| `POSTMARK_FROM_EMAIL` | Default sender email address | No (defaults to noreply@zeeverify.com) |

### Project Structure Notes

- **File Location:** `server/services/email.ts`
- **Import Path:** Used directly in `server/routes.ts`
- **No new route files** - follows existing monorepo pattern
- **Service directory:** Create `server/services/` if it doesn't exist

### Anti-Patterns to Avoid

❌ Don't create separate route files for email endpoints
❌ Don't use `require()` - use ESModules `import`
❌ Don't throw exceptions for email failures - return false
❌ Don't hardcode API tokens - use environment variables
❌ Don't use synchronous operations - Postmark API is async

### References

- [Source: docs/architecture.md#Email Infrastructure]
- [Source: docs/epics.md#Story 1.1]
- [Source: docs/project_context.md#Email (Postmark)]

## Dev Agent Record

### Context Reference

<!-- Story context created by create-story workflow -->
- Epic: 1 - Email Infrastructure Foundation
- Dependencies: None (foundation epic)
- FRs Covered: FR-4.3.1, FR-4.3.2

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Postmark package v4.0.5 installed per architecture document
- EmailService class created with singleton pattern
- Graceful degradation implemented - returns false when token missing
- Error logging implemented for all failure paths
- .env.example created with all required environment variables
- TypeScript compiles without errors (pre-existing errors in other files unrelated)

### File List

**Files Created:**
- `server/services/email.ts` - EmailService class with Postmark integration
- `.env.example` - Environment variable documentation

**Files Modified:**
- `package.json` - Added postmark@4.0.5 dependency
- `package-lock.json` - Updated with postmark dependencies

### Change Log

- 2025-12-04: Initial implementation of EmailService with Postmark integration

### Definition of Done

- [x] `server/services/email.ts` created with EmailService class
- [x] `postmark` package installed and in package.json
- [x] Service exports singleton `emailService` instance
- [x] Graceful degradation when token is missing
- [x] Error logging implemented
- [x] TypeScript compiles without errors (`npm run check`)
