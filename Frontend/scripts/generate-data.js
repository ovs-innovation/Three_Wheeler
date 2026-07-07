const fs = require('fs');
const path = require('path');

// Ensure output directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 1. GENERATE BRANDS
const BRANDS = [
  { id: 'bajaj', name: 'Bajaj', logo: '/images/brands/bajaj.png', description: 'India\'s pioneer in three-wheelers, renowned for reliability and the iconic RE series.', marketShare: '35%', rating: 4.8, established: 1945, origin: 'Pune, India' },
  { id: 'piaggio', name: 'Piaggio', logo: '/images/brands/piaggio.png', description: 'Italian heritage meets Indian transport. Famous for the powerful Ape cargo and passenger series.', marketShare: '28%', rating: 4.7, established: 1999, origin: 'Baramati, India' },
  { id: 'mahindra', name: 'Mahindra', logo: '/images/brands/mahindra.png', description: 'Leading the EV revolution in three-wheelers with the Treo range and robust Alfa diesel series.', marketShare: '20%', rating: 4.7, established: 1945, origin: 'Mumbai, India' },
  { id: 'tvs', name: 'TVS', logo: '/images/brands/tvs.png', description: 'Renowned for the TVS King series, offering superior comfort, durability, and mileage.', marketShare: '8%', rating: 4.5, established: 1978, origin: 'Hosur, India' },
  { id: 'atul-auto', name: 'Atul Auto', logo: '/images/brands/atul.png', description: 'A reliable name in cargo and passenger auto-rickshaws, offering robust metal bodies and high payloads.', marketShare: '5%', rating: 4.4, established: 1986, origin: 'Rajkot, India' },
  { id: 'yc-electric', name: 'YC Electric', logo: '/images/brands/yc.png', description: 'One of India\'s largest selling electric rickshaw brands, highly popular in Northern India.', marketShare: '2%', rating: 4.3, established: 2014, origin: 'Delhi, India' },
  { id: 'altigreen', name: 'Altigreen', logo: '/images/brands/altigreen.png', description: 'Pioneers in high-performance electric cargo three-wheelers built for heavy utility.', marketShare: '1%', rating: 4.6, established: 2013, origin: 'Bengaluru, India' },
  { id: 'euler-motors', name: 'Euler Motors', logo: '/images/brands/euler.png', description: 'Makers of Euler HiLoad EV, India\'s highest payload-carrying cargo electric three-wheeler.', marketShare: '1%', rating: 4.8, established: 2018, origin: 'New Delhi, India' },
  { id: 'omega-seiki', name: 'Omega Seiki', logo: '/images/brands/omega.png', description: 'Rage series cargo and passenger EVs designed for smart city logistics.', marketShare: '0.8%', rating: 4.3, established: 2018, origin: 'Faridabad, India' },
  { id: 'kinetic-green', name: 'Kinetic Green', logo: '/images/brands/kinetic.png', description: 'Pioneering green mobility with passenger and cargo e-rickshaws and e-autos.', marketShare: '0.7%', rating: 4.2, established: 2016, origin: 'Pune, India' },
  { id: 'lohia', name: 'Lohia Auto', logo: '/images/brands/lohia.png', description: 'Reliable range of Humrahi passenger e-rickshaws and Narain cargo vehicles.', marketShare: '0.5%', rating: 4.1, established: 2008, origin: 'Noida, India' },
  { id: 'saera', name: 'Saera Electric', logo: '/images/brands/saera.png', description: 'Makers of Mayuri e-rickshaws, providing clean and affordable passenger transport.', marketShare: '0.5%', rating: 4.2, established: 2011, origin: 'Gurugram, India' },
  { id: 'montra-electric', name: 'Montra Electric', logo: '/images/brands/montra.png', description: 'A brand by Tube Investments (Murugappa Group) redefining premium electric three-wheelers.', marketShare: '0.5%', rating: 4.7, established: 2022, origin: 'Chennai, India' },
  { id: 'terra-motors', name: 'Terra Motors', logo: '/images/brands/terra.png', description: 'Japanese EV brand focusing on quality design and long-lasting battery packs.', marketShare: '0.4%', rating: 4.2, established: 2010, origin: 'Tokyo / Kolkata' },
  { id: 'mini-metro', name: 'Mini Metro', logo: '/images/brands/minimetro.png', description: 'Cost-effective cargo loaders and e-rickshaws widely used in tier-2 and tier-3 cities.', marketShare: '0.4%', rating: 4.0, established: 2014, origin: 'Meerut, India' },
  { id: 'saarthi', name: 'Saarthi', logo: '/images/brands/saarthi.png', description: 'Sturdy passenger and loader e-rickshaws by Yatri Auto India.', marketShare: '0.3%', rating: 4.1, established: 2015, origin: 'Gurugram, India' },
  { id: 'city-life', name: 'City Life', logo: '/images/brands/citylife.png', description: 'Durable and highly customizable passenger electric rickshaws.', marketShare: '0.3%', rating: 4.0, established: 2013, origin: 'Kolkata, India' },
  { id: 'jezza', name: 'Jezza Motors', logo: '/images/brands/jezza.png', description: 'Offering high-efficiency battery management systems and durable body structures.', marketShare: '0.2%', rating: 4.2, established: 2014, origin: 'Kolkata, India' },
  { id: 'mahindra-electric', name: 'Mahindra Electric', logo: '/images/brands/mahindra-ev.png', description: 'Dedicated electric vehicle wing of Mahindra & Mahindra.', marketShare: '18%', rating: 4.8, established: 2010, origin: 'Bengaluru, India' },
  { id: 'kinetic', name: 'Kinetic', logo: '/images/brands/kinetic-old.png', description: 'Legendary Indian brand with modern green solutions for public transport.', marketShare: '0.5%', rating: 4.1, established: 1972, origin: 'Pune, India' }
];

