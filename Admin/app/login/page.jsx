'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBtnLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        router.push('/dashboard');
      } else {
        setError(res.error || 'Authentication check failed.');
      }
    } catch (err) {
      setError('An unexpected connection error occurred.');
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-brand-sidebar border border-brand-border p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* Banner accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-primary to-brand-secondary"></div>

        <div className="text-center">
          <div className="inline-flex p-3 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-2xl mb-4">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Three Wheeler <span className="text-brand-primary font-display font-black">Admin Panel</span>
          </h2>
          <p className="mt-1.5 text-xs text-brand-sec-text">
            Three Wheeler Enterprise Automotive Platform
          </p>
        </div>

        {error && (
          <div className="bg-brand-danger/10 text-brand-danger text-xs p-3 rounded-lg border border-brand-danger/25 font-bold flex items-center gap-1.5">
            ⚠️ {error}
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-brand-sec-text uppercase tracking-wider block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted w-4 h-4" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@threewheeler.com"
                  className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs pl-10 pr-4 py-3 outline-none text-brand-text transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-brand-sec-text uppercase tracking-wider block">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted w-4 h-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs pl-10 pr-10 py-3 outline-none text-brand-text transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={btnLoading || loading}
            className="w-full mt-2 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-xs font-bold text-black bg-brand-primary hover:bg-brand-secondary transition-colors shadow-md disabled:bg-brand-muted/40 disabled:text-brand-sec-text"
          >
            {btnLoading ? 'Authenticating...' : 'Sign In To Terminal'} <ArrowRight className="w-4 h-4 ml-1.5" />
          </button>
        </form>

        <div className="text-center text-[10px] text-brand-muted pt-2 border-t border-brand-border/40">
          This system is restricted to authorized operators only. Activity is logged.
        </div>
      </div>
    </div>
  );
}
