'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [location, setLocation] = useState('Delhi/NCR');
  const [compareList, setCompareList] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  // 🚀 User Auth States
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load state from localStorage on client side
  useEffect(() => {
    const savedWishlist = localStorage.getItem('aj_wishlist');
    const savedLocation = localStorage.getItem('aj_location');
    const savedCompare = localStorage.getItem('aj_compare');
    const savedSearch = localStorage.getItem('aj_search');
    const savedUser = localStorage.getItem('aj_user'); // 🚀 Pull user session on start

    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error(e);
      }
    }
    if (savedLocation) {
      setLocation(savedLocation);
    }
    if (savedCompare) {
      try {
        setCompareList(JSON.parse(savedCompare));
      } catch (e) {
        console.error(e);
      }
    }
    if (savedSearch) {
      try {
        setSearchHistory(JSON.parse(savedSearch));
      } catch (e) {
        console.error(e);
      }
    }
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }
    setLoading(false); // Auth hydration check finished
  }, []);

  const toggleWishlist = async (vehicleId) => {
    setWishlist((prev) => {
      const updated = prev.includes(vehicleId)
        ? prev.filter((id) => id !== vehicleId)
        : [...prev, vehicleId];
      localStorage.setItem('aj_wishlist', JSON.stringify(updated));
      return updated;
    });

    if (user && user.token) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/wishlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ vehicleId })
        });
      } catch (err) {
        console.error('Failed to sync wishlist with backend:', err);
      }
    }
  };

  const updateLocation = (loc) => {
    setLocation(loc);
    localStorage.setItem('aj_location', loc);
  };

  const addToCompare = (vehicle) => {
    setCompareList((prev) => {
      if (prev.find((v) => v.id === vehicle.id)) return prev; // already exists
      if (prev.length >= 4) return prev; // max 4
      const updated = [...prev, vehicle];
      localStorage.setItem('aj_compare', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCompare = (vehicleId) => {
    setCompareList((prev) => {
      const updated = prev.filter((v) => v.id !== vehicleId);
      localStorage.setItem('aj_compare', JSON.stringify(updated));
      return updated;
    });
  };

  const clearCompare = () => {
    setCompareList([]);
    localStorage.removeItem('aj_compare');
  };

  const addSearchTerm = (term) => {
    if (!term || !term.trim()) return;
    setSearchHistory((prev) => {
      const trimmedTerm = term.trim();
      const filtered = prev.filter((t) => t.toLowerCase() !== trimmedTerm.toLowerCase());
      const updated = [trimmedTerm, ...filtered].slice(0, 10);
      localStorage.setItem('aj_search', JSON.stringify(updated));
      return updated;
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('aj_search');
  };

  // 🚀 User Authentication Route Actions
  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem('aj_user', JSON.stringify(userData));
    if (userData.wishlist) {
      setWishlist(userData.wishlist);
      localStorage.setItem('aj_wishlist', JSON.stringify(userData.wishlist));
    }
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('aj_user');
    localStorage.removeItem('aj_wishlist');
  };

  // 🚀 User Auth Modal States
  const [authModal, setAuthModal] = useState({ isOpen: false, tab: 'login' });

  const openLoginModal = () => setAuthModal({ isOpen: true, tab: 'login' });
  const openRegisterModal = () => setAuthModal({ isOpen: true, tab: 'register' });
  const closeAuthModal = () => setAuthModal({ isOpen: false, tab: 'login' });

  // 🚀 Enquiry Modal States
  const [enquiryModal, setEnquiryModal] = useState({ isOpen: false, vehicleName: '', type: 'Dealer Enquiry' });

  const openEnquiryModal = (vehicleName = '', type = 'Dealer Enquiry') => setEnquiryModal({ isOpen: true, vehicleName, type });
  const closeEnquiryModal = () => setEnquiryModal({ isOpen: false, vehicleName: '', type: 'Dealer Enquiry' });

  return (
    <AppContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        location,
        updateLocation,
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        searchHistory,
        addSearchTerm,
        clearSearchHistory,
        user,        // 🚀 Exposed state
        loading,     // 🚀 Exposed loading flag
        loginUser,   // 🚀 Exposed login wrapper
        logoutUser,  // 🚀 Exposed logout wrapper
        authModal,
        openLoginModal,
        openRegisterModal,
        closeAuthModal,
        setAuthModal,
        enquiryModal,
        openEnquiryModal,
        closeEnquiryModal,
        setEnquiryModal
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}