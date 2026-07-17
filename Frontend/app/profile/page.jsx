'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, Mail, Phone, MapPin, Building, Shield, Edit2, Key,
  Trash2, LogOut, MessageSquare, Save, X, Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, loginUser, logoutUser } = useApp();

  // Mode toggles
  const [editMode, setEditMode] = useState(false);
  const [pwdMode, setPwdMode] = useState(false);

  // Edit details form states
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', city: '', state: '' });
  
  // Password form states
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  // Loading indicator states
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        city: user.city || 'Delhi/NCR',
        state: user.state || 'Delhi'
      });
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(profileForm)
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Profile update failed');
      }

      // Sync local context state
      loginUser({ ...result.data, token: user.token });
      toast.success('Your profile details updated successfully!');
      setEditMode(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update details');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }

    setBtnLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          oldPassword: pwdForm.oldPassword,
          newPassword: pwdForm.newPassword
        })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.errors?.[0] || result.message || 'Password update failed');
      }

      toast.success('Password updated successfully!');
      setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setPwdMode(false);
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const checkConfirm = window.confirm(
      'WARNING: Are you absolutely sure you want to permanently delete your user account? This action is irreversible.'
    );
    if (!checkConfirm) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete account');
      }

      toast.success('Your account has been deleted.');
      logoutUser();
      router.push('/');
    } catch (err) {
      toast.error(err.message || 'Purging account failed.');
    }
  };

  const handleLogout = () => {
    logoutUser();
    toast.success('Logged out successfully.');
    router.push('/');
  };

  return (
    <>
      <Header />
      <main className="bg-brand-bg flex-grow min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      
      {/* Overview user Card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Banner accent header */}
        <div className="h-32 bg-gradient-to-r from-gray-900 to-orange-600 relative">
          <div className="absolute -bottom-10 left-8 bg-white p-2 rounded-full border shadow-sm">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
              <User size={40} />
            </div>
          </div>
        </div>

        {/* Info detail view */}
        <div className="pt-14 p-8 space-y-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-500 capitalize flex items-center gap-1 mt-1">
                <Shield size={14} className="text-orange-600" /> Account Class: {user.role || 'User'}
              </p>
            </div>
            
            {/* Toolbar Buttons */}
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/profile/enquiries"
                className="px-4 py-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-600 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare size={14} /> My Enquiries
              </Link>
              <button
                onClick={() => { setEditMode(true); setPwdMode(false); }}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Edit2 size={14} /> Edit Profile
              </button>
              <button
                onClick={() => { setPwdMode(true); setEditMode(false); }}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Key size={14} /> Update Security
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <LogOut size={14} /> Log Out
              </button>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* EDIT DETAILS FORM SEGMENT */}
          {editMode && (
            <form onSubmit={handleUpdateProfile} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">Update Personal Profile</h3>
                <button type="button" onClick={() => setEditMode(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full bg-white border border-gray-200 focus:border-orange-500 rounded-lg text-xs px-3 py-2 outline-none text-gray-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Mobile Phone Number</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full bg-white border border-gray-200 focus:border-orange-500 rounded-lg text-xs px-3 py-2 outline-none text-gray-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">City Location</label>
                  <input
                    type="text"
                    required
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    className="w-full bg-white border border-gray-200 focus:border-orange-500 rounded-lg text-xs px-3 py-2 outline-none text-gray-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">State region</label>
                  <input
                    type="text"
                    required
                    value={profileForm.state}
                    onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                    className="w-full bg-white border border-gray-200 focus:border-orange-500 rounded-lg text-xs px-3 py-2 outline-none text-gray-800 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-3.5 py-1.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={btnLoading}
                  className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 disabled:bg-gray-400 shadow-sm"
                >
                  <Save size={13} /> Save Profile
                </button>
              </div>
            </form>
          )}

          {/* CHANGE PASSWORD SEGMENT */}
          {pwdMode && (
            <form onSubmit={handleChangePassword} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">Change Account Password</h3>
                <button type="button" onClick={() => setPwdMode(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Old Password</label>
                  <div className="relative">
                    <input
                      type={showOldPwd ? 'text' : 'password'}
                      required
                      value={pwdForm.oldPassword}
                      onChange={(e) => setPwdForm({ ...pwdForm, oldPassword: e.target.value })}
                      className="w-full bg-white border border-gray-200 focus:border-orange-500 rounded-lg text-xs px-3 py-2 outline-none text-gray-800 pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPwd(!showOldPwd)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showOldPwd ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPwd ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={pwdForm.newPassword}
                      onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                      className="w-full bg-white border border-gray-200 focus:border-orange-500 rounded-lg text-xs px-3 py-2 outline-none text-gray-800 pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPwd ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={pwdForm.confirmPassword}
                    onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                    className="w-full bg-white border border-gray-200 focus:border-orange-500 rounded-lg text-xs px-3 py-2 outline-none text-gray-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPwdMode(false)}
                  className="px-3.5 py-1.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={btnLoading}
                  className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 disabled:bg-gray-400 shadow-sm"
                >
                  <Save size={13} /> Update Password
                </button>
              </div>
            </form>
          )}

          {/* READ-ONLY DISPLAY GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100/50">
              <Mail className="text-gray-400 mt-0.5 w-5 h-5" />
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Registered Email</span>
                <span className="text-sm font-medium text-gray-800">{user.email}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100/50">
              <Phone className="text-gray-400 mt-0.5 w-5 h-5" />
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Mobile Number</span>
                <span className="text-sm font-medium text-gray-800">{user.phone || 'Not Provided'}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100/50">
              <MapPin className="text-gray-400 mt-0.5 w-5 h-5" />
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Hub City Location</span>
                <span className="text-sm font-medium text-gray-800">{user.city || 'Delhi/NCR'}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100/50">
              <Building className="text-gray-400 mt-0.5 w-5 h-5" />
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">State Region</span>
                <span className="text-sm font-medium text-gray-800">{user.state || 'Delhi'}</span>
              </div>
            </div>
          </div>

          {/* DANGER DELETION SEGMENT */}
          <div className="border-t border-red-100/60 pt-6 mt-8 flex justify-between items-center">
            <div>
              <span className="block text-xs font-bold text-gray-800">Close 3Pahia Account</span>
              <span className="block text-[10px] text-gray-400 mt-0.5">This will completely erase your wishlist, comparison parameters, and logged session.</span>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Trash2 size={13} /> Deactivate Account
            </button>
          </div>

        </div>
      </div>
      </div>
      </main>
      <Footer />
    </>
  );
}