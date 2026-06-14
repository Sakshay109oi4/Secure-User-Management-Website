const express = require('express');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerValidation,
  loginValidation,
} = require('../middleware/sanitize');
const {
  register,
  login,
  logout,
  refreshAccessToken,
  getMe,
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/logout', protect, logout);
router.post('/refresh', refreshAccessToken);
router.get('/me', protect, getMe);

module.exports = router;
