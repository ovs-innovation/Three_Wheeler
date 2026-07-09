const Brand = require('../models/brand.model');

/**
 * @desc Get all brands
 * @route GET /api/brands
 * @access Public
 */
const getBrands = async (req, res, next) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      message: 'Brands retrieved successfully',
      data: brands,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get brand by slug
 * @route GET /api/brands/:slug
 * @access Public
 */
const getBrandBySlug = async (req, res, next) => {
  try {
    const brand = await Brand.findOne({ slug: req.params.slug });
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
        data: null,
        errors: ['Brand not found']
      });
    }
    res.status(200).json({
      success: true,
      message: 'Brand retrieved successfully',
      data: brand,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create a brand
 * @route POST /api/brands
 * @access Private (Admin)
 */
const createBrand = async (req, res, next) => {
  try {
    const { name, slug, logo, banner, country, description, marketShare, rating, established, origin, seoTitle, seoDescription, seoKeywords, status } = req.body;

    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existingBrand = await Brand.findOne({ $or: [{ slug: finalSlug }, { id: finalSlug }] });
    if (existingBrand) {
      return res.status(400).json({
        success: false,
        message: 'Brand creation failed',
        data: null,
        errors: ['Brand with this slug/id is already registered']
      });
    }

    const brand = await Brand.create({
      id: finalSlug,
      name,
      slug: finalSlug,
      logo,
      banner,
      country,
      description,
      marketShare,
      rating,
      established,
      origin,
      seoTitle,
      seoDescription,
      seoKeywords,
      status
    });

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: brand,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update a brand
 * @route PUT /api/brands/:id
 * @access Private (Admin)
 */
const updateBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
        data: null,
        errors: ['Brand not found']
      });
    }

    res.status(200).json({
      success: true,
      message: 'Brand updated successfully',
      data: brand,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete a brand
 * @route DELETE /api/brands/:id
 * @access Private (Admin)
 */
const deleteBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
        data: null,
        errors: ['Brand not found']
      });
    }

    res.status(200).json({
      success: true,
      message: 'Brand deleted successfully',
      data: {},
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBrands,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand
};
