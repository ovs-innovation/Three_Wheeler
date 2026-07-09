const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    city: {
      type: String,
      trim: true,
      default: 'Delhi/NCR'
    },
    vehicleName: {
      type: String,
      required: [true, 'Vehicle model name is required'],
      trim: true
    },
    vehicleId: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      required: [true, 'Enquiry type is required'],
      default: 'Dealer Enquiry'
    },
    message: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['Pending', 'Contacted', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    assignedExecutive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    },
    notes: {
      type: String,
      default: ''
    },
    date: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Enquiry = mongoose.model('Enquiry', enquirySchema);

module.exports = Enquiry;
