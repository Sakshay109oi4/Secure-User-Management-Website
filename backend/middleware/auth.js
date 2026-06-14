const { verifyToken } = require('../utils/jwt');
const tokenBlacklist = require('../utils/tokenBlacklist');
const User = require('../models/User');
const { HTTP_STATUS, TOKEN_TYPES } = require('../config/constants');

const protect = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    if (tokenBlacklist.isBlacklisted(token)) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Token has been revoked. Please login again.',
      });
    }

    const decoded = verifyToken(token);

    if (decoded.type !== TOKEN_TYPES.ACCESS) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid token type.',
      });
    }

    const user = await User.findById(decoded.id).select('+password');

    if (!user || !user.isActive) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User no longer exists or is deactivated.',
      });
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Password was recently changed. Please login again.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Token expired. Please login again.',
        code: 'TOKEN_EXPIRED',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid token.',
      });
    }

    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
};

module.exports = protect;
