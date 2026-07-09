const express = require('express');
const router = express.Router();
const {
  getEnquiries,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry
} = require('../controllers/enquiry.controller');
const { protectUserOrAdmin, optionalProtectUser, protectAdmin } = require('../middleware/auth.middleware');

// Create enquiry (available to guests and logged-in users)
router.post('/', optionalProtectUser, createEnquiry);

// Query and cancel routes (available to users or admins)
router.get('/', protectUserOrAdmin, getEnquiries);
router.delete('/:id', protectUserOrAdmin, deleteEnquiry);

// Admin update (assign staff, close status, add notes)
router.put('/:id', protectAdmin, updateEnquiry);

module.exports = router;
