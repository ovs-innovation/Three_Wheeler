const User = require('../models/user.model');
const Vehicle = require('../models/vehicle.model');
const { generateToken } = require('../utils/jwt');

/**
 * Helper to generate token and set cookie header
 */
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken({ id: user._id, role: user.role });

  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  // Remove password from JSON response payload
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    message,
    data: {
      token,
      user: userResponse
    },
    errors: null
  });
};

/**
 * @desc Register user
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, city, state } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Registration failed',
        data: null,
        errors: ['Email is already registered']
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      city,
      state
    });

    sendTokenResponse(user, 201, res, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Login failed',
        data: null,
        errors: ['Invalid email or password']
      });
    }

    // Verify account status
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Login failed: account is ${user.status}`,
        data: null,
        errors: [`Your account status is currently ${user.status}`]
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Login failed',
        data: null,
        errors: ['Invalid email or password']
      });
    }

    sendTokenResponse(user, 200, res, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Logout user (Clears token cookie)
 * @route POST /api/auth/logout
 * @access Public
 */
const logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 5000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data: {},
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get currently logged-in user profile
 * @route GET /api/auth/profile
 * @access Private
 */
const getProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: req.user,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update user profile
 * @route PUT /api/auth/profile
 * @access Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, city, state } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (phone) fieldsToUpdate.phone = phone;
    if (city) fieldsToUpdate.city = city;
    if (state) fieldsToUpdate.state = state;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    }).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Change password
 * @route PUT /api/auth/change-password
 * @access Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    // Verify old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Password change failed',
        data: null,
        errors: ['Current password does not match']
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      data: {},
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete user account
 * @route DELETE /api/auth/delete-account
 * @access Private
 */
const deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id);

    // Clear cookie
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 5000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
      data: {},
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Forgot password placeholder link
 * @route POST /api/auth/forgot-password
 * @access Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Forgot password request failed',
        data: null,
        errors: ['User not found with this email']
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link generated and simulated successfully',
      data: { email },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Reset password placeholder link
 * @route POST /api/auth/reset-password
 * @access Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and new password are required',
        data: null,
        errors: ['Email and new password are required']
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
        data: null,
        errors: ['Password must be at least 6 characters']
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Password reset failed',
        data: null,
        errors: ['No account found with this email address']
      });
    }

    user.password = password;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully',
      data: {},
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get User Wishlist populated with Vehicle documents
 * @route GET /api/auth/wishlist
 * @access Private
 */
const getWishlist = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ id: { $in: req.user.wishlist } });
    res.status(200).json({
      success: true,
      message: 'Wishlist retrieved successfully',
      data: vehicles,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Toggle Vehicle ID in User Wishlist
 * @route POST /api/auth/wishlist
 * @access Private
 */
const toggleWishlist = async (req, res, next) => {
  try {
    const { vehicleId } = req.body;
    if (!vehicleId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Vehicle ID provided',
        data: null,
        errors: ['Vehicle ID is required']
      });
    }

    let updatedWishlist = [...req.user.wishlist];
    const isAdded = updatedWishlist.includes(vehicleId);

    if (isAdded) {
      updatedWishlist = updatedWishlist.filter(id => id !== vehicleId);
    } else {
      updatedWishlist.push(vehicleId);
    }

    req.user.wishlist = updatedWishlist;
    await req.user.save();

    res.status(200).json({
      success: true,
      message: isAdded ? 'Removed from Wishlist' : 'Added to Wishlist',
      data: req.user.wishlist,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get User Compare populated with Vehicle documents
 * @route GET /api/auth/compare
 * @access Private
 */
const getCompare = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ id: { $in: req.user.compare } });
    res.status(200).json({
      success: true,
      message: 'Comparison list retrieved successfully',
      data: vehicles,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update User Compare list values
 * @route POST /api/auth/compare
 * @access Private
 */
const updateCompare = async (req, res, next) => {
  try {
    const { compareList } = req.body; // expect array of strings
    if (!Array.isArray(compareList)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid compareList format',
        data: null,
        errors: ['compareList must be an array of vehicle IDs']
      });
    }

    const cleanList = compareList.map(String).map(s => s.trim()).filter(s => s.length > 0);
    req.user.compare = cleanList;
    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Comparison list updated successfully',
      data: req.user.compare,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  forgotPassword,
  resetPassword,
  getWishlist,
  toggleWishlist,
  getCompare,
  updateCompare
};
