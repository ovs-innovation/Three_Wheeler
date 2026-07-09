const express = require('express');
const router = express.Router();
const { getUsers, updateUserStatus, deleteUser } = require('../controllers/user.controller');
const { protectAdmin } = require('../middleware/auth.middleware');

router.get('/', protectAdmin, getUsers);
router.patch('/:id/status', protectAdmin, updateUserStatus);
router.delete('/:id', protectAdmin, deleteUser);

module.exports = router;
