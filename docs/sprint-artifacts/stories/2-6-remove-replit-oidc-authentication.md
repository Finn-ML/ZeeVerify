# Story 2.6: Remove Replit OIDC Authentication

## Story Info
- **Epic:** 2 - User Authentication & Onboarding
- **Story ID:** 2.6
- **Title:** Remove Replit OIDC Authentication
- **Status:** ready-for-dev
- **Dependencies:** Stories 2.2-2.5 complete and tested

## User Story

As a **developer**,
I want **to remove the Replit OIDC authentication code**,
So that **the codebase uses only the new email/password auth**.

## Acceptance Criteria

### AC1: Remove OIDC Code
**Given** the new authentication system is complete
**When** deploying the application
**Then** Replit OIDC code is removed from:
- `server/replitAuth.ts` (delete file)
- Auth middleware references
- Client-side Replit auth components

### AC2: Existing User Migration
**Given** existing users authenticated via Replit OIDC
**When** they visit the platform
**Then** they are prompted to set a password via "Forgot Password"
**And** their existing user data (reviews, etc.) is preserved

### AC3: Platform Independence
**Given** the application runs outside Replit
**When** accessing authentication features
**Then** all auth features work correctly without Replit dependencies

## Technical Notes

### Files to Delete
- `server/replitAuth.ts`

### Files to Modify
- `server/index.ts` - Remove Replit auth imports, use localAuth
- `package.json` - Remove @replit/* packages
- `client/src/App.tsx` - Update auth provider if needed
- `client/src/hooks/useAuth.ts` - Ensure it uses new endpoints

### Implementation Steps

1. **Verify New Auth Works**
```bash
# Test all auth flows before removing OIDC
npm run dev
# Test: register, verify email, login, logout, password reset
```

2. **Update Server Entry Point**
```typescript
// server/index.ts
// REMOVE these imports:
// import { setupAuth } from "./replitAuth";

// ADD/KEEP these:
import { passport } from "./localAuth";
import session from "express-session";

// Initialize Passport
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));
app.use(passport.initialize());
app.use(passport.session());
```

3. **Remove Replit Packages**
```bash
npm uninstall @replit/auth @replit/identity
```

4. **Delete OIDC File**
```bash
rm server/replitAuth.ts
```

5. **Update useAuth Hook**
```typescript
// client/src/hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return null;
      const data = await res.json();
      return data.user;
    },
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
  };
}
```

6. **Update Environment Variables**
```bash
# .env - Remove Replit-specific vars:
# REPL_ID (no longer needed)
# ISSUER_URL (no longer needed)

# Keep/Add:
SESSION_SECRET=your-secure-secret
DATABASE_URL=your-database-url
POSTMARK_API_TOKEN=your-postmark-token
```

### Migration Strategy for Existing Users

Existing Replit OIDC users will have:
- `email` populated from OIDC
- `passwordHash` = null
- `emailVerified` = false (or true if they had verified)

They can regain access by:
1. Going to "Forgot Password"
2. Entering their email
3. Receiving a reset link
4. Setting a new password

Their existing data (reviews, brand claims, etc.) is preserved because it's linked by `user.id`, not by auth method.

### Testing Checklist
- [ ] New user registration works
- [ ] Email verification works
- [ ] Login with password works
- [ ] Logout works
- [ ] Password reset works
- [ ] Session persists across page reloads
- [ ] Protected routes redirect to login
- [ ] Role-based access works (franchisee, franchisor, admin)
- [ ] Application works outside Replit environment

## Definition of Done
- [ ] `server/replitAuth.ts` deleted
- [ ] `@replit/*` packages removed from package.json
- [ ] `server/index.ts` updated to use localAuth
- [ ] `client/src/hooks/useAuth.ts` updated
- [ ] Replit-specific environment variables documented as deprecated
- [ ] All auth features work without Replit
- [ ] Existing user data preserved
- [ ] TypeScript compiles without errors
- [ ] All tests pass

## Test Scenarios
1. **New Registration:** Works after OIDC removal
2. **Existing User Login:** Prompted to reset password
3. **Existing User Reset:** Can set password, login works
4. **Data Preservation:** Reviews/claims still associated
5. **Non-Replit Deploy:** Auth works on any hosting
6. **Protected Routes:** Proper auth checks
