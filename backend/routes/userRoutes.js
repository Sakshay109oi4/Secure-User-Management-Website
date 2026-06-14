const express = require('express');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const {
  updateProfileValidation,
  changePasswordValidation,
} = require('../middleware/sanitize');
const {
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/userController');

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, validate, updateProfile);
router.put('/change-password', changePasswordValidation, validate, changePassword);

module.exports = router;
