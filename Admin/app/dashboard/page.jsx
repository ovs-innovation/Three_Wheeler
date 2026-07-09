'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '../../context/AdminAuthContext';
import {
  Truck,
  Award,
  MessageSquare,
  Users,
  TrendingUp,
  Zap,
  Flame,
  Clock,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import Link from 'next/link';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function OverviewPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.get('/admin/stats');
        if (res.data && res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-brand-danger/10 border border-brand-danger/25 p-6 rounded-2xl flex items-center gap-3 text-brand-danger font-bold text-xs">
        <AlertTriangle size={20} />
        <span>Failed to load system dashboard statistics. Please ensure the backend is running.</span>
      </div>
    );
  }

  const { counts, recentEnquiries, recentUsers } = stats;

  // Prepare chart datasets
  const donutData = {
    labels: ['CNG / LPG / Petrol / Diesel', 'Electric Models (EV)'],
    datasets: [
      {
        data: [counts.vehicles - counts.electricVehicles, counts.electricVehicles],
        backgroundColor: ['#FF8C00', '#F59E0B'],
        borderWidth: 1,
        borderColor: '#121212'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#A1A1AA', font: { size: 10, weight: 'bold' } }
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Metric Summaries Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Cataloged Vehicles */}
        <div className="bg-brand-sidebar border border-brand-border p-6 rounded-[20px] flex items-center justify-between shadow-xl hover:-translate-y-1 hover:border-brand-primary transition-all group">
          <div>
            <div className="text-[10px] text-brand-sec-text font-bold uppercase tracking-wider">Cataloged Vehicles</div>
            <div className="text-2xl font-extrabold text-white mt-1.5">{counts.vehicles}</div>
            <span className="text-[9px] font-semibold text-brand-muted mt-1 flex items-center gap-0.5">
              <Flame size={10} className="text-brand-primary" /> {counts.popularVehicles} Popular Models
            </span>
          </div>
          <div className="p-3 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-xl group-hover:bg-brand-primary group-hover:text-black transition-colors duration-200">
            <Truck size={20} />
          </div>
        </div>

        {/* Card 2: Total Brands */}
        <div className="bg-brand-sidebar border border-brand-border p-6 rounded-[20px] flex items-center justify-between shadow-xl hover:-translate-y-1 hover:border-brand-primary transition-all group">
          <div>
            <div className="text-[10px] text-brand-sec-text font-bold uppercase tracking-wider">Total Brands</div>
            <div className="text-2xl font-extrabold text-white mt-1.5">{counts.brands}</div>
            <span className="text-[9px] font-semibold text-brand-muted mt-1 flex items-center gap-0.5">
              <Zap size={10} className="text-brand-secondary" /> Active Manufacturers
            </span>
          </div>
          <div className="p-3 bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20 rounded-xl group-hover:bg-brand-secondary group-hover:text-black transition-colors duration-200">
            <Award size={20} />
          </div>
        </div>

        {/* Card 3: Active Enquiries */}
        <div className="bg-brand-sidebar border border-brand-border p-6 rounded-[20px] flex items-center justify-between shadow-xl hover:-translate-y-1 hover:border-brand-primary transition-all group">
          <div>
            <div className="text-[10px] text-brand-sec-text font-bold uppercase tracking-wider">Active Enquiries</div>
            <div className="text-2xl font-extrabold text-white mt-1.5">{counts.enquiries}</div>
            <span className="text-[9px] font-semibold text-brand-muted mt-1 flex items-center gap-0.5">
              <TrendingUp size={10} className="text-brand-primary" /> Callbacks & Testrides
            </span>
          </div>
          <div className="p-3 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-xl group-hover:bg-brand-primary group-hover:text-black transition-colors duration-200">
            <MessageSquare size={20} />
          </div>
        </div>

        {/* Card 4: Registered Users */}
        <div className="bg-brand-sidebar border border-brand-border p-6 rounded-[20px] flex items-center justify-between shadow-xl hover:-translate-y-1 hover:border-brand-primary transition-all group">
          <div>
            <div className="text-[10px] text-brand-sec-text font-bold uppercase tracking-wider">Registered Users</div>
            <div className="text-2xl font-extrabold text-white mt-1.5">{counts.users}</div>
            <span className="text-[9px] font-semibold text-brand-muted mt-1 flex items-center gap-0.5">
              <Users size={10} className="text-brand-secondary" /> Customer Accounts
            </span>
          </div>
          <div className="p-3 bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20 rounded-xl group-hover:bg-brand-secondary group-hover:text-black transition-colors duration-200">
            <Users size={20} />
          </div>
        </div>
      </div>

      {/* Visual Analytics & Feed segment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Enquiries Table */}
        <div className="lg:col-span-8 bg-brand-sidebar border border-brand-border rounded-[20px] p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-white">Recent Customer Enquiries</h3>
            <Link href="/dashboard/enquiries" className="text-[10px] font-bold text-brand-primary hover:text-brand-secondary hover:underline transition-colors">
              View All Enquiries &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse text-brand-text">
              <thead>
                <tr className="border-b border-brand-border text-brand-muted font-bold uppercase text-[9px] tracking-wider">
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Vehicle</th>
                  <th className="pb-3">Lead Type</th>
                  <th className="pb-3">Filed Date</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {recentEnquiries.length > 0 ? (
                  recentEnquiries.map((enq) => (
                    <tr key={enq._id} className="hover:bg-brand-card/20">
                      <td className="py-3.5 pr-2">
                        <span className="block font-bold text-white leading-snug">{enq.name}</span>
                        <span className="text-[10px] text-brand-muted">{enq.phone}</span>
                      </td>
                      <td className="py-3.5 pr-2 font-semibold text-white">{enq.vehicleName}</td>
                      <td className="py-3.5 pr-2">
                        <span className="px-2 py-0.5 bg-brand-card border border-brand-border rounded text-[9.5px] font-bold tracking-wide uppercase text-brand-sec-text">
                          {enq.type}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2 text-brand-sec-text font-medium flex items-center gap-1 mt-0.5">
                        <Clock size={11} /> {enq.date}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                          enq.status === 'Resolved' || enq.status === 'Closed'
                            ? 'bg-brand-success/10 border-brand-success/20 text-brand-success'
                            : enq.status === 'Pending'
                            ? 'bg-brand-warning/10 border-brand-warning/20 text-brand-warning'
                            : 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'
                        }`}>
                          {enq.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-brand-muted italic">
                      No customer enquiries logged in directory yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Breakdown Segment & Users feed */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Fuel Segment Share */}
          <div className="bg-brand-sidebar border border-brand-border rounded-[20px] p-6 shadow-xl flex flex-col justify-between">
            <h3 className="text-sm font-extrabold text-white mb-4">Inventory Fuel Types</h3>
            <div className="max-w-[200px] mx-auto pb-4">
              <Doughnut data={donutData} options={chartOptions} />
            </div>
            <div className="flex justify-around items-center border-t border-brand-border/60 pt-4 text-center">
              <div>
                <span className="text-[10px] text-brand-muted font-bold block uppercase">Traditional</span>
                <span className="text-base font-extrabold text-white mt-1 block">{counts.vehicles - counts.electricVehicles}</span>
              </div>
              <div className="h-6 w-px bg-brand-border"></div>
              <div>
                <span className="text-[10px] text-brand-muted font-bold block uppercase">Electric (EV)</span>
                <span className="text-base font-extrabold text-brand-primary mt-1 block">{counts.electricVehicles}</span>
              </div>
            </div>
          </div>

          {/* Recent Users list */}
          <div className="bg-brand-sidebar border border-brand-border rounded-[20px] p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-extrabold text-white">Recent User Signups</h3>
              <Link href="/dashboard/users" className="text-[10px] font-bold text-brand-primary hover:underline">
                All Users &rarr;
              </Link>
            </div>
            <div className="space-y-4">
              {recentUsers.length > 0 ? (
                recentUsers.map((usr) => (
                  <div key={usr._id} className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-brand-card border border-brand-border flex items-center justify-center text-brand-secondary font-bold text-xs uppercase shadow-inner">
                        {usr.name.charAt(0)}
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-white leading-tight">{usr.name}</span>
                        <span className="text-[9.5px] text-brand-sec-text block mt-0.5">{usr.email}</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-brand-muted font-semibold flex items-center gap-0.5">
                      <Calendar size={10} /> {new Date(usr.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-brand-muted italic text-xs">
                  No user accounts registered.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
