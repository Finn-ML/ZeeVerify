# Z Verify Product Requirements Document

**Version:** 1.0
**Date:** December 2024
**Client:** Cameron - Z Verify
**Prepared By:** Million Labs

---

## 1. Executive Summary

Z Verify is a franchise review and verification platform designed to provide transparency in the franchise industry. The platform enables franchisees to submit anonymous reviews about their franchise experience, while allowing franchisors to claim their listings, respond to feedback, and showcase verified performance data.

The platform addresses a significant gap in the franchise industry where prospective franchise buyers lack access to authentic, unfiltered feedback from current franchisees. By creating a trusted verification layer, Z Verify aims to help good franchisors rise to the top while holding underperforming ones accountable.

---

## 2. Product Overview

### 2.1 Vision

To become the trusted source of franchise information by providing authentic, verified reviews from current franchisees, enabling informed investment decisions and improving franchise industry transparency.

### 2.2 Target Users

| User Type | Description |
|-----------|-------------|
| **Franchisees** | Current franchise owners who can submit reviews about their franchise experience |
| **Franchisors** | Franchise brand representatives who can claim listings and respond to reviews |
| **Prospective Buyers** | Individuals researching franchise opportunities (unregistered users) |
| **Administrators** | Platform operators managing content and users |

---

## 3. User Roles & Permissions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Admin** | Platform administrators | Full access, user management, content moderation, metrics |
| **Franchisee** | Verified franchise owners | Submit reviews, manage own reviews, flag content |
| **Franchisor** | Franchise brand representatives | Claim listings, respond to reviews, upload content |
| **Unregistered** | Public visitors | View aggregate metrics, compare brands, browse listings |

---

## 4. Feature Specifications

### 4.1 Login & Signup

Basic authentication system for users to access the application using email and password credentials.

**Functional Requirements:**
- Users shall be able to create an account using email address and password
- Users shall select their user type during registration (Franchisee or Franchisor)
- Users shall be able to log in with registered email and password
- System shall provide a "Forgot Password" popup functionality
- System shall send password reset emails to registered users
- System shall validate email format and password strength
- System shall display appropriate error messages for failed login attempts

**Acceptance Criteria:**
- User can successfully create account and receive confirmation
- User can log in and is redirected to appropriate dashboard based on user type
- Password reset email is received within 2 minutes of request
- Password reset link expires after 24 hours

---

### 4.2 User Account Settings

Allow users to manage their account settings including personal information, password, and preferences.

**Functional Requirements:**
- Users shall be able to update their email address
- Users shall be able to change their password
- Users shall be able to update profile information (name, contact details)
- Users shall be able to manage notification preferences
- System shall require current password confirmation for sensitive changes
- Users shall be able to delete their account

**Acceptance Criteria:**
- All profile changes are saved and reflected immediately
- Email change requires verification of new email address
- Password change requires current password verification

---

### 4.3 Notifications (Advanced)

HTML email notification system using third-party services (SendGrid/Postmark) to deliver personalized, visually appealing messages to users.

**Functional Requirements:**
- System shall send HTML-formatted transactional emails
- System shall integrate with SendGrid or Postmark for email delivery
- System shall send password reset notification emails
- System shall send account verification emails
- System shall notify franchisors when new reviews are posted
- System shall notify franchisees when franchisors respond to their reviews
- System shall send moderation outcome notifications
- Email templates shall be customizable and branded

**Acceptance Criteria:**
- All emails render correctly across major email clients
- Emails are delivered within 2 minutes of triggering event
- Users can unsubscribe from non-essential notifications

---

### 4.4 Franchisee Portal

A dedicated portal for verified franchisees to manage their reviews, update responses, and flag incorrect information for admin review.

**Functional Requirements:**
- Franchisees shall be able to submit reviews for their franchise brand
- Reviews shall support text-based feedback input
- Franchisees shall be able to view their submitted review history
- Franchisees shall be able to update or edit their existing reviews
- Franchisees shall be able to view franchisor responses to their reviews
- Franchisees shall be able to flag incorrect information for admin review
- System shall display review status (pending, approved, rejected)
- Reviews shall remain anonymous to protect franchisee identity

**Acceptance Criteria:**
- Franchisee can submit a review and see it in pending status
- Franchisee can view all their historical reviews
- Flagged content is routed to admin queue within 1 minute
- Franchisee identity is not visible to franchisors or public

---

### 4.5 Franchisor Portal

Portal for franchisors to claim their brand profiles, respond to reviews, and upload verified performance data to enhance their brand presence.

**Functional Requirements:**
- Franchisors shall be able to claim their brand listing
- System shall require payment via Stripe to claim a listing
- Franchisors shall be able to respond to franchisee reviews
- Franchisors shall be able to upload brand information (description, logo)
- Franchisors shall be able to upload videos about their brand
- Franchisors shall be able to upload supporting documentation
- Franchisors shall be able to report inappropriate reviews for admin review
- System shall display aggregate review metrics and sentiment
- Claimed listings shall display a verified badge

**Acceptance Criteria:**
- Franchisor can complete claim process and payment
- Responses to reviews are visible to all users
- Uploaded media displays correctly on listing page
- Verified badge appears on claimed listings

---

### 4.6 Comparison & Filtering Tools

Tools enabling users to compare franchise brands side-by-side based on various metrics and apply filters for focused search results.

**Functional Requirements:**
- Users shall be able to compare multiple brands side-by-side
- Comparison shall display aggregate metrics for each brand
- Users shall be able to filter brands by industry/category
- Users shall be able to filter by rating/score range
- Users shall be able to filter by claimed/unclaimed status
- Users shall be able to sort results by various criteria
- System shall allow saving and sharing comparisons
- Filters shall update results in real-time