// 2. GENERATE VEHICLES (150+)
const FUEL_TYPES = ['CNG', 'LPG', 'Electric', 'Diesel', 'Petrol'];
const CATEGORIES = [
  'Passenger Auto', 
  'Cargo Auto', 
  'Electric Auto', 
  'Electric Cargo', 
  'LPG Auto', 
  'CNG Auto', 
  'Diesel Cargo', 
  'Petrol Auto', 
  'Mini Cargo', 
  'Loader Auto', 
  'Pickup Three Wheeler', 
  'Last Mile Delivery'
];

const STATES_DEALERS = [
  'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Bihar', 'West Bengal', 'Gujarat', 'Rajasthan', 'Madhya Pradesh', 'Punjab', 'Haryana', 'Andhra Pradesh', 'Telangana', 'Kerala'
];

// Seed lists to make realistic names
const ADJECTIVES = ['RE', 'Maxima', 'Ape DX', 'Ape City', 'Treo', 'Alfa', 'King', 'Elite', 'Gemini', 'HiLoad', 'neEV', 'Rage+', 'Humrahi', 'Mayuri', 'Super', 'E-Alfa', 'Zor', 'Dlx', 'Smart', 'Pro', 'Plus', 'Ultra', 'Giga', 'Classic', 'Power', 'Grand', 'Champion', 'Loader', 'Carrier', 'Ryder', 'Tough', 'Strong', 'Eco', 'Star', 'Supreme'];
const SUFFIXES = ['CNG', 'LPG', 'Diesel', 'Petrol', 'EV', 'Electric', 'HD', 'LD', 'Z', 'X', '500', '600', '800', '1000', 'Li-Ion', 'Smart', '2.0', 'BS6', 'Eco', 'Cargo', 'Passenger'];

