# Data Flow Documentation

## Secure User Management Web Application

---

## 1. User Registration Data Flow

```mermaid
flowchart TD
    A[User fills registration form] --> B[Client-side validation]
    B --> C[Fetch CSRF token]
    C --> D[POST /api/auth/register]
    D --> E{CSRF valid?}
    E -->|No| F[403 Forbidden]
    E -->|Yes| G{Rate limit OK?}
    G -->|No| H[429 Too Many Requests]
    G -->|Yes| I[express-validator checks]
    I -->|Fail| J[400 Validation Error]
    I -->|Pass| K[Check email uniqueness]
    K -->|Exists| L[409 Conflict]
    K -->|New| M[bcrypt hash password]
    M --> N[Save user to MongoDB]
    N --> O[Generate JWT tokens]
    O --> P[Set HTTP-only cookies]
    P --> Q[201 Created + user data]
    Q --> R[Redirect to Dashboard]
```

### Data Transformations (Registration)

| Step | Input | Output |
|------|-------|--------|
| Validation | Raw form data | Sanitized strings |
| Password hash | Plain text password | bcrypt hash (60 chars) |
| JWT creation | User ID, email, role | Signed access + refresh tokens |
| DB storage | User object | MongoDB document with `_id` |

---

## 2. User Login Data Flow

```mermaid
flowchart TD
    A[User enters credentials] --> B[Fetch CSRF token]
    B --> C[POST /api/auth/login]
    C --> D[Rate limiter check]
    D --> E[Validate email/password format]
    E --> F[Find user by email +password]
    F --> G{User exists?}
    G -->|No| H[401 Invalid credentials]
    G -->|Yes| I[bcrypt.compare password]
    I -->|Fail| H
    I -->|Pass| J{Account active?}
    J -->|No| K[403 Account deactivated]
    J -->|Yes| L[Update lastLogin timestamp]
    L --> M[Generate tokens]
    M --> N[Set cookies]
    N --> O[200 OK + user + token]
    O --> P{Role?}
    P -->|admin| Q[Redirect to /admin]
    P -->|user| R[Redirect to /dashboard]
```

---

## 3. Protected Route Access Flow

```mermaid
flowchart TD
    A[User requests protected page/API] --> B[Browser sends cookies]
    B --> C[Auth middleware extracts token]
    C --> D{Token present?}
    D -->|No| E[401 Unauthorized]
    D -->|Yes| F{Token blacklisted?}
    F -->|Yes| G[401 Token revoked]
    F -->|No| H[JWT verify signature + expiry]
    H -->|Invalid| I[401 Invalid token]
    H -->|Valid| J[Load user from DB]
    J --> K{User active?}
    K -->|No| L[401 User deactivated]
    K -->|Yes| M{Password changed after token?}
    M -->|Yes| N[401 Re-login required]
    M -->|No| O[Attach user to req.user]
    O --> P{Admin route?}
    P -->|Yes| Q{Role = admin?}
    Q -->|No| R[403 Forbidden]
    Q -->|Yes| S[Execute controller]
    P -->|No| S
```

---

## 4. Admin User Management Data Flow

```mermaid
flowchart LR
    A[Admin Panel] --> B[GET /api/admin/users]
    B --> C[Auth + RBAC middleware]
    C --> D[Query MongoDB with pagination]
    D --> E[Return user list JSON]
    E --> F[Render table in browser]

    F --> G[Admin clicks action]
    G --> H{Action type}
    H -->|Toggle Role| I[PATCH /users/:id/role]
    H -->|Toggle Status| J[PATCH /users/:id/toggle-status]
    H -->|Delete| K[DELETE /users/:id]
    I & J & K --> L[Validate + Execute]
    L --> M[Update MongoDB]
    M --> N[Return updated data]
    N --> O[Refresh UI]
```

---

## 5. Logout Data Flow

```mermaid
flowchart TD
    A[User clicks Logout] --> B[POST /api/auth/logout]
    B --> C[Extract access + refresh tokens]
    C --> D[Add tokens to blacklist]
    D --> E[Increment refreshTokenVersion]
    E --> F[Clear HTTP-only cookies]
    F --> G[Clear sessionStorage]
    G --> H[Redirect to /login]
```

---

## 6. Data Model Flow

```
┌──────────────────────────────────────────────┐
│              User Document                    │
├──────────────────────────────────────────────┤
│ _id: ObjectId                                │
│ name: String (2-50 chars)                    │
│ email: String (unique, lowercase)            │
│ password: String (bcrypt hash, select:false)  │
│ role: "user" | "admin"                       │
│ isActive: Boolean                            │
│ lastLogin: Date                              │
│ passwordChangedAt: Date                      │
│ refreshTokenVersion: Number                  │
│ createdAt: Date (auto)                       │
│ updatedAt: Date (auto)                       │
└──────────────────────────────────────────────┘
```

### Indexes

- `{ email: 1 }` — Fast login lookups
- `{ role: 1 }` — Admin dashboard queries

---

## 7. Error Data Flow

```
Error occurs in controller
        │
        ▼
   next(error) called
        │
        ▼
┌───────────────────┐
│  Error Handler    │
│                   │
│ Mongoose Validation → 400
│ Duplicate key (11000) → 409
│ CastError → 400
│ AppError → custom status
│ Unknown → 500 (generic message)
└───────────────────┘
        │
        ▼
{ success: false, message: "..." }
(No stack trace in production)
```

---

*Data flows are designed to minimize sensitive data exposure at every step.*
