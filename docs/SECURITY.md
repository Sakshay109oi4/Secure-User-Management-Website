# Security Features Documentation

## Secure User Management Web Application

---

## 1. Security Overview

This application implements defenses against the **OWASP Top 10 (2021)** vulnerabilities relevant to a web authentication system.

| OWASP Category | Implementation |
|----------------|----------------|
| A01 Broken Access Control | RBAC middleware, protected routes |
| A02 Cryptographic Failures | bcrypt hashing, JWT secrets, HTTPS-ready |
| A03 Injection | express-mongo-sanitize, input validation |
| A04 Insecure Design | Dual-token auth, token versioning |
| A05 Security Misconfiguration | Helmet headers, env-based config |
| A06 Vulnerable Components | Pinned dependency versions |
| A07 Auth Failures | Rate limiting, generic error messages |
| A08 Data Integrity Failures | CSRF protection, signed cookies |
| A09 Logging Failures | Morgan HTTP logging |
| A10 SSRF | Not applicable (no outbound URL fetching) |

---

## 2. Password Security (bcrypt)

### Implementation

```javascript
// User model pre-save hook
userSchema.pre('save', async function (next) {
  const saltRounds = 12; // Configurable via BCRYPT_SALT_ROUNDS
  this.password = await bcrypt.hash(this.password, saltRounds);
});
```

### Why bcrypt?

| Feature | Benefit |
|---------|---------|
| Adaptive cost factor | Slows brute-force as hardware improves |
| Built-in salt | Unique hash per password, prevents rainbow tables |
| One-way function | Cannot reverse hash to plaintext |

### Password Policy

- Minimum 8 characters
- Must contain: uppercase, lowercase, digit, special character
- Validated on both client (strength indicator) and server

---

## 3. JWT Authentication Security

### Token Configuration

```javascript
jwt.sign(payload, secret, {
  expiresIn: '1h',
  issuer: 'secure-user-management-app',
  audience: 'secure-app-users',
});
```

### Security Measures

| Measure | Purpose |
|---------|---------|
| Short access token TTL (1h) | Limits exposure window |
| Refresh token versioning | Invalidates all sessions on password change |
| Token blacklist on logout | Prevents reuse of logged-out tokens |
| HTTP-only cookies | Prevents XSS token theft |
| SameSite cookie attribute | Reduces CSRF risk |
| Issuer/audience claims | Prevents token misuse across apps |

---

## 4. NoSQL Injection Prevention

### Threat

```javascript
// Attack attempt
{ "email": { "$gt": "" }, "password": { "$gt": "" } }
```

### Mitigation

```javascript
app.use(mongoSanitize()); // Strips $ and . from user input
```

Additionally, Mongoose schema validation ensures only expected field types are stored.

---

## 5. XSS (Cross-Site Scripting) Prevention

### Server-Side

```javascript
app.use(xss()); // Sanitizes req.body, req.query, req.params
```

### Client-Side

```javascript
const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // ...
};
```

All user-generated content rendered in the DOM uses `escapeHtml()` before insertion.

### Content Security Policy (Helmet)

```
default-src 'self';
script-src 'self' https://cdn.jsdelivr.net;
style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
```

---

## 6. CSRF (Cross-Site Request Forgery) Prevention

### Double-Submit Cookie Pattern

1. Server generates CSRF token via `csurf` middleware
2. Client fetches token: `GET /api/csrf-token`
3. Client sends token in `X-CSRF-Token` header on all POST/PUT/PATCH/DELETE
4. Server validates token matches cookie

```javascript
// Client
headers: { 'X-CSRF-Token': csrfToken }

// Server
app.use('/api/auth', csrfProtection, authRoutes);
```

---

## 7. Rate Limiting

### Configuration

| Limiter | Window | Max Requests | Applied To |
|---------|--------|-------------|------------|
| General | 15 min | 100 | All routes |
| Auth | 15 min | 10 | Login, Register |

### Purpose

- Prevents brute-force password attacks
- Mitigates credential stuffing
- Protects against DoS at application layer

---

## 8. HTTP Security Headers (Helmet)

| Header | Value | Purpose |
|--------|-------|---------|
| X-Content-Type-Options | nosniff | Prevents MIME sniffing |
| X-Frame-Options | DENY | Prevents clickjacking |
| Strict-Transport-Security | max-age=31536000 | Forces HTTPS |
| X-XSS-Protection | 0 | Disabled (CSP is better) |
| Content-Security-Policy | Restrictive | Controls resource loading |

---

## 9. Input Validation & Sanitization

### Server-Side (express-validator)

```javascript
body('email').isEmail().normalizeEmail()
body('password').isLength({ min: 8 }).matches(/regex/)
body('name').trim().matches(/^[a-zA-Z\s.'-]+$/)
```

### HTTP Parameter Pollution (HPP)

```javascript
app.use(hpp()); // Prevents duplicate parameter attacks
```

### Request Size Limiting

```javascript
app.use(express.json({ limit: '10kb' }));
```

---

## 10. Role-Based Access Control (RBAC)

```javascript
// Only admins can access
router.use(authorize(ROLES.ADMIN));

// Prevent privilege escalation
// - Users cannot self-promote to admin
// - Admins cannot delete/deactivate themselves
```

---

## 11. Secure Environment Variables

- All secrets stored in `.env` (never committed)
- `.env.example` provided as template
- JWT secret minimum 32 characters enforced
- Cookie signing secret separate from JWT secret

---

## 12. Error Handling Security

- Generic messages for auth failures ("Invalid email or password")
- No stack traces in production responses
- No database error details exposed to client
- Operational errors vs programming errors distinguished

---

## 13. Session Management Security

| Feature | Implementation |
|---------|----------------|
| Stateless sessions | JWT (no server-side session store) |
| Session invalidation | Token blacklist + refreshTokenVersion |
| Concurrent session control | Version increment on password change |
| Secure cookie flags | httpOnly, secure, sameSite |

---

## 14. Security Testing Checklist

- [ ] Attempt SQL/NoSQL injection in login form
- [ ] Inject `<script>alert('xss')</script>` in name field
- [ ] Access `/api/admin/users` without authentication
- [ ] Access admin routes as regular user (expect 403)
- [ ] Send 15 rapid login attempts (expect 429)
- [ ] Use expired JWT token (expect 401)
- [ ] Submit form without CSRF token (expect 403)
- [ ] Check response headers include Helmet headers
- [ ] Verify passwords are not returned in API responses
- [ ] Test logout invalidates previous token

---

*Security is implemented in depth — at the network, application, and data layers.*
