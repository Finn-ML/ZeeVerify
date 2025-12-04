# Story 2.1: User Schema Authentication Columns

## Story Info
- **Epic:** 2 - User Authentication & Onboarding
- **Story ID:** 2.1
- **Title:** User Schema Authentication Columns
- **Status:** ready-for-dev
- **Dependencies:** None

## User Story

As a **developer**,
I want **authentication-related columns added to the users table**,
So that **the database can store password hashes and verification tokens**.

## Acceptance Criteria

### AC1: Schema Update
**Given** the database schema is being updated
**When** running `npm run db:push`
**Then** the users table has the following new columns:
- `password_hash` (VARCHAR 255, nullable for migration)
- `email_verified` (BOOLEAN, default false)
- `email_verification_token` (VARCHAR 255, nullable)
- `email_verification_expires` (TIMESTAMP, nullable)
- `password_reset_token` (VARCHAR 255, nullable)
- `password_reset_expires` (TIMESTAMP, nullable)

### AC2: Migration Support
**Given** existing users from Replit OIDC
**When** they attempt to use the new auth system
**Then** they can use "Forgot Password" to set a password
**And** their existing user data is preserved

## Technical Notes

### Files to Create/Modify
- **Modify:** `shared/schema.ts`

### Implementation Details
```typescript
// Add to users table in shared/schema.ts

export const users = pgTable("users", {
  // ... existing columns ...

  // New authentication columns
  passwordHash: varchar("password_hash", { length: 255 }),
  emailVerified: boolean("email_verified").default(false).notNull(),
  emailVerificationToken: varchar("email_verification_token", { length: 255 }),
  emailVerificationExpires: timestamp("email_verification_expires"),
  passwordResetToken: varchar("password_reset_token", { length: 255 }),
  passwordResetExpires: timestamp("password_reset_expires"),
});

// Add Zod schemas for validation
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  userType: z.enum(["franchisee", "franchisor"]),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

### Database Indexes
```typescript
// Add indexes for token lookups (performance)
// These are used for verification and password reset
export const emailVerificationTokenIdx = index("email_verification_token_idx")
  .on(users.emailVerificationToken);
export const passwordResetTokenIdx = index("password_reset_token_idx")
  .on(users.passwordResetToken);
```

### Migration Command
```bash
npm run db:push
```

## Definition of Done
- [ ] `passwordHash` column added to users table
- [ ] `emailVerified` column added with default false
- [ ] `emailVerificationToken` column added
- [ ] `emailVerificationExpires` column added
- [ ] `passwordResetToken` column added
- [ ] `passwordResetExpires` column added
- [ ] `registerSchema` Zod schema created
- [ ] `loginSchema` Zod schema created
- [ ] Database migration runs successfully
- [ ] TypeScript compiles without errors
- [ ] Existing user data preserved

## Test Scenarios
1. **Schema Push:** All columns created without errors
2. **Existing Users:** Old users still queryable
3. **New Users:** Can insert users with new columns
4. **Nullable Fields:** Token columns accept null values
