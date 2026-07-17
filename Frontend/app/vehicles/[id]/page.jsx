'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import VehicleImage from '@/components/VehicleCard/VehicleImage';
import VehicleCard from '@/components/VehicleCard/VehicleCard';
import vehiclesData from '@/data/vehicles.json';
import { useApp } from '@/context/AppContext';
import { 
  Heart, RefreshCw, Star, Info, Share2, Shield, 
  MapPin, CheckCircle, XCircle, Award, Battery, 
  Settings, Ruler, Calendar, ArrowLeft, Fuel, Gauge, Layers, Compass
} from 'lucide-react';

export default function VehicleDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const { wishlist, toggleWishlist, compareList, addToCompare, removeFromCompare, location, openEnquiryModal } = useApp();

  const [vehicle, setVehicle] = useState(null);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'features' | 'reviews'
  const [rotationAngle, setRotationAngle] = useState(90); // 360 degree slider
  const [copiedLink, setCopiedLink] = useState(false);

  // EMI Calculator state
  const [downPaymentPct, setDownPaymentPct] = useState(20); // 20% default
  const [loanPeriod, setLoanPeriod] = useState(36); // 36 months
  const [interestRate, setInterestRate] = useState(9.5); // 9.5%

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!id) return;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (apiUrl) {
        try {
          const response = await fetch(`${apiUrl}/vehicles/${id}`);
          const result = await response.json();
          if (result.success && result.data) {
            setVehicle(result.data);
            return;
          }
        } catch (err) {
          console.error('Failed to fetch live vehicle specs, trying fallback static file:', err);
        }
      }

      // Fallback
      const match = vehiclesData.find(v => v.id === id);
      if (match) {
        setVehicle(match);
      }
    };
    fetchVehicle();
  }, [id]);

  if (!vehicle) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
          <h2 className="text-2xl font-black text-brand-dark">Vehicle Profile Not Found</h2>
          <p className="text-xs text-gray-500">The vehicle you are trying to view does not exist in our catalog.</p>
          <Link href="/vehicles" className="inline-block bg-primary text-white text-xs font-bold px-6 py-2.5 rounded-lg">Return to Catalogue &larr;</Link>
        </div>
        <Footer />
      </>
    );
  }

  const isWishlisted = wishlist.includes(vehicle.id);
  const isCompared = compareList.some((v) => v.id === vehicle.id);

  const handleWishlistToggle = () => {
    toggleWishlist(vehicle.id);
  };

  const handleCompareToggle = () => {
    if (isCompared) {
      removeFromCompare(vehicle.id);
    } else {
      if (compareList.length >= 4) {
        alert('Compare list is full (Max 4). Remove an existing vehicle first.');
      } else {
        addToCompare(vehicle);
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: vehicle.name,
        text: `Check out ${vehicle.name} price and specifications on 3Pahia!`,
        url: window.location.href,
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // 360 View representation label helper
  const getAngleLabel = (angle) => {
    if (angle >= 0 && angle < 45) return 'Rear View (0° - 45°)';
    if (angle >= 45 && angle < 135) return 'Side Profile (45° - 135°)';
    if (angle >= 135 && angle < 225) return 'Front View (135° - 225°)';
    if (angle >= 225 && angle < 315) return 'Opposite Profile (225° - 315°)';
    return 'Rear-Angle View (315° - 360°)';
  };

  // Pricing values
  const rtoTax = Math.round(vehicle.priceMin * 0.06);
  const insurance = Math.round(vehicle.priceMin * 0.04);
  const greenSubsidy = vehicle.fuelType === 'Electric' ? 30000 : 0;
  const estimatedOnRoadPrice = vehicle.priceMin + rtoTax + insurance - greenSubsidy;

  // Detailed Loan Math
  const downPaymentAmount = Math.round(vehicle.priceMin * (downPaymentPct / 100));
  const loanAmount = vehicle.priceMin - downPaymentAmount;
  const monthlyRate = (interestRate / 12) / 100;
  const emiNumerator = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanPeriod);
  const emiDenominator = Math.pow(1 + monthlyRate, loanPeriod) - 1;
  const monthlyEmi = Math.round(emiNumerator / emiDenominator);
  const totalAmountPayable = monthlyEmi * loanPeriod;
  const totalInterestPayable = totalAmountPayable - loanAmount;

  // Filter alternatives
  const relatedModels = vehiclesData
    .filter(v => v.id !== vehicle.id && (v.brandId === vehicle.brandId || v.fuelType === vehicle.fuelType))
    .slice(0, 4);

  // JSON-LD Vehicle Schema
  const vehicleSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": vehicle.name,
    "description": vehicle.expertReview,
    "brand": {
      "@type": "Brand",
      "name": vehicle.brandName
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "INR",
      "lowPrice": vehicle.priceMin,
      "highPrice": vehicle.priceMax,
      "offerCount": "1",
      "priceValuedOnly": "true"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": vehicle.rating,
      "reviewCount": vehicle.reviewsCount
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What is the ex-showroom price of ${vehicle.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `The ex-showroom price of ${vehicle.name} ranges between ₹${(vehicle.priceMin/100000).toFixed(2)} Lakh and ₹${(vehicle.priceMax/100000).toFixed(2)} Lakh depending on location and variations.`
        }
      },
      {
        "@type": "Question",
        "name": `What is the warranty coverage on ${vehicle.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `The standard warranty offered on ${vehicle.name} is ${vehicle.warranty}.`
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Header />
      <main className="bg-brand-bg flex-grow min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Breadcrumbs & Top Actions */}
          <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="text-xs text-gray-400 font-medium">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link> &gt;{' '}
              <Link href="/vehicles" className="hover:text-primary transition-colors">Catalogue</Link> &gt;{' '}
              <span className="text-brand-dark font-semibold">{vehicle.name}</span>
            </div>
            <div className="flex items-center space-x-3 text-xs font-bold">
              <button 
                onClick={handleCompareToggle}
                className={`flex items-center gap-1.5 px-4 py-2 border rounded-lg transition-colors ${isCompared ? 'bg-primary border-primary text-white' : 'bg-white hover:bg-gray-50 text-gray-600'}`}
              >
                <RefreshCw className="w-4 h-4" /> {isCompared ? 'Compared' : 'Add to Compare'}
              </button>
              <button 
                onClick={handleWishlistToggle}
                className={`flex items-center gap-1.5 px-4 py-2 border rounded-lg transition-colors ${isWishlisted ? 'bg-primary border-primary text-white' : 'bg-white hover:bg-gray-50 text-gray-600'}`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} /> {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
              </button>
              <button 
                onClick={handleShare}
                className="flex items-center gap-1.5 px-4 py-2 border bg-white hover:bg-gray-50 text-gray-600 rounded-lg relative"
              >
                <Share2 className="w-4 h-4" /> {copiedLink ? 'Link Copied!' : 'Share'}
              </button>
            </div>
          </div>

          {/* Title Header */}
          <div className="bg-white border border-brand-border rounded-xl p-6 mb-8 custom-shadow">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  {vehicle.category}
                </span>
                <h1 className="text-2xl md:text-3xl font-black text-brand-dark mt-1.5 leading-tight">{vehicle.name}</h1>
                <p className="text-xs text-gray-500 mt-1 font-medium">Verify specs and pricing from verified Indian showrooms.</p>
              </div>
              <div className="text-left md:text-right">
                <div className="text-xs text-gray-400 font-bold uppercase">Estimated Ex-Showroom</div>
                <div className="text-2xl md:text-3xl font-black text-brand-dark mt-0.5">
                  ₹{(vehicle.priceMin/100000).toFixed(2)} - {(vehicle.priceMax/100000).toFixed(2)} Lakh*
                </div>
                <span className="text-[10px] text-brand-green font-bold bg-green-50 px-2 py-0.5 rounded inline-block mt-1">EMI Starts at ₹{vehicle.emi.toLocaleString('en-IN')}/mo</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            
            {/* LEFT COLUMN: Gallery & 360 View */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Gallery / Interactive 360 View component */}
              <div className="bg-white border border-brand-border rounded-xl p-6 custom-shadow">
                <h3 className="text-sm font-extrabold text-brand-dark mb-4 flex items-center gap-1.5">
                  <Compass className="w-4.5 h-4.5 text-primary" /> Interactive 360° Exterior View Simulator
                </h3>

                <div className="bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center p-6 relative">
                  {/* Visual representing vehicle rotation using custom dimensions in SVG */}
                  <svg viewBox="0 0 400 220" className="w-3/4 h-auto drop-shadow-lg transition-transform duration-200">
                    <defs>
                      <linearGradient id="360-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={vehicle.fuelType === 'Electric' ? '#06B6D4' : '#10B981'} />
                        <stop offset="100%" stopColor={vehicle.fuelType === 'Electric' ? '#3B82F6' : '#059669'} />
                      </linearGradient>
                      <linearGradient id="tire-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#374151" />
                        <stop offset="100%" stopColor="#111827" />
                      </linearGradient>
                    </defs>

                    {/* Ground shade */}
                    <ellipse cx="200" cy="180" rx={80 + (rotationAngle/10)} ry="10" fill="#E2E8F0" />

                    {/* DYNAMIC BLUEPRINT SVG THAT SHIFTS AS YOU ROTATE SLIDER */}
                    {rotationAngle >= 45 && rotationAngle <= 135 ? (
                      // SIDE VIEW (45 to 135)
                      <g>
                        <rect x="100" y="60" width="180" height="90" rx="4" fill="url(#360-grad)" stroke="#1E293B" strokeWidth="2" />
                        <path d="M220 60 L280 60 L300 95 L300 150 L220 150 Z" fill="#1F2937" stroke="#111827" strokeWidth="2" />
                        <path d="M260 65 L292 95 L292 110 L250 110 Z" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1.5" />
                        {/* Wheels */}
                        <circle cx="140" cy="165" r="22" fill="url(#tire-grad)" stroke="#4B5563" strokeWidth="2" />
                        <circle cx="260" cy="165" r="22" fill="url(#tire-grad)" stroke="#4B5563" strokeWidth="2" />
                        <circle cx="140" cy="165" r="9" fill="#94A3B8" />
                        <circle cx="260" cy="165" r="9" fill="#94A3B8" />
                      </g>
                    ) : rotationAngle > 135 && rotationAngle <= 225 ? (
                      // FRONT VIEW (135 to 225)
                      <g>
                        <rect x="130" y="50" width="140" height="110" rx="10" fill="#1F2937" stroke="#111827" strokeWidth="2" />
                        <rect x="145" y="60" width="110" height="50" rx="3" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1.5" />
                        {/* Dual Headlights */}
                        <circle cx="160" cy="130" r="10" fill="#FDE047" className="animate-pulse" />
                        <circle cx="240" cy="130" r="10" fill="#FDE047" className="animate-pulse" />
                        {/* Front Single Wheel */}
                        <rect x="190" y="150" width="20" height="34" rx="4" fill="url(#tire-grad)" stroke="#4B5563" strokeWidth="2" />
                        {/* Brand Label */}
                        <rect x="175" y="115" width="50" height="8" rx="2" fill="url(#360-grad)" />
                        <text x="200" y="121" fontSize="5" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">{vehicle.brandName.toUpperCase()}</text>
                      </g>
                    ) : rotationAngle > 225 && rotationAngle <= 315 ? (
                      // OPPOSITE SIDE PROFILE (225 to 315)
                      <g>
                        <rect x="120" y="60" width="180" height="90" rx="4" fill="url(#360-grad)" stroke="#1E293B" strokeWidth="2" />
                        <path d="M180 60 L120 60 L100 95 L100 150 L180 150 Z" fill="#1F2937" stroke="#111827" strokeWidth="2" />
                        <path d="M140 65 L108 95 L108 110 L150 110 Z" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1.5" />
                        {/* Wheels */}
                        <circle cx="140" cy="165" r="22" fill="url(#tire-grad)" stroke="#4B5563" strokeWidth="2" />
                        <circle cx="260" cy="165" r="22" fill="url(#tire-grad)" stroke="#4B5563" strokeWidth="2" />
                        <circle cx="140" cy="165" r="9" fill="#94A3B8" />
                        <circle cx="260" cy="165" r="9" fill="#94A3B8" />
                      </g>
                    ) : (
                      // REAR VIEW (0-45 & 315-360)
                      <g>
                        <rect x="130" y="55" width="140" height="105" rx="4" fill="url(#360-grad)" stroke="#111827" strokeWidth="2" />
                        {/* Cargo door lines or tail lamps */}
                        <line x1="200" y1="55" x2="200" y2="160" stroke="#111827" strokeWidth="1.5" />
                        <rect x="140" y="130" width="15" height="8" rx="1" fill="#EF4444" />
                        <rect x="245" y="130" width="15" height="8" rx="1" fill="#EF4444" />
                        {/* Dual Wheels showing slightly */}
                        <rect x="145" y="150" width="18" height="30" rx="3" fill="url(#tire-grad)" stroke="#4B5563" strokeWidth="1.5" />
                        <rect x="237" y="150" width="18" height="30" rx="3" fill="url(#tire-grad)" stroke="#4B5563" strokeWidth="1.5" />
                      </g>
                    )}
                  </svg>

                  {/* Active view tag label */}
                  <span className="absolute bottom-3 bg-gray-900 text-white font-extrabold text-[10px] uppercase px-3 py-1 rounded-full shadow border border-gray-800 tracking-wider">
                    {getAngleLabel(rotationAngle)}
                  </span>
                </div>

                {/* Interactive Slider Input */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-gray-500">
                    <span>0° Rear</span>
                    <span className="text-primary font-black animate-pulse">← Drag slider to spin vehicle 360° →</span>
                    <span>360° Rear</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={rotationAngle}
                    onChange={(e) => setRotationAngle(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>

              {/* Specs and Features Tabs Container */}
              <div className="bg-white border border-brand-border rounded-xl overflow-hidden custom-shadow">
                
                {/* Tab Header list */}
                <div className="flex border-b text-xs md:text-sm font-bold bg-gray-50">
                  <button 
                    onClick={() => setActiveTab('specs')}
                    className={`flex-1 py-4 text-center border-b-2 transition-all ${activeTab === 'specs' ? 'border-primary text-primary bg-white font-black' : 'border-transparent text-gray-500 hover:text-brand-dark'}`}
                  >
                    Technical Specifications
                  </button>
                  <button 
                    onClick={() => setActiveTab('features')}
                    className={`flex-1 py-4 text-center border-b-2 transition-all ${activeTab === 'features' ? 'border-primary text-primary bg-white font-black' : 'border-transparent text-gray-500 hover:text-brand-dark'}`}
                  >
                    Key Features
                  </button>
                  <button 
                    onClick={() => setActiveTab('reviews')}
                    className={`flex-1 py-4 text-center border-b-2 transition-all ${activeTab === 'reviews' ? 'border-primary text-primary bg-white font-black' : 'border-transparent text-gray-500 hover:text-brand-dark'}`}
                  >
                    Reviews ({vehicle.reviewsCount})
                  </button>
                </div>

                {/* Tab Content Box */}
                <div className="p-6">
                  
                  {activeTab === 'specs' && (
                    <div className="space-y-4">
                      {/* Subdivided Spec tables */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Settings className="w-3.5 h-3.5 text-primary" /> Engine & Transmission</h4>
                          <table className="w-full text-xs text-brand-dark">
                            <tbody className="divide-y divide-gray-100">
                              {vehicle.fuelType !== 'Electric' ? (
                                <>
                                  <tr className="py-2"><td className="text-gray-400 font-bold py-1.5">Engine Capacity</td><td className="font-extrabold py-1.5 text-right">{vehicle.engineCapacity}</td></tr>
                                  <tr className="py-2"><td className="text-gray-400 font-bold py-1.5">Fuel Tank Volume</td><td className="font-extrabold py-1.5 text-right">{vehicle.fuelTank}</td></tr>
                                </>
                              ) : (
                                <>
                                  <tr className="py-2"><td className="text-gray-400 font-bold py-1.5">Motor Power</td><td className="font-extrabold py-1.5 text-right">{vehicle.motorPower}</td></tr>
                                  <tr className="py-2"><td className="text-gray-400 font-bold py-1.5">Battery Capacity</td><td className="font-extrabold py-1.5 text-right">{vehicle.batteryCapacity}</td></tr>
                                  <tr className="py-2"><td className="text-gray-400 font-bold py-1.5">Charging Time</td><td className="font-extrabold py-1.5 text-right">{vehicle.chargingTime}</td></tr>
                                </>
                              )}
                              <tr className="py-2"><td className="text-gray-400 font-bold py-1.5">Transmission</td><td className="font-extrabold py-1.5 text-right">{vehicle.transmission}</td></tr>
                              <tr className="py-2"><td className="text-gray-400 font-bold py-1.5">Top Speed</td><td className="font-extrabold py-1.5 text-right">{vehicle.topSpeed}</td></tr>
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Ruler className="w-3.5 h-3.5 text-primary" /> Chassis & Payload</h4>
                          <table className="w-full text-xs text-brand-dark">
                            <tbody className="divide-y divide-gray-100">
                              <tr className="py-2"><td className="text-gray-400 font-bold py-1.5">Body Layout Dimensions</td><td className="font-extrabold py-1.5 text-right">{vehicle.dimensions}</td></tr>
                              <tr className="py-2"><td className="text-gray-400 font-bold py-1.5">Payload Weight Limit</td><td className="font-extrabold py-1.5 text-right">{vehicle.payloadCapacity}</td></tr>
                              <tr className="py-2"><td className="text-gray-400 font-bold py-1.5">Passenger Seating</td><td className="font-extrabold py-1.5 text-right">{vehicle.seatingCapacity}</td></tr>
                              <tr className="py-2"><td className="text-gray-400 font-bold py-1.5">Ground Clearance</td><td className="font-extrabold py-1.5 text-right">{vehicle.groundClearance}</td></tr>
                              <tr className="py-2"><td className="text-gray-400 font-bold py-1.5">Turning Circle Radius</td><td className="font-extrabold py-1.5 text-right">{vehicle.turningRadius}</td></tr>
                            </tbody>
                          </table>
                        </div>

                      </div>

                      <div className="border-t pt-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Brakes & Suspension</h4>
                          <table className="w-full text-xs text-brand-dark">
                            <tbody className="divide-y divide-gray-100">
                              <tr className="py-2"><td className="text-gray-400 font-bold py-1.5">Braking Tech</td><td className="font-extrabold py-1.5 text-right">{vehicle.brakes}</td></tr>
                              <tr className="py-2"><td className="text-gray-400 font-bold py-1.5">Suspension Setup</td><td className="font-extrabold py-1.5 text-right">{vehicle.suspension}</td></tr>
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Warranty details</h4>
                          <table className="w-full text-xs text-brand-dark">
                            <tbody className="divide-y divide-gray-100">
                              <tr className="py-2"><td className="text-gray-400 font-bold py-1.5">Standard Warranty</td><td className="font-extrabold py-1.5 text-right">{vehicle.warranty}</td></tr>
                              <tr className="py-2"><td className="text-gray-400 font-bold py-1.5">Maintenance Interval</td><td className="font-extrabold py-1.5 text-right">{vehicle.maintenanceCost}</td></tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'features' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        'Reinforced High-Strength Steel Chassis Structure',
                        'Durable Cabin Canopy with Weather Resistance',
                        'Analogue/Digital Smart Instrument Cluster',
                        'Mobile Charging Socket (12V)',
                        'Wide Passenger Cabin Leg Space',
                        'Low Ground Clearance Loading Lip (Cargo Loaders)',
                        'Eco & Boost Traction Power Modes (EV Models)',
                        'Reverse Gear buzzer and Side Indicator alerts'
                      ].map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-brand-dark font-medium">
                          <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="space-y-6">
                      {/* Average score and stars */}
                      <div className="bg-gray-50 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-6 justify-around border">
                        <div className="text-center">
                          <div className="text-4xl font-black text-brand-dark">{vehicle.rating}</div>
                          <div className="flex justify-center text-brand-blue my-1">
                            <Star className="w-4 h-4 fill-brand-blue text-brand-blue" />
                            <Star className="w-4 h-4 fill-brand-blue text-brand-blue" />
                            <Star className="w-4 h-4 fill-brand-blue text-brand-blue" />
                            <Star className="w-4 h-4 fill-brand-blue text-brand-blue" />
                            <Star className="w-4 h-4 fill-brand-blue text-brand-blue" />
                          </div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase">Based on {vehicle.reviewsCount} verified owners</div>
                        </div>
                        <div className="space-y-1.5 w-full sm:max-w-xs text-xs text-gray-500 font-bold uppercase">
                          <div className="flex items-center gap-2"><span>5 Star</span> <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-brand-green w-[85%]" /></div> <span>85%</span></div>
                          <div className="flex items-center gap-2"><span>4 Star</span> <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-brand-green w-[10%]" /></div> <span>10%</span></div>
                          <div className="flex items-center gap-2"><span>3 Star</span> <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-brand-green w-[4%]" /></div> <span>4%</span></div>
                          <div className="flex items-center gap-2"><span>2 Star</span> <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-brand-green w-[1%]" /></div> <span>1%</span></div>
                        </div>
                      </div>

                      {/* Rendered user reviews */}
                      <div className="divide-y divide-gray-100">
                        {vehicle.userReviews.map((rev, idx) => (
                          <div key={idx} className="py-4 space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <div>
                                <span className="font-extrabold text-brand-dark block">{rev.name}</span>
                                <span className="text-[10px] text-gray-400 font-medium">{rev.role}</span>
                              </div>
                              <span className="text-gray-400 font-medium">{rev.date}</span>
                            </div>
                            <div className="flex text-brand-blue">
                              {Array.from({ length: rev.rating }).map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-brand-blue text-brand-blue" />
                              ))}
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed font-medium">"{rev.comment}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: On-road price breakdown, Loan details, Pros/Cons */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* On-Road Price breakdown */}
              <div className="bg-white border border-brand-border rounded-xl p-5 custom-shadow">
                <h3 className="text-sm font-extrabold text-brand-dark mb-3 flex items-center gap-1"><Info className="w-4 h-4 text-primary" /> On-Road Price Estimation ({location})</h3>
                
                <div className="space-y-2 text-xs border-b pb-4 mb-4">
                  <div className="flex justify-between text-gray-500 font-medium"><span>Ex-Showroom Price</span><span className="font-extrabold text-brand-dark">₹{vehicle.priceMin.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between text-gray-500 font-medium"><span>RTO Registration (Commercial Badge)</span><span className="font-extrabold text-brand-dark">₹{rtoTax.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between text-gray-500 font-medium"><span>Commercial Third-Party Insurance</span><span className="font-extrabold text-brand-dark">₹{insurance.toLocaleString('en-IN')}</span></div>
                  {vehicle.fuelType === 'Electric' && (
                    <div className="flex justify-between text-brand-green font-bold bg-green-50 px-2 py-1 rounded">
                      <span>EV Green Subsidy (EMPS)</span>
                      <span>− ₹{greenSubsidy.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-sm font-black mb-4">
                  <span>Estimated On-Road Price</span>
                  <span className="text-lg text-primary">₹{estimatedOnRoadPrice.toLocaleString('en-IN')}*</span>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={() => openEnquiryModal(vehicle.name, 'Get Best Offer')}
                    className="w-full bg-primary hover:bg-orange-600 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Get Best Quote
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => openEnquiryModal(vehicle.name, 'Dealer Enquiry')}
                      className="py-2.5 border border-brand-border hover:bg-gray-50 text-brand-dark font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Enquire Now
                    </button>
                    <button 
                      onClick={() => openEnquiryModal(vehicle.name, 'Book Test Ride')}
                      className="py-2.5 border border-brand-border hover:bg-gray-50 text-brand-dark font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Book Test Ride
                    </button>
                  </div>
                </div>
                <span className="text-[9.5px] text-gray-400 block mt-1.5 text-center">*Indicative price. Final RTO tax rates and insurance premiums vary by city municipal councils.</span>
              </div>

              {/* Custom EMI Planner Card */}
              <div className="bg-white border border-brand-border rounded-xl p-5 custom-shadow">
                <h3 className="text-sm font-extrabold text-brand-dark mb-4 flex items-center gap-1"><Calendar className="w-4 h-4 text-primary" /> Customize Commercial Loan</h3>
                
                <div className="space-y-4 text-xs font-semibold text-gray-500">
                  {/* Down payment slider */}
                  <div>
                    <div className="flex justify-between uppercase text-[10px] mb-1 font-bold">
                      <span>Down Payment ({downPaymentPct}%)</span>
                      <span className="text-brand-dark font-extrabold">₹{downPaymentAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="40"
                      step="5"
                      value={downPaymentPct}
                      onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Loan Tenure dropdown */}
                    <div>
                      <span className="block text-[10px] uppercase font-bold mb-1">Tenure Period</span>
                      <select
                        value={loanPeriod}
                        onChange={(e) => setLoanPeriod(Number(e.target.value))}
                        className="w-full border rounded-lg p-2 font-bold bg-gray-50 outline-none text-brand-dark text-xs"
                      >
                        <option value="12">12 Months (1 Yr)</option>
                        <option value="24">24 Months (2 Yrs)</option>
                        <option value="36">36 Months (3 Yrs)</option>
                        <option value="48">48 Months (4 Yrs)</option>
                      </select>
                    </div>

                    {/* Interest rate selector */}
                    <div>
                      <span className="block text-[10px] uppercase font-bold mb-1">Interest Rate</span>
                      <select
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="w-full border rounded-lg p-2 font-bold bg-gray-50 outline-none text-brand-dark text-xs"
                      >
                        <option value="8.9">8.9% ROI (Special EV)</option>
                        <option value="9.5">9.5% ROI (Average CNG)</option>
                        <option value="10.5">10.5% ROI</option>
                        <option value="11.5">11.5% ROI</option>
                      </select>
                    </div>
                  </div>

                  {/* Loan breakdown display */}
                  <div className="bg-primary-light border border-primary/20 p-4 rounded-xl text-center space-y-1">
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Estimated Monthly EMI</span>
                    <div className="text-2xl font-black text-primary">₹{monthlyEmi.toLocaleString('en-IN')}/Month</div>
                    <div className="text-[10px] text-gray-500 font-medium">
                      Loan Amount: <strong>₹{loanAmount.toLocaleString('en-IN')}</strong> | Total Interest: <strong>₹{totalInterestPayable.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expert Pros & Cons list */}
              <div className="bg-white border border-brand-border rounded-xl p-5 custom-shadow text-xs">
                <h3 className="text-sm font-extrabold text-brand-dark mb-3">Expert Verdict (Pros & Cons)</h3>
                
                <div className="space-y-4">
                  {/* Pros */}
                  <div className="space-y-1.5">
                    <span className="font-extrabold text-brand-green flex items-center gap-1.5 uppercase text-[10px]"><Award className="w-3.5 h-3.5 text-brand-green" /> Key Advantages</span>
                    {vehicle.pros.map((pro, index) => (
                      <div key={index} className="flex items-start gap-1.5 text-gray-600 font-medium">
                        <CheckCircle className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                        <span>{pro}</span>
                      </div>
                    ))}
                  </div>

                  {/* Cons */}
                  <div className="space-y-1.5 border-t pt-4">
                    <span className="font-extrabold text-primary flex items-center gap-1.5 uppercase text-[10px]"><XCircle className="w-3.5 h-3.5 text-primary" /> Drawbacks / Limitations</span>
                    {vehicle.cons.map((con, index) => (
                      <div key={index} className="flex items-start gap-1.5 text-gray-600 font-medium">
                        <XCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{con}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Expert Review Summary Box */}
          <div className="bg-white border border-brand-border rounded-xl p-6 mb-8 custom-shadow">
            <h3 className="text-base font-extrabold text-brand-dark mb-2">Expert Road-Test Review</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">{vehicle.expertReview}</p>
          </div>

          {/* RELATED VEHICLES CAROUSEL */}
          <div className="border-t pt-8">
            <h3 className="text-xl font-black text-brand-dark mb-6">Similar Vehicles You May Like</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedModels.map(v => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
