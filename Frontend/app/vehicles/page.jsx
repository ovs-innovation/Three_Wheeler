'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import VehicleCard from '@/components/VehicleCard/VehicleCard';
import { useApp } from '@/context/AppContext';
import vehiclesData from '@/data/vehicles.json';
import brandsData from '@/data/brands.json';
import { Filter, SlidersHorizontal, RefreshCcw, Search, Grid, List, AlertCircle } from 'lucide-react';

function VehiclesCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { wishlist } = useApp();

  // Search/Filter parameters from URL
  const queryParam = searchParams.get('q') || '';
  const fuelParam = searchParams.get('fuel') || '';
  const brandParam = searchParams.get('brand') || '';
  const categoryParam = searchParams.get('category') || '';
  const filterParam = searchParams.get('filter') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const minPriceParam = searchParams.get('minPrice') || '';

  // Local Filter States
  const [searchVal, setSearchVal] = useState(queryParam);
  const [selectedBrands, setSelectedBrands] = useState(brandParam ? [brandParam] : []);
  const [selectedFuels, setSelectedFuels] = useState(fuelParam ? [fuelParam] : []);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all'); // 'all' | 'passenger' | 'cargo'
  const [priceRange, setPriceRange] = useState(maxPriceParam ? Number(maxPriceParam) : 500000);
  const [minPayload, setMinPayload] = useState(0); // kg
  const [minRange, setMinRange] = useState(0); // km
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'priceAsc' | 'priceDesc' | 'mileage'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync state with URL params when they change
  useEffect(() => {
    setSearchVal(queryParam);
    if (brandParam) setSelectedBrands([brandParam]);
    else if (!brandParam && searchParams.get('brand') === null) setSelectedBrands([]);

    if (fuelParam) setSelectedFuels([fuelParam]);
    else if (!fuelParam && searchParams.get('fuel') === null) setSelectedFuels([]);

    if (categoryParam) setSelectedCategory(categoryParam);
    if (maxPriceParam) setPriceRange(Number(maxPriceParam));
  }, [queryParam, fuelParam, brandParam, categoryParam, maxPriceParam]);

  // Brand and fuel list data
  const brandsList = brandsData;
  const fuelsList = ['CNG', 'LPG', 'Electric', 'Diesel', 'Petrol'];

  // Handle Checkbox Toggles
  const handleBrandChange = (brandId) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) ? prev.filter(id => id !== brandId) : [...prev, brandId]
    );
  };

  const handleFuelChange = (fuel) => {
    setSelectedFuels(prev => 
      prev.includes(fuel) ? prev.filter(f => f !== fuel) : [...prev, fuel]
    );
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchVal('');
    setSelectedBrands([]);
    setSelectedFuels([]);
    setSelectedCategory('all');
    setPriceRange(500000);
    setMinPayload(0);
    setMinRange(0);
    setSortBy('popular');
    router.push('/vehicles');
  };

  // Filter & Sort Logic
  const filteredVehicles = vehiclesData.filter((v) => {
    // 1. Wishlist Only Filter
    if (filterParam === 'wishlist' && !wishlist.includes(v.id)) {
      return false;
    }

    // 2. Search query matching name, brand, category, fuel
    if (searchVal.trim() !== '') {
      const q = searchVal.toLowerCase();
      const match = v.name.toLowerCase().includes(q) || 
                    v.brandName.toLowerCase().includes(q) ||
                    v.category.toLowerCase().includes(q) ||
                    v.fuelType.toLowerCase().includes(q);
      if (!match) return false;
    }

    // 3. Brands filter
    if (selectedBrands.length > 0 && !selectedBrands.includes(v.brandId)) {
      return false;
    }

    // 4. Fuels filter
    if (selectedFuels.length > 0 && !selectedFuels.includes(v.fuelType)) {
      return false;
    }

    // 5. Category Type
    if (selectedCategory !== 'all') {
      const isCargo = v.category.toLowerCase().includes('cargo') || 
                      v.category.toLowerCase().includes('loader') || 
                      v.category.toLowerCase().includes('pickup') || 
                      v.category.toLowerCase().includes('delivery');
      if (selectedCategory === 'passenger' && isCargo) return false;
      if (selectedCategory === 'cargo' && !isCargo) return false;
    }

    // 6. Max Price range (Ex showroom minPrice)
    if (v.priceMin > priceRange) {
      return false;
    }

    // 7. Payload Capacity
    if (minPayload > 0) {
      const isCargo = v.category.toLowerCase().includes('cargo') || 
                      v.category.toLowerCase().includes('loader') || 
                      v.category.toLowerCase().includes('pickup');
      if (!isCargo) return false;
      
      const payloadVal = parseInt(v.payloadCapacity) || 0;
      if (payloadVal < minPayload) return false;
    }

    // 8. EV Range
    if (minRange > 0) {
      if (v.fuelType !== 'Electric') return false;
      const rangeVal = parseInt(v.batteryRange) || 0;
      if (rangeVal < minRange) return false;
    }

    return true;
  }).sort((a, b) => {
    // Sorting Engine
    if (sortBy === 'priceAsc') return a.priceMin - b.priceMin;
    if (sortBy === 'priceDesc') return b.priceMin - a.priceMin;
    if (sortBy === 'mileage') {
      const rA = parseInt(a.batteryRange) || parseInt(a.mileage) || 0;
      const rB = parseInt(b.batteryRange) || parseInt(b.mileage) || 0;
      return rB - rA;
    }
    // Default: Popularity (rating * reviewsCount)
    const ratingA = parseFloat(a.rating) * a.reviewsCount;
    const ratingB = parseFloat(b.rating) * b.reviewsCount;
    return ratingB - ratingA;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Breadcrumbs & Page Info */}
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <div className="text-xs text-gray-400 font-medium">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link> &gt; <span>Vehicles Catalogue</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-dark mt-1">
            {filterParam === 'wishlist' ? "My Favorite Wishlist" : "Browse Commercial Three Wheelers"}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Showing {filteredVehicles.length} of {vehiclesData.length} matches found matching your filters.
          </p>
        </div>

        {/* View mode and Sort controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center text-xs font-bold text-gray-400 uppercase gap-1.5">
            <span>Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-brand-border rounded px-2.5 py-1.5 text-brand-dark outline-none font-semibold"
            >
              <option value="popular">Popularity</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="mileage">Mileage / Range</option>
            </select>
          </div>
          <button 
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 border border-brand-border bg-white rounded text-gray-500 hover:text-brand-dark hidden sm:block"
            title="Toggle View Mode"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2 rounded shadow"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR FILTERS - Desktop */}
        <aside className="hidden lg:block space-y-6 self-start bg-white border border-brand-border rounded-xl p-5 custom-shadow sticky top-24">
          <div className="flex justify-between items-center pb-3 border-b">
            <span className="text-sm font-extrabold text-brand-dark flex items-center gap-1.5"><SlidersHorizontal className="w-4.5 h-4.5 text-primary" /> Filter Options</span>
            <button onClick={handleResetFilters} className="text-xs text-primary hover:underline font-bold flex items-center gap-1"><RefreshCcw className="w-3 h-3" /> Reset</button>
          </div>

          {/* Search keyword inside catalog */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Search Models</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type model name..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-3 pr-8 py-2 border rounded-lg text-xs bg-gray-50 focus:bg-white outline-none"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Category Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Body Configuration</label>
            <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-lg text-xs font-bold">
              <button 
                onClick={() => setSelectedCategory('all')}
                className={`py-1.5 rounded transition-all text-center ${selectedCategory === 'all' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-500 hover:text-brand-dark'}`}
              >
                All
              </button>
              <button 
                onClick={() => setSelectedCategory('passenger')}
                className={`py-1.5 rounded transition-all text-center ${selectedCategory === 'passenger' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-500 hover:text-brand-dark'}`}
              >
                Pass.
              </button>
              <button 
                onClick={() => setSelectedCategory('cargo')}
                className={`py-1.5 rounded transition-all text-center ${selectedCategory === 'cargo' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-500 hover:text-brand-dark'}`}
              >
                Cargo
              </button>
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase">
              <span className="text-gray-400">Max Ex-Showroom</span>
              <span className="text-primary">₹{(priceRange/100000).toFixed(2)} L</span>
            </div>
            <input
              type="range"
              min="120000"
              max="500000"
              step="10000"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[9px] text-gray-400 font-bold">
              <span>₹1.20 Lakh</span>
              <span>₹5.00 Lakh</span>
            </div>
          </div>

          {/* Fuel Types checkboxes */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Fuel Type</label>
            <div className="space-y-1.5 text-xs text-brand-dark font-medium">
              {fuelsList.map((fuel) => (
                <label key={fuel} className="flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedFuels.includes(fuel)}
                    onChange={() => handleFuelChange(fuel)}
                    className="mr-2 rounded border-gray-300 accent-primary focus:ring-primary w-4.5 h-4.5"
                  />
                  <span>{fuel} Three Wheelers</span>
                </label>
              ))}
            </div>
          </div>

          {/* Brands Checklist */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Manufacturer</label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs text-brand-dark font-medium">
              {brandsList.map((b) => (
                <label key={b.id} className="flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b.id)}
                    onChange={() => handleBrandChange(b.id)}
                    className="mr-2 rounded border-gray-300 accent-primary w-4.5 h-4.5"
                  />
                  <span>{b.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Payload filter (Cargo) */}
          <div className="space-y-2 border-t pt-4">
            <label className="text-xs font-bold text-gray-400 uppercase block">Min Payload Capacity (Cargo)</label>
            <select
              value={minPayload}
              onChange={(e) => setMinPayload(Number(e.target.value))}
              className="w-full border rounded-lg px-2 py-1.5 text-xs bg-gray-50 outline-none text-brand-dark font-semibold"
            >
              <option value="0">All Capacities</option>
              <option value="400">400 kg & above</option>
              <option value="600">600 kg & above</option>
              <option value="800">800 kg & above</option>
            </select>
          </div>

          {/* Electric Range filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase block">Min EV Range (Electric)</label>
            <select
              value={minRange}
              onChange={(e) => setMinRange(Number(e.target.value))}
              className="w-full border rounded-lg px-2 py-1.5 text-xs bg-gray-50 outline-none text-brand-dark font-semibold"
            >
              <option value="0">All Ranges</option>
              <option value="80">80 km / charge & above</option>
              <option value="100">100 km / charge & above</option>
              <option value="120">120 km / charge & above</option>
            </select>
          </div>
        </aside>

        {/* RESULTS GRID / LIST CONTAINER */}
        <section className="lg:col-span-3">
          {filteredVehicles.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {filteredVehicles.map(v => (
                <div key={v.id} className={viewMode === 'list' ? 'bg-white border rounded-xl overflow-hidden shadow-sm p-4 flex flex-col md:flex-row gap-6' : ''}>
                  {viewMode === 'grid' ? (
                    <VehicleCard vehicle={v} />
                  ) : (
                    // LIST VIEW LAYOUT
                    <>
                      {/* Left: Image */}
                      <div className="w-full md:w-56 shrink-0 rounded-lg overflow-hidden border">
                        <Link href={`/vehicles/${v.id}`}>
                          <div className="h-40 md:h-full bg-gray-100 flex items-center justify-center font-bold">
                            {/* Static-looking placeholder styled blueprint */}
                            <span className="text-xs text-primary">{v.brandName} - {v.fuelType}</span>
                          </div>
                        </Link>
                      </div>
                      {/* Right: Info */}
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">{v.brandName}</span>
                            <span className="text-xs font-bold bg-gray-100 px-2 py-0.5 rounded text-brand-dark">{v.fuelType}</span>
                          </div>
                          <h3 className="text-lg font-black text-brand-dark mt-1 hover:text-primary"><Link href={`/vehicles/${v.id}`}>{v.name}</Link></h3>
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">{v.expertReview}</p>
                          <div className="flex gap-4 mt-4 text-xs font-semibold text-gray-500">
                            <span>Payload: <strong className="text-brand-dark">{v.payloadCapacity}</strong></span>
                            <span>Range: <strong className="text-brand-dark">{v.batteryRange}</strong></span>
                            <span>Top Speed: <strong className="text-brand-dark">{v.topSpeed}</strong></span>
                          </div>
                        </div>
                        <div className="border-t pt-4 mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                          <span className="text-lg font-black text-brand-dark">₹{(v.priceMin/100000).toFixed(2)} - {(v.priceMax/100000).toFixed(2)} Lakh*</span>
                          <Link href={`/vehicles/${v.id}`} className="bg-primary hover:bg-primary-dark text-white font-bold text-xs px-6 py-2 rounded-lg">View Model Details</Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Empty State
            <div className="bg-white border rounded-xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
              <AlertCircle className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-lg font-black text-brand-dark">No Matching Vehicles Found</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                We couldn't find any three-wheeler models matching your active filter criteria. Try resetting your choices or sliding the price limit higher.
              </p>
              <button 
                onClick={handleResetFilters}
                className="bg-primary hover:bg-primary-dark text-white font-bold text-xs px-6 py-2.5 rounded-lg inline-block shadow-sm"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </section>
      </div>

      {/* MOBILE FILTERS MODAL DIALOG */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-4/5 max-w-sm bg-white h-full flex flex-col shadow-2xl p-5 animate-slide-in overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <span className="text-sm font-extrabold text-brand-dark">Filter Settings</span>
              <button onClick={() => setShowMobileFilters(false)} className="text-xs font-bold text-gray-400">Close ×</button>
            </div>

            <div className="space-y-6 flex-grow">
              {/* Reset link */}
              <button 
                onClick={() => {
                  handleResetFilters();
                  setShowMobileFilters(false);
                }}
                className="w-full text-center py-2 border border-brand-border rounded-lg text-xs font-bold hover:bg-gray-50 flex items-center justify-center gap-1.5"
              >
                <RefreshCcw className="w-3.5 h-3.5" /> Clear All Active Filters
              </button>

              {/* Search keyword inside catalog */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Search Models</label>
                <input
                  type="text"
                  placeholder="Type model name..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-gray-50 outline-none"
                />
              </div>

              {/* Category Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Body Configuration</label>
                <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-lg text-xs font-bold">
                  <button 
                    onClick={() => setSelectedCategory('all')}
                    className={`py-1.5 rounded text-center ${selectedCategory === 'all' ? 'bg-white text-brand-dark' : 'text-gray-500'}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setSelectedCategory('passenger')}
                    className={`py-1.5 rounded text-center ${selectedCategory === 'passenger' ? 'bg-white text-brand-dark' : 'text-gray-500'}`}
                  >
                    Pass.
                  </button>
                  <button 
                    onClick={() => setSelectedCategory('cargo')}
                    className={`py-1.5 rounded text-center ${selectedCategory === 'cargo' ? 'bg-white text-brand-dark' : 'text-gray-500'}`}
                  >
                    Cargo
                  </button>
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase">
                  <span className="text-gray-400">Max Ex-Showroom</span>
                  <span className="text-primary">₹{(priceRange/100000).toFixed(2)} L</span>
                </div>
                <input
                  type="range"
                  min="120000"
                  max="500000"
                  step="10000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg accent-primary"
                />
              </div>

              {/* Fuel Types checkboxes */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Fuel Type</label>
                <div className="space-y-1.5 text-xs text-brand-dark font-medium">
                  {fuelsList.map((fuel) => (
                    <label key={`mob-${fuel}`} className="flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedFuels.includes(fuel)}
                        onChange={() => handleFuelChange(fuel)}
                        className="mr-2 rounded border-gray-300 accent-primary w-4.5 h-4.5"
                      />
                      <span>{fuel} Rickshaws</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowMobileFilters(false)}
              className="w-full bg-primary hover:bg-primary-dark text-white font-extrabold text-sm py-3 rounded-lg mt-6 shadow-md"
            >
              Apply Filter Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VehiclesCatalogPage() {
  return (
    <>
      <Header />
      <main className="bg-brand-bg flex-grow min-h-screen">
        <Suspense fallback={
          <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs font-bold text-gray-400 uppercase">
            Loading Catalog Listings...
          </div>
        }>
          <VehiclesCatalogContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
