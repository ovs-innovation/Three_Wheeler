'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-brand-dark text-gray-300 border-t-4 border-primary mt-auto">
      {/* Upper Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 border-b border-gray-800">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div>
            <h3 className="text-white text-lg font-bold">Subscribe to Fleet Insights</h3>
            <p className="text-gray-400 text-xs mt-1">Get the latest launch updates, government EV schemes (FAME), and fuel profitability guides weekly.</p>
          </div>
          <div className="lg:col-span-2">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-lg lg:ml-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-grow bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-primary"
              />
              <button 
                type="submit" 
                className="bg-primary hover:bg-primary-dark text-white font-bold text-sm px-6 py-2.5 rounded-lg flex items-center justify-center transition-colors gap-2"
              >
                {subscribed ? 'Subscribed!' : 'Subscribe'} <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Directory Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {/* Brand Profile Column */}
        <div className="col-span-2 md:col-span-4 lg:col-span-2 space-y-4">
          <Link href="/" className="flex flex-col">
            <span className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center">
              Auto<span className="text-primary">Junction</span>
            </span>
            <span className="text-[10px] text-gray-400 font-semibold tracking-wide uppercase leading-none">
              India's Trusted Three Wheeler Portal
            </span>
          </Link>
          <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
            AutoJunction is India's largest marketplace and information portal for Three Wheelers. We provide exhaustive details, expert reviews, and specifications for passenger auto rickshaws, cargo loaders, and electric commercial vehicles. Trusted by over 50,000 transport businesses across India.
          </p>
          {/* Social Icons */}
          <div className="flex space-x-3 pt-2">
            <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-brand-blue hover:text-white transition-colors" aria-label="Facebook">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
              </svg>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-brand-blue hover:text-white transition-colors" aria-label="Twitter">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-brand-blue hover:text-white transition-colors" aria-label="Youtube">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.525 3.545 12 3.545 12 3.545s-7.525 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.025 0 12 0 12s0 3.975.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.863.508 9.388.508 9.388.508s7.525 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.975 24 12 24 12s0-3.975-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-brand-blue hover:text-white transition-colors" aria-label="Linkedin">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Popular Brands Column */}
        <div className="space-y-3">
          <h4 className="text-white text-xs font-bold uppercase tracking-wider">Popular Brands</h4>
          <ul className="text-xs space-y-2 text-gray-400">
            <li><Link href="/vehicles?brand=bajaj" className="hover:text-primary transition-colors">Bajaj Three Wheelers</Link></li>
            <li><Link href="/vehicles?brand=piaggio" className="hover:text-primary transition-colors">Piaggio Ape rickshaws</Link></li>
            <li><Link href="/vehicles?brand=mahindra" className="hover:text-primary transition-colors">Mahindra Treo & Alfa</Link></li>
            <li><Link href="/vehicles?brand=tvs" className="hover:text-primary transition-colors">TVS King range</Link></li>
            <li><Link href="/vehicles?brand=atul-auto" className="hover:text-primary transition-colors">Atul Auto Loaders</Link></li>
            <li><Link href="/vehicles?brand=euler-motors" className="hover:text-primary transition-colors">Euler Motors EV</Link></li>
            <li><Link href="/vehicles?brand=altigreen" className="hover:text-primary transition-colors">Altigreen cargo</Link></li>
          </ul>
        </div>

        {/* Fuel & Categories Column */}
        <div className="space-y-3">
          <h4 className="text-white text-xs font-bold uppercase tracking-wider">Fuel Type & Fuel</h4>
          <ul className="text-xs space-y-2 text-gray-400">
            <li><Link href="/vehicles?fuel=Electric" className="hover:text-primary transition-colors">Electric Three Wheelers</Link></li>
            <li><Link href="/vehicles?fuel=CNG" className="hover:text-primary transition-colors">CNG Auto Rickshaws</Link></li>
            <li><Link href="/vehicles?fuel=Diesel" className="hover:text-primary transition-colors">Diesel Cargo Loaders</Link></li>
            <li><Link href="/vehicles?fuel=LPG" className="hover:text-primary transition-colors">LPG Passenger Rickshaws</Link></li>
            <li><Link href="/vehicles?fuel=Petrol" className="hover:text-primary transition-colors">Petrol Passenger Autos</Link></li>
            <li><Link href="/vehicles?category=Loader" className="hover:text-primary transition-colors">Cargo loaders & Pickups</Link></li>
          </ul>
        </div>

        {/* Tools & Resources Column */}
        <div className="space-y-3">
          <h4 className="text-white text-xs font-bold uppercase tracking-wider">Tools & Info</h4>
          <ul className="text-xs space-y-2 text-gray-400">
            <li><Link href="/tools" className="hover:text-primary transition-colors">EMI Calculator</Link></li>
            <li><Link href="/tools" className="hover:text-primary transition-colors">Running Cost Calculator</Link></li>
            <li><Link href="/compare" className="hover:text-primary transition-colors">Compare Three Wheelers</Link></li>
            <li><Link href="/dealers" className="hover:text-primary transition-colors">Dealer Locations</Link></li>
            <li><Link href="/news" className="hover:text-primary transition-colors">Commercial News</Link></li>
            <li><Link href="/blogs" className="hover:text-primary transition-colors">Buying Guides</Link></li>
          </ul>
        </div>
      </div>

      {/* Corporate Info & App Badges Row */}
      <div className="max-w-7xl mx-auto px-4 py-8 border-t border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-2 text-primary flex-shrink-0" /> AutoJunction India Pvt. Ltd., Okhla Industrial Area, Phase-III, New Delhi, 110020</div>
          <div className="flex items-center"><Mail className="w-3.5 h-3.5 mr-2 text-primary flex-shrink-0" /> support@autojunction.in</div>
        </div>

        {/* Download App badges */}
        <div className="flex space-x-3 md:justify-center">
          {/* Styled Apple badge */}
          <div className="bg-black border border-gray-700 hover:border-gray-500 rounded-lg px-3 py-1.5 flex items-center space-x-2 cursor-pointer transition-all w-36">
            <svg viewBox="0 0 384 512" className="w-5 h-5 fill-white flex-shrink-0">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-48.7-22.9-84.5-22.4-45.3.6-87.3 26.2-110.3 66.3-47.7 83-12.2 205.8 33.4 271.9 22.3 32.3 48.7 68.2 82.4 67-33.6-1.2-46.2-22.4-85.7-22.4-39.7 0-53.1 22.4-85.3 22.4 34.3 1.2 59.4-32.3 81.7-65.1 25.8-37.3 36.7-73.6 37-75.7-.7-.3-72.3-27.8-72.9-110.6zM290.7 83.4c21.8-26.2 35.5-61.7 30.6-97.4-30.2 1.2-68.7 20-90.3 45.1-19 22.1-35.5 58.3-30.5 93.1 33.6 2.6 70-17 90.2-40.8z"/>
            </svg>
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-gray-400 uppercase leading-none">Download on the</span>
              <span className="text-xs text-white font-bold leading-none mt-1">App Store</span>
            </div>
          </div>
          {/* Styled Android badge */}
          <div className="bg-black border border-gray-700 hover:border-gray-500 rounded-lg px-3 py-1.5 flex items-center space-x-2 cursor-pointer transition-all w-36">
            <svg viewBox="0 0 512 512" className="w-5 h-5 fill-white flex-shrink-0">
              <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58 33.2-60.1-60.1 118.1 26.9zM385.4 337.8L104.6 499l220.7-221.3 60.1 60.1z"/>
            </svg>
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-gray-400 uppercase leading-none">Get it on</span>
              <span className="text-xs text-white font-bold leading-none mt-1">Google Play</span>
            </div>
          </div>
        </div>

        {/* Disclaimer notes */}
        <div className="text-right text-[10px] text-gray-500 space-y-1">
          <p>© {new Date().getFullYear()} AutoJunction. All Rights Reserved.</p>
          <p>Ex-showroom prices listed are indicative and vary by state. T&C apply.</p>
        </div>
      </div>
    </footer>
  );
}
