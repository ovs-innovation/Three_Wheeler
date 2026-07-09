const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/auth.controller');

const {
  validate,
  registerRules,
  loginRules,
  changePasswordRules
} = require('../validators/auth.validator');

const { protectUser } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes (requires user login)
router.get('/profile', protectUser, getProfile);
router.put('/profile', protectUser, updateProfile);
router.put('/change-password', protectUser, changePasswordRules, validate, changePassword);
router.delete('/delete-account', protectUser, deleteAccount);

// Wishlist & Compare APIs
router.get('/wishlist', protectUser, getWishlist);
router.post('/wishlist', protectUser, toggleWishlist);
router.get('/compare', protectUser, getCompare);
router.post('/compare', protectUser, updateCompare);

module.exports = router;
