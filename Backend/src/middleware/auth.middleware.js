const { verifyToken, verifyAdminToken } = require('../utils/jwt');
const User = require('../models/user.model');
const Admin = require('../models/admin.model');

/**
 * Protect User routes: ensures the request has a valid User JWT
 */
const protectUser = async (req, res, next) => {
  let token;

  // Check authorization header or cookies for token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: login required',
      data: null,
      errors: ['No token provided']
    });
  }

  try {
    // Verify token
    const decoded = verifyToken(token);

    // Fetch user and attach to request object
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: user no longer exists',
        data: null,
        errors: ['User not found']
      });
    }

    // Verify account status
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Access denied: account status is ${user.status}`,
        data: null,
        errors: [`Account status: ${user.status}`]
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: token is invalid or expired',
      data: null,
      errors: [error.message]
    });
  }
};

/**
 * Protect Admin routes: ensures the request has a valid Admin JWT
 */
const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: admin login required',
      data: null,
      errors: ['No admin token provided']
    });
  }

  try {
    const decoded = verifyAdminToken(token);

    // Fetch admin from Admin collection
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: admin no longer exists',
        data: null,
        errors: ['Admin not found']
      });
    }

    if (admin.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: admin account status is inactive',
        data: null,
        errors: ['Admin account inactive']
      });
    }

    // Confirm that the decoded role matches an administrator/staff role
    const validRoles = ['superadmin', 'admin', 'editor', 'sales_executive'];
    if (!validRoles.includes(decoded.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: insufficient permissions',
        data: null,
        errors: ['Requires administrative role']
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: token is invalid or expired',
      data: null,
      errors: [error.message]
    });
  }
};

/**
 * Limit access to specific roles (e.g., superadmin)
 * @param  {...string} roles - List of allowed roles
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    const activeActor = req.user || req.admin;

    if (!activeActor || !roles.includes(activeActor.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: insufficient permissions',
        data: null,
        errors: ['Forbidden']
      });
    }
    next();
  };
};

/**
 * Optional User verification: checks for a token and sets req.user if valid, but does not block guests if not present.
 */
const optionalProtectUser = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.status === 'active') {
        req.user = user;
      }
    } catch (error) {
      // Proceed silently as guest if token verification fails
    }
  }
  next();
};

/**
 * Dual user/admin protection: authenticates either user JWT or admin JWT.
 */
const protectUserOrAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: login required',
      data: null,
      errors: ['No token provided']
    });
  }

  // 1. Try to verify as standard user
  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');
    if (user && user.status === 'active') {
      req.user = user;
      return next();
    }
  } catch (error) {
    // Fail silently, try admin next
  }

  // 2. Try to verify as administrator
  try {
    const decoded = verifyAdminToken(token);
    const admin = await Admin.findById(decoded.id).select('-password');
    if (admin && admin.status === 'active') {
      req.admin = admin;
      return next();
    }
  } catch (error) {
    // Both failed
  }

  return res.status(401).json({
    success: false,
    message: 'Not authorized: token is invalid or expired',
    data: null,
    errors: ['Authentication check failed']
  });
};

module.exports = {
  protectUser,
  protectAdmin,
  optionalProtectUser,
  protectUserOrAdmin,
  authorizeRoles
};
