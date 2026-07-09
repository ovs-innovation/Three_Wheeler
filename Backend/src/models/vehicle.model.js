const mongoose = require('mongoose');

const userReviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: 'Owner' },
  rating: { type: Number, required: true },
  date: { type: String, required: true },
  comment: { type: String, default: '' }
});

const vehicleSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Vehicle name is required'],
      trim: true
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true
    },
    brandId: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    brandName: {
      type: String,
      required: true,
      trim: true
    },
    variant: {
      type: String,
      trim: true,
      default: 'Standard'
    },
    vehicleType: {
      type: String,
      trim: true,
      default: 'Auto Rickshaw'
    },
    cargoPassenger: {
      type: String,
      enum: ['Cargo', 'Passenger', 'Both'],
      default: 'Passenger'
    },
    category: {
      type: String,
      required: true,
      default: 'three-wheeler'
    },
    fuelType: {
      type: String,
      required: true,
      enum: ['CNG', 'LPG', 'Electric', 'Diesel', 'Petrol'],
      default: 'CNG'
    },
    priceMin: {
      type: Number,
      required: true,
      default: 0
    },
    priceMax: {
      type: Number,
      required: true,
      default: 0
    },
    emi: {
      type: Number,
      default: 0
    },
    rating: {
      type: String,
      default: '4.5'
    },
    reviewsCount: {
      type: Number,
      default: 0
    },
    mileage: {
      type: String,
      default: 'N/A'
    },
    payloadCapacity: {
      type: String,
      default: 'N/A'
    },
    batteryRange: {
      type: String,
      default: 'N/A'
    },
    chargingTime: {
      type: String,
      default: 'N/A'
    },
    topSpeed: {
      type: String,
      default: 'N/A'
    },
    motorPower: {
      type: String,
      default: 'N/A'
    },
    engineCapacity: {
      type: String,
      default: 'N/A'
    },
    batteryCapacity: {
      type: String,
      default: 'N/A'
    },
    warranty: {
      type: String,
      default: 'N/A'
    },
    seatingCapacity: {
      type: String,
      default: 'Driver Only'
    },
    groundClearance: {
      type: String,
      default: 'N/A'
    },
    turningRadius: {
      type: String,
      default: 'N/A'
    },
    maintenanceCost: {
      type: String,
      default: 'N/A'
    },
    runningCost: {
      type: String,
      default: 'N/A'
    },
    dimensions: {
      type: String,
      default: 'N/A'
    },
    gradeability: {
      type: String,
      default: 'N/A'
    },
    transmission: {
      type: String,
      default: 'Manual'
    },
    brakes: {
      type: String,
      default: 'N/A'
    },
    suspension: {
      type: String,
      default: 'N/A'
    },
    tyres: {
      type: String,
      default: 'N/A'
    },
    fuelTank: {
      type: String,
      default: 'N/A'
    },
    overview: {
      type: String,
      default: ''
    },
    features: {
      type: [String],
      default: []
    },
    specifications: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    pros: {
      type: [String],
      default: []
    },
    cons: {
      type: [String],
      default: []
    },
    colors: [
      {
        name: { type: String, required: true },
        hex: { type: String, required: true }
      }
    ],
    availableVariants: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true }
      }
    ],
    images: {
      type: [String],
      default: []
    },
    expertReview: {
      type: String,
      default: ''
    },
    userReviews: {
      type: [userReviewSchema],
      default: []
    },
    launchDate: {
      type: String,
      default: ''
    },
    isPopular: {
      type: Boolean,
      default: false
    },
    isLatest: {
      type: Boolean,
      default: false
    },
    isUpcoming: {
      type: Boolean,
      default: false
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['Published', 'Draft'],
      default: 'Published'
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
    brochurePdf: {
      type: String,
      default: ''
    },
    videoUrl: {
      type: String,
      default: ''
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
