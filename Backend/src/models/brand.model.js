const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Brand slug is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    logo: {
      type: String,
      default: ''
    },
    banner: {
      type: String,
      default: ''
    },
    country: {
      type: String,
      trim: true,
      default: 'India'
    },
    description: {
      type: String,
      default: ''
    },
    marketShare: {
      type: String,
      default: '0%'
    },
    rating: {
      type: Number,
      default: 4.0
    },
    established: {
      type: Number
    },
    origin: {
      type: String,
      trim: true
    },
    seoTitle: {
      type: String,
      default: ''
    },
    seoDescription: {
      type: String,
      default: ''
    },
    seoKeywords: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;
