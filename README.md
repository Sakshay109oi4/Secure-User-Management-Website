# Secure User Management Web Application

A production-grade full-stack web application demonstrating secure user authentication, role-based access control (RBAC), and OWASP Top 10 security best practices. 

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![JWT](https://img.shields.io/badge/Auth-JWT-blue)
![Security](https://img.shields.io/badge/Security-OWASP-red)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Architecture](#architecture)
- [Security Features](#security-features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Testing Guide](#testing-guide)
- [Screenshots Guide](#screenshots-guide)
- [Documentation](#documentation)
- [Viva Preparation](#viva-preparation)
- [License](#license)

---

## Features

| Feature | Description |
|---------|-------------|
| User Registration | Secure signup with validation and password strength rules |
| User Login | JWT-based authentication with HTTP-only cookies |
| JWT Authentication | Access + refresh token pattern with auto-refresh |
| Password Hashing | bcrypt with configurable salt rounds (default: 12) |
| RBAC | Admin and User roles with route-level authorization |
| Protected Routes | Middleware guards on API and frontend pages |
| User Profile | View and update profile, change password |
| Admin Panel | User management, role assignment, activate/deactivate |
| Logout | Token blacklisting and cookie clearing |
| Input Validation | Server-side validation with express-validator |
| Error Handling | Centralized error handler with safe messages |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, Bootstrap 5, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Authentication | JSON Web Tokens (JWT) |
| Password Hashing | bcryptjs |
| Security | Helmet, CSRF, XSS-Clean, Rate Limiting |
| Config | dotenv |

---

## Folder Structure

```
secure-user-management-app/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── constants.js          # App constants (roles, status codes)
│   ├── controllers/
│   │   ├── authController.js     # Register, login, logout, refresh
│   │   └── userController.js     # Profile, admin user management
│   ├── middleware/
│   │   ├── auth.js               # JWT verification middleware
│   │   ├── authorize.js          # Role-based access control
│   │   ├── errorHandler.js       # Global error handling
│   │   ├── rateLimiter.js        # Rate limiting config
│   │   ├── sanitize.js           # Input validation rules
│   │   └── validate.js           # Validation result handler
│   ├── models/
│   │   └── User.js               # MongoDB User schema
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth/*
│   │   ├── userRoutes.js         # /api/users/*
│   │   └── adminRoutes.js        # /api/admin/*
│   ├── utils/
│   │   ├── jwt.js                # Token generation/verification
│   │   ├── tokenBlacklist.js     # Logout token revocation
│   │   └── seedAdmin.js          # Admin user seeder script
│   └── server.js                 # Express app entry point
├── frontend/
│   ├── css/
│   │   └── style.css             # Custom styles
│   ├── js/
│   │   ├── api.js                # API client with CSRF
│   │   ├── auth.js               # Auth state management
│   │   ├── admin.js              # Admin panel logic
│   │   └── utils.js              # Utility functions
│   └── pages/
│       ├── index.html            # Landing page
│       ├── login.html            # Login page
│       ├── register.html         # Registration page
│       ├── dashboard.html        # User dashboard
│       ├── profile.html          # User profile
│       └── admin.html            # Admin panel
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATA_FLOW.md
│   ├── SEQUENCE_DIAGRAMS.md
│   ├── SECURITY.md
│   ├── SCREENSHOTS_GUIDE.md
│   ├── VIVA_QUESTIONS.md
│   ├── PROJECT_REPORT.md
│   └── LINKEDIN_DESCRIPTION.md
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        Browser[Web Browser]
        HTML[HTML Pages]
        JS[JavaScript Client]
    end

    subgraph Server["Server Layer - Express.js"]
        Helmet[Helmet Security Headers]
        CORS[CORS Middleware]
        RateLimit[Rate Limiter]
        CSRF[CSRF Protection]
        AuthMW[Auth Middleware]
        RBAC[RBAC Middleware]
        Routes[API Routes]
        ErrorH[Error Handler]
    end

    subgraph Data["Data Layer"]
        MongoDB[(MongoDB Atlas)]
        UserModel[User Schema]
    end

    Browser --> HTML
    HTML --> JS
    JS -->|HTTPS + Cookies| Helmet
    Helmet --> CORS --> RateLimit --> CSRF --> Routes
    Routes --> AuthMW --> RBAC
    Routes --> UserModel --> MongoDB
    Routes --> ErrorH
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

---

## Security Features

| Threat | Mitigation |
|--------|------------|
| NoSQL Injection | `express-mongo-sanitize` strips `$` operators |
| XSS | `xss-clean` middleware + client-side `escapeHtml()` |
| CSRF | `csurf` double-submit cookie pattern |
| Brute Force | Rate limiting on auth endpoints (10 req/15 min) |
| Session Hijacking | HTTP-only, Secure, SameSite cookies |
| Password Attacks | bcrypt hashing with 12 salt rounds |
| Information Disclosure | Helmet security headers, generic error messages |
| Privilege Escalation | RBAC middleware on admin routes |

See [docs/SECURITY.md](docs/SECURITY.md) for complete security documentation.

---

## Installation

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB Atlas** account (free tier works)
- **Git** (optional, for cloning)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/secure-user-management-app.git
cd secure-user-management-app

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and secrets

# 4. Seed admin user (first time only)
npm run seed:admin

# 5. Start the server
npm run dev
```

---

## Configuration

Copy `.env.example` to `.env` and update:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/secure_user_mgmt
JWT_SECRET=your_32_character_minimum_secret_key_here
COOKIE_SECRET=your_cookie_signing_secret_here
```

### MongoDB Atlas Setup

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user with read/write permissions
3. Whitelist your IP address (or `0.0.0.0/0` for development)
4. Copy the connection string to `MONGODB_URI`

---

## Running the Application

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Open **http://localhost:5000** in your browser.

### Default Admin Credentials

After running `npm run seed:admin`:

- **Email:** `admin@secureapp.com`
- **Password:** Value from `ADMIN_PASSWORD` in `.env` (default: `Admin@Secure123!`)

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Register new user |
| POST | `/login` | No | Login and receive tokens |
| POST | `/logout` | Yes | Logout and revoke tokens |
| POST | `/refresh` | Cookie | Refresh access token |
| GET | `/me` | Yes | Get current user |

### User (`/api/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/profile` | Yes | Get user profile |
| PUT | `/profile` | Yes | Update profile |
| PUT | `/change-password` | Yes | Change password |

### Admin (`/api/admin`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/dashboard` | Yes | Admin | Dashboard stats |
| GET | `/users` | Yes | Admin | List all users |
| GET | `/users/:id` | Yes | Admin | Get user by ID |
| PATCH | `/users/:id/role` | Yes | Admin | Update user role |
| PATCH | `/users/:id/toggle-status` | Yes | Admin | Activate/deactivate |
| DELETE | `/users/:id` | Yes | Admin | Delete user |

### Utility

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/csrf-token` | Get CSRF token |

---

## Testing Guide

### 1. Health Check

```bash
curl http://localhost:5000/api/health
```

### 2. User Registration

```bash
# Get CSRF token first
curl -c cookies.txt http://localhost:5000/api/csrf-token

# Register (replace CSRF_TOKEN)
curl -b cookies.txt -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: CSRF_TOKEN" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test@1234","confirmPassword":"Test@1234"}'
```

### 3. User Login

```bash
curl -b cookies.txt -c cookies.txt -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: CSRF_TOKEN" \
  -d '{"email":"test@example.com","password":"Test@1234"}'
```

### 4. Access Protected Route

```bash
curl -b cookies.txt http://localhost:5000/api/auth/me
```

### 5. Test RBAC (Non-Admin Accessing Admin)

Login as regular user, then:

```bash
curl -b cookies.txt http://localhost:5000/api/admin/users
# Expected: 403 Forbidden
```

### 6. Test Rate Limiting

Send 11+ login requests rapidly — expect `429 Too Many Requests`.

### 7. Frontend Testing Checklist

- [ ] Register with weak password (should fail validation)
- [ ] Register with valid credentials
- [ ] Login with wrong password (generic error message)
- [ ] Access dashboard without login (redirect to login)
- [ ] Update profile name
- [ ] Change password (redirects to login)
- [ ] Admin: view all users, toggle roles, deactivate user
- [ ] Logout clears session

---

## Screenshots Guide

See [docs/SCREENSHOTS_GUIDE.md](docs/SCREENSHOTS_GUIDE.md) for recommended screenshots for your report and GitHub README.

---

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture diagram and explanation |
| [DATA_FLOW.md](docs/DATA_FLOW.md) | Data flow diagrams |
| [SEQUENCE_DIAGRAMS.md](docs/SEQUENCE_DIAGRAMS.md) | Login, register, admin sequence diagrams |
| [SECURITY.md](docs/SECURITY.md) | Detailed security implementation |
| [VIVA_QUESTIONS.md](docs/VIVA_QUESTIONS.md) | 25+ viva Q&A for internship |
| [PROJECT_REPORT.md](docs/PROJECT_REPORT.md) | Full 15-20 page internship report |
| [LINKEDIN_DESCRIPTION.md](docs/LINKEDIN_DESCRIPTION.md) | LinkedIn project post template |

---

## Viva Preparation

Key topics to prepare:

1. **JWT vs Session-based auth** — why JWT with HTTP-only cookies
2. **bcrypt** — how salting prevents rainbow table attacks
3. **CSRF** — double-submit cookie pattern explanation
4. **RBAC** — middleware implementation
5. **NoSQL Injection** — how `express-mongo-sanitize` works
6. **OWASP Top 10** — which vulnerabilities this app addresses

Full Q&A: [docs/VIVA_QUESTIONS.md](docs/VIVA_QUESTIONS.md)

---

## Author

Sakshay
