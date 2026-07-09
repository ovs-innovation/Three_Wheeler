'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { MessageSquare, Calendar, ArrowRight, Info } from 'lucide-react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export default function EnquiriesPage() {
    const { user } = useApp();
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserEnquiries = async () => {
            if (!user?.token) {
                setLoading(false);
                return;
            }
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enquiries`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                const result = await response.json();
                if (result.success && result.data) {
                    setEnquiries(result.data);
                }
            } catch (err) {
                console.error("Error loading enquiries data parameters", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserEnquiries();
    }, [user]);

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-[50vh] flex items-center justify-center">
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
                <div className="max-w-4xl mx-auto px-4 py-10">
                    <div className="flex flex-col mb-6">
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                            <MessageSquare className="text-orange-600" /> My Fleet Enquiries
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Track requested dealership quotes and pricing requests.</p>
                    </div>

                    {enquiries.length === 0 ? (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center text-blue-700 flex flex-col items-center justify-center space-y-2">
                            <Info size={24} />
                            <p className="font-semibold text-sm">No Active Enquiries Found</p>
                            <p className="text-xs text-blue-600 max-w-sm">When you request quotes on vehicle cards, your dealership pricing queries will populate here automatically.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {enquiries.map((item) => (
                                <div key={item._id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:border-orange-200 transition-all flex justify-between items-center">
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-bold px-2 py-0.5 bg-orange-50 text-orange-600 rounded">
                                            ID: #{item._id.slice(-6).toUpperCase()}
                                        </span>
                                        <h3 className="text-base font-bold text-gray-800">{item.vehicleName || 'Three-Wheeler Base Model'}</h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Calendar size={12} /> Filed: {new Date(item.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.status === 'resolved' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                            {item.status || 'Pending Review'}
                                        </span>
                                        <button className="text-xs font-bold text-gray-400 hover:text-orange-600 flex items-center gap-0.5 mt-3 transition-colors ml-auto">
                                            Details <ArrowRight size={12} />
                                        </button>
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