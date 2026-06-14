const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { mongoIdValidation } = require('../middleware/sanitize');
const { ROLES } = require('../config/constants');
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getDashboardStats,
} = require('../controllers/userController');

const router = express.Router();

router.use(protect);
router.use(authorize(ROLES.ADMIN));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/:id', mongoIdValidation, validate, getUserById);
router.patch(
  '/users/:id/role',
  mongoIdValidation,
  body('role').isIn([ROLES.USER, ROLES.ADMIN]).withMessage('Invalid role'),
  validate,
  updateUserRole
);
router.patch('/users/:id/toggle-status', mongoIdValidation, validate, toggleUserStatus);
router.delete('/users/:id', mongoIdValidation, validate, deleteUser);

module.exports = router;
