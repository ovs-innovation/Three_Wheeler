'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../context/AdminAuthContext';
import {
  Truck, Plus, Trash2, Edit, X, Save, AlertTriangle, Upload, Eye,
  RefreshCw, Check, EyeOff, Copy, Search, ShieldAlert, FileText, CheckCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function VehiclesManager() {
  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  
  // File Upload states
  const [uploadedImages, setUploadedImages] = useState([]);
  const [brochureUrl, setBrochureUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleted, setShowDeleted] = useState(false);

  // Bulk actions selection
  const [selectedIds, setSelectedIds] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm();

  const loadData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        limit: 1000,
        status: statusFilter,
        showDeleted: showDeleted.toString()
      });
      if (brandFilter) queryParams.append('brand', brandFilter);

      const [resVehicles, resBrands] = await Promise.all([
        adminApi.get(`/vehicles?${queryParams.toString()}`),
        adminApi.get('/brands')
      ]);

      if (resVehicles.data?.success) {
        setVehicles(resVehicles.data.data.vehicles);
      }
      if (resBrands.data?.success) {
        setBrands(resBrands.data.data);
      }
    } catch (err) {
      console.error('Failed to load vehicles/brands data:', err);
      toast.error('Failed to load catalog directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [brandFilter, statusFilter, showDeleted]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  const openAddModal = () => {
    setEditVehicle(null);
    setUploadedImages([]);
    setBrochureUrl('');
    reset({
      name: '',
      brandId: '',
      brandName: '',
      fuelType: 'CNG',
      priceMin: '',
      priceMax: '',
      emi: '',
      mileage: '',
      payloadCapacity: '',
      seatingCapacity: '',
      batteryRange: '',
      chargingTime: '',
      topSpeed: '',
      motorPower: '',
      engineCapacity: '',
      batteryCapacity: '',
      warranty: '',
      groundClearance: '',
      transmission: '',
      cargoPassenger: 'Passenger',
      pros: '',
      cons: '',
      expertReview: '',
      isPopular: false,
      isLatest: false,
      isUpcoming: false,
      isFeatured: false,
      status: 'Published',
      videoUrl: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (vehicle) => {
    setEditVehicle(vehicle);
    setUploadedImages(vehicle.images || []);
    setBrochureUrl(vehicle.brochurePdf || '');
    reset({
      name: vehicle.name,
      brandId: vehicle.brandId,
      brandName: vehicle.brandName,
      fuelType: vehicle.fuelType,
      priceMin: vehicle.priceMin,
      priceMax: vehicle.priceMax,
      emi: vehicle.emi || '',
      mileage: vehicle.mileage || '',
      payloadCapacity: vehicle.payloadCapacity || '',
      seatingCapacity: vehicle.seatingCapacity || '',
      batteryRange: vehicle.batteryRange || '',
      chargingTime: vehicle.chargingTime || '',
      topSpeed: vehicle.topSpeed || '',
      motorPower: vehicle.motorPower || '',
      engineCapacity: vehicle.engineCapacity || '',
      batteryCapacity: vehicle.batteryCapacity || '',
      warranty: vehicle.warranty || '',
      groundClearance: vehicle.groundClearance || '',
      transmission: vehicle.transmission || '',
      cargoPassenger: vehicle.cargoPassenger || 'Passenger',
      pros: vehicle.pros ? vehicle.pros.join('\n') : '',
      cons: vehicle.cons ? vehicle.cons.join('\n') : '',
      expertReview: vehicle.expertReview || '',
      isPopular: vehicle.isPopular || false,
      isLatest: vehicle.isLatest || false,
      isUpcoming: vehicle.isUpcoming || false,
      isFeatured: vehicle.isFeatured || false,
      status: vehicle.status || 'Published',
      videoUrl: vehicle.videoUrl || ''
    });
    setModalOpen(true);
  };

  const handleFileUpload = async (e, type = 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file); // API expects field name 'image'

    try {
      setUploading(true);
      const res = await adminApi.post('/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data?.success) {
        const fileUrl = res.data.data.url;
        if (type === 'pdf') {
          setBrochureUrl(fileUrl);
          toast.success('Brochure PDF uploaded successfully.');
        } else {
          setUploadedImages((prev) => [...prev, fileUrl]);
          toast.success('Vehicle image uploaded successfully.');
        }
      }
    } catch (err) {
      console.error('File upload failed:', err);
      toast.error(err.response?.data?.message || 'File upload failed. Ensure server is running.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const onSubmit = async (data) => {
    try {
      // Process comma/newline separated strings to arrays
      const prosArr = data.pros ? data.pros.split('\n').map(p => p.trim()).filter(p => p.length > 0) : [];
      const consArr = data.cons ? data.cons.split('\n').map(c => c.trim()).filter(c => c.length > 0) : [];
      
      // Auto-extract brandName from brandId selection
      const selectedBrandObj = brands.find(b => b.slug === data.brandId);
      const brandName = selectedBrandObj ? selectedBrandObj.name : data.brandName || 'Verified Brand';

      const payload = {
        ...data,
        brandName,
        priceMin: Number(data.priceMin),
        priceMax: Number(data.priceMax),
        emi: Number(data.emi) || 0,
        pros: prosArr,
        cons: consArr,
        images: uploadedImages,
        brochurePdf: brochureUrl
      };

      if (editVehicle) {
        // Edit Vehicle
        const res = await adminApi.put(`/vehicles/${editVehicle.id}`, payload);
        if (res.data?.success) {
          toast.success('Vehicle specs updated successfully!');
          setModalOpen(false);
          loadData();
        }
      } else {
        // Create Vehicle
        const res = await adminApi.post('/vehicles', payload);
        if (res.data?.success) {
          toast.success('New Three-Wheeler cataloged successfully!');
          setModalOpen(false);
          loadData();
        }
      }
    } catch (err) {
      console.error('Form submission failed:', err);
      toast.error(err.response?.data?.errors?.[0] || err.response?.data?.message || 'Action failed.');
    }
  };

  const handleSoftDelete = async (id) => {
    if (window.confirm('Are you sure you want to soft-delete this vehicle? Users will not see it, but you can restore it later.')) {
      try {
        const res = await adminApi.patch(`/vehicles/${id}/soft-delete`);
        if (res.data?.success) {
          toast.success('Vehicle soft-deleted successfully.');
          loadData();
        }
      } catch (err) {
        toast.error('Failed to soft-delete vehicle.');
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      const res = await adminApi.patch(`/vehicles/${id}/restore`);
      if (res.data?.success) {
        toast.success('Vehicle model restored successfully.');
        loadData();
      }
    } catch (err) {
      toast.error('Failed to restore vehicle.');
    }
  };

  const handlePermanentDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this vehicle from the database? This cannot be undone.')) {
      try {
        const res = await adminApi.delete(`/vehicles/${id}`);
        if (res.data?.success) {
          toast.success('Vehicle permanently deleted successfully.');
          loadData();
        }
      } catch (err) {
        toast.error('Failed to delete vehicle.');
      }
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await adminApi.post(`/vehicles/${id}/duplicate`);
      if (res.data?.success) {
        toast.success('Vehicle duplicated successfully as draft copy!');
        loadData();
      }
    } catch (err) {
      toast.error('Duplication failed.');
    }
  };

  // Bulk Actions
  const handleCheckboxToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredVehicles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredVehicles.map((v) => v.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to permanently delete the ${selectedIds.length} selected vehicles?`)) {
      try {
        const res = await adminApi.post('/vehicles/bulk-delete', { ids: selectedIds });
        if (res.data?.success) {
          toast.success('Selected vehicles deleted successfully.');
          setSelectedIds([]);
          loadData();
        }
      } catch (err) {
        toast.error('Bulk deletion failed.');
      }
    }
  };

  const handleBulkPublish = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await adminApi.post('/vehicles/bulk-publish', { ids: selectedIds });
      if (res.data?.success) {
        toast.success('Selected vehicles published successfully.');
        setSelectedIds([]);
        loadData();
      }
    } catch (err) {
      toast.error('Bulk publish failed.');
    }
  };

  const handleBulkDraft = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await adminApi.post('/vehicles/bulk-draft', { ids: selectedIds });
      if (res.data?.success) {
        toast.success('Selected vehicles set to draft.');
        setSelectedIds([]);
        loadData();
      }
    } catch (err) {
      toast.error('Bulk draft operation failed.');
    }
  };

  // Client side search filtering
  const filteredVehicles = vehicles.filter((v) => {
    const term = searchQuery.toLowerCase();
    return (
      v.name.toLowerCase().includes(term) ||
      v.brandName.toLowerCase().includes(term) ||
      v.fuelType.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-display font-extrabold text-white flex items-center gap-2">
            <Truck className="text-brand-primary" /> Vehicle Catalog Management
          </h1>
          <p className="text-xs text-brand-sec-text mt-1">Publish new auto-rickshaws, cargo loaders, manage specifications, or upload brochures.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-brand-primary text-black font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-brand-secondary transition-colors shadow-lg"
        >
          <Plus size={16} /> Catalog New Vehicle
        </button>
      </div>

      {/* Filters Segments toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-brand-sidebar border border-brand-border p-4 rounded-2xl shadow-sm">
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search name, brand, fuel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary text-xs rounded-lg px-3 py-2.5 outline-none pl-8"
          />
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-muted" />
        </div>

        {/* Brand selection */}
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="bg-brand-bg border border-brand-border text-xs rounded-lg px-3 py-2 outline-none text-brand-text"
        >
          <option value="">-- All Brands --</option>
          {brands.map((b) => (
            <option key={b._id} value={b.slug}>{b.name}</option>
          ))}
        </select>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-brand-bg border border-brand-border text-xs rounded-lg px-3 py-2 outline-none text-brand-text"
        >
          <option value="all">-- All Statuses --</option>
          <option value="Published">Published Only</option>
          <option value="Draft">Draft Only</option>
        </select>

        {/* Soft-Deleted checkbox */}
        <label className="flex items-center gap-2 text-xs font-bold text-brand-sec-text cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => setShowDeleted(e.target.checked)}
            className="rounded border-brand-border bg-brand-bg checked:bg-brand-primary checked:border-brand-primary w-4 h-4"
          />
          Include Soft-Deleted Models
        </label>
      </div>

      {/* Bulk actions toolbar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-brand-primary/10 border border-brand-primary/20 p-4 rounded-xl text-xs font-bold">
          <span className="text-brand-primary">{selectedIds.length} vehicles selected</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkPublish}
              className="px-3 py-1.5 bg-brand-primary text-black rounded hover:bg-brand-secondary transition-colors"
            >
              Bulk Publish
            </button>
            <button
              onClick={handleBulkDraft}
              className="px-3 py-1.5 bg-brand-card border border-brand-border text-white rounded hover:bg-brand-bg transition-colors"
            >
              Bulk Draft
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-brand-danger/20 border border-brand-danger/30 text-brand-danger rounded hover:bg-brand-danger/35 transition-colors"
            >
              Bulk Delete
            </button>
          </div>
        </div>
      )}

      {/* Inventory Table List */}
      <div className="bg-brand-sidebar border border-brand-border rounded-[20px] overflow-hidden shadow-xl shadow-black/20">
        {loading ? (
          <div className="py-24 text-center">
            <div className="h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brand-border bg-brand-bg/40 text-brand-muted font-bold uppercase text-[9px] tracking-wider">
                  <th className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredVehicles.length && filteredVehicles.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-brand-border bg-brand-bg checked:bg-brand-primary checked:border-brand-primary w-4.5 h-4.5"
                    />
                  </th>
                  <th className="p-4">Vehicle Model</th>
                  <th className="p-4">Brand</th>
                  <th className="p-4">Specs Summary</th>
                  <th className="p-4">Price Range (Ex-Showroom)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40 text-brand-text">
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle) => {
                    const isSoftDeleted = vehicle.deletedAt !== null;
                    return (
                      <tr
                        key={vehicle.id}
                        className={`hover:bg-brand-card/25 transition-colors duration-150 ${isSoftDeleted ? 'opacity-50 bg-brand-danger/[0.02]' : ''}`}
                      >
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(vehicle.id)}
                            onChange={() => handleCheckboxToggle(vehicle.id)}
                            className="rounded border-brand-border bg-brand-bg checked:bg-brand-primary checked:border-brand-primary w-4.5 h-4.5"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-8 rounded bg-brand-bg border border-brand-border overflow-hidden shrink-0 flex items-center justify-center text-brand-muted font-semibold relative">
                              {vehicle.images?.[0] ? (
                                <img src={vehicle.images[0]} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Truck size={14} />
                              )}
                            </div>
                            <div>
                              <span className="block font-bold text-white leading-tight">{vehicle.name}</span>
                              <span className="text-[9.5px] text-brand-muted block mt-0.5 font-semibold">ID: {vehicle.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-brand-sec-text">{vehicle.brandName}</td>
                        <td className="p-4 space-y-0.5 leading-normal">
                          <div className="text-[10px]"><span className="text-brand-muted">Fuel:</span> <strong className="text-brand-primary">{vehicle.fuelType}</strong></div>
                          <div className="text-[10px]"><span className="text-brand-muted">Category:</span> <strong className="text-white">{vehicle.vehicleType}</strong></div>
                        </td>
                        <td className="p-4 font-bold text-white text-[12.5px]">
                          ₹{(vehicle.priceMin / 100000).toFixed(2)} - {(vehicle.priceMax / 100000).toFixed(2)} Lakh*
                        </td>
                        <td className="p-4">
                          {isSoftDeleted ? (
                            <span className="px-2.5 py-0.5 bg-brand-danger/10 border border-brand-danger/25 text-brand-danger rounded-full text-[9px] font-extrabold uppercase">
                              Soft Deleted
                            </span>
                          ) : (
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                              vehicle.status === 'Published'
                                ? 'bg-brand-success/10 border-brand-success/20 text-brand-success'
                                : 'bg-brand-warning/10 border-brand-warning/20 text-brand-warning'
                            }`}>
                              {vehicle.status || 'Published'}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-1.5 shrink-0">
                          {isSoftDeleted ? (
                            <>
                              <button
                                onClick={() => handleRestore(vehicle.id)}
                                title="Restore"
                                className="p-1.5 bg-brand-success/10 hover:bg-brand-success/20 text-brand-success border border-brand-success/25 rounded-lg inline-flex"
                              >
                                <Check size={13} />
                              </button>
                              <button
                                onClick={() => handlePermanentDelete(vehicle.id)}
                                title="Permanently Delete"
                                className="p-1.5 bg-brand-danger/10 hover:bg-brand-danger/20 text-brand-danger border border-brand-danger/25 rounded-lg inline-flex"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => openEditModal(vehicle)}
                                title="Edit specs"
                                className="p-1.5 bg-brand-card border border-brand-border text-brand-sec-text hover:text-brand-primary hover:border-brand-primary/50 rounded-lg inline-flex transition-colors"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                onClick={() => handleDuplicate(vehicle.id)}
                                title="Duplicate model draft"
                                className="p-1.5 bg-brand-card border border-brand-border text-brand-sec-text hover:text-brand-secondary hover:border-brand-secondary/50 rounded-lg inline-flex transition-colors"
                              >
                                <Copy size={13} />
                              </button>
                              <button
                                onClick={() => handleSoftDelete(vehicle.id)}
                                title="Soft delete"
                                className="p-1.5 bg-brand-danger/10 border border-brand-danger/20 text-brand-danger hover:bg-brand-danger/20 rounded-lg inline-flex transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-brand-muted italic">
                      No vehicles cataloged in directory.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CRUD CREATION / MODIFICATION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-sidebar border border-brand-border rounded-2xl w-full max-w-4xl p-6 relative shadow-2xl overflow-y-auto max-h-[90vh] text-brand-text">
            
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-brand-muted hover:text-white text-xl font-bold"
            >
              ×
            </button>

            <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-6">
              <Truck className="text-brand-primary" /> {editVehicle ? `Modify Specs: ${editVehicle.name}` : 'Catalog New Three-Wheeler Model'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Form segment grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Brand Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Select Manufacturer Brand</label>
                  <select
                    {...register('brandId', { required: 'Brand is required' })}
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  >
                    <option value="">-- Choose Brand --</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b.slug}>{b.name}</option>
                    ))}
                  </select>
                  {errors.brandId && <span className="text-[10px] text-brand-danger mt-1 block font-bold">{errors.brandId.message}</span>}
                </div>

                {/* Model Name */}
                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Model Name (Generates Slug)</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Model name is required' })}
                    placeholder="e.g. Treo EV Rickshaw"
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  />
                  {errors.name && <span className="text-[10px] text-brand-danger mt-1 block font-bold">{errors.name.message}</span>}
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Fuel Type Segment</label>
                  <select
                    {...register('fuelType', { required: 'Fuel type is required' })}
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  >
                    <option value="CNG">CNG</option>
                    <option value="Electric">Electric</option>
                    <option value="LPG">LPG</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                  </select>
                </div>

                {/* Price bounds */}
                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Min Ex-Showroom (INR)</label>
                  <input
                    type="number"
                    {...register('priceMin', { required: 'Min price is required' })}
                    placeholder="e.g. 210000"
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Max Ex-Showroom (INR)</label>
                  <input
                    type="number"
                    {...register('priceMax', { required: 'Max price is required' })}
                    placeholder="e.g. 235000"
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  />
                </div>

                {/* EMI */}
                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Start EMI Rate (INR/mo)</label>
                  <input
                    type="number"
                    {...register('emi')}
                    placeholder="e.g. 5200"
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  />
                </div>

                {/* Category Type */}
                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Usage Category Type</label>
                  <input
                    type="text"
                    {...register('vehicleType')}
                    placeholder="e.g. Cargo Auto, Passenger Rickshaw"
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  />
                </div>

                {/* Seating Capacity */}
                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Seating capacity</label>
                  <input
                    type="text"
                    {...register('seatingCapacity')}
                    placeholder="e.g. D + 3 Passenger"
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  />
                </div>

                {/* Payload capacity */}
                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Payload Load Capacity</label>
                  <input
                    type="text"
                    {...register('payloadCapacity')}
                    placeholder="e.g. 550 kg"
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  />
                </div>

                {/* Electric EV specifics */}
                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">EV Range (Electric Only)</label>
                  <input
                    type="text"
                    {...register('batteryRange')}
                    placeholder="e.g. 110 km/charge"
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">EV Charge Time (Electric Only)</label>
                  <input
                    type="text"
                    {...register('chargingTime')}
                    placeholder="e.g. 3.5 Hours"
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">EV Motor Power (kW)</label>
                  <input
                    type="text"
                    {...register('motorPower')}
                    placeholder="e.g. 8 kW BLDC"
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  />
                </div>

                {/* ICE specifics */}
                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Engine CC (ICE Only)</label>
                  <input
                    type="text"
                    {...register('engineCapacity')}
                    placeholder="e.g. 210 cc Engine"
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Fuel Tank Volume / Capacity</label>
                  <input
                    type="text"
                    {...register('fuelTank')}
                    placeholder="e.g. 10.5 Litres"
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Standard Mileage</label>
                  <input
                    type="text"
                    {...register('mileage')}
                    placeholder="e.g. 35 km/l"
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  />
                </div>

                {/* Other specs */}
                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Top Speed</label>
                  <input
                    type="text"
                    {...register('topSpeed')}
                    placeholder="e.g. 50 km/h"
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Transmission Gearbox</label>
                  <input
                    type="text"
                    {...register('transmission')}
                    placeholder="e.g. 4-Speed Constant Mesh"
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Cargo / Passenger Type</label>
                  <select
                    {...register('cargoPassenger')}
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  >
                    <option value="Passenger">Passenger Segment</option>
                    <option value="Cargo">Cargo / Loader Segment</option>
                  </select>
                </div>
              </div>

              {/* Media uploads and expert review details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-brand-border pt-6">
                
                {/* Images Gallery */}
                <div className="space-y-3">
                  <span className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider">Vehicle Gallery Images</span>
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2 bg-brand-card hover:bg-brand-bg border border-brand-border text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5">
                      <Upload size={14} /> Upload image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'image')}
                        className="hidden"
                      />
                    </label>
                    {uploading && <RefreshCw size={14} className="animate-spin text-brand-primary" />}
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="aspect-video rounded bg-brand-bg border border-brand-border overflow-hidden relative group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-brand-danger font-bold text-xs transition-opacity"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PDF Brochure */}
                <div>
                  <span className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Technical Brochure (PDF Document)</span>
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2 bg-brand-card hover:bg-brand-bg border border-brand-border text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5">
                      <FileText size={14} /> Upload PDF Brochure
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileUpload(e, 'pdf')}
                        className="hidden"
                      />
                    </label>
                    {brochureUrl && (
                      <span className="text-[10px] text-brand-success font-semibold flex items-center gap-0.5 truncate max-w-[200px]">
                        <CheckCircle size={10} /> Brochure Uploaded
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Text areas (Pros, Cons, Expert Review) */}
              <div className="space-y-4 border-t border-brand-border pt-6">
                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">ExpertVerdict Road-Test Summary</label>
                  <textarea
                    rows={4}
                    {...register('expertReview')}
                    placeholder="Provide professional review summary about structural performance..."
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Pros (advantages list - one per line)</label>
                    <textarea
                      rows={4}
                      {...register('pros')}
                      placeholder="High mileage&#10;Comfortable driver seat..."
                      className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Cons (drawbacks list - one per line)</label>
                    <textarea
                      rows={4}
                      {...register('cons')}
                      placeholder="Vibration at high speed&#10;Higher cost..."
                      className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Checkboxes parameters */}
              <div className="flex flex-wrap gap-6 border-t border-brand-border pt-6 text-xs font-bold text-brand-sec-text">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('isPopular')} className="rounded border-brand-border w-4.5 h-4.5 accent-brand-primary" /> Popular Model
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('isLatest')} className="rounded border-brand-border w-4.5 h-4.5 accent-brand-primary" /> Latest Release
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('isUpcoming')} className="rounded border-brand-border w-4.5 h-4.5 accent-brand-primary" /> Upcoming Model
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('isFeatured')} className="rounded border-brand-border w-4.5 h-4.5 accent-brand-primary" /> Featured Grid
                </label>

                <div className="ml-auto flex items-center gap-2">
                  <label className="text-[10px] uppercase font-bold text-brand-muted">Status:</label>
                  <select
                    {...register('status')}
                    className="bg-brand-bg border border-brand-border rounded text-[10px] p-1 font-bold"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 border-t border-brand-border pt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-brand-border rounded-xl text-xs font-bold hover:bg-brand-card transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-primary text-black font-bold text-xs rounded-xl flex items-center gap-1 hover:bg-brand-secondary transition-colors"
                >
                  <Save size={14} /> Save Specifications
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
