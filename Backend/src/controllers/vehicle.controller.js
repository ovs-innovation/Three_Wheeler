const Vehicle = require('../models/vehicle.model');

/**
 * Helper to generate a unique slug/id from a model name
 */
const generateUniqueSlug = async (name) => {
  let baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  let uniqueSlug = baseSlug;
  let count = 1;
  
  // Keep checking until a unique slug is found in both id and slug fields
  while (await Vehicle.findOne({ $or: [{ id: uniqueSlug }, { slug: uniqueSlug }] })) {
    count++;
    uniqueSlug = `${baseSlug}-${count}`;
  }
  
  return uniqueSlug;
};

/**
 * @desc Get all vehicles with filtering, sorting, pagination
 * @route GET /api/vehicles
 * @access Public
 */
const getVehicles = async (req, res, next) => {
  try {
    const {
      q,
      brand,
      fuel,
      category,
      maxPrice,
      minPrice,
      isPopular,
      isLatest,
      isUpcoming,
      isFeatured,
      status, // 'Published' or 'Draft' or 'all'
      showDeleted, // 'true' to include soft deleted
      sort,
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // 1. Soft Delete Check
    if (showDeleted !== 'true') {
      query.deletedAt = null;
    }

    // 2. Status check (For public users, show only Published)
    if (req.admin) {
      if (status && status !== 'all') {
        query.status = status;
      }
    } else {
      query.status = 'Published';
    }

    // 3. Search query matching name, brand, category, fuel
    if (q && q.trim() !== '') {
      const regex = new RegExp(q.trim(), 'i');
      query.$or = [
        { name: regex },
        { brandName: regex },
        { category: regex },
        { fuelType: regex }
      ];
    }

    // 4. Exact matching filters
    if (brand) {
      query.brandId = brand.toLowerCase();
    }
    if (fuel) {
      query.fuelType = fuel;
    }
    if (category) {
      if (category.toLowerCase() === 'passenger') {
        query.$or = [{ cargoPassenger: 'Passenger' }, { category: /passenger/i }];
      } else if (category.toLowerCase() === 'cargo') {
        query.$or = [{ cargoPassenger: 'Cargo' }, { category: /cargo/i }];
      } else {
        query.category = category;
      }
    }

    // Boolean filters
    if (isPopular !== undefined) query.isPopular = isPopular === 'true';
    if (isLatest !== undefined) query.isLatest = isLatest === 'true';
    if (isUpcoming !== undefined) query.isUpcoming = isUpcoming === 'true';
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';

    // Price range bounds
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.priceMin = {};
      if (minPrice !== undefined) query.priceMin.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.priceMin.$lte = Number(maxPrice);
    }

    // 5. Sorting
    let sortOptions = { createdAt: -1 }; // Default: Newest first
    if (sort === 'priceAsc' || sort === 'price-asc') {
      sortOptions = { priceMin: 1 };
    } else if (sort === 'priceDesc' || sort === 'price-desc') {
      sortOptions = { priceMin: -1 };
    } else if (sort === 'rating') {
      sortOptions = { rating: -1 };
    } else if (sort === 'popular') {
      sortOptions = { isPopular: -1, rating: -1 };
    }

    // 6. Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Vehicle.countDocuments(query);
    const vehicles = await Vehicle.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      message: 'Vehicles retrieved successfully',
      data: {
        vehicles,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get vehicle details by ID
 * @route GET /api/vehicles/:id
 * @access Public
 */
const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({ id: req.params.id });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle model not found',
        data: null,
        errors: ['Vehicle not found']
      });
    }

    // If guest, block Draft models
    if (vehicle.status === 'Draft' && !req.admin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: vehicle is in draft state',
        data: null,
        errors: ['Forbidden']
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vehicle details retrieved successfully',
      data: vehicle,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create new vehicle
 * @route POST /api/vehicles
 * @access Private (Admin)
 */
const createVehicle = async (req, res, next) => {
  try {
    const vehicleData = req.body;

    // Automatically generate unique slug and set to both id and slug
    const generatedSlug = await generateUniqueSlug(vehicleData.name);
    vehicleData.id = generatedSlug;
    vehicleData.slug = generatedSlug;

    // Force category to "three-wheeler"
    vehicleData.category = 'three-wheeler';

    const vehicle = await Vehicle.create(vehicleData);

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: vehicle,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update vehicle details
 * @route PUT /api/vehicles/:id
 * @access Private (Admin)
 */
const updateVehicle = async (req, res, next) => {
  try {
    // If name is changing, we generate a new unique slug, unless it is a draft/optional edit
    // To match traditional standards, we do not force slug changes on edit unless needed, but let's allow it
    const vehicleData = req.body;

    // Force category to "three-wheeler"
    vehicleData.category = 'three-wheeler';

    const vehicle = await Vehicle.findOneAndUpdate(
      { id: req.params.id },
      vehicleData,
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
        data: null,
        errors: ['Vehicle not found']
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete vehicle (Hard delete)
 * @route DELETE /api/vehicles/:id
 * @access Private (Admin)
 */
const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({ id: req.params.id });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
        data: null,
        errors: ['Vehicle not found']
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vehicle permanently deleted successfully',
      data: {},
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Soft delete vehicle
 * @route PATCH /api/vehicles/:id/soft-delete
 * @access Private (Admin)
 */
const softDeleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOneAndUpdate(
      { id: req.params.id },
      { deletedAt: new Date() },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
        data: null,
        errors: ['Vehicle not found']
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vehicle soft-deleted successfully',
      data: vehicle,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Restore soft deleted vehicle
 * @route PATCH /api/vehicles/:id/restore
 * @access Private (Admin)
 */
const restoreVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOneAndUpdate(
      { id: req.params.id },
      { deletedAt: null },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
        data: null,
        errors: ['Vehicle not found']
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vehicle restored successfully',
      data: vehicle,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Duplicate vehicle model
 * @route POST /api/vehicles/:id/duplicate
 * @access Private (Admin)
 */
const duplicateVehicle = async (req, res, next) => {
  try {
    const original = await Vehicle.findOne({ id: req.params.id });
    if (!original) {
      return res.status(404).json({
        success: false,
        message: 'Original vehicle model not found',
        data: null,
        errors: ['Vehicle not found']
      });
    }

    const copyData = original.toObject();
    delete copyData._id;
    delete copyData.createdAt;
    delete copyData.updatedAt;

    // Set duplicate name and generate unique slug
    copyData.name = `${original.name} (Copy)`;
    const newSlug = await generateUniqueSlug(copyData.name);
    copyData.id = newSlug;
    copyData.slug = newSlug;
    copyData.status = 'Draft'; // Set duplicated vehicle to Draft

    const duplicate = await Vehicle.create(copyData);

    res.status(201).json({
      success: true,
      message: 'Vehicle model duplicated successfully as draft',
      data: duplicate,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Bulk Delete Vehicles
 * @route POST /api/vehicles/bulk-delete
 * @access Private (Admin)
 */
const bulkDelete = async (req, res, next) => {
  try {
    const { ids } = req.body; // Expect array of string IDs
    if (!Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        message: 'Bulk delete failed',
        data: null,
        errors: ['ids must be an array of vehicle IDs']
      });
    }

    await Vehicle.deleteMany({ id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `${ids.length} vehicles deleted successfully`,
      data: {},
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Bulk Publish Vehicles
 * @route POST /api/vehicles/bulk-publish
 * @access Private (Admin)
 */
const bulkPublish = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        message: 'Bulk publish failed',
        data: null,
        errors: ['ids must be an array of vehicle IDs']
      });
    }

    await Vehicle.updateMany({ id: { $in: ids } }, { status: 'Published' });

    res.status(200).json({
      success: true,
      message: `${ids.length} vehicles published successfully`,
      data: {},
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Bulk Draft Vehicles
 * @route POST /api/vehicles/bulk-draft
 * @access Private (Admin)
 */
const bulkDraft = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        message: 'Bulk draft failed',
        data: null,
        errors: ['ids must be an array of vehicle IDs']
      });
    }

    await Vehicle.updateMany({ id: { $in: ids } }, { status: 'Draft' });

    res.status(200).json({
      success: true,
      message: `${ids.length} vehicles set to draft successfully`,
      data: {},
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
