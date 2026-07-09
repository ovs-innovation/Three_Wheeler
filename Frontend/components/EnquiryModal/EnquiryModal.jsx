'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Mail, Phone, User, MapPin, Check, Info, ArrowRight, X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EnquiryModal() {
  const { enquiryModal, closeEnquiryModal, user } = useApp();
  const { isOpen, vehicleName, type } = enquiryModal;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    vehicleName: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  // Pre-fill form if user is logged in or if a vehicleName is passed in
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        city: user?.city || 'Delhi/NCR',
        vehicleName: vehicleName || '',
        message: ''
      });
      setErrors({});
      setTouched({});
    }
  }, [isOpen, vehicleName, user]);

  if (!isOpen) return null;

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^[0-9]{10}$/.test(phone);
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform validation
    const valErrors = {};
    if (!formData.name.trim()) valErrors.name = 'Full Name is required';
    if (!validateEmail(formData.email)) valErrors.email = 'Enter a valid email address';
    if (!validatePhone(formData.phone)) valErrors.phone = 'Mobile must be exactly 10 digits';
    if (!formData.city.trim()) valErrors.city = 'City location is required';
    if (!formData.vehicleName.trim()) valErrors.vehicleName = 'Please specify the vehicle name';

    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      const allTouched = {};
      Object.keys(formData).forEach(k => allTouched[k] = true);
      setTouched(allTouched);
      toast.error('Please correct all validation errors.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        vehicleName: formData.vehicleName,
        type: type || 'Dealer Enquiry',
        message: formData.message
      };

      // Set auth headers if logged in
      const headers = { 'Content-Type': 'application/json' };
      if (user && user.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enquiries`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Submission failed.');
      }

      toast.success('Your enquiry request has been sent successfully!');
      closeEnquiryModal();
    } catch (err) {
      toast.error(err.message || 'Failed to submit enquiry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-brand-dark">
      <div className="bg-white border border-[#E5E7EB] w-full max-w-lg rounded-[24px] shadow-2xl relative overflow-hidden flex flex-col p-6 md:p-8 animate-scale-up">
        {/* Close Button */}
        <button
          onClick={closeEnquiryModal}
          className="absolute top-5 right-5 p-1 rounded-full text-gray-400 hover:text-brand-dark hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <div className="flex items-center text-primary text-xs font-extrabold gap-1 mb-1 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" /> {type || 'Dealer Enquiry'} Portal
          </div>
          <h3 className="text-xl font-black text-brand-dark leading-tight">Request Quote & Pricing</h3>
          <p className="text-xs text-gray-400 font-medium mt-1">Submit your details to receive commercial pricing quotes, finance options, and dealer callbacks.</p>
        </div>

        {/* Enquiry Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Full Name */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onBlur={() => handleBlur('name')}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Manish Gupta"
                  className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/20 font-semibold transition-colors ${
                    touched.name && !formData.name.trim() ? 'border-red-500 bg-red-50/50' : 'border-[#E5E7EB] focus:border-primary'
                  }`}
                />
              </div>
              {touched.name && !formData.name.trim() && (
                <span className="text-[9px] text-red-500 font-bold mt-1 block">Name is required</span>
              )}
            </div>

            {/* Phone/Mobile */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onBlur={() => handleBlur('phone')}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="10-digit number"
                  className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/20 font-semibold transition-colors ${
                    touched.phone && !validatePhone(formData.phone) ? 'border-red-500 bg-red-50/50' : 'border-[#E5E7EB] focus:border-primary'
                  }`}
                />
              </div>
              {touched.phone && !validatePhone(formData.phone) && (
                <span className="text-[9px] text-red-500 font-bold mt-1 block">Enter 10-digit number</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Email Address */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onBlur={() => handleBlur('email')}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@fleetcompany.com"
                  className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/20 font-semibold transition-colors ${
                    touched.email && !validateEmail(formData.email) ? 'border-red-500 bg-red-50/50' : 'border-[#E5E7EB] focus:border-primary'
                  }`}
                />
              </div>
              {touched.email && !validateEmail(formData.email) && (
                <span className="text-[9px] text-red-500 font-bold mt-1 block">Enter a valid email</span>
              )}
            </div>

            {/* City */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">City Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  required
                  value={formData.city}
                  onBlur={() => handleBlur('city')}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Pune"
                  className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/20 font-semibold transition-colors ${
                    touched.city && !formData.city.trim() ? 'border-red-500 bg-red-50/50' : 'border-[#E5E7EB] focus:border-primary'
                  }`}
                />
              </div>
              {touched.city && !formData.city.trim() && (
                <span className="text-[9px] text-red-500 font-bold mt-1 block">City is required</span>
              )}
            </div>
          </div>

          {/* Vehicle Name Interest */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Vehicle Interested</label>
            <input
              type="text"
              required
              value={formData.vehicleName}
              onBlur={() => handleBlur('vehicleName')}
              onChange={(e) => setFormData({ ...formData, vehicleName: e.target.value })}
              placeholder="e.g. Bajaj RE CNG or Mahindra Zor Grand"
              className={`w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/20 font-semibold transition-colors ${
                touched.vehicleName && !formData.vehicleName.trim() ? 'border-red-500 bg-red-50/50' : 'border-[#E5E7EB] focus:border-primary'
              }`}
            />
            {touched.vehicleName && !formData.vehicleName.trim() && (
              <span className="text-[9px] text-red-500 font-bold mt-1 block">Vehicle model interest is required</span>
            )}
          </div>

          {/* Message Text area */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Your Message (Optional)</label>
            <textarea
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Please provide custom requirements, loan tenure request, or test drive times..."
              className="w-full px-3 py-2 border border-[#E5E7EB] focus:border-primary rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/20 font-semibold"
            />
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C2410C] hover:bg-[#EA580C] text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>Submit Enquiry Request <ArrowRight className="w-3.5 h-3.5" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
