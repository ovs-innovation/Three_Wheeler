const User = require('../models/user.model');

/**
 * @desc Get all registered users
 * @route GET /api/users
 * @access Private (Admin Only)
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
    res.status(200).json({
      success: true,
      message: 'Users list retrieved successfully',
      data: users,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update User profile status (e.g. block/unblock/suspend)
 * @route PUT /api/users/:id/status
 * @access Private (Admin Only)
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = ['active', 'inactive', 'suspended', 'blocked'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
        data: null,
        errors: [`Status must be one of: ${validStatuses.join(', ')}`]
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null,
        errors: ['User not found']
      });
    }

    res.status(200).json({
      success: true,
      message: `User status changed to ${status} successfully`,
      data: user,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete User account
 * @route DELETE /api/users/:id
 * @access Private (Admin Only)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null,
        errors: ['User not found']
      });
    }

    res.status(200).json({
      success: true,
      message: 'User account deleted successfully',
      data: {},
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  updateUserStatus,
  deleteUser
};