**Acceptance Criteria:**
- User can add up to 4 brands to comparison view
- Filter changes reflect in results within 1 second
- Comparison data is accurate and up-to-date

---

### 4.7 Admin Dashboard

Central hub for managing and monitoring the application, displaying key metrics and providing control over platform functionality.

**Functional Requirements:**
- Dashboard shall display total user counts by type
- Dashboard shall display total review counts and trends
- Dashboard shall display moderation queue statistics
- Dashboard shall display claimed vs unclaimed listing counts
- Dashboard shall display revenue/payment metrics
- Admin shall be able to manage user roles
- Admin shall be able to manage content settings
- Dashboard shall provide quick actions for common tasks

**Acceptance Criteria:**
- All metrics refresh in real-time or within 5 minutes
- Dashboard loads within 3 seconds
- Quick actions execute successfully

---

### 4.8 Admin User Management

Administrative tools for viewing, searching, editing, and managing user accounts within the application.

**Functional Requirements:**
- Admin shall be able to view all user accounts
- Admin shall be able to search users by email address
- Admin shall be able to filter users by account type
- Admin shall be able to edit user account details
- Admin shall be able to delete user accounts
- Admin shall be able to suspend user accounts
- Admin shall be able to send password reset emails to users
- Admin shall be able to change user roles
- System shall log all admin actions for audit purposes

**Acceptance Criteria:**
- Search returns results within 2 seconds
- User changes are reflected immediately
- Deleted accounts are permanently removed after confirmation
- Password reset emails are sent within 2 minutes

---

### 4.9 Trust & Verification Layer

Moderation system ensuring authenticity and quality of reviews through admin verification and content moderation of all submissions.

**Functional Requirements:**
- All reviews shall enter moderation queue before publication
- Admin shall be able to approve reviews for publication
- Admin shall be able to reject reviews with reason
- Admin shall be able to edit review content before approval
- System shall queue reported content for admin review
- Admin shall be able to view moderation history
- System shall notify users of moderation outcomes
- Moderation queue shall display priority indicators
- System shall track moderation metrics (approval rate, avg time)

**Acceptance Criteria:**
- New reviews appear in moderation queue within 1 minute
- Approved reviews are published immediately
- Users receive notification of moderation outcome
- Moderation history is searchable and exportable

---

### 4.10 Stripe Checkout

Integration with Stripe for processing one-time payments for listing claims and services via credit or debit card.

**Functional Requirements:**
- System shall integrate with Stripe Checkout for payments
- Users shall be able to pay using credit or debit card
- System shall process one-time payments for listing claims
- System shall redirect to Stripe hosted checkout page
- System shall handle successful payment confirmation
- System shall handle failed payment scenarios
- System shall send payment confirmation emails
- Admin shall be able to view payment history

**Acceptance Criteria:**
- User is redirected to Stripe checkout within 2 seconds
- Successful payment activates listing claim immediately
- Failed payments display appropriate error message
- Payment confirmation email sent within 5 minutes

---

## 5. Technical Requirements

### 5.1 Platform

- **Frontend:** React 18 with TypeScript, Vite build tooling, Tailwind CSS
- **Backend:** Express.js with TypeScript, Drizzle ORM
- **Database:** Neon serverless PostgreSQL
- **Authentication:** Replit Auth (OpenID Connect)
- Responsive design for desktop and mobile browsers
- Domain: zverify.com

### 5.2 Integrations

| Integration | Purpose |
|-------------|---------|
| **Stripe** | Payment processing for listing claims |
| **SendGrid/Postmark** | Transactional email delivery (planned) |
| **Google Maps API** | Location services and address autocomplete (planned) |

### 5.3 Security Requirements

- Secure password hashing
- HTTPS encryption for all communications
- Role-based access control
- PCI compliance via Stripe
- Protection against bot accounts and spam

---

## 6. Data Model Overview

### 6.1 Core Entities

| Entity | Key Fields |
|--------|------------|
| **User** | ID, Email, Password, User Type, Name, Created Date, Status |
| **Brand** | ID, Name, Description, Logo, Category, Claimed Status, Owner ID |
| **Review** | ID, Brand ID, Author ID, Content, Rating, Status, Created Date |
| **Response** | ID, Review ID, Franchisor ID, Content, Created Date |
| **Payment** | ID, User ID, Brand ID, Amount, Stripe ID, Status, Date |

---

## 7. Assumptions & Dependencies

### 7.1 Assumptions

- Client will provide list of approximately 4,000 franchise brands for initial seeding
- Client will handle all customer support inquiries
- Stripe account is set up and verified
- SendGrid/Postmark account is set up
- Domain is registered and DNS is configurable

### 7.2 Dependencies

- Stripe API availability for payment processing
- Email service provider availability
- Platform availability
- Client-provided brand data and logos

---

## 8. Out of Scope (Phase 1)

The following items are excluded from Phase 1 development:

- Mobile native applications (iOS/Android)
- AI-powered automated sentiment analysis
- Embeddable widgets for third-party websites
- Subscription/recurring payment processing
- Blue Collar Bureau marketplace integration

**Note:** The following items from the original spec have been implemented in the current build:
- Z Score calculation engine (implemented)
- Lead capture and routing system (implemented)
- Word frequency/key term visualization (implemented)
- Stripe Identity verification for franchisees (integration ready)

---

## 9. Document Approval

This document serves as the official requirements specification for Z Verify Phase 1 development.

| Role | Name | Date |
|------|------|------|
| Client | | |
| Project Manager | | |
| Technical Lead | | |
