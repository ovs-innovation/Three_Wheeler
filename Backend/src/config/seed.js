const fs = require('fs');
const path = require('path');
const Brand = require('../models/brand.model');
const Vehicle = require('../models/vehicle.model');
const News = require('../models/news.model');
const Blog = require('../models/blog.model');
const Admin = require('../models/admin.model');

/**
 * Seed database with mock data if collections are empty
 */
const seedData = async () => {
  try {
    const frontendDataPath = path.join(__dirname, '../../../Frontend/data');

    // 0. Seed Default Admin
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log('MongoDB: Seeding default administrator...');
      await Admin.create({
        name: 'Administrator',
        email: 'admin@threewheeler.com',
        password: 'admin123',
        role: 'superadmin',
        status: 'active'
      });
      console.log('MongoDB: Default administrator seeded (admin@threewheeler.com / admin123) successfully.');
    }

    // 1. Seed Brands
    const brandCount = await Brand.countDocuments();
    if (brandCount === 0) {
      console.log('MongoDB: Seeding Brands collection...');
      const brandsRaw = fs.readFileSync(path.join(frontendDataPath, 'brands.json'), 'utf8');
      const brands = JSON.parse(brandsRaw);
      
      // Adapt frontend brands objects to Mongoose model schema
      const mappedBrands = brands.map(b => ({
        id: b.id,
        name: b.name,
        slug: b.id, // frontend 'id' acts as slug
        logo: b.logo,
        banner: '',
        country: b.origin ? b.origin.split(',').pop().trim() : 'India',
        description: b.description || '',
        marketShare: b.marketShare || '0%',
        rating: b.rating || 4.5,
        established: b.established,
        origin: b.origin,
        status: 'active'
      }));

      await Brand.insertMany(mappedBrands);
      console.log(`MongoDB: Seeded ${mappedBrands.length} Brands successfully.`);
    }

    // 2. Seed Vehicles
    const vehicleCount = await Vehicle.countDocuments();
    if (vehicleCount === 0) {
      console.log('MongoDB: Seeding Vehicles collection (this may take a few seconds)...');
      const vehiclesRaw = fs.readFileSync(path.join(frontendDataPath, 'vehicles.json'), 'utf8');
      const vehicles = JSON.parse(vehiclesRaw);

      // Map frontend keys to model schema
      const mappedVehicles = vehicles.map(v => ({
        id: v.id,
        name: v.name,
        slug: v.id, // use frontend 'id' as slug
        brandId: v.brandId,
        brandName: v.brandName,
        category: 'three-wheeler', // Automatically set category to "three-wheeler"
        variant: 'Standard',
        vehicleType: v.category || 'Auto Rickshaw',
        cargoPassenger: (v.category && v.category.toLowerCase().includes('cargo')) ? 'Cargo' : 'Passenger',
        fuelType: v.fuelType,
        priceMin: v.priceMin || 0,
        priceMax: v.priceMax || 0,
        emi: v.emi || 0,
        rating: v.rating || '4.5',
        reviewsCount: v.reviewsCount || 0,
        mileage: v.mileage || 'N/A',
        payloadCapacity: v.payloadCapacity || 'N/A',
        batteryRange: v.batteryRange || 'N/A',
        chargingTime: v.chargingTime || 'N/A',
        topSpeed: v.topSpeed || 'N/A',
        motorPower: v.motorPower || 'N/A',
        engineCapacity: v.engineCapacity || 'N/A',
        batteryCapacity: v.batteryCapacity || 'N/A',
        warranty: v.warranty || 'N/A',
        seatingCapacity: v.seatingCapacity || 'D + 3 Passenger',
        groundClearance: v.groundClearance || 'N/A',
        turningRadius: v.turningRadius || 'N/A',
        maintenanceCost: v.maintenanceCost || 'N/A',
        runningCost: v.runningCost || 'N/A',
        dimensions: v.dimensions || 'N/A',
        gradeability: v.gradeability || 'N/A',
        transmission: v.transmission || 'Manual',
        brakes: v.brakes || 'N/A',
        suspension: v.suspension || 'N/A',
        tyres: v.tyres || 'N/A',
        fuelTank: v.fuelTank || 'N/A',
        pros: v.pros || [],
        cons: v.cons || [],
        images: v.images || [],
        expertReview: v.expertReview || '',
        userReviews: (v.userReviews || []).map(r => ({
          name: r.name,
          role: r.role || 'Owner',
          rating: r.rating || 5,
          date: r.date || '2026-01-01',
          comment: r.comment || ''
        })),
        status: 'Published',
        isPopular: v.priceMin > 200000 && v.priceMin < 350000,
        isLatest: v.id.includes('petrol') || v.id.includes('electric'),
        isUpcoming: v.id.includes('upcoming') || false,
        isFeatured: v.rating >= 4.7
      }));

      await Vehicle.insertMany(mappedVehicles);
      console.log(`MongoDB: Seeded ${mappedVehicles.length} Vehicles successfully.`);
    }

    // 3. Seed News
    const newsCount = await News.countDocuments();
    if (newsCount === 0) {
      console.log('MongoDB: Seeding News collection...');
      const newsRaw = fs.readFileSync(path.join(frontendDataPath, 'news.json'), 'utf8');
      const news = JSON.parse(newsRaw);
      await News.insertMany(news);
      console.log(`MongoDB: Seeded ${news.length} News articles successfully.`);
    }

    // 4. Seed Blogs
    const blogCount = await Blog.countDocuments();
    if (blogCount === 0) {
      console.log('MongoDB: Seeding Blogs collection...');
      const blogsRaw = fs.readFileSync(path.join(frontendDataPath, 'blogs.json'), 'utf8');
      const blogs = JSON.parse(blogsRaw);
      await Blog.insertMany(blogs);
      console.log(`MongoDB: Seeded ${blogs.length} Blog posts successfully.`);
    }

  } catch (error) {
    console.error('MongoDB Data Seeder Error:', error.message);
  }
};

module.exports = seedData;
