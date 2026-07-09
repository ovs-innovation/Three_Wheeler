const express = require('express');
const router = express.Router();
const {
  adminLogin,
  adminLogout,
  getAdminProfile,
  getDashboardStats
} = require('../controllers/admin.controller');
const { protectAdmin } = require('../middleware/auth.middleware');

// Public admin routes
router.post('/login', adminLogin);
router.post('/logout', adminLogout);

// Protected admin routes
router.get('/profile', protectAdmin, getAdminProfile);
router.get('/stats', protectAdmin, getDashboardStats);

module.exports = router;
