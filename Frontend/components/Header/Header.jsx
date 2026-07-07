'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  MapPin, Search, ChevronDown, Menu, X, Heart, 
  RefreshCw, Phone, ShieldCheck, Zap, Truck, Users, 
  HelpCircle, Newspaper, BookOpen
} from 'lucide-react';
import vehiclesData from '@/data/vehicles.json';
import brandsData from '@/data/brands.json';

const POPULAR_CITIES = [
  'Delhi/NCR', 'Mumbai', 'Bengaluru', 'Chennai', 'Kolkata', 
  'Pune', 'Ahmedabad', 'Lucknow', 'Patna', 'Hyderabad', 
  'Jaipur', 'Indore'
];

const TRENDING_SEARCHES = [
  'Mahindra Treo EV', 'Bajaj RE CNG', 'Piaggio Ape Cargo', 'Euler HiLoad', 'Altigreen neEV'
];

export default function Header() {
  const router = useRouter();
  const { 
    location, updateLocation, wishlist, compareList, 
    searchHistory, addSearchTerm, clearSearchHistory 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null); // 'brands' | 'fuel' | 'categories' | null
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  
  const searchRef = useRef(null);
  const locationRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationModal(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions when typing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSuggestions([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const matches = vehiclesData
      .filter(v => 
        v.name.toLowerCase().includes(query) || 
        v.brandName.toLowerCase().includes(query) ||
        v.category.toLowerCase().includes(query) ||
        v.fuelType.toLowerCase().includes(query)
      )
      .slice(0, 6);
    setFilteredSuggestions(matches);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addSearchTerm(searchQuery.trim());
      setShowSuggestions(false);
      router.push(`/vehicles?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    addSearchTerm(suggestion.name);
    setSearchQuery('');
    setShowSuggestions(false);
    router.push(`/vehicles/${suggestion.id}`);
  };

  const handleRecentSearchClick = (term) => {
    setSearchQuery(term);
    addSearchTerm(term);
    setShowSuggestions(false);
    router.push(`/vehicles?q=${encodeURIComponent(term)}`);
  };

  return (
    <>
      {/* Top Banner (Info and Trust) */}
      <div className="bg-brand-dark text-white text-xs py-2 px-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-gray-300">
              <Phone className="w-3.5 h-3.5 mr-1 text-primary" /> Toll-Free: 1800-300-9999 (9 AM - 7 PM)
            </span>
            <span className="hidden md:flex items-center text-gray-300">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-primary" /> India's Verified Fleet Platform
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/tools" className="hover:text-primary transition-colors">Tools & Calculators</Link>
            <span className="text-gray-600">|</span>
            <Link href="/dealers" className="hover:text-primary transition-colors">Dealer Locator</Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-brand-border shadow-sm glass-nav">
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex flex-col flex-shrink-0">
            <span className="text-xl md:text-2xl font-extrabold tracking-tight text-primary flex items-center">
              Auto<span className="text-brand-dark">Junction</span>
            </span>
            <span className="text-[9px] md:text-[10px] text-gray-500 font-medium tracking-wide uppercase leading-none">
              India's Trusted Three Wheeler Portal
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:block flex-1 max-w-xl mx-8 relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search Auto Rickshaws, Cargo Loaders, EV Rickshaws..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-4 pr-10 py-2 border-2 border-brand-border focus:border-primary rounded-lg text-sm bg-gray-50 outline-none focus:bg-white transition-all"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Suggestions Overlay */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-brand-border rounded-lg shadow-xl overflow-hidden z-50">
                {/* Suggestions Matching Input */}
                {searchQuery.trim() !== '' ? (
                  <div>
                    {filteredSuggestions.length > 0 ? (
                      <div className="py-2">
                        <div className="px-4 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Matching Vehicles</div>
                        {filteredSuggestions.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => handleSuggestionClick(v)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex justify-between items-center"
                          >
                            <div>
                              <span className="font-semibold text-brand-dark">{v.name}</span>
                              <span className="ml-2 text-xs font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{v.fuelType}</span>
                            </div>
                            <span className="text-primary text-xs font-semibold">₹{(v.priceMin/100000).toFixed(2)} - {(v.priceMax/100000).toFixed(2)} Lakh*</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-4 text-center text-sm text-gray-500">No vehicles found matching "{searchQuery}"</div>
                    )}
                  </div>
                ) : (
                  // Default Dropdown content: Trending & History
                  <div className="grid grid-cols-2 divide-x divide-gray-100">
                    <div className="p-3">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Trending Searches</div>
                      <div className="space-y-1.5">
                        {TRENDING_SEARCHES.map((term, index) => (
                          <button
                            key={index}
                            onClick={() => handleRecentSearchClick(term)}
                            className="w-full text-left text-sm text-brand-dark hover:text-primary transition-colors flex items-center"
                          >
                            <Search className="w-3.5 h-3.5 mr-2 text-gray-400" /> {term}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Searches</span>
                        {searchHistory.length > 0 && (
                          <button onClick={clearSearchHistory} className="text-[10px] text-primary hover:underline">Clear</button>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {searchHistory.length > 0 ? (
                          searchHistory.map((term, index) => (
                            <button
                              key={index}
                              onClick={() => handleRecentSearchClick(term)}
                              className="w-full text-left text-sm text-brand-dark hover:text-primary transition-colors flex items-center truncate"
                            >
                              <Search className="w-3.5 h-3.5 mr-2 text-gray-400" /> {term}
                            </button>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic block">No recent searches</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Location selector, Compare, Wishlist, Call - Desktop */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Location Selector */}
            <div className="relative" ref={locationRef}>
              <button 
                onClick={() => setShowLocationModal(!showLocationModal)}
                className="flex items-center text-sm font-semibold hover:text-primary transition-colors"
              >
                <MapPin className="w-4 h-4 mr-1 text-primary" />
                <span>{location}</span>
                <ChevronDown className="w-3.5 h-3.5 ml-1 text-gray-500" />
              </button>
              {showLocationModal && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-brand-border rounded-lg shadow-xl p-3 z-50">
                  <div className="text-xs font-bold text-gray-400 uppercase mb-2">Popular Cities</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {POPULAR_CITIES.map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          updateLocation(city);
                          setShowLocationModal(false);
                        }}
                        className={`text-left text-xs px-2 py-1.5 rounded transition-colors ${location === city ? 'bg-primary-light text-primary font-bold' : 'hover:bg-gray-100 text-brand-dark'}`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Compare Link */}
            <Link href="/compare" className="flex items-center text-sm font-semibold text-brand-dark hover:text-primary transition-colors relative">
              <RefreshCw className="w-4 h-4 mr-1.5" />
              <span>Compare</span>
              {compareList.length > 0 && (
                <span className="absolute -top-2.5 -right-2 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {compareList.length}
                </span>
              )}
            </Link>

            {/* Wishlist Link */}
            <Link href="/vehicles?filter=wishlist" className="flex items-center text-sm font-semibold text-brand-dark hover:text-primary transition-colors relative">
              <Heart className="w-4 h-4 mr-1.5" />
              <span>Wishlist</span>
              {wishlist.length > 0 && (
                <span className="absolute -top-2.5 -right-2 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Quote Button */}
            <Link href="/dealers" className="bg-primary hover:bg-primary-dark text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors shadow-sm">
              Get Best Quotes
            </Link>
          </div>

          {/* Mobile Right Buttons (Search, Menu) */}
          <div className="flex lg:hidden items-center space-x-4">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-brand-dark hover:text-primary"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Categories Bar / Mega Menu - Desktop */}
        <div className="hidden lg:block border-t border-brand-border bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 flex space-x-8 h-12 items-center text-sm font-bold text-gray-700">
            <Link href="/vehicles?fuel=Electric" className="hover:text-primary transition-colors flex items-center">
              <Zap className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" /> Electric Autos
            </Link>
            <Link href="/vehicles?category=Passenger" className="hover:text-primary transition-colors flex items-center">
              <Users className="w-4 h-4 mr-1 text-gray-500" /> Passenger Rickshaws
            </Link>
            <Link href="/vehicles?category=Cargo" className="hover:text-primary transition-colors flex items-center">
              <Truck className="w-4 h-4 mr-1 text-gray-500" /> Cargo Loaders
            </Link>
            <div 
              className="relative py-3.5 cursor-pointer hover:text-primary flex items-center"
              onMouseEnter={() => setActiveMegaMenu('brands')}
              onMouseLeave={() => setActiveMegaMenu(null)}
            >
              Brands <ChevronDown className="w-3.5 h-3.5 ml-1" />
              {activeMegaMenu === 'brands' && (
                <div className="absolute top-full left-0 w-[550px] bg-white border border-brand-border rounded-b-lg shadow-xl p-4 grid grid-cols-4 gap-3 z-50 text-xs text-brand-dark">
                  {brandsData.slice(0, 16).map(brand => (
                    <Link key={brand.id} href={`/vehicles?brand=${brand.id}`} className="hover:text-primary hover:underline transition-colors flex flex-col font-medium p-1">
                      {brand.name}
                      <span className="text-[10px] text-gray-400">Share: {brand.marketShare}</span>
                    </Link>
                  ))}
                  <div className="col-span-4 border-t pt-2 mt-2 flex justify-between font-bold text-primary">
                    <Link href="/vehicles" className="hover:underline">View All Brands &rarr;</Link>
                  </div>
                </div>
              )}
            </div>

            <div 
              className="relative py-3.5 cursor-pointer hover:text-primary flex items-center"
              onMouseEnter={() => setActiveMegaMenu('fuel')}
              onMouseLeave={() => setActiveMegaMenu(null)}
            >
              Fuel Types <ChevronDown className="w-3.5 h-3.5 ml-1" />
              {activeMegaMenu === 'fuel' && (
                <div className="absolute top-full left-0 w-[240px] bg-white border border-brand-border rounded-b-lg shadow-xl p-3 flex flex-col space-y-2 z-50 text-xs text-brand-dark font-medium">
                  <Link href="/vehicles?fuel=CNG" className="px-2 py-1.5 hover:bg-primary-light hover:text-primary rounded">CNG Three Wheelers</Link>
                  <Link href="/vehicles?fuel=LPG" className="px-2 py-1.5 hover:bg-primary-light hover:text-primary rounded">LPG Three Wheelers</Link>
                  <Link href="/vehicles?fuel=Electric" className="px-2 py-1.5 hover:bg-primary-light hover:text-primary rounded">Electric (EV) Three Wheelers</Link>
                  <Link href="/vehicles?fuel=Diesel" className="px-2 py-1.5 hover:bg-primary-light hover:text-primary rounded">Diesel Three Wheelers</Link>
                  <Link href="/vehicles?fuel=Petrol" className="px-2 py-1.5 hover:bg-primary-light hover:text-primary rounded">Petrol Three Wheelers</Link>
                </div>
              )}
            </div>

            <Link href="/compare" className="hover:text-primary transition-colors flex items-center">
              Compare Tool
            </Link>
            <Link href="/tools" className="hover:text-primary transition-colors flex items-center">
              EMI & Running Cost
            </Link>
            <Link href="/news" className="hover:text-primary transition-colors flex items-center">
              <Newspaper className="w-4 h-4 mr-1 text-gray-500" /> News
            </Link>
            <Link href="/blogs" className="hover:text-primary transition-colors flex items-center">
              <BookOpen className="w-4 h-4 mr-1 text-gray-500" /> Business Blogs
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-brand-border shadow-xl p-4 space-y-4 max-h-[85vh] overflow-y-auto z-50">
            {/* Search Input for Mobile */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-brand-border rounded-lg text-sm bg-gray-50"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Mobile Location Selector */}
            <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
              <span className="text-xs text-gray-500 flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-primary" /> Active Location
              </span>
              <select 
                value={location} 
                onChange={(e) => updateLocation(e.target.value)}
                className="text-xs font-semibold bg-white border rounded p-1 outline-none text-brand-dark"
              >
                {POPULAR_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Mobile Links */}
            <div className="flex flex-col space-y-3 font-semibold text-gray-800 text-sm">
              <Link href="/vehicles?fuel=Electric" onClick={() => setIsMobileMenuOpen(false)} className="py-1 border-b border-gray-100 flex items-center justify-between">
                <span>Electric Rickshaws</span> <Zap className="w-4 h-4 text-yellow-500" />
              </Link>
              <Link href="/vehicles?category=Passenger" onClick={() => setIsMobileMenuOpen(false)} className="py-1 border-b border-gray-100">Passenger Autos</Link>
              <Link href="/vehicles?category=Cargo" onClick={() => setIsMobileMenuOpen(false)} className="py-1 border-b border-gray-100">Cargo Loaders</Link>
              <Link href="/compare" onClick={() => setIsMobileMenuOpen(false)} className="py-1 border-b border-gray-100 flex items-center justify-between">
                <span>Compare Vehicles</span>
                {compareList.length > 0 && <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold">{compareList.length}</span>}
              </Link>
              <Link href="/tools" onClick={() => setIsMobileMenuOpen(false)} className="py-1 border-b border-gray-100">EMI & Cost Calculator</Link>
              <Link href="/dealers" onClick={() => setIsMobileMenuOpen(false)} className="py-1 border-b border-gray-100">Dealer Locator</Link>
              <Link href="/news" onClick={() => setIsMobileMenuOpen(false)} className="py-1 border-b border-gray-100">Commercial News</Link>
              <Link href="/blogs" onClick={() => setIsMobileMenuOpen(false)} className="py-1 border-b border-gray-100">Buying Blogs</Link>
            </div>
            
            <div className="flex space-x-2 pt-2">
              <Link 
                href="/vehicles?filter=wishlist" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="flex-1 text-center py-2 bg-gray-100 rounded-lg text-sm text-brand-dark flex items-center justify-center font-medium"
              >
                <Heart className="w-4 h-4 mr-1.5 text-primary fill-primary" /> Wishlist ({wishlist.length})
              </Link>
              <Link 
                href="/dealers" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="flex-1 text-center py-2 bg-primary text-white rounded-lg text-sm font-semibold shadow-sm"
              >
                Get Quotes
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
