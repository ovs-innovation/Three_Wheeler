'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  MapPin, Search, ChevronDown, Menu, X, Heart,
  RefreshCw, Phone, ShieldCheck, Zap, Truck, Users,
  Newspaper, BookOpen, User, Calculator, MessageSquare, Award, Fuel
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
    searchHistory, addSearchTerm, clearSearchHistory,
    user, loading, logoutUser, openLoginModal, openRegisterModal, openEnquiryModal
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
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
      <div className="bg-[#111827] text-white text-[11px] py-1.5 px-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-gray-300">
              <Phone className="w-3.5 h-3.5 mr-1 text-[#C2410C]" /> Toll-Free: 1800-300-9999 (9 AM - 7 PM)
            </span>
            <span className="hidden md:flex items-center text-gray-300">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#C2410C]" /> India's Verified Fleet Platform
            </span>
          </div>
          <div className="flex items-center space-x-4 font-semibold">
            <Link href="/tools" className="hover:text-[#C2410C] transition-colors">Tools & Calculators</Link>
            <span className="text-gray-700">|</span>
            <Link href="/dealers" className="hover:text-[#C2410C] transition-colors">Dealer Locator</Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        {/* ROW 1: Logo, Search, Location, Action Widgets, Auth, CTA */}
        <div className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
            
            {/* Logo */}
            <Link href="/" className="flex flex-col flex-shrink-0">
              <span className="text-xl md:text-2xl font-black tracking-tight text-[#C2410C] flex items-center leading-none">
                Three<span className="text-gray-900 ml-0.5">Wheeler</span>
              </span>
              <span className="text-[9px] text-gray-400 font-semibold tracking-wide uppercase mt-0.5 leading-none">
                India's Trusted Fleet Portal
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:block flex-grow max-w-xl mx-6 relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search Auto Rickshaws, Cargo Loaders, EV Rickshaws..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full pl-4 pr-10 py-2.5 border border-gray-200 focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]/20 rounded-xl text-xs bg-gray-50 outline-none focus:bg-white transition-all font-semibold"
                />
                <button type="submit" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C2410C]">
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Suggestions Overlay */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 animate-fade-in text-brand-dark">
                  {searchQuery.trim() !== '' ? (
                    <div>
                      {filteredSuggestions.length > 0 ? (
                        <div className="py-2">
                          <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Matching Vehicles</div>
                          {filteredSuggestions.map((v) => (
                            <button
                              key={v.id}
                              onClick={() => handleSuggestionClick(v)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-xs flex justify-between items-center font-semibold"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-gray-900">{v.name}</span>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 uppercase">{v.fuelType}</span>
                              </div>
                              <span className="text-[#C2410C] font-extrabold">₹{(v.priceMin / 100000).toFixed(2)} - {(v.priceMax / 100000).toFixed(2)} Lakh*</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-4 text-center text-xs text-gray-400 font-semibold">No vehicles found matching "{searchQuery}"</div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 divide-x divide-gray-100">
                      <div className="p-3.5">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Trending Searches</div>
                        <div className="space-y-2">
                          {TRENDING_SEARCHES.map((term, index) => (
                            <button
                              key={index}
                              onClick={() => handleRecentSearchClick(term)}
                              className="w-full text-left text-xs text-gray-700 hover:text-[#C2410C] font-semibold transition-colors flex items-center"
                            >
                              <Search className="w-3.5 h-3.5 mr-2 text-gray-400" /> {term}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="p-3.5">
                        <div className="flex justify-between items-center mb-2.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Recent Searches</span>
                          {searchHistory.length > 0 && (
                            <button onClick={clearSearchHistory} className="text-[9px] text-[#C2410C] hover:underline font-bold">Clear</button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {searchHistory.length > 0 ? (
                            searchHistory.map((term, index) => (
                              <button
                                key={index}
                                onClick={() => handleRecentSearchClick(term)}
                                className="w-full text-left text-xs text-gray-700 hover:text-[#C2410C] font-semibold transition-colors flex items-center truncate"
                              >
                                <Search className="w-3.5 h-3.5 mr-2 text-gray-400" /> {term}
                              </button>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400 italic font-semibold block">No recent searches</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions & Buttons Row */}
            <div className="hidden lg:flex items-center space-x-5 flex-shrink-0">
              {/* Location Selector */}
              <div className="relative" ref={locationRef}>
                <button
                  onClick={() => setShowLocationModal(!showLocationModal)}
                  className="flex items-center text-xs font-extrabold text-gray-700 hover:text-[#C2410C] transition-colors gap-1"
                >
                  <MapPin className="w-4 h-4 text-[#C2410C]" />
                  <span>{location}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                {showLocationModal && (
                  <div className="absolute right-0 mt-2.5 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 z-50">
                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-2.5 tracking-wider">Popular Cities</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {POPULAR_CITIES.map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            updateLocation(city);
                            setShowLocationModal(false);
                          }}
                          className={`text-left text-xs px-2 py-2 rounded-xl transition-colors font-semibold ${location === city ? 'bg-orange-50 text-[#C2410C] font-bold' : 'hover:bg-gray-50 text-gray-700'}`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Compare Widget Link */}
              <Link href="/compare" className="flex items-center text-xs font-extrabold text-gray-700 hover:text-[#C2410C] transition-colors relative gap-1">
                <RefreshCw className="w-4 h-4" />
                <span>Compare</span>
                {compareList.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#C2410C] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {compareList.length}
                  </span>
                )}
              </Link>

              {/* Wishlist Link */}
              <Link href="/vehicles?filter=wishlist" className="flex items-center text-xs font-extrabold text-gray-700 hover:text-[#C2410C] transition-colors relative gap-1">
                <Heart className="w-4 h-4" />
                <span>Wishlist</span>
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#C2410C] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* User Account / Auth Dropdown */}
              <div className="h-6 w-px bg-gray-200"></div>

              {loading ? (
                <div className="w-20 h-5 bg-gray-100 animate-pulse rounded-lg"></div>
              ) : user ? (
                <div className="relative group py-2 flex items-center cursor-pointer">
                  <div className="flex items-center text-xs font-extrabold text-gray-700 hover:text-[#C2410C] transition-all gap-1.5">
                    <User className="w-4 h-4 text-[#C2410C]" />
                    <span className="max-w-[80px] truncate">{user.name || 'Account'}</span>
                    <ChevronDown className="w-3 h-3 text-gray-400 transition-transform group-hover:rotate-180" />
                  </div>
                  {/* Dropdown Options */}
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-xs text-gray-700">
                    <Link href="/profile" className="block px-4 py-2.5 font-bold hover:bg-gray-50 hover:text-[#C2410C] transition-colors">
                      View Profile
                    </Link>
                    <Link href="/profile/enquiries" className="block px-4 py-2.5 font-bold hover:bg-gray-50 hover:text-[#C2410C] transition-colors">
                      My Enquiries
                    </Link>
                    <hr className="border-gray-100 my-1.5" />
                    <button
                      onClick={async () => {
                        try {
                          logoutUser();
                           await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: 'POST' });
                        } catch (e) {
                          console.error(e);
                        } finally {
                          router.push('/');
                        }
                      }}
                      className="w-full text-left px-4 py-2.5 font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={openLoginModal} 
                    className="text-xs font-extrabold text-gray-700 hover:text-[#C2410C] px-3 py-2 transition-all rounded-xl hover:bg-gray-50 cursor-pointer"
                  >
                    Login
                  </button>
                  <button 
                    onClick={openRegisterModal} 
                    className="bg-[#C2410C] hover:bg-[#EA580C] text-white text-[11px] font-black px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              )}

              <div className="h-6 w-px bg-gray-200"></div>

              {/* Get Best Quotes CTA */}
              <button 
                onClick={() => openEnquiryModal('', 'Get Best Offer')}
                className="bg-gray-950 hover:bg-[#C2410C] text-white font-extrabold text-xs px-4.5 py-2 rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
              >
                Get Best Quotes
              </button>
            </div>

            {/* Mobile Hamburger Trigger */}
            <div className="flex lg:hidden items-center space-x-3">
              <button 
                onClick={() => openEnquiryModal('', 'Get Best Offer')}
                className="bg-[#C2410C] hover:bg-[#EA580C] text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Get Quotes
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-900 hover:text-[#C2410C] p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* ROW 2: Category Navigation with Icons */}
        <div className="hidden lg:block bg-white">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-12 text-xs font-extrabold text-gray-600">
            <div className="flex space-x-7 items-center h-full">
              
              {/* Electric */}
              <Link href="/vehicles?fuel=Electric" className="hover:text-[#C2410C] transition-colors flex items-center gap-1.5 py-3.5 border-b-2 border-transparent hover:border-[#C2410C] h-full animate-hover-fade">
                <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> Electric rickshaws
              </Link>
              
              {/* Passenger */}
              <Link href="/vehicles?category=Passenger" className="hover:text-[#C2410C] transition-colors flex items-center gap-1.5 py-3.5 border-b-2 border-transparent hover:border-[#C2410C] h-full">
                <Users className="w-3.5 h-3.5 text-gray-400" /> Passenger rickshaws
              </Link>
              
              {/* Cargo */}
              <Link href="/vehicles?category=Cargo" className="hover:text-[#C2410C] transition-colors flex items-center gap-1.5 py-3.5 border-b-2 border-transparent hover:border-[#C2410C] h-full">
                <Truck className="w-3.5 h-3.5 text-gray-400" /> Cargo loaders
              </Link>

              {/* Brands Hover Menu */}
              <div
                className="relative cursor-pointer hover:text-[#C2410C] flex items-center gap-1 py-3.5 border-b-2 border-transparent hover:border-[#C2410C] h-full"
                onMouseEnter={() => setActiveMegaMenu('brands')}
                onMouseLeave={() => setActiveMegaMenu(null)}
              >
                <Award className="w-3.5 h-3.5 text-gray-400" />
                <span>Brands</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
                {activeMegaMenu === 'brands' && (
                  <div className="absolute top-full left-0 w-[520px] bg-white border border-gray-100 rounded-b-2xl shadow-xl p-4 grid grid-cols-4 gap-3.5 z-50 text-xs text-gray-800">
                    {brandsData.slice(0, 16).map(brand => (
                      <Link key={brand.id} href={`/vehicles?brand=${brand.id}`} className="hover:text-[#C2410C] hover:underline transition-colors flex flex-col font-bold p-1">
                        {brand.name}
                        <span className="text-[10px] text-gray-400 font-semibold">Share: {brand.marketShare}</span>
                      </Link>
                    ))}
                    <div className="col-span-4 border-t border-gray-100 pt-2.5 mt-2 flex justify-between font-black text-[#C2410C]">
                      <Link href="/vehicles" className="hover:underline">View All Brands &rarr;</Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Fuel Types Dropdown */}
              <div
                className="relative cursor-pointer hover:text-[#C2410C] flex items-center gap-1 py-3.5 border-b-2 border-transparent hover:border-[#C2410C] h-full"
                onMouseEnter={() => setActiveMegaMenu('fuel')}
                onMouseLeave={() => setActiveMegaMenu(null)}
              >
                <Fuel className="w-3.5 h-3.5 text-gray-400" />
                <span>Fuel Types</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
                {activeMegaMenu === 'fuel' && (
                  <div className="absolute top-full left-0 w-[220px] bg-white border border-gray-100 rounded-b-2xl shadow-xl p-3.5 flex flex-col space-y-2.5 z-50 text-xs text-gray-800 font-bold">
                    <Link href="/vehicles?fuel=CNG" className="px-2 py-1.5 hover:bg-orange-50 hover:text-[#C2410C] rounded-xl transition-all">CNG Autos</Link>
                    <Link href="/vehicles?fuel=LPG" className="px-2 py-1.5 hover:bg-orange-50 hover:text-[#C2410C] rounded-xl transition-all">LPG Autos</Link>
                    <Link href="/vehicles?fuel=Electric" className="px-2 py-1.5 hover:bg-orange-50 hover:text-[#C2410C] rounded-xl transition-all">Electric Autos (EV)</Link>
                    <Link href="/vehicles?fuel=Diesel" className="px-2 py-1.5 hover:bg-orange-50 hover:text-[#C2410C] rounded-xl transition-all">Diesel Vehicles</Link>
                    <Link href="/vehicles?fuel=Petrol" className="px-2 py-1.5 hover:bg-orange-50 hover:text-[#C2410C] rounded-xl transition-all">Petrol Rickshaws</Link>
                  </div>
                )}
              </div>

              {/* EMI Calculator */}
              <Link href="/tools" className="hover:text-[#C2410C] transition-colors flex items-center gap-1.5 py-3.5 border-b-2 border-transparent hover:border-[#C2410C] h-full">
                <Calculator className="w-3.5 h-3.5 text-gray-400" /> EMI Calculator
              </Link>

              {/* News */}
              <Link href="/news" className="hover:text-[#C2410C] transition-colors flex items-center gap-1.5 py-3.5 border-b-2 border-transparent hover:border-[#C2410C] h-full">
                <Newspaper className="w-3.5 h-3.5 text-gray-400" /> Commercial News
              </Link>

              {/* Blogs */}
              <Link href="/blogs" className="hover:text-[#C2410C] transition-colors flex items-center gap-1.5 py-3.5 border-b-2 border-transparent hover:border-[#C2410C] h-full">
                <BookOpen className="w-3.5 h-3.5 text-gray-400" /> Buying Guides
              </Link>
            </div>

            {/* Enquiry Trigger Button */}
            <button 
              onClick={() => openEnquiryModal('', 'Dealer Enquiry')} 
              className="hover:text-[#C2410C] text-gray-600 transition-colors flex items-center gap-1.5 py-3.5 cursor-pointer border-b-2 border-transparent hover:border-[#C2410C] h-full"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#C2410C]" /> Enquiry Desk
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl p-4 space-y-4 max-h-[85vh] overflow-y-auto z-50 text-xs font-semibold text-gray-700">
            {/* Search Input for Mobile */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search Auto Rickshaws, Cargo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white outline-none"
              />
              <button type="submit" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Location Selector for Mobile */}
            <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-4 h-4 text-[#C2410C]" /> Active Location
              </span>
              <select
                value={location}
                onChange={(e) => updateLocation(e.target.value)}
                className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 outline-none font-bold"
              >
                {POPULAR_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Authentication Mobile Cards */}
            {user ? (
              <div className="py-2 border-b border-gray-100 flex flex-col space-y-2">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Account Access ({user.name})</div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1 font-bold">
                  <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 bg-gray-50 hover:bg-orange-50 hover:text-[#C2410C] rounded-xl text-gray-700 transition-colors">
                    Profile
                  </Link>
                  <Link href="/profile/enquiries" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 bg-gray-50 hover:bg-orange-50 hover:text-[#C2410C] rounded-xl text-gray-700 transition-colors">
                    Enquiries
                  </Link>
                  <button
                    onClick={async () => {
                      try {
                        logoutUser();
                         await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: 'POST' });
                      } catch (e) {
                        console.error(e);
                      } finally {
                        router.push('/');
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    className="py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-3 border-b border-gray-100 flex flex-col gap-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Secure Access</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openLoginModal();
                    }}
                    className="w-full py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openRegisterModal();
                    }}
                    className="w-full py-2.5 bg-[#C2410C] hover:bg-[#EA580C] text-white rounded-xl font-bold shadow-sm"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Categories Links */}
            <div className="flex flex-col space-y-1 font-bold text-gray-700">
              <Link href="/vehicles?fuel=Electric" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 border-b border-gray-100 flex items-center justify-between hover:text-[#C2410C]">
                <span>Electric Rickshaws</span> <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              </Link>
              <Link href="/vehicles?category=Passenger" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 border-b border-gray-100 flex items-center justify-between hover:text-[#C2410C]">
                <span>Passenger rickshaws</span> <Users className="w-4 h-4 text-gray-400" />
              </Link>
              <Link href="/vehicles?category=Cargo" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 border-b border-gray-100 flex items-center justify-between hover:text-[#C2410C]">
                <span>Cargo loaders</span> <Truck className="w-4 h-4 text-gray-400" />
              </Link>
              <Link href="/compare" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 border-b border-gray-100 flex items-center justify-between hover:text-[#C2410C]">
                <span>Compare Vehicles</span>
                {compareList.length > 0 && <span className="bg-[#C2410C] text-white text-xs px-2 py-0.5 rounded-full font-bold">{compareList.length}</span>}
              </Link>
              <Link href="/tools" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 border-b border-gray-100 hover:text-[#C2410C]">EMI & Calculators</Link>
              <Link href="/dealers" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 border-b border-gray-100 hover:text-[#C2410C]">Dealer Locator</Link>
              <Link href="/news" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 border-b border-gray-100 hover:text-[#C2410C]">Commercial News</Link>
              <Link href="/blogs" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 border-b border-gray-100 hover:text-[#C2410C]">Buying Guides</Link>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openEnquiryModal('', 'Dealer Enquiry');
                }} 
                className="w-full text-left py-2.5 hover:text-[#C2410C] flex items-center justify-between cursor-pointer"
              >
                <span>Enquiry Desk</span> <MessageSquare className="w-4 h-4 text-[#C2410C]" />
              </button>
            </div>

            {/* Mobile Wishlist link */}
            <div className="flex pt-2">
              <Link
                href="/vehicles?filter=wishlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 flex items-center justify-center font-bold"
              >
                <Heart className="w-4 h-4 mr-1.5 text-[#C2410C] fill-[#C2410C]" /> Wishlist ({wishlist.length})
              </Link>
            </div>
          </div>
        )}

      </header>
    </>
  );
}