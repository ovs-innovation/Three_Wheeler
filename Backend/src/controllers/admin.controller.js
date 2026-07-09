const Admin = require('../models/admin.model');
const Vehicle = require('../models/vehicle.model');
const Brand = require('../models/brand.model');
const Enquiry = require('../models/enquiry.model');
const User = require('../models/user.model');
const News = require('../models/news.model');
const Blog = require('../models/blog.model');
const { generateAdminToken } = require('../utils/jwt');

/**
 * Helper to generate token and set cookie header for Admins
 */
const sendAdminTokenResponse = (admin, statusCode, res, message) => {
  const token = generateAdminToken({ id: admin._id, role: admin.role });

  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  // Remove password from response
  const adminResponse = admin.toObject();
  delete adminResponse.password;

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    message,
    data: {
      token,
      admin: adminResponse
    },
    errors: null
  });
};

/**
 * @desc Admin Login
 * @route POST /api/admin/auth/login
 * @access Public
 */
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin login failed',
        data: null,
        errors: ['Invalid administrative credentials']
      });
    }

    if (admin.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Admin login failed',
        data: null,
        errors: ['This administrator account is currently inactive']
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Admin login failed',
        data: null,
        errors: ['Invalid administrative credentials']
      });
    }

    sendAdminTokenResponse(admin, 200, res, 'Admin logged in successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Admin Logout
 * @route POST /api/admin/auth/logout
 * @access Public
 */
const adminLogout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 5000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Admin logged out successfully',
      data: {},
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get currently logged-in Admin Profile
 * @route GET /api/admin/auth/profile
 * @access Private (Admin)
 */
const getAdminProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Admin profile retrieved successfully',
      data: req.admin,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get Admin Dashboard Statistics
 * @route GET /api/admin/dashboard/stats
 * @access Private (Admin)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const totalVehicles = await Vehicle.countDocuments({ deletedAt: null });
    const totalBrands = await Brand.countDocuments({ status: 'active' });
    const totalEnquiries = await Enquiry.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalNews = await News.countDocuments();
    const totalBlogs = await Blog.countDocuments();

    // Fetch popular/electric segment breakdown
    const electricVehicles = await Vehicle.countDocuments({ fuelType: 'Electric', deletedAt: null });
    const popularVehicles = await Vehicle.countDocuments({ isPopular: true, deletedAt: null });

    // Fetch recent items for preview
    const recentEnquiries = await Enquiry.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('user', 'name email phone');

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select('-password');

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: {
        counts: {
          vehicles: totalVehicles,
          brands: totalBrands,
          enquiries: totalEnquiries,
          users: totalUsers,
          news: totalNews,
          blogs: totalBlogs,
          electricVehicles,
          popularVehicles
        },
        recentEnquiries,
        recentUsers
      },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin,
  adminLogout,
  getAdminProfile,
  getDashboardStats
};
