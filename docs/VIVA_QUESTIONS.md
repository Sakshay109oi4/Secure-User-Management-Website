# Viva Questions & Answers

## Secure User Management Web Application — Internship Preparation

---

### Section A: Project Overview

**Q1. What is your project about?**

**A:** My project is a Secure User Management Web Application built with Node.js, Express.js, MongoDB Atlas, and vanilla JavaScript. It implements user registration, login, JWT authentication, role-based access control (Admin/User), and comprehensive security measures following OWASP Top 10 guidelines. It is designed as a production-grade application suitable for real-world deployment.

---

**Q2. Why did you choose this tech stack?**

**A:** 
- **Node.js + Express:** Non-blocking I/O, ideal for API-driven applications, large ecosystem
- **MongoDB Atlas:** Flexible schema for user data, cloud-hosted, free tier for development
- **JWT:** Stateless authentication, scalable across multiple servers
- **Bootstrap 5:** Rapid responsive UI development without heavy frontend frameworks
- **Vanilla JS:** Demonstrates fundamental web skills without framework abstraction

---

**Q3. What problem does your project solve?**

**A:** Many student projects lack proper security implementation. This project demonstrates how to build authentication systems correctly — with password hashing, token management, input validation, CSRF/XSS protection, and role-based access control — serving as a reference implementation for secure web development.

---

### Section B: Authentication & Authorization

**Q4. What is JWT and how does it work in your project?**

**A:** JWT (JSON Web Token) is a compact, URL-safe token format for securely transmitting claims between parties. In my project:
- **Access Token** (1 hour): Contains user ID, email, and role. Stored in HTTP-only cookie.
- **Refresh Token** (7 days): Contains user ID and token version. Used to obtain new access tokens.
- Tokens are signed with HMAC-SHA256 using a secret key stored in environment variables.
- On each protected request, the auth middleware verifies the token signature and expiry.

---

**Q5. Why use HTTP-only cookies instead of localStorage for JWT?**

**A:** localStorage is accessible via JavaScript, making tokens vulnerable to XSS attacks. HTTP-only cookies cannot be read by JavaScript, so even if an XSS vulnerability exists, the attacker cannot steal the authentication token. Combined with CSRF protection and SameSite cookie attributes, HTTP-only cookies provide stronger security.

---

**Q6. Explain your Role-Based Access Control (RBAC) implementation.**

**A:** RBAC is implemented through two middleware functions:
1. **`protect`** — Verifies JWT and attaches user to `req.user`
2. **`authorize(...roles)`** — Checks if `req.user.role` matches required roles

Admin routes use `authorize('admin')`. Regular users accessing admin endpoints receive a 403 Forbidden response. Additional safeguards prevent admins from deleting or deactivating their own account.

---

**Q7. What happens when a user changes their password?**

**A:** Three security actions occur:
1. New password is hashed with bcrypt (pre-save hook)
2. `passwordChangedAt` timestamp is updated
3. `refreshTokenVersion` is incremented, invalidating all existing refresh tokens
4. User must re-login on all devices

The auth middleware also checks if the token was issued before `passwordChangedAt` and rejects it.

---

**Q8. How does logout work securely?**

**A:** On logout:
1. Access and refresh tokens are added to an in-memory blacklist with their expiry time
2. `refreshTokenVersion` is incremented in the database
3. HTTP-only cookies are cleared
4. Client-side sessionStorage is cleared
5. User is redirected to login page

Even if someone has a copy of the old token, it will be rejected by the blacklist check.

---

### Section C: Security

**Q9. How do you prevent NoSQL Injection?**

**A:** Two layers of protection:
1. **`express-mongo-sanitize`** middleware strips `$` and `.` operators from user input, preventing queries like `{ "$gt": "" }`
2. **Mongoose schema validation** ensures only expected data types and field names are accepted

---

**Q10. How do you prevent XSS attacks?**

**A:** Three layers:
1. **Server:** `xss-clean` middleware sanitizes all request body, query, and params
2. **Client:** `escapeHtml()` function escapes HTML entities before rendering user data in the DOM
3. **Headers:** Helmet sets Content-Security-Policy restricting script sources to `'self'` and trusted CDNs

---

**Q11. How do you prevent CSRF attacks?**

**A:** Using the `csurf` package with the double-submit cookie pattern:
1. Server generates a CSRF token and stores it in a cookie
2. Client fetches the token via `GET /api/csrf-token`
3. Client sends the token in the `X-CSRF-Token` header on all state-changing requests
4. Server validates the header token matches the cookie token
5. Mismatched or missing tokens result in 403 Forbidden

---

**Q12. Explain bcrypt password hashing.**

**A:** bcrypt is an adaptive hashing algorithm designed for passwords:
- **Salt:** A random value prepended to the password before hashing, ensuring identical passwords produce different hashes
- **Cost factor:** 12 rounds (2^12 iterations), making brute-force computationally expensive
- **One-way:** Cannot be reversed to obtain the original password
- On login, `bcrypt.compare()` hashes the input with the stored salt and compares results

---

**Q13. What is rate limiting and why is it important?**

**A:** Rate limiting restricts the number of requests a client can make in a time window. In my project:
- **General:** 100 requests per 15 minutes for all routes
- **Auth:** 10 requests per 15 minutes for login/register

