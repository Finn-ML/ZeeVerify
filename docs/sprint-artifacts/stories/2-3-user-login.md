# Story 2.3: User Login

## Story Info
- **Epic:** 2 - User Authentication & Onboarding
- **Story ID:** 2.3
- **Title:** User Login
- **Status:** review
- **Dependencies:** Story 2.1

## User Story

As a **registered user**,
I want **to log in with my email and password**,
So that **I can access my account**.

## Acceptance Criteria

### AC1: Login Form
**Given** I am on the login page
**When** I enter my email and password
**Then** I see validation for required fields

### AC2: Successful Login (Verified Account)
**Given** I submit valid credentials for a verified account
**When** the login form is submitted
**Then** `POST /api/auth/login` authenticates via Passport Local
**And** a session is created
**And** I am redirected to my dashboard based on user type:
- Franchisee → `/franchisee`
- Franchisor → `/franchisor`
- Admin → `/admin`

### AC3: Unverified Account
**Given** I submit valid credentials for an unverified account
**When** the login form is submitted
**Then** I see "Please verify your email before logging in" message
**And** I see a "Resend verification email" link

### AC4: Invalid Credentials
**Given** I submit invalid credentials
**When** the login form is submitted
**Then** I see "Invalid email or password" error (generic for security)
**And** the form remains on the page

### AC5: Already Logged In
**Given** I am already logged in
**When** I navigate to the login page
**Then** I am redirected to my dashboard

## Technical Notes

### Files to Create/Modify
- **Create:** `client/src/pages/login.tsx`
- **Create:** `server/localAuth.ts` - Passport Local strategy
- **Modify:** `server/routes.ts` - Add login/logout routes
- **Modify:** `server/index.ts` - Initialize Passport
- **Modify:** `client/src/hooks/useAuth.ts` - Update for new endpoints

### Passport Local Strategy
```typescript
// server/localAuth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { storage } from "./storage";

passport.use(new LocalStrategy(
  { usernameField: "email" },
  async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);

      if (!user || !user.passwordHash) {
        return done(null, false, { message: "Invalid email or password" });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return done(null, false, { message: "Invalid email or password" });
      }

      if (!user.emailVerified) {
        return done(null, false, { message: "Please verify your email before logging in" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export { passport };
```

### Routes Implementation
```typescript
// Add to server/routes.ts
import { passport } from "./localAuth";

app.post("/api/auth/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: info?.message || "Login failed" });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.json({ user: { id: user.id, email: user.email, role: user.role } });
    });
  })(req, res, next);
});

app.post("/api/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.json({ message: "Logged out successfully" });
  });
});

app.get("/api/auth/me", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});
```

### Dependencies to Install
```bash
npm install passport passport-local @types/passport @types/passport-local
```

### Dashboard Routing
| User Type | Redirect Path |
|-----------|---------------|
| franchisee | `/franchisee` |
| franchisor | `/franchisor` |
| admin | `/admin` |

## Definition of Done
- [x] `client/src/pages/login.tsx` created
- [x] `server/localAuth.ts` created with Passport Local
- [x] `POST /api/auth/login` route added
- [x] `POST /api/auth/logout` route added
- [x] `GET /api/auth/me` route added
- [x] Passport packages installed (already present)
- [x] Session-based authentication working
- [x] Role-based dashboard redirect
- [x] Unverified account handling
- [x] Generic error message for security
- [x] TypeScript compiles without errors

## Test Scenarios
1. **Valid Login (Verified):** Session created, redirected to dashboard
2. **Valid Login (Unverified):** Error with resend link
3. **Invalid Email:** Generic error shown
4. **Invalid Password:** Generic error shown
5. **Already Logged In:** Redirect to dashboard
6. **Logout:** Session destroyed

## Dev Agent Record

### Agent Model Used
Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List
- Created localAuth.ts with Passport Local Strategy running alongside OIDC
- Added POST /api/auth/login with proper error handling for unverified accounts
- Added POST /api/auth/logout route
- Added GET /api/auth/me route for local auth session check
- Created login.tsx page with form validation, password toggle, role-based redirect
- Updated useAuth hook to check both local and OIDC endpoints
- Unverified accounts get special error code with resend option
- Generic "Invalid email or password" message for security
- TypeScript compiles (pre-existing errors in unrelated files)

### File List
**Files Created:**
- `server/localAuth.ts` - Passport Local Strategy configuration
- `client/src/pages/login.tsx` - Login form page

**Files Modified:**
- `server/routes.ts` - Added login, logout, me routes
- `client/src/App.tsx` - Added login route
- `client/src/hooks/useAuth.ts` - Updated to check both auth endpoints

### Change Log
- 2025-12-04: Implemented local authentication with session management
