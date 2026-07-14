'use client';
import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Heart, RefreshCw, Star, ArrowRight, Layers, Gauge, Fuel } from 'lucide-react';
import VehicleImage from './VehicleImage';

export default function VehicleCard({ vehicle }) {
  const { wishlist, toggleWishlist, compareList, addToCompare, removeFromCompare } = useApp();

  const isWishlisted = wishlist.includes(vehicle.id);
  const isCompared = compareList.some((v) => v.id === vehicle.id);

  const formatPrice = (price) => {
    return (price / 100000).toFixed(2);
  };

  const handleCompareClick = (e) => {
    e.preventDefault();
    if (isCompared) {
      removeFromCompare(vehicle.id);
    } else {
      if (compareList.length >= 4) {
        alert('You can compare up to 4 vehicles at a time. Please remove an existing vehicle first.');
      } else {
        addToCompare(vehicle);
      }
    }
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    toggleWishlist(vehicle.id);
  };

  const categoryStr = (vehicle.category || vehicle.vehicleType || '').toLowerCase();
  const isCargo = categoryStr.includes('cargo') || 
                  categoryStr.includes('loader') || 
                  categoryStr.includes('pickup') ||
                  categoryStr.includes('delivery') ||
                  (vehicle.cargoPassenger && vehicle.cargoPassenger.toLowerCase() === 'cargo');

  return (
    <div className="bg-white border border-brand-border hover:border-primary rounded-xl overflow-hidden hover-scale custom-shadow flex flex-col h-full relative group">
      
      {/* Wishlist Button (Heart) */}
      <button
        onClick={handleWishlistClick}
        className="absolute top-14 right-3 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm border border-gray-100 hover:text-primary transition-colors duration-200"
        aria-label="Add to Wishlist"
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'text-primary fill-primary' : 'text-gray-400'}`} />
      </button>

      {/* Compare Checkbox Button */}
      <button
        onClick={handleCompareClick}
        className={`absolute top-14 left-3 z-10 p-2 rounded-full shadow-sm border transition-all duration-200 flex items-center justify-center ${
          isCompared 
            ? 'bg-primary border-primary text-white' 
            : 'bg-white/90 border-gray-100 text-gray-400 hover:text-brand-dark'
        }`}
        aria-label="Compare Vehicle"
        title="Add to Compare"
      >
        <RefreshCw className={`w-4 h-4 ${isCompared ? 'animate-spin-once' : ''}`} />
      </button>

      {/* Vehicle Image Blueprint Component */}
      <Link href={`/vehicles/${vehicle.id}`}>
        <VehicleImage 
          category={vehicle.category} 
          fuelType={vehicle.fuelType} 
          brandName={vehicle.brandName} 
        />
      </Link>

      {/* Content Area */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        
        <div>
          {/* Brand & Rating row */}
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{vehicle.brandName}</span>
            <div className="flex items-center text-brand-blue text-xs font-bold bg-blue-50 px-1.5 py-0.5 rounded">
              <Star className="w-3.5 h-3.5 fill-brand-blue text-brand-blue mr-1" />
              <span>{vehicle.rating}</span>
              <span className="text-gray-400 font-normal ml-0.5">({vehicle.reviewsCount})</span>
            </div>
          </div>

          {/* Vehicle Name */}
          <h3 className="text-base font-extrabold text-brand-dark group-hover:text-primary transition-colors leading-tight mb-2 truncate">
            <Link href={`/vehicles/${vehicle.id}`}>
              {vehicle.name}
            </Link>
          </h3>

          {/* Pricing Info */}
          <div className="mb-3">
            <div className="text-lg font-black text-brand-dark">
              ₹{formatPrice(vehicle.priceMin || 0)} - {formatPrice(vehicle.priceMax || 0)} Lakh*
            </div>
            <div className="text-xs text-gray-500 flex justify-between mt-0.5 font-medium">
              <span>Ex-Showroom Price</span>
              <span className="text-brand-green font-bold bg-green-50 px-1.5 py-0.5 rounded">EMI starting at ₹{(vehicle.emi || 0).toLocaleString('en-IN')}/mo</span>
            </div>
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-gray-100 mb-4 text-center">
            {/* Spec 1: Payload / Seating */}
            <div className="flex flex-col items-center">
              <Layers className="w-4 h-4 text-gray-400 mb-1" />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {isCargo ? 'Payload' : 'Seating'}
              </span>
              <span className="text-xs font-extrabold text-brand-dark truncate w-full px-1">
                {isCargo ? (vehicle.payloadCapacity || 'N/A') : (vehicle.seatingCapacity || 'N/A').replace(' Passenger', '')}
              </span>
            </div>

            {/* Spec 2: Range / Mileage */}
            <div className="flex flex-col items-center">
              <Fuel className="w-4 h-4 text-gray-400 mb-1" />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {vehicle.fuelType === 'Electric' ? 'Range' : 'Mileage'}
              </span>
              <span className="text-xs font-extrabold text-brand-dark truncate w-full px-1">
                {vehicle.fuelType === 'Electric' ? (vehicle.batteryRange || 'N/A').replace(' km/charge', ' km') : (vehicle.mileage || 'N/A')}
              </span>
            </div>

            {/* Spec 3: Motor / Engine */}
            <div className="flex flex-col items-center">
              <Gauge className="w-4 h-4 text-gray-400 mb-1" />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {vehicle.fuelType === 'Electric' ? 'Motor' : 'Engine'}
              </span>
              <span className="text-xs font-extrabold text-brand-dark truncate w-full px-1">
                {vehicle.fuelType === 'Electric' ? (vehicle.motorPower || 'N/A').replace(' kW BLDC', ' kW') : (vehicle.engineCapacity || 'N/A').replace(' cc DTS-i Engine', ' cc').replace(' cc Direct Injection', ' cc').replace(' cc Engine', ' cc').replace(' cc Spark Ignition', ' cc')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Link 
          href={`/vehicles/${vehicle.id}`}
          className="w-full bg-gray-900 hover:bg-primary text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center transition-colors group-hover:bg-primary"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>

      </div>
    </div>
  );
}
