'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [location, setLocation] = useState('Delhi/NCR');
  const [compareList, setCompareList] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  // Load state from localStorage on client side
  useEffect(() => {
    const savedWishlist = localStorage.getItem('aj_wishlist');
    const savedLocation = localStorage.getItem('aj_location');
    const savedCompare = localStorage.getItem('aj_compare');
    const savedSearch = localStorage.getItem('aj_search');

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
  }, []);

  const toggleWishlist = (vehicleId) => {
    setWishlist((prev) => {
      const updated = prev.includes(vehicleId)
        ? prev.filter((id) => id !== vehicleId)
        : [...prev, vehicleId];
      localStorage.setItem('aj_wishlist', JSON.stringify(updated));
      return updated;
    });
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
