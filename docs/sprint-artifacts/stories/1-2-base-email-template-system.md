# Story 1.2: Base Email Template System

Status: ready-for-dev

## Story

As a developer,
I want a consistent HTML email template structure,
so that all emails have professional, branded appearance.

## Acceptance Criteria

1. **AC1: Branded Template Structure**
   - Given any email is being sent
   - When the EmailService generates the email content
   - Then the email uses ZeeVerify branding (logo, colors)
   - And the email is responsive for mobile viewing
   - And the email includes unsubscribe footer where appropriate
   - And the email renders correctly in major clients (Gmail, Outlook, Apple Mail)

2. **AC2: Dynamic Content Injection**
   - Given the email template needs customization
   - When passing dynamic content to the template
   - Then variables are properly escaped to prevent injection
   - And the template renders the dynamic content correctly

## Tasks / Subtasks

- [ ] Task 1: Create wrapInTemplate method (AC: 1)
  - [ ] Add `wrapInTemplate(content: string, includeUnsubscribe: boolean): string` to EmailService
  - [ ] Include ZeeVerify header with logo
  - [ ] Apply brand colors (navy #1a1f36, gold #c9a962)
  - [ ] Add responsive meta tags
  - [ ] Add footer section

- [ ] Task 2: Create escapeHtml utility (AC: 2)
  - [ ] Add `escapeHtml(text: string): string` method
  - [ ] Escape &, <, >, ", ' characters
  - [ ] Prevent XSS in email content

- [ ] Task 3: Implement email structure (AC: 1)
  - [ ] Use inline CSS for email client compatibility
  - [ ] Use table-based layout for structure
  - [ ] Set max-width to 600px for readability
  - [ ] Add unsubscribe link placeholder

- [ ] Task 4: Test email rendering (AC: 1)
  - [ ] Verify in Gmail
  - [ ] Verify in Outlook
  - [ ] Verify responsive on mobile viewport

## Dev Notes

### Architecture Compliance

**Required Pattern:** Extend EmailService from Story 1.1
- Add methods to existing `server/services/email.ts`
- Follow private method convention for internal utilities
- Use inline CSS for maximum email client compatibility

**Design System Colors:**
| Token | Value | Usage |
|-------|-------|-------|
| Primary (Navy) | #1a1f36 | Headers, text |
| Accent (Gold) | #c9a962 | CTAs, links |
| Background | #f5f5f5 | Email wrapper |
| White | #ffffff | Content area |

### Technical Implementation

```typescript
// Add to server/services/email.ts

private escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

private wrapInTemplate(content: string, includeUnsubscribe: boolean = true): string {
  const unsubscribeSection = includeUnsubscribe
    ? `<p style="font-size: 12px; color: #666; margin-top: 30px;">
         <a href="{{unsubscribe_url}}" style="color: #666;">Unsubscribe</a> from these emails
       </p>`
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ZeeVerify</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: #1a1f36; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #c9a962; font-size: 28px; font-weight: bold;">ZeeVerify</h1>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  ${content}
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                    © ${new Date().getFullYear()} ZeeVerify. All rights reserved.
                  </p>
                  ${unsubscribeSection}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
```

### Email Client Compatibility Notes

**Use These Patterns:**
- Inline CSS only (no `<style>` blocks)
- Table-based layout
- Web-safe fonts: Arial, Helvetica, sans-serif
- Max-width: 600px for content area
- All images must have full URLs (not relative)

**Avoid These:**
- CSS Flexbox/Grid (Outlook doesn't support)
- `<style>` tags (stripped by Gmail)
- Background images (unreliable)
- Modern CSS features (border-radius works inconsistently)

### Project Structure Notes

- **File Location:** Modify existing `server/services/email.ts`
- **Methods Added:** `wrapInTemplate()`, `escapeHtml()` as private methods
- **Pattern:** Methods should be private (not exported directly)

### Anti-Patterns to Avoid

❌ Don't use external CSS stylesheets
❌ Don't use CSS Flexbox or Grid layouts
❌ Don't use `<style>` tags in email head
❌ Don't forget to escape user-provided content
❌ Don't use relative URLs for images

### References

- [Source: docs/architecture.md#Email Infrastructure]
- [Source: docs/epics.md#Story 1.2]
- [Source: design_guidelines.md] - Brand colors

## Dev Agent Record

### Context Reference

- Epic: 1 - Email Infrastructure Foundation
- Dependencies: Story 1.1 (EmailService must exist)
- FRs Covered: FR-4.3.1

### Agent Model Used

{{agent_model_name_version}}

### Completion Notes List

- Story 1.1 must be complete before starting this story
- All email methods in Story 1.3 will use wrapInTemplate
- Design colors match `design_guidelines.md`

### Previous Story Intelligence

From Story 1.1:
- EmailService class created in `server/services/email.ts`
- Singleton pattern established with `emailService` export
- Error handling returns boolean (no throwing)

### File List

**Files to Modify:**
- `server/services/email.ts` - Add template methods

### Definition of Done

- [ ] `wrapInTemplate()` method added to EmailService
- [ ] `escapeHtml()` method added to EmailService
- [ ] Template includes ZeeVerify header with branding
- [ ] Template includes responsive meta tags
- [ ] Template uses inline CSS only
- [ ] Unsubscribe option in footer (configurable)
- [ ] TypeScript compiles without errors (`npm run check`)
