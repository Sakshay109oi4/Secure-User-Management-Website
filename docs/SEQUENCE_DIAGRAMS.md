# Sequence Diagrams

## Secure User Management Web Application

---

## 1. User Registration Sequence

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant API as Express API
    participant CSRF as CSRF Middleware
    participant Val as Validator
    participant Auth as Auth Controller
    participant DB as MongoDB

    User->>Browser: Fill registration form
    Browser->>API: GET /api/csrf-token
    API->>CSRF: Generate CSRF token
    CSRF-->>Browser: { csrfToken }

    User->>Browser: Submit form
    Browser->>API: POST /api/auth/register + CSRF header
    API->>CSRF: Validate CSRF token
    CSRF-->>API: Valid
    API->>Val: Validate input fields
    Val-->>API: Passed
    API->>Auth: register(req, res)
    Auth->>DB: findOne({ email })
    DB-->>Auth: null (not exists)
    Auth->>Auth: bcrypt.hash(password, 12)
    Auth->>DB: User.create(userData)
    DB-->>Auth: New user document
    Auth->>Auth: generateAccessToken + generateRefreshToken
    Auth-->>Browser: 201 + Set-Cookie headers
    Browser->>Browser: Store user in sessionStorage
    Browser->>User: Redirect to /dashboard
```

---

## 2. User Login Sequence

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant API as Express API
    participant Auth as Auth Controller
    participant DB as MongoDB

    User->>Browser: Enter email & password
    Browser->>API: GET /api/csrf-token
    API-->>Browser: csrfToken

    Browser->>API: POST /api/auth/login
    API->>Auth: login(req, res)
    Auth->>DB: findOne({ email }).select('+password')
    DB-->>Auth: User document
    Auth->>Auth: bcrypt.compare(password, hash)
    alt Password invalid
        Auth-->>Browser: 401 Invalid credentials
    else Password valid
        Auth->>DB: Update lastLogin
        Auth->>Auth: Generate JWT tokens
        Auth-->>Browser: 200 + HTTP-only cookies
        Browser->>User: Redirect based on role
    end
```

---

## 3. Access Protected Resource Sequence

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant API as Express API
    participant AuthMW as Auth Middleware
    participant RBAC as Authorize Middleware
    participant Ctrl as Controller
    participant DB as MongoDB

    User->>Browser: Navigate to /admin
    Browser->>API: GET /api/auth/me (with cookies)
    API->>AuthMW: protect(req, res, next)
    AuthMW->>AuthMW: Extract token from cookie
    AuthMW->>AuthMW: Verify JWT signature
    AuthMW->>DB: findById(userId)
    DB-->>AuthMW: User document
    AuthMW-->>API: req.user attached

    Browser->>API: GET /api/admin/dashboard
    API->>AuthMW: protect()
    AuthMW-->>API: Authenticated
    API->>RBAC: authorize('admin')
    alt Not admin
        RBAC-->>Browser: 403 Forbidden
    else Is admin
        RBAC-->>API: Authorized
        API->>Ctrl: getDashboardStats()
        Ctrl->>DB: countDocuments(), find()
        DB-->>Ctrl: Stats data
        Ctrl-->>Browser: 200 + dashboard JSON
        Browser->>User: Render admin panel
    end
```

---

## 4. Token Refresh Sequence

```mermaid
sequenceDiagram
    participant Browser
    participant API as Express API
    participant Auth as Auth Controller
    participant DB as MongoDB

    Browser->>API: API request with expired access token
    API-->>Browser: 401 TOKEN_EXPIRED

    Browser->>API: POST /api/auth/refresh (refresh cookie)
    API->>Auth: refreshAccessToken()
    Auth->>Auth: Verify refresh token
    Auth->>DB: findById + check tokenVersion
    DB-->>Auth: User (version matches)
    Auth->>Auth: Generate new access token
    Auth-->>Browser: 200 + new accessToken cookie

    Browser->>API: Retry original request
    API-->>Browser: 200 Success
```

---

## 5. Logout Sequence

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant API as Express API
    participant Auth as Auth Controller
    participant BL as Token Blacklist
    participant DB as MongoDB

    User->>Browser: Click Logout
    Browser->>API: POST /api/auth/logout
    API->>Auth: logout(req, res)
    Auth->>BL: Blacklist access token
    Auth->>BL: Blacklist refresh token
    Auth->>DB: Increment refreshTokenVersion
    Auth-->>Browser: Clear cookies + 200 OK
    Browser->>Browser: Clear sessionStorage
    Browser->>User: Redirect to /login
```

---

## 6. Admin Delete User Sequence

```mermaid
sequenceDiagram
    actor Admin
    participant Browser
    participant API as Express API
    participant Ctrl as User Controller
    participant DB as MongoDB

    Admin->>Browser: Click Delete on user row
    Browser->>Browser: confirm() dialog
    Admin->>Browser: Confirm delete
    Browser->>API: DELETE /api/admin/users/:id
    API->>API: Auth + RBAC checks
    API->>Ctrl: deleteUser()
    Ctrl->>Ctrl: Prevent self-deletion check
    Ctrl->>DB: findByIdAndDelete(id)
    DB-->>Ctrl: Deleted document
    Ctrl-->>Browser: 200 User deleted
    Browser->>API: GET /api/admin/users (refresh list)
    API-->>Browser: Updated user list
    Browser->>Admin: Updated table
```

---

## 7. Change Password Sequence

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant API as Express API
    participant Ctrl as User Controller
    participant DB as MongoDB

    User->>Browser: Submit password change form
    Browser->>API: PUT /api/users/change-password
    API->>Ctrl: changePassword()
    Ctrl->>DB: findById().select('+password')
    Ctrl->>Ctrl: bcrypt.compare(currentPassword)
    alt Wrong current password
        Ctrl-->>Browser: 401 Incorrect password
    else Correct
        Ctrl->>Ctrl: Hash new password (pre-save hook)
        Ctrl->>DB: Save + increment refreshTokenVersion
        Ctrl-->>Browser: 200 Password changed
        Browser->>API: POST /api/auth/logout
        Browser->>User: Redirect to login
    end
```

---

*These sequence diagrams illustrate the complete request lifecycle for all major application flows.*
