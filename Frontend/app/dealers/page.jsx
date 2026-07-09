'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import dealersData from '@/data/dealers.json';
import { MapPin, Phone, Mail, Award, CheckCircle, Search, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const STATES_LIST = [
  'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 
  'Bihar', 'West Bengal', 'Gujarat', 'Rajasthan', 'Madhya Pradesh', 
  'Punjab', 'Haryana', 'Andhra Pradesh', 'Telangana', 'Kerala'
];

const CITIES_BY_STATE = {
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

function DealersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL search params
  const stateParam = searchParams.get('state') || '';
  const cityParam = searchParams.get('city') || '';

  // Local Filter States
  const [selectedState, setSelectedState] = useState(stateParam);
  const [selectedCity, setSelectedCity] = useState(cityParam);
  const [activeDealerMap, setActiveDealerMap] = useState(null); // active map view

  // Lead Modal states
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadDealer, setLeadDealer] = useState(null);
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', vehicle: '' });
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  // Sync with URL params
  useEffect(() => {
    setSelectedState(stateParam);
    setSelectedCity(cityParam);
  }, [stateParam, cityParam]);

  // Handle State Change
  const handleStateChange = (state) => {
    setSelectedState(state);
    setSelectedCity('');
    router.push(`/dealers?state=${state}`);
  };

  // Handle City Change
  const handleCityChange = (city) => {
    setSelectedCity(city);
    router.push(`/dealers?state=${selectedState}&city=${city}`);
  };

  // Filtered dealers list
  const filteredDealers = dealersData.filter((dealer) => {
    if (selectedState && dealer.state.toLowerCase() !== selectedState.toLowerCase()) {
      return false;
    }
    if (selectedCity && dealer.city.toLowerCase() !== selectedCity.toLowerCase()) {
      return false;
    }
    return true;
  });

  // Set first dealer as active map by default
  useEffect(() => {
    if (filteredDealers.length > 0) {
      setActiveDealerMap(filteredDealers[0]);
    } else {
      setActiveDealerMap(null);
    }
  }, [selectedState, selectedCity]);

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (leadForm.name && leadForm.phone) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enquiries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: leadForm.name,
            phone: leadForm.phone,
            email: 'guest@autojunction.com',
            city: leadDealer.city || 'Delhi/NCR',
            vehicleName: leadForm.vehicle || `${leadDealer.name} callback`,
            type: 'Request Callback',
            message: `Lead routed directly from dealer list page for dealer: ${leadDealer.name}`
          }),
        });

        const result = await response.json();
        if (response.ok && result.success) {
          setLeadSubmitted(true);
          setTimeout(() => {
            setShowLeadModal(false);
            setLeadSubmitted(false);
            setLeadForm({ name: '', phone: '', vehicle: '' });
          }, 3000);
        } else {
          alert(result.message || 'Submission failed.');
        }
      } catch (err) {
        console.error(err);
        alert('Server connection error occurred.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* breadcrumbs */}
      <div className="text-xs text-gray-400 font-medium mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link> &gt; <span>Dealer Locator</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-black text-brand-dark mb-2">Verified Three Wheeler Showrooms & Dealers</h1>
      <p className="text-xs text-gray-500 mb-8 max-w-xl">
        Locate authorized dealers, commercial showrooms, battery swapping centers, and workshops across India.
      </p>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-brand-border rounded-xl p-4 shadow-sm mb-8">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Select State</label>
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-xs font-semibold bg-gray-50 text-brand-dark"
          >
            <option value="">-- All States --</option>
            {STATES_LIST.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Select City</label>
          <select
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            disabled={!selectedState}
            className="w-full border rounded-lg px-3 py-2 text-xs font-semibold bg-gray-50 text-brand-dark disabled:opacity-50"
          >
            <option value="">-- All Cities --</option>
            {selectedState && CITIES_BY_STATE[selectedState]?.map(ct => (
              <option key={ct} value={ct}>{ct}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button 
            onClick={() => {
              setSelectedState('');
              setSelectedCity('');
              router.push('/dealers');
            }}
            className="w-full border border-brand-border text-xs font-bold text-gray-600 hover:bg-gray-50 py-2.5 rounded-lg text-center transition-colors"
          >
            Clear Search Filter
          </button>
        </div>
      </div>

      {/* RENDER COLUMNS: Dealers cards list on left, Interactive Map on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left list column */}
        <div className="lg:col-span-7 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <h3 className="text-sm font-extrabold text-brand-dark uppercase tracking-wider mb-2">Showrooms Found ({filteredDealers.length})</h3>
          
          {filteredDealers.length > 0 ? (
            filteredDealers.map(dealer => (
              <div 
                key={dealer.id}
                onClick={() => setActiveDealerMap(dealer)}
                className={`border rounded-xl p-5 bg-white cursor-pointer hover:border-primary transition-all relative flex flex-col justify-between ${
                  activeDealerMap?.id === dealer.id ? 'border-primary border-2 shadow-md' : 'border-brand-border'
                }`}
              >
                {/* Certified Badge */}
                <span className="absolute top-4 right-4 text-[9px] font-bold text-brand-green bg-green-50 px-2 py-0.5 rounded flex items-center gap-1 border border-green-200">
                  <ShieldCheck className="w-3 h-3 text-brand-green" /> Verified Partner
                </span>

                <div className="space-y-3">
                  <h4 className="font-black text-base text-brand-dark pr-24 leading-snug">{dealer.name}</h4>
                  
                  <div className="text-xs text-gray-500 space-y-1.5 leading-relaxed font-medium">
                    <p className="flex items-start"><MapPin className="w-4 h-4 text-primary mr-2 shrink-0 mt-0.5" /> {dealer.address}</p>
                    <p className="flex items-center"><Phone className="w-4 h-4 text-gray-400 mr-2 shrink-0" /> {dealer.phone}</p>
                    <p className="flex items-center"><Mail className="w-4 h-4 text-gray-400 mr-2 shrink-0" /> {dealer.email}</p>
                  </div>

                  {/* Brands sold */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    <span className="text-[9px] text-gray-400 font-bold uppercase mt-1 mr-1">Brands:</span>
                    {dealer.brands.map(brand => (
                      <span key={brand} className="text-[9.5px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase">
                        {brand}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 mt-4 flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Services: {dealer.services.slice(0, 3).join(', ')}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLeadDealer(dealer);
                      setShowLeadModal(true);
                    }}
                    className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors shadow-sm"
                  >
                    Request Callback
                  </button>
                </div>

              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white border border-brand-border rounded-xl">
              <p className="text-xs text-gray-400 italic">No verified dealers found in this location.</p>
            </div>
          )}
        </div>

        {/* Right Map column */}
        <div className="lg:col-span-5 sticky top-24 self-start bg-white border border-brand-border rounded-xl overflow-hidden shadow-sm h-[500px] flex flex-col justify-between">
          {activeDealerMap ? (
            <>
              {/* Map frame header */}
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-brand-dark leading-tight truncate max-w-[280px]">{activeDealerMap.name}</h4>
                  <span className="text-[10px] text-gray-400 font-semibold">{activeDealerMap.city}, {activeDealerMap.state}</span>
                </div>
                <span className="text-[9px] font-bold text-primary uppercase">Active Map View</span>
              </div>

              {/* Map iframe mockup */}
              <div className="flex-grow bg-gray-100 relative">
                <iframe
                  title="Dealer Location Map"
                  src={activeDealerMap.mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Map frame footer summary */}
              <div className="p-4 border-t bg-gray-50 text-[10px] text-gray-500 font-medium leading-relaxed">
                <span className="font-bold text-brand-dark">Address Details:</span> {activeDealerMap.address}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-2">
              <MapPin className="w-12 h-12 text-gray-200" />
              <span className="text-xs font-extrabold text-brand-dark">No Showroom Selected</span>
              <span className="text-[10px] text-gray-400">Select a verified dealer from the list to load coordinates and view map path.</span>
            </div>
          )}
        </div>

      </div>

      {/* LEAD MODAL */}
      {showLeadModal && leadDealer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-fade-in text-brand-dark">
            <button 
              onClick={() => setShowLeadModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-brand-dark text-lg font-bold"
            >
              ×
            </button>

            {!leadSubmitted ? (
              <>
                <h3 className="text-lg font-black mb-1">Request Price Quote</h3>
                <p className="text-xs text-gray-500 mb-4 font-medium">Send your details to <strong>{leadDealer.name}</strong> to receive a callback and exact on-road quote.</p>

                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      placeholder="e.g. Rajesh Yadav"
                      className="w-full border rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Mobile Phone Number</label>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className="w-full border rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Model Interested In</label>
                    <select
                      value={leadForm.vehicle}
                      onChange={(e) => setLeadForm({ ...leadForm, vehicle: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-xs font-semibold outline-none bg-gray-50 text-brand-dark"
                    >
                      <option value="">-- Choose Three Wheeler --</option>
                      {dealersData.filter(d => d.id === leadDealer.id)[0]?.brands.map(b => (
                        <option key={b} value={b}>{b} Auto / Loader</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-dark text-white font-extrabold text-xs py-3 rounded-lg text-center transition-colors shadow-md mt-6"
                  >
                    Submit Quotation Request
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-green-50 border border-green-200 text-brand-green flex items-center justify-center mx-auto text-lg">
                  ✓
                </div>
                <h3 className="text-base font-black">Lead Sent Successfully</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Your lead inquiry has been registered. A sales representative from <strong>{leadDealer.name}</strong> will contact you on <strong>+91 {leadForm.phone}</strong> shortly.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default function DealersPage() {
  return (
    <>
      <Header />
      <main className="bg-brand-bg flex-grow min-h-screen">
        <Suspense fallback={
          <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs font-bold text-gray-400 uppercase">
            Loading Showroom Catalog...
          </div>
        }>
          <DealersContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
