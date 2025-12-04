# Story 5.1: New Review Notification for Franchisors

## Story Info
- **Epic:** 5 - Notification System
- **Story ID:** 5.1
- **Title:** New Review Notification for Franchisors
- **Status:** ready-for-dev
- **Dependencies:** Epic 1 complete, Epic 2 complete

## User Story

As a **franchisor with a claimed brand**,
I want **to receive email notifications when new reviews are approved**,
So that **I can respond promptly to franchisee feedback**.

## Acceptance Criteria

### AC1: Notification on Approval
**Given** a review is approved by an admin
**When** the review belongs to a claimed brand
**Then** the franchisor receives an email notification containing:
- Brand name
- Review summary (first 100 chars)
- Overall rating
- Link to respond
**And** the email is sent within 2 minutes of approval

### AC2: Notification Disabled
**Given** the franchisor has disabled review notifications
**When** a review is approved
**Then** no email is sent

### AC3: Unclaimed Brand
**Given** the brand is not claimed
**When** a review is approved
**Then** no notification is sent

## Technical Notes

### Files to Create/Modify
- **Modify:** `server/services/email.ts` - Add notification method
- **Modify:** `server/routes.ts` - Hook into review approval

### Email Service Method
```typescript
// Add to server/services/email.ts

async sendNewReviewNotification(
  to: string,
  brandName: string,
  reviewSummary: string,
  rating: number,
  reviewId: number
): Promise<boolean> {
  const reviewUrl = `${process.env.BASE_URL}/franchisor/reviews/${reviewId}`;
  const safeBrandName = this.escapeHtml(brandName);
  const safeSummary = this.escapeHtml(reviewSummary.slice(0, 100));

  // Star rating display
  const stars = "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));

  const content = `
    <h2 style="color: #1a1f36; margin-bottom: 20px;">New Review for ${safeBrandName}</h2>

    <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <div style="color: #c9a962; font-size: 20px; margin-bottom: 10px;">${stars}</div>
      <p style="color: #333; font-style: italic; margin: 0;">"${safeSummary}${reviewSummary.length > 100 ? '...' : ''}"</p>
    </div>

    <p>A new review has been published for your brand. Responding to reviews shows franchisees that you value their feedback.</p>

    <p style="text-align: center; margin: 30px 0;">
      <a href="${reviewUrl}" style="background-color: #c9a962; color: #1a1f36; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
        View &amp; Respond
      </a>
    </p>
  `;

  return this.sendEmail(
    to,
    `New review for ${safeBrandName}`,
    this.wrapInTemplate(content, true)
  );
}
```

### Integration with Review Approval
```typescript
// Modify review approval route in server/routes.ts

app.post("/api/admin/reviews/:id/approve", isAuthenticated, isAdmin, async (req, res) => {
  const reviewId = parseInt(req.params.id);

  try {
    // Get review before approving
    const review = await storage.getReview(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Approve the review
    await storage.approveReview(reviewId);

    // Get brand info
    const brand = await storage.getBrand(review.brandId);

    // Send notification if brand is claimed
    if (brand?.isClaimed && brand.claimedById) {
      const franchisor = await storage.getUser(brand.claimedById);

      if (franchisor) {
        // Check notification preferences
        const prefs = franchisor.notificationPreferences as { reviewResponses?: boolean } | null;

        if (prefs?.reviewResponses !== false) {
          await emailService.sendNewReviewNotification(
            franchisor.email,
            brand.name,
            review.content,
            review.overallRating,
            reviewId
          );
        }
      }
    }

    // Also notify the review author
    const author = await storage.getUser(review.authorId);
    if (author) {
      const prefs = author.notificationPreferences as { moderationOutcomes?: boolean } | null;
      if (prefs?.moderationOutcomes !== false) {
        await emailService.sendReviewApprovedEmail(author.email, brand?.name || "Unknown Brand", reviewId);
      }
    }

    res.json({ message: "Review approved" });
  } catch (error) {
    console.error("Error approving review:", error);
    res.status(500).json({ message: "Failed to approve review" });
  }
});
```

### Notification Preferences Check
```typescript
// Helper function
function shouldSendNotification(
  user: User,
  notificationType: 'reviewResponses' | 'moderationOutcomes' | 'marketingEmails'
): boolean {
  const prefs = user.notificationPreferences as Record<string, boolean> | null;
  // Default to true if not explicitly set to false
  return prefs?.[notificationType] !== false;
}
```

## Definition of Done
- [ ] `sendNewReviewNotification()` method added to EmailService
- [ ] Review approval route sends notification
- [ ] Only sends to claimed brand franchisors
- [ ] Respects notification preferences
- [ ] Email contains brand name, summary, rating
- [ ] Email contains link to respond
- [ ] Star rating displayed visually
- [ ] TypeScript compiles without errors

## Test Scenarios
1. **Claimed Brand, Notifications On:** Email sent
2. **Claimed Brand, Notifications Off:** No email
3. **Unclaimed Brand:** No email
4. **Email Contains:** Brand name, summary, rating, link
5. **Long Review:** Truncated to 100 chars
