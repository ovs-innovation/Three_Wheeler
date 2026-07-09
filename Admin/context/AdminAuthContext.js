'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

// Configure Axios client for Admin actions
export const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Set Auth Header helper
  const setAuthHeader = (jwtToken) => {
    if (jwtToken) {
      adminApi.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    } else {
      delete adminApi.defaults.headers.common['Authorization'];
    }
  };

  // Check login state on mount
  useEffect(() => {
    const checkLoginState = async () => {
      if (typeof window !== 'undefined') {
        const savedToken = localStorage.getItem('aj_admin_token');
        if (savedToken) {
          try {
            setToken(savedToken);
            setAuthHeader(savedToken);
            const res = await adminApi.get('/admin/profile');
            if (res.data && res.data.success) {
              setAdmin(res.data.data);
              setIsAuthenticated(true);
            } else {
              clearAuthData();
            }
          } catch (err) {
            console.error('Admin session validation failed:', err);
            clearAuthData();
          }
        }
      }
      setLoading(false);
    };
    checkLoginState();
  }, []);

  const clearAuthData = () => {
    setAdmin(null);
    setToken(null);
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aj_admin_token');
    }
    setAuthHeader(null);
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await adminApi.post('/admin/login', { email, password });
      if (res.data && res.data.success) {
        const { token: adminToken, admin: adminData } = res.data.data;
        setAdmin(adminData);
        setToken(adminToken);
        setIsAuthenticated(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('aj_admin_token', adminToken);
        }
        setAuthHeader(adminToken);
        toast.success('Logged in successfully as Administrator!');
        return { success: true };
      } else {
        const errMsg = res.data.message || 'Admin login failed';
        toast.error(errMsg);
        return { success: false, error: errMsg };
      }
    } catch (err) {
      const errMsg = err.response?.data?.errors?.[0] || err.response?.data?.message || 'Invalid administrative credentials';
      toast.error(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await adminApi.post('/admin/logout');
    } catch (err) {
      console.error('Admin logout error:', err);
    } finally {
      clearAuthData();
      toast.success('Administrator logged out successfully.');
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        setAdmin
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
