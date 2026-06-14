const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  getCookieOptions,
} = require('../utils/jwt');
const tokenBlacklist = require('../utils/tokenBlacklist');
const { HTTP_STATUS, TOKEN_TYPES } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, getCookieOptions(ACCESS_TOKEN_MAX_AGE));
  res.cookie('refreshToken', refreshToken, getCookieOptions(REFRESH_TOKEN_MAX_AGE));
};

const clearAuthCookies = (res) => {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email is already registered', HTTP_STATUS.CONFLICT);
    }

    const user = await User.create({ name, email, password });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setAuthCookies(res, accessToken, refreshToken);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated. Contact administrator.', HTTP_STATUS.FORBIDDEN);
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setAuthCookies(res, accessToken, refreshToken);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (accessToken) {
      try {
        const decoded = verifyToken(accessToken);
        tokenBlacklist.add(accessToken, decoded.exp * 1000);
      } catch (_e) {
        // Token may already be expired
      }
    }

    if (refreshToken) {
      try {
        const decoded = verifyToken(refreshToken);
        tokenBlacklist.add(refreshToken, decoded.exp * 1000);
      } catch (_e) {
        // Token may already be expired
      }
    }

    if (req.user) {
      req.user.refreshTokenVersion += 1;
      await req.user.save({ validateBeforeSave: false });
    }

    clearAuthCookies(res);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AppError('Refresh token not found', HTTP_STATUS.UNAUTHORIZED);
    }

    if (tokenBlacklist.isBlacklisted(refreshToken)) {
      throw new AppError('Refresh token revoked', HTTP_STATUS.UNAUTHORIZED);
    }

    const decoded = verifyToken(refreshToken);

    if (decoded.type !== TOKEN_TYPES.REFRESH) {
      throw new AppError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED);
    }

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', HTTP_STATUS.UNAUTHORIZED);
    }

    if (decoded.tokenVersion !== user.refreshTokenVersion) {
      throw new AppError('Refresh token invalidated', HTTP_STATUS.UNAUTHORIZED);
    }

    const newAccessToken = generateAccessToken(user);
    res.cookie('accessToken', newAccessToken, getCookieOptions(ACCESS_TOKEN_MAX_AGE));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Token refreshed',
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      clearAuthCookies(res);
      return next(new AppError('Invalid or expired refresh token', HTTP_STATUS.UNAUTHORIZED));
    }
    next(error);
  }
};

const getMe = async (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isActive: req.user.isActive,
        lastLogin: req.user.lastLogin,
        createdAt: req.user.createdAt,
      },
    },
  });
};

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  getMe,
  clearAuthCookies,
};
