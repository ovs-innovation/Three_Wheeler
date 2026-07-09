const Enquiry = require('../models/enquiry.model');

/**
 * @desc Get all enquiries (Admin sees all, User sees their own)
 * @route GET /api/enquiries
 * @access Private
 */
const getEnquiries = async (req, res, next) => {
  try {
    let query = {};

    // If regular user, restrict to their own enquiries
    if (req.user) {
      query = { user: req.user.id };
    } else if (req.admin) {
      // Admin filters
      const { status, type, userId, search } = req.query;
      if (status) query.status = status;
      if (type) query.type = type;
      if (userId) query.user = userId;
      if (search) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [
          { name: regex },
          { email: regex },
          { phone: regex },
          { vehicleName: regex }
        ];
      }
    } else {
      return res.status(401).json({
        success: false,
        message: 'Access denied: not authenticated',
        data: null,
        errors: ['Authentication required']
      });
    }

    const enquiries = await Enquiry.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name email phone')
      .populate('assignedExecutive', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Enquiries retrieved successfully',
      data: enquiries,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create new enquiry (User or Guest)
 * @route POST /api/enquiries
 * @access Public
 */
const createEnquiry = async (req, res, next) => {
  try {
    const { name, email, phone, city, vehicleName, vehicleId, type, message } = req.body;

    let enquiryData = {
      vehicleName,
      vehicleId: vehicleId || '',
      type: type || 'Dealer Enquiry',
      message: message || '',
      city: city || 'Delhi/NCR',
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      status: 'Pending'
    };

    // If standard user is authenticated, attach details
    if (req.user) {
      enquiryData.user = req.user.id;
      enquiryData.name = req.user.name;
      enquiryData.email = req.user.email;
      enquiryData.phone = req.user.phone;
      enquiryData.city = city || req.user.city || 'Delhi/NCR';
    } else {
      // Guest checks
      if (!name || !email || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Enquiry submission failed',
          data: null,
          errors: ['Guest submissions require name, email, and phone number']
        });
      }
      enquiryData.name = name;
      enquiryData.email = email;
      enquiryData.phone = phone;
    }

    const enquiry = await Enquiry.create(enquiryData);

    res.status(201).json({
      success: true,
      message: 'Your enquiry has been submitted successfully',
      data: enquiry,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update enquiry details (Admin Only)
 * @route PUT /api/enquiries/:id
 * @access Private (Admin Only)
 */
const updateEnquiry = async (req, res, next) => {
  try {
    const { status, assignedExecutive, notes } = req.body;

    const fieldsToUpdate = {};
    if (status) {
      if (!['Pending', 'Contacted', 'In Progress', 'Completed', 'Cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status update',
          data: null,
          errors: ['Status must be Pending, Contacted, In Progress, Completed, or Cancelled']
        });
      }
      fieldsToUpdate.status = status;
    }

    if (assignedExecutive !== undefined) {
      fieldsToUpdate.assignedExecutive = assignedExecutive || null;
    }

    if (notes !== undefined) {
      fieldsToUpdate.notes = notes;
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    )
      .populate('user', 'name email phone')
      .populate('assignedExecutive', 'name email role');

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found',
        data: null,
        errors: ['Enquiry record not found']
      });
    }

    res.status(200).json({
      success: true,
      message: 'Enquiry details updated successfully',
      data: enquiry,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete or cancel enquiry
 * @route DELETE /api/enquiries/:id
 * @access Private
 */
const deleteEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found',
        data: null,
        errors: ['Enquiry not found']
      });
    }

    // Ensure users can only delete/cancel their own enquiries, while admins can delete any
    if (req.user && enquiry.user && enquiry.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: cannot delete other users enquiries',
        data: null,
        errors: ['Forbidden']
      });
    }

    await Enquiry.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Enquiry cancelled/deleted successfully',
      data: {},
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEnquiries,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry
};
