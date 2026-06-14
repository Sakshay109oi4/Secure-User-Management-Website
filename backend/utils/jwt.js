const jwt = require('jsonwebtoken');
const { TOKEN_TYPES } = require('../config/constants');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }
  return secret;
};

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      type: TOKEN_TYPES.ACCESS,
    },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      issuer: 'secure-user-management-app',
      audience: 'secure-app-users',
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      tokenVersion: user.refreshTokenVersion,
      type: TOKEN_TYPES.REFRESH,
    },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      issuer: 'secure-user-management-app',
      audience: 'secure-app-users',
    }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret(), {
    issuer: 'secure-user-management-app',
    audience: 'secure-app-users',
  });
};

const getCookieOptions = (maxAgeMs) => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: maxAgeMs,
    path: '/',
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  getCookieOptions,
};
