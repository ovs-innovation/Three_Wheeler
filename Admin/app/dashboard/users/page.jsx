'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../context/AdminAuthContext';
import { Users, Trash2, Mail, Phone, MapPin, ShieldAlert, Check, Ban } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UsersDirectory() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/users');
      if (res.data?.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load user accounts:', err);
      toast.error('Failed to fetch user accounts directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    const msg = `Are you sure you want to ${newStatus === 'blocked' ? 'BLOCK' : 'UNBLOCK'} this user?`;
    if (window.confirm(msg)) {
      try {
        const res = await adminApi.patch(`/users/${id}/status`, { status: newStatus });
        if (res.data?.success) {
          setUsers(users.map(u => u._id === id ? { ...u, status: newStatus } : u));
          toast.success(`User successfully ${newStatus === 'blocked' ? 'blocked' : 'unblocked'}`);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to update user status.');
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this customer account? This cannot be undone.')) {
      try {
        const res = await adminApi.delete(`/users/${id}`);
        if (res.data?.success) {
          setUsers(users.filter(u => u._id !== id));
          toast.success('Customer account deleted successfully.');
        }
      } catch (err) {
        toast.error('Failed to delete customer account.');
      }
    }
  };

  return (
    <div className="space-y-6 text-brand-text">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-display font-extrabold text-white flex items-center gap-2">
          <Users className="text-brand-primary" /> User Directory
        </h1>
        <p className="text-xs text-brand-sec-text mt-1">Manage customer account access, suspend abusers, and review registered user details.</p>
      </div>

      {/* Main Table */}
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
                  <th className="p-4 rounded-l-lg">Customer Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Location (City, State)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {users.length > 0 ? (
                  users.map((userItem) => (
                    <tr key={userItem._id} className="hover:bg-brand-card/25 transition-colors duration-150">
                      
                      {/* Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-bg border border-brand-border text-brand-secondary flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                            {userItem.name.charAt(0)}
                          </div>
                          <div>
                            <span className="block font-bold text-white leading-tight">{userItem.name}</span>
                            <span className="text-[10px] text-brand-muted block mt-0.5 uppercase tracking-wide">Role: {userItem.role || 'User'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="p-4 font-semibold text-brand-sec-text">
                        <a href={`mailto:${userItem.email}`} className="hover:text-brand-primary flex items-center gap-1">
                          <Mail size={12} /> {userItem.email}
                        </a>
                      </td>

                      {/* Phone */}
                      <td className="p-4 font-semibold text-brand-sec-text">
                        <a href={`tel:${userItem.phone}`} className="hover:text-brand-primary flex items-center gap-1">
                          <Phone size={12} /> {userItem.phone || 'N/A'}
                        </a>
                      </td>

                      {/* Location */}
                      <td className="p-4 font-semibold text-brand-sec-text">
                        <div className="flex items-center gap-1">
                          <MapPin size={12} className="text-brand-muted shrink-0" />
                          <span>{userItem.city || 'Delhi/NCR'}, {userItem.state || 'Delhi'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                          userItem.status === 'active'
                            ? 'bg-brand-success/10 border-brand-success/20 text-brand-success'
                            : 'bg-brand-danger/10 border-brand-danger/20 text-brand-danger'
                        }`}>
                          {userItem.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right space-x-1.5 shrink-0">
                        <button
                          onClick={() => handleUpdateStatus(userItem._id, userItem.status)}
                          className={`p-1.5 border rounded-lg inline-flex transition-colors ${
                            userItem.status === 'active'
                              ? 'bg-brand-danger/10 border-brand-danger/25 text-brand-danger hover:bg-brand-danger/20'
                              : 'bg-brand-success/10 border-brand-success/25 text-brand-success hover:bg-brand-success/20'
                          }`}
                          title={userItem.status === 'active' ? 'Block Access' : 'Unblock Access'}
                        >
                          {userItem.status === 'active' ? <Ban size={13} /> : <Check size={13} />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(userItem._id)}
                          className="p-1.5 bg-brand-danger/10 border border-brand-danger/20 text-brand-danger hover:bg-brand-danger/20 rounded-lg inline-flex transition-colors"
                          title="Permanently Purge Profile"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-brand-muted italic">
                      No user accounts registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
