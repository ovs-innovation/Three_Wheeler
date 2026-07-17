'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Link from 'next/link';
import {
  LayoutDashboard,
  Truck,
  Award,
  MessageSquare,
  Users,
  LogOut,
  Menu,
  X,
  User,
  Newspaper,
  BookOpen,
  Settings,
  ChevronRight
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { admin, isAuthenticated, loading, logout } = useAdminAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Session guard check
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Vehicles CMS', path: '/dashboard/vehicles', icon: Truck },
    { name: 'Brands Catalogue', path: '/dashboard/brands', icon: Award },
    { name: 'Customer Enquiries', path: '/dashboard/enquiries', icon: MessageSquare },
    { name: 'Users Directory', path: '/dashboard/users', icon: Users },
    { name: 'Automotive News', path: '/dashboard/news', icon: Newspaper },
    { name: 'Business Blogs', path: '/dashboard/blogs', icon: BookOpen }
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex">
      {/* SIDEBAR: DESKTOP */}
      <aside className="hidden lg:flex flex-col w-64 bg-brand-sidebar border-r border-brand-border shrink-0">
        {/* Header Branding */}
        <div className="h-20 border-b border-brand-border flex items-center px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-white p-1 rounded-lg flex items-center justify-center">
              <img src="/images/logo.png" alt="3Pahia Logo" className="h-7 w-auto object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white font-extrabold leading-none">
                3Pahia <span className="text-brand-primary text-[8px] bg-brand-primary/20 px-1 py-0.5 rounded ml-0.5 uppercase tracking-wider">CMS</span>
              </span>
              <span className="text-[8px] text-brand-sec-text font-bold uppercase tracking-wider mt-0.5 leading-none">3Pahia Portal</span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-grow p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-brand-primary text-black shadow-lg shadow-brand-primary/10'
                    : 'text-brand-sec-text hover:bg-brand-card hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} />
                  <span>{item.name}</span>
                </div>
                <ChevronRight size={12} className={isActive ? 'text-black' : 'text-brand-muted'} />
              </Link>
            );
          })}
        </nav>

        {/* User Card Segment */}
        <div className="p-4 border-t border-brand-border bg-brand-header/40 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-brand-card border border-brand-border flex items-center justify-center text-brand-primary shrink-0">
              <User size={14} />
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-extrabold text-white truncate leading-tight">{admin?.name || 'Administrator'}</span>
              <span className="block text-[9px] text-brand-muted capitalize font-bold tracking-wider mt-0.5">{admin?.role || 'Staff'}</span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 text-brand-muted hover:text-brand-danger hover:bg-brand-danger/10 rounded-lg transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* RENDER BODY CONTAINER */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* HEADER: MOBILE NAVBAR */}
        <header className="h-16 border-b border-brand-border bg-brand-header/80 backdrop-blur-md sticky top-0 flex items-center justify-between px-6 lg:px-8 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="p-2 text-brand-sec-text hover:text-white lg:hidden hover:bg-brand-card rounded-lg"
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-sm font-extrabold tracking-tight text-white capitalize hidden sm:block">
              {pathname.split('/').pop().replace('-', ' ') || 'Overview'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right text-[10px] hidden md:block">
              <span className="block font-bold text-white leading-tight">{admin?.name}</span>
              <span className="block text-brand-sec-text uppercase tracking-wider mt-0.5">{admin?.role}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-brand-card border border-brand-border flex items-center justify-center text-brand-primary font-bold text-xs uppercase shadow">
              {admin?.name?.charAt(0) || '3P'}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-grow p-6 lg:p-8 max-h-[calc(100vh-4rem)] overflow-y-auto bg-brand-bg">
          {children}
        </main>
      </div>

      {/* MOBILE DRAWER DRAWER */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileOpen(false)}>
          <aside className="w-64 h-full bg-brand-sidebar border-r border-brand-border flex flex-col justify-between" onClick={(e) => e.stopPropagation()}>
            <div>
              <div className="h-16 border-b border-brand-border flex items-center justify-between px-6 bg-brand-header">
                <span className="text-xs font-black tracking-tight text-white uppercase">Menu Navigation</span>
                <button onClick={() => setIsMobileOpen(false)} className="text-brand-muted hover:text-white"><X size={18} /></button>
              </div>
              <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-brand-primary text-black'
                          : 'text-brand-sec-text hover:bg-brand-card hover:text-white'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="p-4 border-t border-brand-border bg-brand-header/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-card border border-brand-border flex items-center justify-center text-brand-primary">
                  <User size={14} />
                </div>
                <div>
                  <span className="block text-xs font-extrabold text-white leading-tight">{admin?.name}</span>
                  <span className="block text-[9px] text-brand-muted capitalize mt-0.5">{admin?.role}</span>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-brand-muted hover:text-brand-danger transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