function getRealisticSpecs(brand, category, fuel) {
  let minPrice = 120000;
  let maxPrice = 280000;
  let payload = 'N/A';
  let mileage = 'N/A';
  let range = 'N/A';
  let chargingTime = 'N/A';
  let topSpeed = '35 km/h';
  let battery = 'N/A';
  let engine = 'N/A';
  let motor = 'N/A';
  let warranty = '1 Year / 12,000 km';
  let seating = 'D + 3 Passenger';

  const isElectric = fuel === 'Electric' || category.includes('Electric') || category.includes('EV');

  if (category.includes('Cargo') || category.includes('Loader') || category.includes('Pickup')) {
    seating = 'Driver Only';
    payload = Math.floor(Math.random() * 500) + 400 + ' kg'; // 400kg to 900kg
  } else {
    seating = Math.random() > 0.8 ? 'D + 4 Passenger' : 'D + 3 Passenger';
  }

  if (isElectric) {
    minPrice = 180000;
    maxPrice = 420000;
    range = Math.floor(Math.random() * 70) + 80 + ' km/charge'; // 80km to 150km
    chargingTime = (Math.random() * 2 + 3).toFixed(1) + ' Hours'; // 3 to 5 hours
    battery = (Math.random() * 6 + 6).toFixed(1) + ' kWh Lithium-ion';
    motor = (Math.random() * 6 + 3).toFixed(1) + ' kW BLDC';
    topSpeed = Math.floor(Math.random() * 20) + 35 + ' km/h'; // 35 to 55 km/h
    warranty = '3 Years / 80,000 km';
  } else {
    // ICE Engines
    topSpeed = Math.floor(Math.random() * 20) + 45 + ' km/h'; // 45 to 65 km/h
    if (fuel === 'Diesel') {
      minPrice = 240000;
      maxPrice = 360000;
      engine = Math.floor(Math.random() * 150) + 350 + ' cc Direct Injection';
      mileage = Math.floor(Math.random() * 10) + 25 + ' km/l';
      warranty = '2 Years / 50,000 km';
    } else if (fuel === 'CNG') {
      minPrice = 190000;
      maxPrice = 290000;
      engine = Math.floor(Math.random() * 100) + 180 + ' cc DTS-i Engine';
      mileage = Math.floor(Math.random() * 15) + 35 + ' km/kg';
      warranty = '3 Years / 1,00,000 km';
    } else if (fuel === 'LPG') {
      minPrice = 170000;
      maxPrice = 250000;
      engine = Math.floor(Math.random() * 100) + 180 + ' cc Spark Ignition';
      mileage = Math.floor(Math.random() * 10) + 28 + ' km/kg';
      warranty = '2 Years / 40,000 km';
    } else {
      // Petrol
      minPrice = 160000;
      maxPrice = 230000;
      engine = Math.floor(Math.random() * 100) + 150 + ' cc Engine';
      mileage = Math.floor(Math.random() * 8) + 22 + ' km/l';
      warranty = '2 Years / 30,000 km';
    }
  }

  // Adjust prices for premium brands
  if (['euler-motors', 'altigreen', 'mahindra-electric'].includes(brand)) {
    minPrice += 50000;
    maxPrice += 80000;
  }

  const price = Math.floor(Math.random() * (maxPrice - minPrice) + minPrice);
  const emi = Math.floor(price * 0.024); // Estimated monthly EMI

  return { price, emi, payload, mileage, range, chargingTime, topSpeed, battery, engine, motor, warranty, seating };
}

const VEHICLES = [];
let idCounter = 1;

