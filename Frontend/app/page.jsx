'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import VehicleCard from '@/components/VehicleCard/VehicleCard';
import staticVehicles from '@/data/vehicles.json';
import staticBrands from '@/data/brands.json';
import staticNews from '@/data/news.json';
import staticBlogs from '@/data/blogs.json';
import faqsData from '@/data/faqs.json';
import { 
  Search, Shield, Tag, Compass, Award, Building2, 
  HelpCircle, ChevronRight, Zap, RefreshCw, Calculator, 
  Calendar, Layers, Users, MapPin, TrendingUp
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  // Search and selector state
  const [heroSearch, setHeroSearch] = useState('');
  const [activeBrowseTab, setActiveBrowseTab] = useState('fuel');
  
  // Compare Widget local state
  const [compareV1, setCompareV1] = useState('');
  const [compareV2, setCompareV2] = useState('');

  // Quick Finance State
  const [finLoan, setFinLoan] = useState(250000);
  const [finTenure, setFinTenure] = useState(36); // months
  const [finInterest, setFinInterest] = useState(9.5); // %

  // Dealer Quick Search
  const [dealerState, setDealerState] = useState('');

  // Live Data States
  const [liveVehicles, setLiveVehicles] = useState(staticVehicles);
  const [liveBrands, setLiveBrands] = useState(staticBrands);
  const [liveNews, setLiveNews] = useState(staticNews);
  const [liveBlogs, setLiveBlogs] = useState(staticBlogs);

  useEffect(() => {
    const fetchLiveHomeData = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.warn('NEXT_PUBLIC_API_URL is not set, using static data.');
        return;
      }
      try {
        const [resVehicles, resBrands, resNews, resBlogs] = await Promise.all([
          fetch(`${apiUrl}/vehicles?limit=24`).then(r => r.json()),
          fetch(`${apiUrl}/brands`).then(r => r.json()),
          fetch(`${apiUrl}/news`).then(r => r.json()),
          fetch(`${apiUrl}/blogs`).then(r => r.json())
        ]);

        if (resVehicles.success && resVehicles.data?.vehicles) {
          setLiveVehicles(resVehicles.data.vehicles);
        }
        if (resBrands.success && resBrands.data) {
          setLiveBrands(resBrands.data);
        }
        if (resNews.success && resNews.data) {
          setLiveNews(resNews.data);
        }
        if (resBlogs.success && resBlogs.data) {
          setLiveBlogs(resBlogs.data);
        }
      } catch (err) {
        console.error('Failed to sync live home data, using static files:', err);
      }
    };
    fetchLiveHomeData();
  }, []);

  const vehiclesData = liveVehicles;
  const brandsData = liveBrands;
  const newsData = liveNews;
  const blogsData = liveBlogs;
  
  // Filter popular categories
  const popularPassenger = vehiclesData.filter(v => { const cat = (v.category || v.vehicleType || '').toLowerCase(); return cat.includes('passenger') || cat.includes('auto') || (v.cargoPassenger && v.cargoPassenger.toLowerCase() === 'passenger'); }).slice(0, 4);
  const popularCargo = vehiclesData.filter(v => { const cat = (v.category || v.vehicleType || '').toLowerCase(); return cat.includes('cargo') || cat.includes('loader') || cat.includes('pickup') || (v.cargoPassenger && v.cargoPassenger.toLowerCase() === 'cargo'); }).slice(0, 4);
  const electricModels = vehiclesData.filter(v => v.fuelType === 'Electric').slice(0, 4);

  // Filter latest and news
  const latestNews = newsData.slice(0, 3);
  const latestBlogs = blogsData.slice(0, 3);
  
  // Toggle FAQ accordion
  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleHeroSearchSubmit = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      router.push(`/vehicles?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  const handleCompareSubmit = (e) => {
    e.preventDefault();
    if (compareV1 && compareV2) {
      router.push(`/compare?v1=${compareV1}&v2=${compareV2}`);
    } else {
      alert('Please select two vehicles to compare.');
    }
  };

  // Compute Quick EMI
  const monthlyInterestRate = (finInterest / 12) / 100;
  const emiNumerator = finLoan * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, finTenure);
  const emiDenominator = Math.pow(1 + monthlyInterestRate, finTenure) - 1;
  const quickEmi = Math.round(emiNumerator / emiDenominator);

  return (
    <>
      <Header />
      <main className="flex-grow">
        
        {/* HERO SECTION */}
        <section className="relative bg-brand-dark text-white overflow-hidden py-16 md:py-24">
          {/* Banner Image Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-25 z-0" 
            style={{ backgroundImage: "url('/images/hero_banner.png')" }} 
          />
          {/* Dark Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/95 to-transparent z-0" />
          
          <div className="max-w-7xl mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase inline-block">
                ★ India's Premier Three-Wheeler Marketplace
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Compare and Buy the Best <span className="text-primary">Three Wheelers</span> in India
              </h1>
              <p className="text-gray-300 text-sm md:text-base max-w-xl font-medium">
                Get ex-showroom prices, payload details, battery range, running cost calculators, and EMI support for auto rickshaws, loader tempos, and e-rickshaws.
              </p>

              {/* Large Search Form */}
              <form onSubmit={handleHeroSearchSubmit} className="flex flex-col sm:flex-row gap-2 max-w-2xl bg-white p-2 rounded-xl shadow-lg border border-gray-100">
                <div className="flex-1 flex items-center px-3 py-1 bg-gray-50 rounded-lg">
                  <Search className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter brand name, model, fuel type (e.g. TVS King, CNG)..."
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    className="w-full bg-transparent border-none text-sm text-brand-dark outline-none py-2"
                  />
                </div>
                <button 
                  type="submit" 
                  className="bg-primary hover:bg-primary-dark text-white font-extrabold text-sm px-8 py-3 rounded-lg flex items-center justify-center transition-colors shrink-0 gap-1.5"
                >
                  Search Vehicles <ChevronRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Navigation Cards */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-gray-400 py-1 font-bold">Popular Searches:</span>
                <Link href="/vehicles?q=Bajaj%20RE" className="bg-gray-800 hover:bg-primary hover:text-white px-3 py-1 rounded-full transition-colors border border-gray-700">Bajaj RE</Link>
                <Link href="/vehicles?fuel=Electric" className="bg-gray-800 hover:bg-primary hover:text-white px-3 py-1 rounded-full transition-colors border border-gray-700">Electric Rickshaws</Link>
                <Link href="/vehicles?q=Euler%20HiLoad" className="bg-gray-800 hover:bg-primary hover:text-white px-3 py-1 rounded-full transition-colors border border-gray-700">Euler Cargo</Link>
                <Link href="/vehicles?fuel=CNG" className="bg-gray-800 hover:bg-primary hover:text-white px-3 py-1 rounded-full transition-colors border border-gray-700">CNG Loaders</Link>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-4 gap-4 border-t border-gray-800 pt-6 max-w-xl text-center md:text-left">
                <div>
                  <div className="text-xl md:text-2xl font-black text-white">150+</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Models</div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-black text-white">20+</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Top Brands</div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-black text-white">500+</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Dealers</div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-black text-white">10k+</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Customers</div>
                </div>
              </div>

            </div>

            {/* Right Interactive Card: Compare Widget */}
            <div className="lg:col-span-5 bg-white text-brand-dark p-6 rounded-2xl shadow-2xl border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center text-primary text-xs font-bold gap-1 mb-1">
                  <RefreshCw className="w-3.5 h-3.5 text-primary" /> Multi-Vehicle Compare Tool
                </div>
                <h3 className="text-lg font-black text-brand-dark mb-4">Compare Three Wheelers Side-by-Side</h3>
                <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                  Select two vehicles to compare their ex-showroom prices, fuel mileage, battery capacities, motor/engine power, payload volume, and warranty.
                </p>

                <form onSubmit={handleCompareSubmit} className="space-y-4">
                  {/* Select Vehicle 1 */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Select First Vehicle</label>
                    <select 
                      value={compareV1} 
                      onChange={(e) => setCompareV1(e.target.value)}
                      className="w-full border border-brand-border rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:bg-white outline-none focus:border-primary text-brand-dark font-medium"
                    >
                      <option value="">-- Choose Model 1 --</option>
                      {vehiclesData.slice(0, 50).map(v => (
                        <option key={`v1-${v.id}`} value={v.id}>{v.name} ({v.fuelType})</option>
                      ))}
                    </select>
                  </div>

                  {/* Select Vehicle 2 */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Select Second Vehicle</label>
                    <select 
                      value={compareV2} 
                      onChange={(e) => setCompareV2(e.target.value)}
                      className="w-full border border-brand-border rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:bg-white outline-none focus:border-primary text-brand-dark font-medium"
                    >
                      <option value="">-- Choose Model 2 --</option>
                      {vehiclesData.slice(10, 60).map(v => (
                        <option key={`v2-${v.id}`} value={v.id}>{v.name} ({v.fuelType})</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-dark text-white font-extrabold text-sm py-3 rounded-lg flex items-center justify-center transition-colors shadow-sm mt-6"
                  >
                    Compare Specifications
                  </button>
                </form>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                <span>Want to compare up to 4 models?</span>
                <Link href="/compare" className="text-primary hover:underline font-bold flex items-center">Open Compare Matrix &rarr;</Link>
              </div>
            </div>

          </div>
        </section>

        {/* TOP BRANDS */}
        <section className="py-12 bg-white border-b border-brand-border">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-black text-brand-dark">Featured Three Wheeler Brands</h2>
                <p className="text-xs text-gray-500 mt-1">Browse vehicles from India's leading passenger and cargo auto-rickshaw manufacturers.</p>
              </div>
              <Link href="/vehicles" className="text-xs font-bold text-primary hover:underline flex items-center">View All Brands &rarr;</Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {brandsData.slice(0, 8).map(brand => (
                <Link 
                  key={brand.id} 
                  href={`/vehicles?brand=${brand.id}`}
                  className="border border-brand-border rounded-xl p-4 flex flex-col items-center justify-center text-center hover-scale bg-gray-50 hover:bg-white transition-all"
                >
                  {/* Styled Logo Placeholder (since image path doesn't physically exist) */}
                  <div className="w-12 h-12 bg-primary-light text-primary font-black rounded-full flex items-center justify-center text-sm shadow-inner mb-2 border border-primary/20">
                    {brand.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-extrabold text-brand-dark leading-tight">{brand.name}</span>
                  <span className="text-[10px] text-gray-400 mt-0.5 font-bold uppercase">{brand.marketShare} Share</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* BROWSE TABS SYSTEM */}
        <section className="py-12 bg-brand-bg">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-black text-brand-dark text-center mb-6">Find Three Wheelers Your Way</h2>
            
            {/* Tab Headers */}
            <div className="flex justify-center border-b border-brand-border mb-8 max-w-lg mx-auto text-xs md:text-sm font-bold">
              <button 
                onClick={() => setActiveBrowseTab('fuel')} 
                className={`flex-1 pb-3 text-center transition-colors border-b-2 ${activeBrowseTab === 'fuel' ? 'border-primary text-primary font-black' : 'border-transparent text-gray-500 hover:text-brand-dark'}`}
              >
                Browse By Fuel
              </button>
              <button 
                onClick={() => setActiveBrowseTab('price')} 
                className={`flex-1 pb-3 text-center transition-colors border-b-2 ${activeBrowseTab === 'price' ? 'border-primary text-primary font-black' : 'border-transparent text-gray-500 hover:text-brand-dark'}`}
              >
                Browse By Budget
              </button>
              <button 
                onClick={() => setActiveBrowseTab('payload')} 
                className={`flex-1 pb-3 text-center transition-colors border-b-2 ${activeBrowseTab === 'payload' ? 'border-primary text-primary font-black' : 'border-transparent text-gray-500 hover:text-brand-dark'}`}
              >
                Browse By Load
              </button>
              <button 
                onClick={() => setActiveBrowseTab('category')} 
                className={`flex-1 pb-3 text-center transition-colors border-b-2 ${activeBrowseTab === 'category' ? 'border-primary text-primary font-black' : 'border-transparent text-gray-500 hover:text-brand-dark'}`}
              >
                Category
              </button>
            </div>

            {/* Tab Content */}
            <div className="max-w-4xl mx-auto">
              
              {activeBrowseTab === 'fuel' && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'CNG Autos', link: '/vehicles?fuel=CNG', desc: 'Max operational savings', color: 'bg-green-50 text-brand-green border-green-200' },
                    { label: 'Electric Autos', link: '/vehicles?fuel=Electric', desc: 'Zero emissions, green subsidies', color: 'bg-green-50 text-brand-green border-green-200' },
                    { label: 'Diesel Autos', link: '/vehicles?fuel=Diesel', desc: 'High torque cargo loaders', color: 'bg-gray-50 text-gray-700 border-gray-200' },
                    { label: 'LPG Autos', link: '/vehicles?fuel=LPG', desc: 'Quiet urban passenger trips', color: 'bg-orange-50 text-orange-700 border-orange-200' },
                    { label: 'Petrol Autos', link: '/vehicles?fuel=Petrol', desc: 'Low maintenance, cheap entry', color: 'bg-orange-50 text-orange-700 border-orange-200' },
                  ].map((item, idx) => (
                    <Link key={idx} href={item.link} className={`border rounded-xl p-4 text-center hover-scale bg-white flex flex-col justify-center`}>
                      <span className="font-extrabold text-sm text-brand-dark">{item.label}</span>
                      <span className="text-[10px] text-gray-400 mt-1">{item.desc}</span>
                    </Link>
                  ))}
                </div>
              )}

              {activeBrowseTab === 'price' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Under ₹1.5 Lakh', link: '/vehicles?maxPrice=150000', desc: 'Affordable Petrol & E-rickshaws' },
                    { label: '₹1.5 - 2.5 Lakh', link: '/vehicles?minPrice=150000&maxPrice=250000', desc: 'Popular CNG & LPG Autos' },
                    { label: '₹2.5 - 3.5 Lakh', link: '/vehicles?minPrice=250000&maxPrice=350000', desc: 'Diesel & Smart Passenger EVs' },
                    { label: 'Above ₹3.5 Lakh', link: '/vehicles?minPrice=350000', desc: 'Heavy Utility Electric Loaders' },
                  ].map((item, idx) => (
                    <Link key={idx} href={item.link} className="border border-brand-border bg-white rounded-xl p-4 text-center hover-scale">
                      <span className="font-extrabold text-sm text-brand-dark block">{item.label}</span>
                      <span className="text-[10px] text-gray-400 mt-1 block">{item.desc}</span>
                    </Link>
                  ))}
                </div>
              )}

              {activeBrowseTab === 'payload' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Under 500 kg', link: '/vehicles?maxPayload=500', desc: 'Light urban delivery' },
                    { label: '500 - 700 kg', link: '/vehicles?minPayload=500&maxPayload=700', desc: 'Standard market loader' },
                    { label: '700 - 900 kg', link: '/vehicles?minPayload=700&maxPayload=900', desc: 'Industrial logistics' },
                    { label: 'Above 900 kg', link: '/vehicles?minPayload=900', desc: 'Heavy-duty cargo haulage' },
                  ].map((item, idx) => (
                    <Link key={idx} href={item.link} className="border border-brand-border bg-white rounded-xl p-4 text-center hover-scale">
                      <span className="font-extrabold text-sm text-brand-dark block">{item.label}</span>
                      <span className="text-[10px] text-gray-400 mt-1 block">{item.desc}</span>
                    </Link>
                  ))}
                </div>
              )}

              {activeBrowseTab === 'category' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Passenger Autos', link: '/vehicles?category=Passenger', desc: 'D+3 & D+4 public transit' },
                    { label: 'Cargo Loaders', link: '/vehicles?category=Cargo', desc: 'Closed canopy & loader cages' },
                    { label: 'Electric E-Rickshaws', link: '/vehicles?fuel=Electric&category=Passenger', desc: 'Budget city runabouts' },
                    { label: 'EV Pickups', link: '/vehicles?fuel=Electric&category=Cargo', desc: 'Fast logistics cargo trucks' },
                  ].map((item, idx) => (
                    <Link key={idx} href={item.link} className="border border-brand-border bg-white rounded-xl p-4 text-center hover-scale">
                      <span className="font-extrabold text-sm text-brand-dark block">{item.label}</span>
                      <span className="text-[10px] text-gray-400 mt-1 block">{item.desc}</span>
                    </Link>
                  ))}
                </div>
              )}

            </div>
          </div>
        </section>

        {/* POPULAR PASSENGER AUTOS */}
        <section className="py-12 bg-white border-b border-brand-border">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-black text-brand-dark">Popular Passenger Auto Rickshaws</h2>
                <p className="text-xs text-gray-500 mt-1">Reliable public transport vehicles with comfortable seating layouts.</p>
              </div>
              <Link href="/vehicles?category=Passenger" className="text-xs font-bold text-primary hover:underline flex items-center">View All Passenger Autos &rarr;</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularPassenger.map(v => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          </div>
        </section>

        {/* POPULAR CARGO AUTOS */}
        <section className="py-12 bg-brand-bg border-b border-brand-border">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-black text-brand-dark">High-Capacity Cargo Loader Autos</h2>
                <p className="text-xs text-gray-500 mt-1">Sturdy three-wheel loaders designed to transport bulk cargo across cities.</p>
              </div>
              <Link href="/vehicles?category=Cargo" className="text-xs font-bold text-primary hover:underline flex items-center">View All Cargo Autos &rarr;</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularCargo.map(v => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          </div>
        </section>

        {/* ELECTRIC VEHICLE SPOTLIGHT */}
        <section className="py-12 bg-white border-b border-brand-border">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-end mb-8">
              <div>
                <div className="text-xs text-primary font-black uppercase flex items-center gap-1"><Zap className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> Go Green, Save Money</div>
                <h2 className="text-2xl font-black text-brand-dark mt-1">Trending Electric Three Wheelers</h2>
                <p className="text-xs text-gray-500">Low charging costs, long battery life, and complete road tax exemptions.</p>
              </div>
              <Link href="/vehicles?fuel=Electric" className="text-xs font-bold text-primary hover:underline flex items-center">View All Electric EVs &rarr;</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {electricModels.map(v => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          </div>
        </section>

        {/* COMMERCIAL LOAN & EMI / SUBSIDY BANNER */}
        <section className="py-12 bg-brand-dark text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Info panel */}
            <div className="lg:col-span-7 space-y-6">
              <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">Commercial Credit Facility</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">Need Financing For Your Auto? Get Loans up to 90%</h2>
              <p className="text-gray-300 text-xs md:text-sm leading-relaxed max-w-xl font-medium">
                Three Wheeler works with India's largest commercial lenders (SBI, Cholamandalam, Shriram Transport, HDFC) to provide customized loan interest rates starting as low as <span className="text-primary font-bold text-base">8.9% ROI*</span>. We also assist in securing government EMPS / FAME EV subsidies.
              </p>

              <div className="grid grid-cols-3 gap-4 border-t border-gray-800 pt-6 text-center lg:text-left">
                <div>
                  <div className="text-2xl font-black text-white">8.9%</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Start Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">90%</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">LTV Funding</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">24 Hrs</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Loan Approvals</div>
                </div>
              </div>
            </div>

            {/* Quick EMI Calculator component */}
            <div className="lg:col-span-5 bg-white text-brand-dark p-6 rounded-2xl border border-gray-800 shadow-xl">
              <div className="flex items-center gap-1.5 text-xs text-primary font-bold mb-2">
                <Calculator className="w-4 h-4 text-primary" /> Loan EMI Estimator
              </div>
              <h3 className="text-lg font-black text-brand-dark mb-4">Quick Loan Payment Calculator</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 font-bold uppercase mb-1">
                    <span>Loan Amount</span>
                    <span className="text-brand-dark font-extrabold">₹{finLoan.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="100000"
                    max="500000"
                    step="10000"
                    value={finLoan}
                    onChange={(e) => setFinLoan(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 font-bold uppercase mb-1">
                      <span>Tenure</span>
                      <span className="text-brand-dark font-extrabold">{finTenure} Mos</span>
                    </div>
                    <select
                      value={finTenure}
                      onChange={(e) => setFinTenure(Number(e.target.value))}
                      className="w-full border border-brand-border rounded-lg p-2 text-xs font-semibold bg-gray-50 outline-none text-brand-dark"
                    >
                      <option value="12">12 Months (1 Yr)</option>
                      <option value="24">24 Months (2 Yrs)</option>
                      <option value="36">36 Months (3 Yrs)</option>
                      <option value="48">48 Months (4 Yrs)</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 font-bold uppercase mb-1">
                      <span>Interest Rate</span>
                      <span className="text-brand-dark font-extrabold">{finInterest}%</span>
                    </div>
                    <select
                      value={finInterest}
                      onChange={(e) => setFinInterest(Number(e.target.value))}
                      className="w-full border border-brand-border rounded-lg p-2 text-xs font-semibold bg-gray-50 outline-none text-brand-dark"
                    >
                      <option value="8.9">8.9% ROI</option>
                      <option value="9.5">9.5% ROI</option>
                      <option value="10.5">10.5% ROI</option>
                      <option value="11.5">11.5% ROI</option>
                    </select>
                  </div>
                </div>

                <div className="bg-primary-light border border-primary/20 p-4 rounded-xl text-center mt-4">
                  <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Estimated Monthly EMI</span>
                  <div className="text-2xl font-black text-primary mt-1">₹{quickEmi.toLocaleString('en-IN')}/Month</div>
                  <span className="text-[9px] text-gray-500 block mt-1">Excludes downpayment details, tax and insurance.</span>
                </div>

                <Link 
                  href="/tools" 
                  className="w-full bg-gray-900 hover:bg-brand-dark text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center transition-colors mt-2"
                >
                  Access Full EMI & Cost suite &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK DEALER LOCATOR */}
        <section className="py-12 bg-white border-b border-brand-border">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-black text-brand-dark flex items-center justify-center gap-1.5">
              <MapPin className="w-5 h-5 text-primary" /> Locate Three Wheeler Dealers Near You
            </h2>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              Get contact numbers, addresses, and request price quotes directly from verified brand showrooms in your city.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto p-2 bg-gray-50 border border-brand-border rounded-xl">
              <select
                value={dealerState}
                onChange={(e) => setDealerState(e.target.value)}
                className="flex-1 bg-white border border-brand-border rounded-lg px-3 py-2.5 text-xs font-semibold outline-none text-brand-dark"
              >
                <option value="">-- Select Your State --</option>
                <option value="Delhi">Delhi</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Bihar">Bihar</option>
                <option value="West Bengal">West Bengal</option>
              </select>
              <button 
                onClick={() => router.push(`/dealers?state=${dealerState}`)}
                className="bg-primary hover:bg-primary-dark text-white font-extrabold text-xs px-6 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                Find Showrooms <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* LATEST NEWS & BUSINESS BLOGS */}
        <section className="py-12 bg-brand-bg border-b border-brand-border">
          <div className="max-w-7xl mx-auto px-4">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Industry News Column */}
              <div>
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-xl font-black text-brand-dark">Latest Commercial Vehicle News</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Policy changes, sales numbers, and company announcements.</p>
                  </div>
                  <Link href="/news" className="text-xs font-bold text-primary hover:underline">View News &rarr;</Link>
                </div>
                <div className="space-y-4">
                  {latestNews.map(news => (
                    <Link 
                      key={news.id} 
                      href={`/news/${news.id}`} 
                      className="bg-white border border-brand-border p-4 rounded-xl flex gap-4 hover-scale cursor-pointer"
                    >
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center font-black text-xs text-primary border">
                        NEWS
                      </div>
                      <div className="flex-grow min-w-0">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{news.category}</span>
                        <h4 className="text-sm font-extrabold text-brand-dark mt-1 line-clamp-2 leading-snug">{news.title}</h4>
                        <div className="text-[10px] text-gray-400 mt-2 font-medium flex gap-3">
                          <span>{news.date}</span>
                          <span>{news.readTime}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Business Blogs Column */}
              <div>
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-xl font-black text-brand-dark">Business Tips & Buying Guides</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Increase fleet profits, driver safety and maintenance practices.</p>
                  </div>
                  <Link href="/blogs" className="text-xs font-bold text-primary hover:underline">View Blogs &rarr;</Link>
                </div>
                <div className="space-y-4">
                  {latestBlogs.map(blog => (
                    <Link 
                      key={blog.id} 
                      href={`/blogs/${blog.id}`}
                      className="bg-white border border-brand-border p-4 rounded-xl flex gap-4 hover-scale cursor-pointer"
                    >
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center font-black text-xs text-gray-500 border">
                        BLOG
                      </div>
                      <div className="flex-grow min-w-0">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{blog.category}</span>
                        <h4 className="text-sm font-extrabold text-brand-dark mt-1 line-clamp-2 leading-snug">{blog.title}</h4>
                        <div className="text-[10px] text-gray-400 mt-2 font-medium flex gap-3">
                          <span>{blog.date}</span>
                          <span>{blog.readTime}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* FAQs ACCORDION SECTION */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-black text-brand-dark text-center">Frequently Asked Questions (FAQs)</h2>
            <p className="text-xs text-gray-500 text-center mt-1">General queries related to auto permits, battery warranties, and commercial vehicle loans.</p>

            <div className="mt-8 space-y-3">
              {faqsData.slice(0, 5).map((faq, index) => (
                <div key={faq.id} className="border border-brand-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full text-left px-5 py-4 bg-gray-50 hover:bg-gray-100 font-extrabold text-sm text-brand-dark flex justify-between items-center transition-colors"
                  >
                    <span>{faq.question.replace(/^\d+\.\s*/, '')}</span>
                    <span className="text-lg font-bold text-gray-400">{expandedFaq === index ? '−' : '+'}</span>
                  </button>
                  {expandedFaq === index && (
                    <div className="px-5 py-4 text-xs text-gray-600 leading-relaxed border-t border-brand-border bg-white">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
