require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const csrf = require('csurf');

const connectDB = require('./config/db');
const { generalLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

connectDB();

app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5000')
  .split(',')
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  })
);

app.use(generalLimiter);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  },
});

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({
    success: true,
    csrfToken: req.csrfToken(),
  });
});

app.use('/api/auth', csrfProtection, authRoutes);
app.use('/api/users', csrfProtection, userRoutes);
app.use('/api/admin', csrfProtection, adminRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Secure User Management API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

app.get('/', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'pages', 'index.html'));
});

app.get('/login', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'pages', 'login.html'));
});

app.get('/register', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'pages', 'register.html'));
});

app.get('/dashboard', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'pages', 'dashboard.html'));
});

app.get('/profile', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'pages', 'profile.html'));
});

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'pages', 'admin.html'));
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
