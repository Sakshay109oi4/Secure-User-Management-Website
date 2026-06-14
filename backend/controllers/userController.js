const User = require('../models/User');
const { HTTP_STATUS, ROLES } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const getProfile = async (req, res) => {
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
        updatedAt: req.user.updatedAt,
      },
    },
  });
};

const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const updates = {};

    if (name) updates.name = name;

    if (Object.keys(updates).length === 0) {
      throw new AppError('No valid fields to update', HTTP_STATUS.BAD_REQUEST);
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', HTTP_STATUS.UNAUTHORIZED);
    }

    user.password = newPassword;
    user.refreshTokenVersion += 1;
    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Password changed successfully. Please login again.',
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(),
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (![ROLES.USER, ROLES.ADMIN].includes(role)) {
      throw new AppError('Invalid role specified', HTTP_STATUS.BAD_REQUEST);
    }

    if (req.params.id === req.user._id.toString()) {
      throw new AppError('Cannot change your own role', HTTP_STATUS.BAD_REQUEST);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User role updated successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      throw new AppError('Cannot deactivate your own account', HTTP_STATUS.BAD_REQUEST);
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    user.isActive = !user.isActive;
    user.refreshTokenVersion += 1;
    await user.save({ validateBeforeSave: false });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      throw new AppError('Cannot delete your own account', HTTP_STATUS.BAD_REQUEST);
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, activeUsers, adminCount, recentUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: ROLES.ADMIN }),
      User.find()
        .select('name email role createdAt')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers,
          adminCount,
        },
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getDashboardStats,
};
