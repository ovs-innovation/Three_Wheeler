const express = require('express');
const router = express.Router();
const {
  getBrands,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand
} = require('../controllers/brand.controller');
const { protectAdmin } = require('../middleware/auth.middleware');

router.get('/', getBrands);
router.get('/:slug', getBrandBySlug);

router.post('/', protectAdmin, createBrand);
router.put('/:id', protectAdmin, updateBrand);
router.delete('/:id', protectAdmin, deleteBrand);

module.exports = router;
