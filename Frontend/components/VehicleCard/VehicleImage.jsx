'use client';
import React from 'react';

export default function VehicleImage({ category = 'Passenger Auto', fuelType = 'Electric', brandName = 'Bajaj', className = '' }) {
  const isCargo = category.toLowerCase().includes('cargo') || 
                  category.toLowerCase().includes('loader') || 
                  category.toLowerCase().includes('pickup') ||
                  category.toLowerCase().includes('delivery');

  // Choose color theme based on fuel
  let gradientId = `grad-${fuelType.toLowerCase()}-${brandName.toLowerCase().replace(/\s+/g, '')}`;
  let primaryColor = '#4B5563'; // Slate
  let secondaryColor = '#1F2937';
  
  if (fuelType === 'Electric') {
    primaryColor = '#06B6D4'; // Teal/Cyan
    secondaryColor = '#0891B2';
  } else if (fuelType === 'CNG') {
    primaryColor = '#10B981'; // Green
    secondaryColor = '#059669';
  } else if (fuelType === 'LPG') {
    primaryColor = '#F59E0B'; // Amber
    secondaryColor = '#D97706';
  } else if (fuelType === 'Diesel') {
    primaryColor = '#B45309'; // Brownish/Orange
    secondaryColor = '#78350F';
  } else if (fuelType === 'Petrol') {
    primaryColor = '#EF4444'; // Red
    secondaryColor = '#B91C1C';
  }

  return (
    <div className={`relative w-full bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100 ${className}`} style={{ height: '180px' }}>
      {/* Background Blueprint Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
        backgroundSize: '16px 16px'
      }} />

      {/* Brand Badge in BG */}
      <div className="absolute top-3 left-3 bg-white px-2 py-0.5 rounded shadow-sm text-[10px] font-bold text-gray-500 tracking-wider uppercase border border-gray-100">
        {brandName}
      </div>

      {/* Fuel Type Badge in BG */}
      <div className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm bg-gray-900 text-white uppercase">
        {fuelType}
      </div>

      <svg viewBox="0 0 400 250" className="w-4/5 h-4/5 drop-shadow-md">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
          <linearGradient id="wheel-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>
        </defs>

        {isCargo ? (
          // CARGO LOADER SVG ILLUSTRATION
          <g>
            {/* Cargo Box (Back Container) */}
            <rect x="70" y="70" width="160" height="90" rx="3" fill={`url(#${gradientId})`} stroke="#1F2937" strokeWidth="2" />
            <line x1="110" y1="70" x2="110" y2="160" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
            <line x1="150" y1="70" x2="150" y2="160" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
            <line x1="190" y1="70" x2="190" y2="160" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
            
            {/* Loader Cabin / Driver Canopy */}
            <path d="M230 70 L280 70 L305 105 L305 160 L230 160 Z" fill="#1F2937" stroke="#111827" strokeWidth="2" />
            
            {/* Windshield */}
            <path d="M275 75 L298 105 L298 115 L265 115 Z" fill="#E2E8F0" opacity="0.8" stroke="#1E293B" strokeWidth="1.5" />
            <path d="M285 80 L295 103 L295 109 L280 109 Z" fill="#FFFFFF" opacity="0.5" />
            
            {/* Side Window */}
            <path d="M235 75 L260 75 L260 115 L235 115 Z" fill="#E2E8F0" opacity="0.8" stroke="#1E293B" strokeWidth="1.5" />
            
            {/* Front Headlight (EV Glowing or standard) */}
            <circle cx="308" cy="135" r="7" fill={fuelType === 'Electric' ? '#22D3EE' : '#FDE047'} className="animate-pulse" />
            <polygon points="312,130 360,115 360,155 312,140" fill={fuelType === 'Electric' ? '#22D3EE' : '#FEF08A'} opacity="0.15" />

            {/* Rear Mudguards */}
            <path d="M90 160 A30 30 0 0 1 150 160 Z" fill="#1F2937" />
            
            {/* Front Mudguard */}
            <path d="M275 160 A25 25 0 0 1 315 160 Z" fill="#1F2937" />

            {/* Chassis Under-frame */}
            <rect x="80" y="160" width="210" height="8" fill="#4B5563" />

            {/* Rear Wheel */}
            <circle cx="120" cy="175" r="24" fill="url(#wheel-grad)" stroke="#4B5563" strokeWidth="2" />
            <circle cx="120" cy="175" r="12" fill="#94A3B8" stroke="#374151" strokeWidth="2" />
            <circle cx="120" cy="175" r="4" fill="#374151" />

            {/* Front Wheel */}
            <circle cx="295" cy="175" r="24" fill="url(#wheel-grad)" stroke="#4B5563" strokeWidth="2" />
            <circle cx="295" cy="175" r="12" fill="#94A3B8" stroke="#374151" strokeWidth="2" />
            <circle cx="295" cy="175" r="4" fill="#374151" />

            {/* EV Battery Pack / Fuel Tank underbody */}
            {fuelType === 'Electric' ? (
              <rect x="170" y="160" width="50" height="12" fill="#06B6D4" rx="2" />
            ) : (
              <rect x="175" y="160" width="35" height="10" fill="#EF4444" rx="2" />
            )}
          </g>
        ) : (
          // PASSENGER RICKSHAW SVG ILLUSTRATION
          <g>
            {/* Rickshaw Cabin Base & Sides */}
            <path d="M100 80 L250 80 L300 115 L300 160 L100 160 Z" fill={`url(#${gradientId})`} stroke="#1F2937" strokeWidth="2" />
            
            {/* Black Canopy Roof */}
            <path d="M90 80 L240 80 L280 115 L190 115 L160 85 L90 85 Z" fill="#1F2937" stroke="#111827" strokeWidth="1.5" />
            
            {/* Windshield */}
            <path d="M268 85 L292 113 L292 125 L260 125 Z" fill="#E2E8F0" opacity="0.8" stroke="#1E293B" strokeWidth="1.5" />
            <path d="M275 90 L288 111 L288 119 L272 119 Z" fill="#FFFFFF" opacity="0.5" />

            {/* Passenger Cabin Opening (Door cutout) */}
            <path d="M130 90 L200 90 L200 160 L130 160 Z" fill="#F3F4F6" stroke="#1F2937" strokeWidth="2" />
            
            {/* Passenger Seats (Inside) */}
            <rect x="110" y="125" width="22" height="35" rx="3" fill="#D1D5DB" />
            <rect x="110" y="125" width="6" height="35" rx="1" fill="#4B5563" />

            {/* Driver Area Details */}
            <rect x="235" y="130" width="10" height="30" fill="#374151" />
            <line x1="240" y1="120" x2="255" y2="128" stroke="#111827" strokeWidth="2" /> {/* Handlebars */}

            {/* Headlights */}
            <circle cx="302" cy="135" r="7" fill={fuelType === 'Electric' ? '#22D3EE' : '#FDE047'} className="animate-pulse" />
            <polygon points="306,130 355,115 355,155 306,140" fill={fuelType === 'Electric' ? '#22D3EE' : '#FEF08A'} opacity="0.15" />

            {/* Rear Mudguards */}
            <path d="M110 160 A30 30 0 0 1 170 160 Z" fill="#1F2937" />
            
            {/* Front Mudguard */}
            <path d="M265 160 A25 25 0 0 1 305 160 Z" fill="#1F2937" />

            {/* Rear Wheel */}
            <circle cx="140" cy="175" r="24" fill="url(#wheel-grad)" stroke="#4B5563" strokeWidth="2" />
            <circle cx="140" cy="175" r="12" fill="#94A3B8" stroke="#374151" strokeWidth="2" />
            <circle cx="140" cy="175" r="4" fill="#374151" />

            {/* Front Wheel */}
            <circle cx="285" cy="175" r="24" fill="url(#wheel-grad)" stroke="#4B5563" strokeWidth="2" />
            <circle cx="285" cy="175" r="12" fill="#94A3B8" stroke="#374151" strokeWidth="2" />
            <circle cx="285" cy="175" r="4" fill="#374151" />

            {/* Underbody styling */}
            <rect x="164" y="160" width="98" height="8" fill="#4B5563" />
          </g>
        )}
      </svg>

      {/* Seating/Payload Quick Info overlay */}
      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
        {!isCargo ? 'PASSENGER Rickshaw' : 'CARGO Loader'}
      </div>
    </div>
  );
}
