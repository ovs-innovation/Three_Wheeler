const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  softDeleteVehicle,
  restoreVehicle,
  duplicateVehicle,
  bulkDelete,
  bulkPublish,
  bulkDraft
} = require('../controllers/vehicle.controller');
const { protectAdmin, optionalProtectUser } = require('../middleware/auth.middleware');

// Bulk operations
router.post('/bulk-delete', protectAdmin, bulkDelete);
router.post('/bulk-publish', protectAdmin, bulkPublish);
router.post('/bulk-draft', protectAdmin, bulkDraft);

router.get('/', optionalProtectUser, getVehicles);
router.get('/:id', optionalProtectUser, getVehicleById);

// Admin CRUD routes
router.post('/', protectAdmin, createVehicle);
router.put('/:id', protectAdmin, updateVehicle);
router.delete('/:id', protectAdmin, deleteVehicle);

// CMS workflow actions
router.patch('/:id/soft-delete', protectAdmin, softDeleteVehicle);
router.patch('/:id/restore', protectAdmin, restoreVehicle);
router.post('/:id/duplicate', protectAdmin, duplicateVehicle);

module.exports = router;