This prevents brute-force password attacks, credential stuffing, and application-layer DoS attacks.

---

**Q14. What security headers does Helmet set?**

**A:** Key headers include:
- `X-Content-Type-Options: nosniff` — Prevents MIME type sniffing
- `X-Frame-Options: DENY` — Prevents clickjacking via iframes
- `Content-Security-Policy` — Restricts resource loading sources
- `Strict-Transport-Security` — Forces HTTPS in production
- `X-DNS-Prefetch-Control` — Controls DNS prefetching

---

**Q15. Which OWASP Top 10 vulnerabilities does your project address?**

**A:**

| # | Vulnerability | Mitigation |
|---|--------------|------------|
| A01 | Broken Access Control | RBAC middleware |
| A02 | Cryptographic Failures | bcrypt, JWT secrets |
| A03 | Injection | mongo-sanitize, validation |
| A04 | Insecure Design | Dual-token pattern |
| A05 | Security Misconfiguration | Helmet, env variables |
| A07 | Auth Failures | Rate limiting, generic errors |
| A08 | Data Integrity Failures | CSRF protection |

---

### Section D: Database & Architecture

**Q16. Why MongoDB over SQL databases?**

**A:** MongoDB offers flexible document schema ideal for user profiles that may evolve. As a NoSQL database, it handles JSON-like documents natively, aligning with JavaScript/Node.js. MongoDB Atlas provides free cloud hosting with built-in security features. However, I implement NoSQL injection prevention since MongoDB is susceptible to operator injection attacks.

---

**Q17. Explain your MongoDB User schema design.**

**A:** The User schema includes:
- `name`, `email`, `password` — Core identity fields
- `role` — Enum: 'user' or 'admin' (RBAC)
- `isActive` — Soft deactivation without deletion
- `password` — Select: false (never returned in queries by default)
- `refreshTokenVersion` — For invalidating sessions
- `passwordChangedAt` — For rejecting old tokens
- Indexes on `email` (login) and `role` (admin queries)

---

**Q18. What is the difference between authentication and authorization?**

**A:**
- **Authentication (AuthN):** Verifying WHO the user is (login with email/password, JWT verification)
- **Authorization (AuthZ):** Determining WHAT the user can do (admin vs user role checks)

My project: Login authenticates the user. The `authorize` middleware authorizes based on role.

---

### Section E: Development & Testing

**Q19. How do you handle errors in your application?**

**A:** Centralized error handling via `errorHandler` middleware:
- Catches all errors passed through `next(error)`
- Maps Mongoose errors to appropriate HTTP status codes
- Returns generic messages in production (no stack traces)
- Logs detailed errors in development mode
- Distinguishes operational errors (AppError) from programming errors

---

**Q20. How would you deploy this application to production?**

**A:**
1. Set `NODE_ENV=production`
2. Deploy to cloud platform (Railway, Render, AWS, Azure)
3. Enable HTTPS/TLS
4. Use Redis for token blacklist (replace in-memory)
5. Configure MongoDB Atlas with IP whitelisting and backup
6. Set strong secrets via platform environment variables
7. Enable monitoring and logging (e.g., PM2, Datadog)
8. Set up CI/CD pipeline with automated tests

---

**Q21. What improvements would you make with more time?**

**A:**
1. Email verification on registration
2. Password reset via email (OTP/link)
3. Two-factor authentication (TOTP)
4. Redis-backed token blacklist and rate limiting
5. Unit and integration tests (Jest, Supertest)
6. API documentation with Swagger/OpenAPI
7. Audit logging for admin actions
8. Account lockout after failed login attempts

---

**Q22. How do you validate user input?**

**A:** Dual validation approach:
- **Server-side (primary):** `express-validator` with custom rules for name, email, password format. The `validate` middleware returns structured error responses.
- **Client-side (UX):** HTML5 form validation attributes and password strength indicator for immediate feedback.

Server-side validation is the security boundary — client-side can be bypassed.

---

**Q23. What is the purpose of the seed admin script?**

**A:** `npm run seed:admin` creates the initial administrator account in the database. This is needed because:
- The first admin cannot be created through the UI (registration defaults to 'user' role)
- It reads credentials from environment variables for security
- It checks for existing admin to prevent duplicates
- Run once during initial setup

---

**Q24. Explain the middleware chain in your Express application.**

**A:** Request flows through middleware in this order:
1. Helmet (security headers)
2. CORS (origin validation)
3. Rate limiter (throttling)
4. Morgan (logging)
5. Body parser (JSON, 10kb limit)
6. Cookie parser (signed cookies)
7. mongo-sanitize (NoSQL injection)
8. xss-clean (XSS prevention)
9. hpp (parameter pollution)
10. CSRF (on API routes)
11. Route-specific: auth → authorize → validate → controller
12. Error handler (global catch)

---

**Q25. How do you manage environment variables securely?**

**A:**
- All secrets in `.env` file (listed in `.gitignore`)
- `.env.example` provided as template without real values
- `dotenv` loads variables at startup
- JWT secret minimum length enforced (32 chars)
- Separate secrets for JWT signing and cookie signing
- Never hardcode secrets in source code
- Production: use platform secret management (AWS Secrets Manager, etc.)

---

*25 questions covering all aspects of the project for confident viva performance.*
