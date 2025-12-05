# Story 5.3: Moderation Outcome Notification

## Story Info
- **Epic:** 5 - Notification System
- **Story ID:** 5.3
- **Title:** Moderation Outcome Notification
- **Status:** Ready for Review
- **Dependencies:** Epic 1 complete, Epic 2 complete

## User Story

As a **franchisee who submitted a review**,
I want **to be notified of the moderation outcome**,
So that **I know if my review was published or rejected**.

## Acceptance Criteria

### AC1: Approval Notification
**Given** my review is approved
**When** the admin approves it
**Then** I receive an email:
- Subject: "Your review has been published"
- Content: Brand name, link to view review

### AC2: Rejection Notification
**Given** my review is rejected
**When** the admin rejects it
**Then** I receive an email:
- Subject: "Update on your review submission"
- Content: Brand name, rejection reason, option to resubmit

### AC3: Notifications Disabled
**Given** I have disabled moderation notifications
**When** a moderation decision is made
**Then** no email is sent

## Technical Notes

### Files to Create/Modify
- **Modify:** `server/services/email.ts` - Add notification methods
- **Modify:** `server/routes.ts` - Hook into moderation actions

### Email Service Methods
```typescript
// Add to server/services/email.ts

async sendReviewApprovedEmail(
  to: string,
  brandName: string,
  reviewId: number
): Promise<boolean> {
  const reviewUrl = `${process.env.BASE_URL}/reviews/${reviewId}`;
  const safeBrandName = this.escapeHtml(brandName);

  const content = `
    <h2 style="color: #1a1f36; margin-bottom: 20px;">Your Review Has Been Published! 🎉</h2>

    <p>Great news! Your review for <strong>${safeBrandName}</strong> has been approved and is now live on ZeeVerify.</p>

    <p>Thank you for sharing your franchise experience. Your feedback helps prospective franchise buyers make informed decisions.</p>

    <p style="text-align: center; margin: 30px 0;">
      <a href="${reviewUrl}" style="background-color: #c9a962; color: #1a1f36; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
        View Your Review
      </a>
    </p>

    <p style="font-size: 14px; color: #666;">Remember, your identity is protected. The franchisor and other users cannot see who wrote the review.</p>
  `;

  return this.sendEmail(
    to,
    "Your review has been published",
    this.wrapInTemplate(content, true)
  );
}

async sendReviewRejectedEmail(
  to: string,
  brandName: string,
  reason: string
): Promise<boolean> {
  const safeBrandName = this.escapeHtml(brandName);
  const safeReason = this.escapeHtml(reason);

  const content = `
    <h2 style="color: #1a1f36; margin-bottom: 20px;">Update on Your Review Submission</h2>

    <p>Thank you for submitting a review for <strong>${safeBrandName}</strong>.</p>

    <p>Unfortunately, we were unable to publish your review at this time. Here's why:</p>

    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px 20px; margin: 20px 0;">
      <p style="color: #991b1b; margin: 0;"><strong>Reason:</strong> ${safeReason}</p>
    </div>

    <h3 style="color: #1a1f36; margin-top: 30px;">What You Can Do</h3>

    <p>You're welcome to submit a new review that addresses the feedback above. We value your input and want to ensure all reviews meet our community guidelines.</p>

    <p style="text-align: center; margin: 30px 0;">
      <a href="${process.env.BASE_URL}/franchisee/reviews/new" style="background-color: #c9a962; color: #1a1f36; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
        Submit New Review
      </a>
    </p>

    <p style="font-size: 14px; color: #666;">If you believe this decision was made in error, please contact our support team.</p>
  `;

  return this.sendEmail(
    to,
    "Update on your review submission",
    this.wrapInTemplate(content, true)
  );
}
```

### Integration with Moderation Routes
```typescript
// Modify rejection route in server/routes.ts

app.post("/api/admin/reviews/:id/reject", isAuthenticated, isAdmin, async (req, res) => {
  const reviewId = parseInt(req.params.id);
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({ message: "Rejection reason required" });
  }

  try {
    // Get review
    const review = await storage.getReview(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Reject the review
    await storage.rejectReview(reviewId, reason);

    // Get brand name
    const brand = await storage.getBrand(review.brandId);

    // Notify review author
    const author = await storage.getUser(review.authorId);
    if (author) {
      const prefs = author.notificationPreferences as { moderationOutcomes?: boolean } | null;

      if (prefs?.moderationOutcomes !== false) {
        await emailService.sendReviewRejectedEmail(
          author.email,
          brand?.name || "Unknown Brand",
          reason
        );
      }
    }

    res.json({ message: "Review rejected" });
  } catch (error) {
    console.error("Error rejecting review:", error);
    res.status(500).json({ message: "Failed to reject review" });
  }
});
```

### Storage Methods Required
```typescript
// Add to server/storage.ts
approveReview(reviewId: number): Promise<void>
rejectReview(reviewId: number, reason: string): Promise<void>
```

## Definition of Done
- [x] `sendReviewApprovedEmail()` method added to EmailService
- [x] `sendReviewRejectedEmail()` method added to EmailService
- [x] Approval route sends approval notification
- [x] Rejection route sends rejection notification
- [x] Both check notification preferences
- [x] Approval email contains link to view
- [x] Rejection email contains reason and resubmit link
- [x] TypeScript compiles without errors

## Test Scenarios
1. **Approval, Notifications On:** Approval email sent
2. **Rejection, Notifications On:** Rejection email sent
3. **Notifications Off:** No email for either outcome
4. **Approval Email:** Contains brand, view link
5. **Rejection Email:** Contains reason, resubmit link
6. **No Reason Provided:** Rejection fails validation

---

## Dev Agent Record

### Implementation Notes
- Added `sendReviewApprovedEmail()` to `server/services/email.ts:291-320`
- Added `sendReviewRejectedEmail()` to `server/services/email.ts:329-367`
- Modified `/api/admin/reviews/:id/moderate` in `server/routes.ts:664-742`
- Notification preference check: `prefs?.moderationOutcomes !== false` (defaults to enabled)
- Rejection uses `notes` field as reason; defaults to generic message if not provided

### Technical Decisions
- Used existing unified moderate endpoint (action: "approve" | "reject") rather than separate endpoints
- Rejection email provides default reason if notes not supplied
- Approval email includes anonymity reminder for user reassurance

## File List
- `server/services/email.ts` - Added sendReviewApprovedEmail and sendReviewRejectedEmail methods
- `server/routes.ts` - Modified moderation route to send author notifications

## Change Log
| Date | Change | Author |
|------|--------|--------|
| 2025-12-04 | Implemented moderation outcome notifications | Dev Agent |