BRANDS.forEach(brand => {
  // We want to generate around 7 to 8 models per brand to get 150+ total
  const count = brand.id === 'bajaj' || brand.id === 'piaggio' || brand.id === 'mahindra' ? 10 : 7;
  
  for (let i = 0; i < count; i++) {
    // Select category and fuel logically based on brand characteristics
    let fuel = 'Electric';
    let category = 'Electric Auto';

    if (['bajaj', 'piaggio', 'tvs', 'atul-auto'].includes(brand.id)) {
      const fuels = ['CNG', 'Diesel', 'LPG', 'Petrol', 'Electric'];
      fuel = fuels[i % fuels.length];
      const isCargo = i % 2 === 0;
      if (fuel === 'Electric') {
        category = isCargo ? 'Electric Cargo' : 'Electric Auto';
      } else {
        category = isCargo ? 'Cargo Auto' : 'Passenger Auto';
      }
    } else {
      // EV only brands
      fuel = 'Electric';
      const isCargo = i % 2 === 0;
      category = isCargo ? 'Electric Cargo' : 'Electric Auto';
    }

    const adj = ADJECTIVES[(brand.name.length + i) % ADJECTIVES.length];
    const sfx = SUFFIXES[(brand.name.length * i + 3) % SUFFIXES.length];
    const name = `${brand.name} ${adj} ${sfx}`;
    const vehicleId = `${brand.id}-${adj.toLowerCase()}-${sfx.toLowerCase()}-${i}`.replace(/\s+/g, '-').replace(/\+/g, '').toLowerCase();

    const specs = getRealisticSpecs(brand.id, category, fuel);

    const vehicle = {
      id: vehicleId,
      name: name,
      brandId: brand.id,
      brandName: brand.name,
      category: category,
      fuelType: fuel,
      priceMin: specs.price,
      priceMax: Math.floor(specs.price * 1.08),
      emi: specs.emi,
      rating: (Math.random() * 0.8 + 4.0).toFixed(1),
      reviewsCount: Math.floor(Math.random() * 120) + 15,
      // Key specs
      mileage: specs.mileage,
      payloadCapacity: specs.payload,
      batteryRange: specs.range,
      chargingTime: specs.chargingTime,
      topSpeed: specs.topSpeed,
      motorPower: specs.motor,
      engineCapacity: specs.engine,
      batteryCapacity: specs.battery,
      warranty: specs.warranty,
      seatingCapacity: specs.seating,
      // Additional specs
      groundClearance: Math.floor(Math.random() * 30) + 155 + ' mm',
      turningRadius: (Math.random() * 0.6 + 2.5).toFixed(1) + ' m',
      maintenanceCost: '₹' + (Math.floor(Math.random() * 1000) + 500) + ' / Month',
      runningCost: '₹' + (Math.random() * 2 + 0.5).toFixed(2) + ' / km',
      dimensions: `${Math.floor(Math.random()*200)+2600} x ${Math.floor(Math.random()*100)+1300} x ${Math.floor(Math.random()*100)+1700} mm`,
      gradeability: Math.floor(Math.random() * 8) + 12 + ' Degrees',
      transmission: fuel === 'Electric' ? 'Automatic / Direct Drive' : 'Constant Mesh 4-Speed Manual',
      brakes: 'Hydraulic Drum Brakes (Front & Rear)',
      suspension: 'Helical Coil Spring with Dampers',
      tyres: '4.00 - 8, 4PR or 6PR',
      fuelTank: fuel === 'Electric' ? 'N/A' : (fuel === 'CNG' ? '30 Litres (Gas Water Equivalent)' : '8 Litres (Petrol/Diesel)'),
      pros: [
        'Excellent cabin ergonomics and driver comfort',
        'Strong payload capability suited for commercial weights',
        'Widely distributed service networks across rural & urban India',
        fuel === 'Electric' ? 'Very low running cost compared to diesel/CNG' : 'Proven fuel economy with robust engine life'
      ],
      cons: [
        fuel === 'Electric' ? 'Initial acquisition cost is higher than petrol autos' : 'Slightly higher noise and vibration levels (NVH)',
        'Resale value heavily dependent on city permit transfers',
        fuel === 'Electric' ? 'Public fast charging network is still growing' : 'Strict enforcement of green-fuel permits in major tier-1 cities'
      ],
      images: [
        `/images/vehicles/${brand.id}-main.jpg`,
        `/images/vehicles/${brand.id}-angle2.jpg`,
        `/images/vehicles/${brand.id}-interior.jpg`,
        `/images/vehicles/${brand.id}-chassis.jpg`
      ],
      expertReview: `The ${name} is a highly dependable commercial three-wheeler tailored perfectly for Indian road conditions and cargo/passenger demands. During our test drive, we found the structural chassis rigid and well-balanced. Its gradeability handles steep city flyovers with a full payload of ${specs.payload} with ease. If you are looking to maximize business profit margins through low running costs, this vehicle makes an exceptional commercial investment.`,
      userReviews: [
        { name: 'Rajesh Kumar', role: 'Fleet Owner, Patna', rating: 5, date: '2026-05-12', comment: 'Excellent mileage. I have bought 5 of these for my transport business and my drivers are very happy.' },
        { name: 'Sanjay Sawant', role: 'Auto Rickshaw Driver, Pune', rating: 4, date: '2026-04-20', comment: 'Very comfortable seat. Customers also choose my auto because of extra leg space. Maintenance is cheap.' },
        { name: 'Amit Verma', role: 'E-commerce Delivery Fleet, Noida', rating: 4, date: '2026-06-02', comment: 'Battery range is accurate. We get around 110 km with full load. Charging is fast enough at night.' }
      ]
    };

    VEHICLES.push(vehicle);
  }
});

// 3. GENERATE NEWS ARTICLES (80+)
const NEWS = [];
const newsCategories = ['Commercial Vehicle News', 'Electric Vehicle News', 'Government Policies', 'Business Updates', 'Launches', 'Industry Reports'];
const citiesList = ['Delhi', 'Mumbai', 'Chennai', 'Bengaluru', 'Kolkata', 'Hyderabad', 'Pune', 'Lucknow', 'Ahmedabad', 'Patna'];

