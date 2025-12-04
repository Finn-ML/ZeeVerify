import { ServerClient } from 'postmark';

/**
 * EmailService - Postmark integration for transactional emails
 *
 * Requires POSTMARK_API_TOKEN environment variable.
 * Gracefully degrades when token is missing - methods return false instead of throwing.
 */
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

  /**
   * Escape HTML special characters to prevent XSS in email content
   * @param text - Raw text to escape
   * @returns Escaped text safe for HTML rendering
   */
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

  /**
   * Wrap content in the ZeeVerify branded email template
   * @param content - HTML content to wrap (already escaped if from user input)
   * @param includeUnsubscribe - Whether to include unsubscribe link in footer
   * @returns Complete HTML email ready to send
   */
  private wrapInTemplate(content: string, includeUnsubscribe: boolean = true): string {
    const unsubscribeSection = includeUnsubscribe
      ? `<p style="font-size: 12px; color: #666; margin-top: 30px;">
           <a href="{{unsubscribe_url}}" style="color: #666;">Unsubscribe</a> from these emails
         </p>`
      : '';

    return `<!DOCTYPE html>
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
</html>`;
  }

  /**
   * Create safe HTML content from user-provided text
   * @param text - User-provided text to make safe
   * @returns Escaped text safe for HTML email content
   */
  public safeText(text: string): string {
    return this.escapeHtml(text);
  }

  /**
   * Send an email via Postmark
   * @param to - Recipient email address
   * @param subject - Email subject line
   * @param htmlBody - HTML content of the email
   * @returns true on success, false on failure
   */
  async sendEmail(to: string, subject: string, htmlBody: string): Promise<boolean> {
    if (!this.client) {
      console.error('Email send failed:', { reason: 'Postmark client not initialized', to, subject });
      return false;
    }

    try {
      await this.client.sendEmail({
        From: process.env.POSTMARK_FROM_EMAIL || 'noreply@zeeverify.com',
        To: to,
        Subject: subject,
        HtmlBody: htmlBody,
      });
      return true;
    } catch (error) {
      console.error('Email send failed:', { error, to, subject });
      return false;
    }
  }

  /**
   * Send a branded email using the ZeeVerify template
   * @param to - Recipient email address
   * @param subject - Email subject line
   * @param content - HTML content to place in the email body
   * @param includeUnsubscribe - Whether to include unsubscribe footer
   * @returns true on success, false on failure
   */
  async sendBrandedEmail(
    to: string,
    subject: string,
    content: string,
    includeUnsubscribe: boolean = true
  ): Promise<boolean> {
    const htmlBody = this.wrapInTemplate(content, includeUnsubscribe);
    return this.sendEmail(to, subject, htmlBody);
  }

  /**
   * Send email verification link to user
   * @param to - Recipient email address
   * @param token - Verification token
   * @returns true on success, false on failure
   */
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

  /**
   * Send password reset link to user
   * @param to - Recipient email address
   * @param token - Password reset token
   * @returns true on success, false on failure
   */
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
      <p style="font-size: 14px; color: #666;">Never share this link with anyone. ZeeVerify will never ask for your password.</p>
      <p style="font-size: 14px; color: #666;">If you didn't request this reset, you can safely ignore this email.</p>
    `;

    return this.sendEmail(to, 'Reset your ZeeVerify password', this.wrapInTemplate(content, false));
  }

  /**
   * Send notification to franchisor when new review is approved for their brand
   * @param to - Franchisor's email address
   * @param brandName - Name of the brand
   * @param reviewSummary - Review content (will be truncated to 100 chars)
   * @param rating - Overall rating (1-5)
   * @param reviewId - Review ID for linking
   * @returns true on success, false on failure
   */
  async sendNewReviewNotification(
    to: string,
    brandName: string,
    reviewSummary: string,
    rating: number,
    reviewId: number
  ): Promise<boolean> {
    const reviewUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/franchisor/reviews/${reviewId}`;
    const safeBrandName = this.escapeHtml(brandName);
    const safeSummary = this.escapeHtml(reviewSummary.slice(0, 100));

    // Star rating display
    const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

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

  /**
   * Send notification to franchisee when franchisor responds to their review
   * @param to - Review author's email address
   * @param brandName - Name of the brand
   * @param responsePreview - Response content (will be truncated to 100 chars)
   * @param reviewId - Review ID for linking
   * @returns true on success, false on failure
   */
  async sendResponseNotification(
    to: string,
    brandName: string,
    responsePreview: string,
    reviewId: number
  ): Promise<boolean> {
    const reviewUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/reviews/${reviewId}`;
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

  /**
   * Send notification to review author when their review is approved
   * @param to - Review author's email address
   * @param brandName - Name of the brand
   * @param reviewId - Review ID for linking
   * @returns true on success, false on failure
   */
  async sendReviewApprovedEmail(
    to: string,
    brandName: string,
    reviewId: number
  ): Promise<boolean> {
    const reviewUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/reviews/${reviewId}`;
    const safeBrandName = this.escapeHtml(brandName);

    const content = `
      <h2 style="color: #1a1f36; margin-bottom: 20px;">Your Review Has Been Published!</h2>

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
      'Your review has been published',
      this.wrapInTemplate(content, true)
    );
  }

  /**
   * Send notification to review author when their review is rejected
   * @param to - Review author's email address
   * @param brandName - Name of the brand
   * @param reason - Rejection reason provided by moderator
   * @returns true on success, false on failure
   */
  async sendReviewRejectedEmail(
    to: string,
    brandName: string,
    reason: string
  ): Promise<boolean> {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
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
        <a href="${baseUrl}/franchisee/reviews/new" style="background-color: #c9a962; color: #1a1f36; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Submit New Review
        </a>
      </p>

      <p style="font-size: 14px; color: #666;">If you believe this decision was made in error, please contact our support team.</p>
    `;

    return this.sendEmail(
      to,
      'Update on your review submission',
      this.wrapInTemplate(content, true)
    );
  }

  /**
   * Send welcome email to new user
   * @param to - Recipient email address
   * @param firstName - User's first name
   * @returns true on success, false on failure
   */
  async sendWelcomeEmail(to: string, firstName: string): Promise<boolean> {
    const safeFirstName = this.escapeHtml(firstName);
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

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
        <a href="${baseUrl}" style="background-color: #c9a962; color: #1a1f36; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Start Exploring
        </a>
      </p>
    `;

    // Don't include unsubscribe for welcome email until notification preferences are implemented
    return this.sendEmail(to, `Welcome to ZeeVerify, ${safeFirstName}!`, this.wrapInTemplate(content, false));
  }
}

// Singleton instance for use across the application
export const emailService = new EmailService();
