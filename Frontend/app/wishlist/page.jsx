'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Truck, Heart, ArrowRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export default function WishlistPage() {
  const { user, wishlist, toggleWishlist } = useApp();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      if (user && user.token) {
        // Logged-in user: fetch populated vehicle list from backend API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/wishlist`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        const result = await response.json();
        if (result.success && result.data) {
          setVehicles(result.data);
        }
      } else {
        // Guest user: load from local mockup vehicles.json matching ID list
        const response = await fetch('/data/vehicles.json');
        const localData = await response.json();
        const filtered = localData.filter(v => wishlist.includes(v.id));
        setVehicles(filtered);
      }
    } catch (err) {
      console.error('Failed to load wishlist items:', err);
      toast.error('Failed to load wishlist catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistItems();
  }, [wishlist, user]);

  const handleRemove = async (vehicleId) => {
    await toggleWishlist(vehicleId);
    toast.success('Removed from wishlist');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="bg-brand-bg flex-grow min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col mb-4">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <Heart className="text-orange-600 fill-orange-600" /> My Saved Vehicles
        </h1>
        <p className="text-sm text-gray-500 mt-1">Review your bookmarked three-wheelers, check ex-showroom prices, or request callbacks.</p>
      </div>

      {vehicles.length === 0 ? (
        <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-orange-100/50 text-orange-600 rounded-full">
            <Heart size={32} />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-800 text-base">Your Wishlist is Empty</h3>
            <p className="text-xs text-gray-500 max-w-sm mt-1">Browse our cargo rickshaw and passenger auto catalog, and tap the heart icon on any model to save it here.</p>
          </div>
          <Link
            href="/vehicles"
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
          >
            Explore Vehicles <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <div key={v.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-orange-200 transition-all flex flex-col justify-between group">
              <div>
                {/* Image gallery */}
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                  {v.images?.[0] ? (
                    <img src={v.images[0]} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300"><Truck size={40} /></div>
                  )}
                  <button
                    onClick={() => handleRemove(v.id)}
                    className="absolute top-3 right-3 p-2 bg-white/95 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-full shadow transition-colors"
                    title="Remove from Saved"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Specs content */}
                <div className="p-5 space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    <span>{v.brandName}</span>
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">{v.fuelType}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors leading-tight">
                    {v.name}
                  </h3>
                  <div className="text-base font-black text-orange-600 pt-1.5">
                    ₹{(v.priceMin / 100000).toFixed(2)} - {(v.priceMax / 100000).toFixed(2)} Lakh*
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-5 pt-0 border-t border-gray-50 mt-4 flex items-center justify-between gap-3 text-xs font-bold">
                <Link
                  href={`/vehicles/${v.id}`}
                  className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-center shadow-sm transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
      </main>
      <Footer />
    </>
  );
}