for (let i = 1; i <= 82; i++) {
  const category = newsCategories[i % newsCategories.length];
  const brand = BRANDS[i % BRANDS.length];
  const city = citiesList[i % citiesList.length];
  
  let title = '';
  let content = '';

  if (category === 'Electric Vehicle News') {
    title = `Electric Three-Wheeler Sales Surge by ${15 + (i % 30)}% in ${city} Amid High CNG Prices`;
    content = `Electric three-wheelers are experiencing unprecedented demand in ${city} as operating costs for CNG autos climb. Logistics fleet operators are switching over 60% of their new acquisitions to commercial EVs. Leading makers like Mahindra Electric, Altigreen, and Piaggio have reported waiting periods of up to 4 weeks. Fleet owners are citing a substantial increase in monthly savings.`;
  } else if (category === 'Government Policies') {
    title = `Government Announces FAME III Guidelines with Dedicated Incentives for Cargo Three-Wheelers`;
    content = `The Ministry of Heavy Industries has unveiled the draft guidelines for the FAME III subsidy program. Under the new program, electric three-wheelers (both passenger and cargo loaders) will qualify for direct subsidies ranging from ₹25,000 to ₹50,000 depending on battery size. This policy is set to accelerate last-mile delivery transitions to clean fuels over the next three fiscal years.`;
  } else if (category === 'Launches') {
    title = `${brand.name} Launches All-New High Payload Three-Wheeler at ₹${(2.2 + (i % 3) * 0.4).toFixed(2)} Lakh`;
    content = `${brand.name} has formally introduced its latest commercial offering tailored for logistics companies in India. The new model comes equipped with a certified payload capacity of ${500 + (i % 5) * 100} kg and enhanced driver cabin features including digital instrument clusters, telematics, and a reinforced dual-wishbone chassis suspension system.`;
  } else {
    title = `How Auto Drivers in ${city} are Maximizing Profits with the New ${brand.name} Rickshaws`;
    content = `Drivers operating ${brand.name} vehicles in ${city} report an average daily increase in earnings by up to 30%. The brand\'s new fuel-injected engine tech has optimized CNG consumption while reducing routine maintenance intervals. Dealerships are offering aggressive finance schemes with down payments as low as ₹19,999.`;
  }

  NEWS.push({
    id: `news-${i}`,
    title: title,
    category: category,
    image: `/images/news/news-${(i % 5) + 1}.jpg`,
    date: new Date(Date.now() - (i * 2) * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // dynamic older dates
    author: ['Srinivasan Iyer', 'Preeti Sharma', 'Rohan Mehta', 'Vikram Aditya'][i % 4],
    readTime: `${Math.floor(Math.random() * 4) + 3} min read`,
    summary: title + '. This comprehensive industry update details the market movements, sales metrics, and commercial impacts across India.',
    content: content + `\n\nAccording to industry analysts, this trend will continue to shape the micro-logistics environment. The cost comparison shows that EVs operate at just ₹0.80 per km, compared to CNG at ₹2.20 per km and Diesel at ₹3.80 per km. Dealership networks are adding robust charging docks and fast-swapping battery options to handle commercial logistics fleet uptimes. Major retail and e-commerce companies are mandating 100% EV utilization for urban deliveries by next year.`
  });
}

// 4. GENERATE BLOGS (80+)
const BLOGS = [];
const blogCategories = ['Buying Guides', 'Maintenance Tips', 'Commercial Business', 'EV Ownership', 'Government Subsidies', 'Transport Tips', 'Last Mile Delivery', 'Profitability Guides'];

for (let i = 1; i <= 85; i++) {
  const category = blogCategories[i % blogCategories.length];
  const brand = BRANDS[i % BRANDS.length];
  let title = '';
  let content = '';

  if (category === 'Buying Guides') {
    title = `CNG vs Electric Auto Rickshaw: Which is the Best Business Choice in 2026?`;
    content = `Choosing between a CNG and an electric auto-rickshaw is one of the most critical decisions for a transport business today. This detailed comparison breaks down the upfront purchase costs, permit availability, charging vs fueling times, and long-term resale valuations of both models to help you select the ideal three-wheeler for your city route.`;
  } else if (category === 'Maintenance Tips') {
    title = `10 Crucial Maintenance Tips to Double Your Three-Wheeler's Engine Life`;
    content = `Commercial three-wheelers run under strenuous payloads and heavy traffic daily. To prevent costly breakdowns and maintain high fuel mileage, drivers must perform routine inspections. Learn the best practices for gear oil changes, clean spark plug spacing, tyre rotations, and brake cylinder checks that will keep your vehicle running smoothly.`;
  } else if (category === 'Profitability Guides') {
    title = `How to Start a Last-Mile Delivery Business with Three Cargo Loaders`;
    content = `The e-commerce boom in India has created an immense demand for secondary local distribution. Starting a micro-logistics business with a fleet of three cargo loaders is highly profitable. We present a detailed budget blueprint, covering vehicle financing, driver hiring, tie-ups with e-commerce portals, and route optimization.`;
  } else {
    title = `Understanding FAME Subsidies and State EV Road-Tax Waivers in India`;
    content = `Navigating electric vehicle subsidies can be confusing. This guide outlines how you can claim state-level EV incentives, obtain complete road tax exemptions, and leverage commercial vehicle loans with subsidized interest rates for buying electric loaders and passenger rickshaws.`;
  }

  BLOGS.push({
    id: `blog-${i}`,
    title: title,
    category: category,
    image: `/images/blogs/blog-${(i % 5) + 1}.jpg`,
    date: new Date(Date.now() - (i * 3) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    author: ['Harpreet Singh', 'Manish Gupta', 'Venkatesh Prasad', 'Ramesh Shah'][i % 4],
    readTime: `${Math.floor(Math.random() * 5) + 4} min read`,
    summary: title + '. Read our detailed commercial vehicle analysis containing tips, tables, and guides to maximize your transport operations.',
    content: content + `\n\nTo make a successful career out of driving or managing commercial cargo logistics, managing costs is key. Electric loaders like the Euler HiLoad or Mahindra Zor Grand offer superior battery ranges that support multi-trip routines, while classics like Bajaj RE CNG offer universal parts availability. We recommend getting quotes from at least three local dealers and opting for a minimum of 3 years of extended warranty on the battery or drivetrain to protect your commercial capital investment.`
  });
}

// 5. GENERATE FAQS (50+)
const FAQS = [];
const faqSubjects = ['Finance & Loan', 'Electric Vehicles', 'CNG & LPG Autos', 'Permits & Registration', 'Maintenance & Warranty'];

for (let i = 1; i <= 52; i++) {
  const subject = faqSubjects[i % faqSubjects.length];
  let question = '';
  let answer = '';

  if (subject === 'Finance & Loan') {
    question = `What documents are required to secure a commercial three-wheeler loan?`;
    answer = `To apply for a commercial auto loan, you typically need: 1. Aadhaar Card and PAN Card for identity proof. 2. Address proof (Utility bills or rent agreement). 3. Bank statements for the last 6 months. 4. Driver's badge/commercial driving license. 5. Income proof or previous vehicle ownership details (if applicable). Most commercial vehicle lenders like SBI, Cholamandalam Finance, and HDFC provide up to 90% funding.`;
  } else if (subject === 'Electric Vehicles') {
    question = `How long does an electric three-wheeler battery pack last before needing replacement?`;
    answer = `Most modern electric three-wheelers utilize Lithium-ion battery packs with LFP (Lithium Iron Phosphate) chemistry. These batteries typically last for 1,500 to 2,000 charge cycles, which translates to roughly 5 to 7 years of daily usage under standard operations. Manufacturers usually offer a 3-year or 80,000-km warranty on the battery.`;
  } else if (subject === 'CNG & LPG Autos') {
    question = `Is it safe to run a passenger auto-rickshaw on LPG compared to CNG?`;
    answer = `Yes, both CNG and LPG are completely safe when using factory-fitted kits approved by the ARAI (Automotive Research Association of India). CNG operates at higher pressures but disperses rapidly in the air in case of leaks, while LPG is liquid under pressure and provides slightly better torque. Regular safety inspections of the cylinder valves are mandatory every 3 years.`;
  } else if (subject === 'Permits & Registration') {
    question = `How can I transfer a commercial passenger auto permit to another state or driver?`;
    answer = `Permit transfer requires applying to the local RTO (Regional Transport Office) using Form 29 and Form 30, along with a No Objection Certificate (NOC) from the financier if the auto is on loan. The buyer must possess a valid commercial badge and commercial driving license. The transfer fee varies by state and municipal corporative rules.`;
  } else {
    question = `What is the warranty coverage on the drivetrain of a commercial loader auto?`;
    answer = `For diesel and CNG cargo loaders, manufacturers usually offer a warranty of 1 to 2 years or 50,000 km. For electric cargo loaders, warranties are typically longer, spanning 3 years or 80,000 km to 1,00,000 km on both the traction motor, controller, and battery pack. Always check if the warranty covers water ingress.`;
  }

  FAQS.push({
    id: `faq-${i}`,
    question: `${i}. ${question}`,
    answer: answer,
    category: subject
  });
}

// 6. GENERATE DEALERS (20+)
const DEALERS = [];
const dealerNames = [
  'Sri Vinayaka Auto Agencies', 'Shree Balaji Commercial Motors', 'Apex Auto Distributors', 'Sai Ram Motors', 
  'Ganga Three Wheeler Emporium', 'Vanguard EV Logistics Hub', 'Karan Automobile Solutions', 'Metro Commercials',
  'Pioneer Cargo Motors', 'Narmada Green Wheels', 'Elite Passenger Rickshaw Point', 'Saraswati E-Motors',
  'Jai Hind Auto Traders', 'United Logistics Wheels', 'Royal Three Wheeler Hub', 'Krishna Commercial Vehicles',
  'Kolkata E-Rickshaw Point', 'Chola Green Transports', 'Deccan Motors Group', 'Northern Auto Agency'
];

for (let i = 0; i < 24; i++) {
  const name = dealerNames[i % dealerNames.length];
  const state = STATES_DEALERS[i % STATES_DEALERS.length];
  
  const citiesMap = {
    'Delhi': ['New Delhi', 'Rohini', 'Okhla'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur'],
    'Karnataka': ['Bengaluru', 'Mysuru', 'Hubli'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Noida', 'Varanasi'],
    'Bihar': ['Patna', 'Muzaffarpur', 'Gaya'],
    'West Bengal': ['Kolkata', 'Howrah', 'Siliguri'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur'],
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior'],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar'],
    'Haryana': ['Gurugram', 'Faridabad', 'Panipat'],
    'Andhra Pradesh': ['Vijayawada', 'Visakhapatnam'],
    'Telangana': ['Hyderabad', 'Warangal'],
    'Kerala': ['Kochi', 'Trivandrum', 'Kozhikode']
  };

  const cities = citiesMap[state] || ['Central City'];
  const city = cities[i % cities.length];

  const brandIds = [BRANDS[i % BRANDS.length].id, BRANDS[(i + 3) % BRANDS.length].id, BRANDS[(i + 7) % BRANDS.length].id];
  const brandsHandled = BRANDS.filter(b => brandIds.includes(b.id)).map(b => b.name);

  DEALERS.push({
    id: `dealer-${i + 1}`,
    name: name,
    state: state,
    city: city,
    address: `Plot No. ${45 + i * 8}, Sector ${i + 2}, Industrial Area, ${city}, ${state} - ${110000 + i * 115}`,
    phone: `+91 98765 ${54321 - i * 111}`,
    email: `sales@${name.toLowerCase().replace(/\s+/g, '')}.com`,
    brands: brandsHandled,
    services: ['Sales', 'Service', 'Spare Parts', 'Battery Swapping', 'Finance Assistance'],
    mapUrl: `https://maps.google.com/maps?q=${encodeURIComponent(name + ' ' + city)}&t=&z=13&ie=UTF8&iwloc=&output=embed`
  });
}

// Write all generated arrays to individual files
fs.writeFileSync(path.join(dataDir, 'brands.json'), JSON.stringify(BRANDS, null, 2));
fs.writeFileSync(path.join(dataDir, 'vehicles.json'), JSON.stringify(VEHICLES, null, 2));
fs.writeFileSync(path.join(dataDir, 'news.json'), JSON.stringify(NEWS, null, 2));
fs.writeFileSync(path.join(dataDir, 'blogs.json'), JSON.stringify(BLOGS, null, 2));
fs.writeFileSync(path.join(dataDir, 'faqs.json'), JSON.stringify(FAQS, null, 2));
fs.writeFileSync(path.join(dataDir, 'dealers.json'), JSON.stringify(DEALERS, null, 2));

console.log('Successfully generated brands.json (20)');
console.log(`Successfully generated vehicles.json (${VEHICLES.length})`);
console.log(`Successfully generated news.json (${NEWS.length})`);
console.log(`Successfully generated blogs.json (${BLOGS.length})`);
console.log(`Successfully generated faqs.json (${FAQS.length})`);
console.log(`Successfully generated dealers.json (${DEALERS.length})`);
