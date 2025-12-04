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
