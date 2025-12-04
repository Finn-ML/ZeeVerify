# Story 5.2: Franchisor Response Notification

## Story Info
- **Epic:** 5 - Notification System
- **Story ID:** 5.2
- **Title:** Franchisor Response Notification
- **Status:** ready-for-dev
- **Dependencies:** Epic 1 complete, Epic 2 complete

## User Story

As a **franchisee**,
I want **to be notified when a franchisor responds to my review**,
So that **I can read their response**.

## Acceptance Criteria

### AC1: Notification on Response
**Given** a franchisor responds to my review
**When** the response is submitted
**Then** I receive an email notification containing:
- Brand name
- Response preview (first 100 chars)
- Link to view full response
**And** the email is sent within 2 minutes

### AC2: Notifications Disabled
**Given** I have disabled response notifications
**When** a response is posted
**Then** no email is sent

## Technical Notes

### Files to Create/Modify
- **Modify:** `server/services/email.ts` - Add notification method
- **Modify:** `server/routes.ts` - Hook into response submission

### Email Service Method
```typescript
// Add to server/services/email.ts

async sendResponseNotification(
  to: string,
  brandName: string,
  responsePreview: string,
  reviewId: number
): Promise<boolean> {
  const reviewUrl = `${process.env.BASE_URL}/reviews/${reviewId}`;
  const safeBrandName = this.escapeHtml(brandName);
  const safeResponse = this.escapeHtml(responsePreview.slice(0, 100));

  const content = `
    <h2 style="color: #1a1f36; margin-bottom: 20px;">Response from ${safeBrandName}</h2>

    <p>The franchisor of ${safeBrandName} has responded to your review:</p>

    <div style="background-color: #f9f9f9; border-left: 4px solid #c9a962; padding: 15px 20px; margin: 20px 0;">
      <p style="color: #333; font-style: italic; margin: 0;">"${safeResponse}${responsePreview.length > 100 ? '...' : ''}"</p>
    </div>

    <p style="text-align: center; margin: 30px 0;">
      <a href="${reviewUrl}" style="background-color: #c9a962; color: #1a1f36; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
        View Full Response
      </a>
    </p>

    <p style="font-size: 14px; color: #666;">Your identity remains anonymous. The franchisor cannot see who wrote the review.</p>
  `;

  return this.sendEmail(
    to,
    `${safeBrandName} responded to your review`,
    this.wrapInTemplate(content, true)
  );
}
```

### Integration with Response Submission
```typescript
// Modify response route in server/routes.ts

app.post("/api/reviews/:id/response", isAuthenticated, async (req, res) => {
  const reviewId = parseInt(req.params.id);
  const { content } = req.body;
  const userId = req.user!.id;

  try {
    // Get review
    const review = await storage.getReview(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Get brand and verify user owns it
    const brand = await storage.getBrand(review.brandId);
    if (!brand || !brand.isClaimed || brand.claimedById !== userId) {
      return res.status(403).json({ message: "You can only respond to reviews on your claimed brands" });
    }

    // Save response
    await storage.createReviewResponse({
      reviewId,
      franchisorId: userId,
      content,
    });

    // Send notification to review author
    const author = await storage.getUser(review.authorId);
    if (author) {
      const prefs = author.notificationPreferences as { reviewResponses?: boolean } | null;

      if (prefs?.reviewResponses !== false) {
        await emailService.sendResponseNotification(
          author.email,
          brand.name,
          content,
          reviewId
        );
      }
    }

    res.json({ message: "Response submitted" });
  } catch (error) {
    console.error("Error submitting response:", error);
    res.status(500).json({ message: "Failed to submit response" });
  }
});
```

### Storage Method Required
```typescript
// Add to server/storage.ts
createReviewResponse(data: {
  reviewId: number;
  franchisorId: number;
  content: string;
}): Promise<ReviewResponse>
```

### Response Schema (if not exists)
```typescript
// Add to shared/schema.ts if needed
export const reviewResponses = pgTable("review_responses", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").notNull().references(() => reviews.id),
  franchisorId: integer("franchisor_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

## Definition of Done
- [ ] `sendResponseNotification()` method added to EmailService
- [ ] Response submission route sends notification
- [ ] Only sends if preferences allow
- [ ] Email contains brand name, response preview
- [ ] Email contains link to view response
- [ ] Anonymity reminder included
- [ ] TypeScript compiles without errors

## Test Scenarios
1. **Notifications On:** Email sent to review author
2. **Notifications Off:** No email sent
3. **Email Contains:** Brand name, preview, link
4. **Long Response:** Truncated to 100 chars
5. **Anonymity:** Reminder that identity is protected
