'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { useApp } from '@/context/AppContext';
import vehiclesData from '@/data/vehicles.json';
import { X, Plus, RefreshCw, Layers, Fuel, Gauge, Award, DollarSign } from 'lucide-react';
import Link from 'next/link';

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { compareList, addToCompare, removeFromCompare, clearCompare } = useApp();

  // Selected models state
  const [selectedVehicles, setSelectedVehicles] = useState([null, null, null, null]);

  // Read from URL and sync with AppContext comparison list
  useEffect(() => {
    const list = [...compareList];
    
    // Also check url query params
    const vIds = [
      searchParams.get('v1') || searchParams.get('v1Id'),
      searchParams.get('v2') || searchParams.get('v2Id'),
      searchParams.get('v3') || searchParams.get('v3Id'),
      searchParams.get('v4') || searchParams.get('v4Id')
    ].filter(Boolean);

    vIds.forEach(id => {
      const match = vehiclesData.find(v => v.id === id);
      if (match && !list.some(v => v.id === match.id)) {
        list.push(match);
      }
    });

    // Populate comparison slots (max 4)
    const slots = [null, null, null, null];
    list.slice(0, 4).forEach((v, index) => {
      slots[index] = v;
    });
    setSelectedVehicles(slots);
  }, [compareList, searchParams]);

  const handleRemoveSlot = (vehicleId, index) => {
    removeFromCompare(vehicleId);
    setSelectedVehicles(prev => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
  };

  const handleSelectSlot = (vehicleId, index) => {
    const match = vehiclesData.find(v => v.id === vehicleId);
    if (match) {
      if (compareList.some(v => v.id === match.id)) {
        alert('This vehicle is already in the comparison.');
        return;
      }
      addToCompare(match);
      setSelectedVehicles(prev => {
        const updated = [...prev];
        updated[index] = match;
        return updated;
      });
    }
  };

  // Helper logic to find highlights (lowest price, highest payload, lowest running cost, longest range)
  const getHighlightIndices = (key, parseFn, compareType = 'max') => {
    let bestValue = compareType === 'max' ? -Infinity : Infinity;
    let bestIndices = [];

    selectedVehicles.forEach((v, idx) => {
      if (!v) return;
      const rawVal = v[key];
      const val = parseFn ? parseFn(rawVal, v) : parseFloat(rawVal) || 0;
      
      if (compareType === 'max') {
        if (val > bestValue) {
          bestValue = val;
          bestIndices = [idx];
        } else if (val === bestValue) {
          bestIndices.push(idx);
        }
      } else {
        if (val < bestValue) {
          bestValue = val;
          bestIndices = [idx];
        } else if (val === bestValue) {
          bestIndices.push(idx);
        }
      }
    });

    return bestIndices;
  };

  // Find highlights indices
  const bestPriceIdx = getHighlightIndices('priceMin', null, 'min');
  const bestPayloadIdx = getHighlightIndices('payloadCapacity', (val) => parseInt(val) || 0, 'max');
  const bestRunningCostIdx = getHighlightIndices('runningCost', (val) => parseFloat(val.replace('₹', '')) || 0, 'min');
  const bestRangeIdx = getHighlightIndices('batteryRange', (val, v) => parseInt(val) || parseInt(v?.mileage) || 0, 'max');

  const activeSlotsCount = selectedVehicles.filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* breadcrumbs & top bar */}
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <div className="text-xs text-gray-400 font-medium">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link> &gt; <span>Compare Three Wheelers</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-dark mt-1">
            Compare Specs Side-by-Side
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Compare ex-showroom price, operational costs, running cost metrics, and battery ranges for up to 4 models.
          </p>
        </div>
        {activeSlotsCount > 0 && (
          <button 
            onClick={clearCompare}
            className="text-xs text-primary border border-primary hover:bg-primary hover:text-white transition-all font-bold px-4 py-2 rounded-lg inline-flex items-center gap-1.5 self-start"
          >
            Clear Compare Grid
          </button>
        )}
      </div>

      {/* COMPARISON SLOTS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {selectedVehicles.map((vehicle, index) => (
          <div key={index} className="bg-white border border-brand-border rounded-xl p-5 shadow-sm relative flex flex-col h-full justify-between min-h-[220px]">
            
            {vehicle ? (
              // Active Vehicle Card in slot
              <>
                <button
                  onClick={() => handleRemoveSlot(vehicle.id, index)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-primary bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full"
                  title="Remove vehicle"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-3">
                  <span className="text-[9.5px] font-bold text-primary uppercase tracking-wider bg-primary-light px-2 py-0.5 rounded">
                    {vehicle.category}
                  </span>
                  
                  <h3 className="text-base font-black text-brand-dark leading-snug hover:text-primary pr-6 truncate">
                    <Link href={`/vehicles/${vehicle.id}`}>{vehicle.name}</Link>
                  </h3>
                  
                  <div className="text-sm font-bold text-gray-500 flex gap-2 items-center">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-xs font-semibold text-gray-600 uppercase">{vehicle.fuelType}</span>
                    <span>₹{(vehicle.priceMin/100000).toFixed(2)} - {(vehicle.priceMax/100000).toFixed(2)} L</span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-2.5 text-xs text-gray-500 flex flex-col space-y-1 font-semibold">
                    <div className="flex justify-between"><span>Payload:</span><span className="text-brand-dark font-extrabold">{vehicle.payloadCapacity}</span></div>
                    <div className="flex justify-between"><span>Range/Mileage:</span><span className="text-brand-dark font-extrabold">{vehicle.fuelType === 'Electric' ? vehicle.batteryRange : vehicle.mileage}</span></div>
                  </div>
                </div>

                <Link 
                  href={`/vehicles/${vehicle.id}`}
                  className="w-full text-center bg-gray-900 hover:bg-primary text-white font-bold text-xs py-2 rounded-lg transition-colors mt-4 block"
                >
                  View Full Specs
                </Link>
              </>
            ) : (
              // Empty Slot Selector
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-6 text-center h-full">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400 mb-3">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs font-extrabold text-brand-dark">Add a vehicle</span>
                <span className="text-[10px] text-gray-400 mt-1 max-w-[150px] leading-relaxed">Choose a three-wheeler model to start comparing.</span>
                
                <select
                  onChange={(e) => handleSelectSlot(e.target.value, index)}
                  defaultValue=""
                  className="w-full border rounded-lg px-2 py-1.5 text-xs bg-gray-50 text-brand-dark outline-none font-semibold mt-4"
                >
                  <option value="" disabled>-- Select Model --</option>
                  {vehiclesData.map(v => (
                    <option key={`slot-${index}-${v.id}`} value={v.id}>{v.name} ({v.fuelType})</option>
                  ))}
                </select>
              </div>
            )}

          </div>
        ))}
      </div>

      {/* MATRIX TABLE OF SPECS */}
      {activeSlotsCount > 0 ? (
        <div className="bg-white border border-brand-border rounded-xl overflow-hidden shadow-sm custom-shadow">
          <div className="px-5 py-4 border-b font-extrabold text-brand-dark text-sm bg-gray-50 flex items-center gap-1">
            <RefreshCw className="w-4 h-4 text-primary" /> Specifications Comparison Matrix
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left divide-y divide-gray-100">
              
              {/* Table section: Price & Financials */}
              <thead>
                <tr className="bg-gray-100/50"><th colSpan="5" className="px-6 py-2.5 font-bold uppercase text-[10px] text-primary tracking-wider">Pricing & Running Cost</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-bold text-gray-500 w-1/5">Ex-Showroom Price</td>
                  {selectedVehicles.map((v, idx) => (
                    <td key={`price-${idx}`} className="px-6 py-3 font-black text-brand-dark w-1/5">
                      {v ? (
                        <div className="flex flex-col">
                          <span>₹{(v.priceMin/100000).toFixed(2)} - {(v.priceMax/100000).toFixed(2)} Lakh*</span>
                          {bestPriceIdx.includes(idx) && (
                            <span className="text-[9px] font-bold text-brand-green bg-green-50 px-1 py-0.5 rounded w-max mt-1">Lowest Price</span>
                          )}
                        </div>
                      ) : '-'}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-bold text-gray-500">Estimated EMI</td>
                  {selectedVehicles.map((v, idx) => (
                    <td key={`emi-${idx}`} className="px-6 py-3 font-extrabold text-brand-green">
                      {v ? `₹${v.emi.toLocaleString('en-IN')}/Month` : '-'}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-bold text-gray-500">Running Cost per KM</td>
                  {selectedVehicles.map((v, idx) => (
                    <td key={`rcost-${idx}`} className="px-6 py-3 font-black text-brand-dark">
                      {v ? (
                        <div className="flex flex-col">
                          <span>{v.runningCost}</span>
                          {bestRunningCostIdx.includes(idx) && (
                            <span className="text-[9px] font-bold text-brand-green bg-green-50 px-1 py-0.5 rounded w-max mt-1">Most Economical</span>
                          )}
                        </div>
                      ) : '-'}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-bold text-gray-500">Monthly Maintenance</td>
                  {selectedVehicles.map((v, idx) => (
                    <td key={`maint-${idx}`} className="px-6 py-3 font-extrabold text-gray-600">
                      {v ? v.maintenanceCost : '-'}
                    </td>
                  ))}
                </tr>
              </tbody>

              {/* Table section: Performance & Load capacity */}
              <thead>
                <tr className="bg-gray-100/50"><th colSpan="5" className="px-6 py-2.5 font-bold uppercase text-[10px] text-primary tracking-wider">Performance & Payload</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-bold text-gray-500">Fuel & Technology</td>
                  {selectedVehicles.map((v, idx) => (
                    <td key={`fuel-${idx}`} className="px-6 py-3 font-extrabold text-brand-dark uppercase">
                      {v ? v.fuelType : '-'}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-bold text-gray-500">Payload Capacity</td>
                  {selectedVehicles.map((v, idx) => (
                    <td key={`payload-${idx}`} className="px-6 py-3 font-black text-brand-dark">
                      {v ? (
                        <div className="flex flex-col">
                          <span>{v.payloadCapacity}</span>
                          {bestPayloadIdx.includes(idx) && v.payloadCapacity !== 'N/A' && (
                            <span className="text-[9px] font-bold text-brand-green bg-green-50 px-1 py-0.5 rounded w-max mt-1">Highest Payload</span>
                          )}
                        </div>
                      ) : '-'}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-bold text-gray-500">Mileage / Battery Range</td>
                  {selectedVehicles.map((v, idx) => (
                    <td key={`range-${idx}`} className="px-6 py-3 font-black text-brand-dark">
                      {v ? (
                        <div className="flex flex-col">
                          <span>{v.fuelType === 'Electric' ? v.batteryRange : v.mileage}</span>
                          {bestRangeIdx.includes(idx) && (
                            <span className="text-[9px] font-bold text-brand-green bg-green-50 px-1 py-0.5 rounded w-max mt-1">Longest Range</span>
                          )}
                        </div>
                      ) : '-'}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-bold text-gray-500">Engine / Motor Power</td>
                  {selectedVehicles.map((v, idx) => (
                    <td key={`power-${idx}`} className="px-6 py-3 font-extrabold text-brand-dark">
                      {v ? (v.fuelType === 'Electric' ? v.motorPower : v.engineCapacity) : '-'}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-bold text-gray-500">Top Speed</td>
                  {selectedVehicles.map((v, idx) => (
                    <td key={`speed-${idx}`} className="px-6 py-3 font-extrabold text-gray-600">
                      {v ? v.topSpeed : '-'}
                    </td>
                  ))}
                </tr>
              </tbody>

              {/* Table section: Mechanical & Dimensions */}
              <thead>
                <tr className="bg-gray-100/50"><th colSpan="5" className="px-6 py-2.5 font-bold uppercase text-[10px] text-primary tracking-wider">Dimensions & Chassis</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-bold text-gray-500">Seating Capacity</td>
                  {selectedVehicles.map((v, idx) => (
                    <td key={`seating-${idx}`} className="px-6 py-3 font-extrabold text-gray-600">
                      {v ? v.seatingCapacity : '-'}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-bold text-gray-500">Body Dimensions</td>
                  {selectedVehicles.map((v, idx) => (
                    <td key={`dim-${idx}`} className="px-6 py-3 text-gray-600 font-medium">
                      {v ? v.dimensions : '-'}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-bold text-gray-500">Ground Clearance</td>
                  {selectedVehicles.map((v, idx) => (
                    <td key={`gc-${idx}`} className="px-6 py-3 font-extrabold text-gray-600">
                      {v ? v.groundClearance : '-'}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-bold text-gray-500">Turning Radius</td>
                  {selectedVehicles.map((v, idx) => (
                    <td key={`radius-${idx}`} className="px-6 py-3 font-extrabold text-gray-600">
                      {v ? v.turningRadius : '-'}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-bold text-gray-500">Standard Warranty</td>
                  {selectedVehicles.map((v, idx) => (
                    <td key={`warr-${idx}`} className="px-6 py-3 font-extrabold text-gray-600">
                      {v ? v.warranty : '-'}
                    </td>
                  ))}
                </tr>
              </tbody>

            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border rounded-xl p-12 text-center max-w-xl mx-auto shadow-sm space-y-4">
          <Plus className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-black text-brand-dark">Compare Matrix is Empty</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Please add at least one three-wheeler model above to start analyzing side-by-side specifications.
          </p>
        </div>
      )}

    </div>
  );
}

export default function ComparePage() {
  return (
    <>
      <Header />
      <main className="bg-brand-bg flex-grow min-h-screen">
        <Suspense fallback={
          <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs font-bold text-gray-400 uppercase">
            Loading Compare Matrix...
          </div>
        }>
          <CompareContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
