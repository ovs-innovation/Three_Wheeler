'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../context/AdminAuthContext';
import {
  MessageSquare, Trash2, Calendar, Phone, Mail, User, Check,
  AlertTriangle, Search, Filter, FileSpreadsheet, Edit, Save, X, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function EnquiriesManager() {
  const [enquiries, setEnquiries] = useState([]);
  const [executives, setExecutives] = useState([]); // List of admin staff
  const [loading, setLoading] = useState(true);

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Edit states
  const [activeModalEnquiry, setActiveModalEnquiry] = useState(null);
  const [editForm, setEditForm] = useState({ status: 'Pending', assignedExecutive: '', notes: '' });

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/enquiries');
      if (res.data?.success) {
        setEnquiries(res.data.data);
      }

      // Also retrieve users list to extract admin staff for assignments
      const resUsers = await adminApi.get('/users');
      // For assignment executive, we can query admins or just allow selection
      // Let's also fetch active admin profile list or simulate a list of staff
      setExecutives([
        { id: '1', name: 'Rohan Sharma (Sales Executive)' },
        { id: '2', name: 'Preeti Deshmukh (Financing Desk)' },
        { id: '3', name: 'Karan Kumar (Test Drive Lead)' }
      ]);
    } catch (err) {
      console.error('Failed to load enquiries:', err);
      toast.error('Failed to fetch enquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleUpdateStatus = async (id, updatedFields) => {
    try {
      const res = await adminApi.put(`/enquiries/${id}`, updatedFields);
      if (res.data?.success) {
        setEnquiries((prev) =>
          prev.map((e) => (e._id === id ? res.data.data : e))
        );
        toast.success('Enquiry updated successfully.');
        setActiveModalEnquiry(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update enquiry.');
    }
  };

  const handleDeleteEnquiry = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this customer enquiry?')) {
      try {
        const res = await adminApi.delete(`/enquiries/${id}`);
        if (res.data?.success) {
          setEnquiries((prev) => prev.filter((e) => e._id !== id));
          toast.success('Customer enquiry deleted successfully.');
        }
      } catch (err) {
        toast.error('Failed to delete enquiry.');
      }
    }
  };

  const openEditModal = (enquiry) => {
    setActiveModalEnquiry(enquiry);
    setEditForm({
      status: enquiry.status || 'Pending',
      assignedExecutive: enquiry.assignedExecutive?._id || enquiry.assignedExecutive || '',
      notes: enquiry.notes || ''
    });
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (activeModalEnquiry) {
      handleUpdateStatus(activeModalEnquiry._id, editForm);
    }
  };

  // CSV Export utility
  const exportToCSV = () => {
    if (enquiries.length === 0) {
      toast.error('No enquiries found to export.');
      return;
    }

    const headers = ['Enquiry ID', 'Customer Name', 'Email', 'Phone', 'City', 'Vehicle Model', 'Lead Type', 'Date', 'Status', 'Notes'];
    const rows = filteredEnquiries.map(e => [
      e._id,
      e.name,
      e.email,
      e.phone,
      e.city,
      e.vehicleName,
      e.type,
      e.date,
      e.status,
      e.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `autojunction_enquiries_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Leads exported to CSV successfully.');
  };

  // Filter logic
  const filteredEnquiries = enquiries.filter((e) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      e.name.toLowerCase().includes(term) ||
      e.email.toLowerCase().includes(term) ||
      e.phone.toLowerCase().includes(term) ||
      e.vehicleName.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchesType = typeFilter === 'all' || e.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalCount = enquiries.length;
  const pendingCount = enquiries.filter(e => e.status === 'Pending').length;
  const completedCount = enquiries.filter(e => e.status === 'Completed').length;
  
  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const todayCount = enquiries.filter(e => e.date === todayStr).length;

  return (
    <div className="space-y-6 text-brand-text">
      
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-display font-extrabold text-white flex items-center gap-2">
            <MessageSquare className="text-brand-primary" /> Consumer Lead Management
          </h1>
          <p className="text-xs text-brand-sec-text mt-1">Review callbacks, loan details, insurance requests, test drive bookings, and pricing queries.</p>
        </div>
        <button
          onClick={exportToCSV}
          className="px-4 py-2.5 bg-brand-success/15 border border-brand-success/30 text-brand-success font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-brand-success/20 transition-all shadow-md"
        >
          <FileSpreadsheet size={16} /> Export leads to CSV
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-brand-sidebar border border-brand-border p-5 rounded-[20px] shadow-lg flex items-center justify-between hover:border-brand-primary transition-all">
          <div>
            <div className="text-[10px] text-brand-sec-text font-bold uppercase tracking-wider">Total Enquiries</div>
            <div className="text-2xl font-extrabold text-white mt-1.5">{totalCount}</div>
            <span className="text-[9px] font-semibold text-brand-muted mt-1 block">Lifetime submissions</span>
          </div>
          <div className="p-3 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-xl">
            <MessageSquare size={18} />
          </div>
        </div>

        <div className="bg-brand-sidebar border border-brand-border p-5 rounded-[20px] shadow-lg flex items-center justify-between hover:border-brand-warning transition-all">
          <div>
            <div className="text-[10px] text-brand-sec-text font-bold uppercase tracking-wider">Pending Review</div>
            <div className="text-2xl font-extrabold text-white mt-1.5">{pendingCount}</div>
            <span className="text-[9px] font-semibold text-brand-muted mt-1 block">Awaiting customer follow-up</span>
          </div>
          <div className="p-3 bg-brand-warning/10 text-brand-warning border border-brand-warning/20 rounded-xl">
            <AlertTriangle size={18} />
          </div>
        </div>

        <div className="bg-brand-sidebar border border-brand-border p-5 rounded-[20px] shadow-lg flex items-center justify-between hover:border-brand-success transition-all">
          <div>
            <div className="text-[10px] text-brand-sec-text font-bold uppercase tracking-wider">Completed</div>
            <div className="text-2xl font-extrabold text-white mt-1.5">{completedCount}</div>
            <span className="text-[9px] font-semibold text-brand-muted mt-1 block">Successfully resolved leads</span>
          </div>
          <div className="p-3 bg-brand-success/10 text-brand-success border border-brand-success/20 rounded-xl">
            <Check size={18} />
          </div>
        </div>

        <div className="bg-brand-sidebar border border-brand-border p-5 rounded-[20px] shadow-lg flex items-center justify-between hover:border-brand-primary transition-all">
          <div>
            <div className="text-[10px] text-brand-sec-text font-bold uppercase tracking-wider">Today's Enquiries</div>
            <div className="text-2xl font-extrabold text-white mt-1.5">{todayCount}</div>
            <span className="text-[9px] font-semibold text-brand-muted mt-1 block">Received today</span>
          </div>
          <div className="p-3 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-xl">
            <Calendar size={18} />
          </div>
        </div>
      </div>

      {/* Filters Segments toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-brand-sidebar border border-brand-border p-4 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search name, phone, vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary text-xs rounded-lg px-3 py-2.5 outline-none pl-8"
          />
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-muted" />
        </div>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-brand-bg border border-brand-border text-xs rounded-lg px-3 py-2 outline-none text-brand-text"
        >
          <option value="all">-- All Statuses --</option>
          <option value="Pending">Pending Review</option>
          <option value="Contacted">Contacted</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-brand-bg border border-brand-border text-xs rounded-lg px-3 py-2 outline-none text-brand-text"
        >
          <option value="all">-- All Action Buttons --</option>
          <option value="Get Best Offer">Get Best Offer</option>
          <option value="Request Callback">Request Callback</option>
          <option value="Book Test Drive">Book Test Drive</option>
          <option value="Finance Enquiry">Finance Enquiry</option>
          <option value="Loan Enquiry">Loan Enquiry</option>
          <option value="Insurance Enquiry">Insurance Enquiry</option>
          <option value="Dealer Enquiry">Dealer Enquiry</option>
          <option value="Contact Dealer">Contact Dealer</option>
          <option value="Get Price">Get Price</option>
          <option value="Download Brochure">Download Brochure</option>
        </select>
      </div>

      {/* Main Enquiries Table */}
      <div className="bg-brand-sidebar border border-brand-border rounded-[20px] overflow-hidden shadow-xl shadow-black/25">
        {loading ? (
          <div className="py-24 text-center">
            <div className="h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brand-border bg-brand-bg/40 text-brand-muted font-bold uppercase text-[9px] tracking-wider">
                  <th className="p-4 rounded-l-lg">Customer Details</th>
                  <th className="p-4">Vehicle Interested</th>
                  <th className="p-4">Submission Type</th>
                  <th className="p-4">Staff Assignment & Notes</th>
                  <th className="p-4">Submitted Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {filteredEnquiries.length > 0 ? (
                  filteredEnquiries.map((enquiry) => (
                    <tr key={enquiry._id} className="hover:bg-brand-card/25 transition-colors duration-150">
                      
                      {/* Customer Details */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-bg border border-brand-border text-brand-secondary flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
                            {enquiry.name.charAt(0)}
                          </div>
                          <div>
                            <span className="block font-bold text-white leading-tight">{enquiry.name}</span>
                            <span className="text-[10px] text-brand-muted block mt-0.5 font-semibold">City: {enquiry.city}</span>
                            <div className="flex items-center gap-2 mt-1.5 text-brand-sec-text">
                              <a href={`tel:${enquiry.phone}`} className="hover:text-brand-primary flex items-center gap-0.5"><Phone size={10} /> {enquiry.phone}</a>
                              <span className="text-brand-border">|</span>
                              <a href={`mailto:${enquiry.email}`} className="hover:text-brand-primary flex items-center gap-0.5"><Mail size={10} /> {enquiry.email}</a>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td className="p-4 font-bold text-white text-[12.5px] leading-tight pr-2">
                        {enquiry.vehicleName}
                      </td>

                      {/* Action Type */}
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-brand-bg border border-brand-border text-[9.5px] rounded font-bold uppercase text-brand-primary select-none">
                          {enquiry.type}
                        </span>
                      </td>

                      {/* Notes / Staff */}
                      <td className="p-4 max-w-[200px]">
                        <div className="text-[10px] leading-relaxed truncate font-medium text-brand-sec-text">
                          <strong className="text-white block">Agent: {enquiry.assignedExecutive?.name || 'Unassigned'}</strong>
                          {enquiry.notes ? `"${enquiry.notes}"` : 'No admin comments.'}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-4 font-semibold text-brand-sec-text flex items-center gap-1 mt-3">
                        <Calendar size={11} /> {enquiry.date}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                          enquiry.status === 'Completed'
                            ? 'bg-brand-success/10 border-brand-success/20 text-brand-success'
                            : enquiry.status === 'Cancelled'
                            ? 'bg-brand-danger/10 border-brand-danger/20 text-brand-danger'
                            : enquiry.status === 'Pending'
                            ? 'bg-brand-warning/10 border-brand-warning/20 text-brand-warning'
                            : 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'
                        }`}>
                          {enquiry.status}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-4 text-right space-x-1.5 shrink-0">
                        <button
                          onClick={() => openEditModal(enquiry)}
                          className="p-1.5 bg-brand-card border border-brand-border text-brand-sec-text hover:text-brand-primary hover:border-brand-primary/50 rounded-lg inline-flex transition-colors"
                          title="Update lead notes / status"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteEnquiry(enquiry._id)}
                          className="p-1.5 bg-brand-danger/10 border border-brand-danger/20 text-brand-danger hover:bg-brand-danger/20 rounded-lg inline-flex transition-colors"
                          title="Purge lead query"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-brand-muted italic">
                      No customer leads logged in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* UPDATE STATUS & ASSIGN EXECUTIVE MODAL */}
      {activeModalEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-sidebar border border-brand-border rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-fade-in">
            <button
              onClick={() => setActiveModalEnquiry(null)}
              className="absolute top-4 right-4 text-brand-muted hover:text-white text-xl font-bold"
            >
              ×
            </button>

            <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-1">
              <Edit className="text-brand-primary" size={16} /> Process Customer Lead
            </h3>
            <p className="text-[10px] text-brand-sec-text mb-6">Modify assignment, log customer follow-up notes, or resolve the request status.</p>

            <form onSubmit={handleSaveModal} className="space-y-4">
              {/* Client Info snippet */}
              <div className="bg-brand-bg/50 border border-brand-border p-3.5 rounded-xl text-xs space-y-1">
                <div><span className="text-brand-muted">Name:</span> <strong className="text-white">{activeModalEnquiry.name}</strong></div>
                <div><span className="text-brand-muted">Model Interest:</span> <strong className="text-brand-primary">{activeModalEnquiry.vehicleName}</strong></div>
                <div><span className="text-brand-muted">Action:</span> <strong className="text-white uppercase text-[10px]">{activeModalEnquiry.type}</strong></div>
              </div>

              {/* Status Select */}
              <div>
                <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1">Change Lead Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                >
                  <option value="Pending">Pending Review</option>
                  <option value="Contacted">Contacted</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Executive assignment */}
              <div>
                <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1">Assign Sales Executive</label>
                <select
                  value={editForm.assignedExecutive}
                  onChange={(e) => setEditForm({ ...editForm, assignedExecutive: e.target.value })}
                  className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                >
                  <option value="">-- Unassigned (Available Staff) --</option>
                  {executives.map((exec) => (
                    <option key={exec.id} value={exec.id}>{exec.name}</option>
                  ))}
                </select>
              </div>

              {/* Follow-up notes */}
              <div>
                <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1">Office Follow-up Notes / Comments</label>
                <textarea
                  rows={3}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Customer requesting custom EV battery warranty financing details..."
                  className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-brand-border/40 mt-6">
                <button
                  type="button"
                  onClick={() => setActiveModalEnquiry(null)}
                  className="px-4 py-2 border border-brand-border rounded-lg text-xs font-bold hover:bg-brand-card"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-primary text-black font-bold text-xs rounded-lg"
                >
                  Save Lead Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
