# Screenshots Guide

## Recommended Screenshots for Internship Report & GitHub README

Capture these screenshots after running the application locally. Use **1920x1080** resolution for best quality.

---

## 1. Landing Page (Home)

**URL:** `http://localhost:5000/`

**What to capture:**
- Hero section with "Secure User Management" title
- Three feature cards (JWT, RBAC, OWASP)
- Security badges at bottom
- Navigation bar

**Filename:** `01-landing-page.png`

**Caption for report:** *Figure 1: Application landing page showcasing security features*

---

## 2. Registration Page

**URL:** `http://localhost:5000/register`

**What to capture:**
- Registration form with all fields
- Password strength indicator (type a password to show the bar)

**Also capture validation error:**
- Submit with weak password to show validation alert

**Filenames:**
- `02-register-page.png`
- `02b-register-validation-error.png`

**Caption:** *Figure 2: User registration with password strength validation*

---

## 3. Login Page

**URL:** `http://localhost:5000/login`

**What to capture:**
- Clean login form
- Link to registration page

**Also capture:**
- Failed login attempt showing generic error message

**Filenames:**
- `03-login-page.png`
- `03b-login-error.png`

**Caption:** *Figure 3: Secure login with generic error messages (no user enumeration)*

---

## 4. User Dashboard

**URL:** `http://localhost:5000/dashboard`

**Prerequisite:** Login as regular user

**What to capture:**
- Welcome message with user avatar
- Role badge, authentication status, last login
- Quick actions and security status section

**Filename:** `04-user-dashboard.png`

**Caption:** *Figure 4: Protected user dashboard after successful authentication*

---

## 5. User Profile Page

**URL:** `http://localhost:5000/profile`

**What to capture:**
- Profile information form (left panel)
- Change password form (right panel)
- Password strength indicator on new password field

**Filename:** `05-user-profile.png`

**Caption:** *Figure 5: User profile management with password change functionality*

---

## 6. Admin Dashboard

**URL:** `http://localhost:5000/admin`

**Prerequisite:** Login as admin (`admin@secureapp.com`)

**What to capture:**
- Statistics cards (Total, Active, Inactive, Admins)
- User management table with actions
- Recent registrations sidebar

**Filename:** `06-admin-dashboard.png`

**Caption:** *Figure 6: Admin panel with user management and dashboard statistics*

---

## 7. RBAC — Access Denied

**How to capture:**
1. Login as regular user
2. Open browser DevTools → Console
3. Run: `fetch('/api/admin/users', { credentials: 'include' }).then(r => r.json()).then(console.log)`
4. Screenshot the 403 response in Network tab

**Filename:** `07-rbac-forbidden.png`

**Caption:** *Figure 7: Role-based access control blocking unauthorized admin access*

---

## 8. API Health Check

**How to capture:**
1. Open browser or terminal
2. Visit `http://localhost:5000/api/health`
3. Screenshot JSON response

**Filename:** `08-api-health.png`

**Caption:** *Figure 8: API health check endpoint response*

---

## 9. Security Headers (DevTools)

**How to capture:**
1. Open DevTools → Network tab
2. Reload any page
3. Click on the document request
4. Screenshot Response Headers showing Helmet headers:
   - `X-Content-Type-Options`
   - `X-Frame-Options`
   - `Content-Security-Policy`

**Filename:** `09-security-headers.png`

**Caption:** *Figure 9: HTTP security headers set by Helmet middleware*

---

## 10. MongoDB Atlas Database

**How to capture:**
1. Login to MongoDB Atlas dashboard
2. Navigate to your cluster → Browse Collections
3. Screenshot the `users` collection showing documents
4. **Blur/hide** any sensitive data if sharing publicly

**Filename:** `10-mongodb-atlas.png`

**Caption:** *Figure 10: User documents stored in MongoDB Atlas cloud database*

---

## 11. Project Structure (VS Code / Cursor)

**How to capture:**
- Screenshot the file explorer showing the complete folder structure

**Filename:** `11-project-structure.png`

**Caption:** *Figure 11: Project folder structure in development environment*

---

## 12. Rate Limiting Test

**How to capture:**
1. Use terminal to send multiple rapid login requests
2. Screenshot the 429 response

```bash
# PowerShell example - run multiple times
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"wrong"}'
```

**Filename:** `12-rate-limiting.png`

**Caption:** *Figure 12: Rate limiting preventing brute-force attacks*

---

## GitHub README Banner (Optional)

Create a simple banner image (1200x600) with:
- Project title
- Tech stack icons
- "Secure • JWT • RBAC • OWASP" tagline

**Filename:** `banner.png`

---

## Tips for Professional Screenshots

1. Use a clean browser window (hide bookmarks bar)
2. Use light mode for consistency
3. Crop unnecessary browser chrome
4. Add figure numbers and captions in your report
5. Store all screenshots in a `screenshots/` folder in the repo
6. Reference screenshots in README.md using relative paths

---

*12 screenshots covering all major features and security aspects.*
