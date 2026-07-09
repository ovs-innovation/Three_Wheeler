'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../context/AdminAuthContext';
import { Award, Plus, Trash2, Edit, X, Save, AlertTriangle, Upload, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function BrandsManager() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBrand, setEditBrand] = useState(null);
  
  // Image states
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm();

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/brands');
      if (res.data && res.data.success) {
        setBrands(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load brands:', err);
      toast.error('Failed to fetch manufacturer brands.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openAddModal = () => {
    setEditBrand(null);
    setLogoUrl('');
    setBannerUrl('');
    reset({
      name: '',
      slug: '',
      logo: '',
      banner: '',
      country: 'India',
      description: '',
      marketShare: '0%',
      rating: 4.5,
      established: '',
      origin: '',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      status: 'active'
    });
    setModalOpen(true);
  };

  const openEditModal = (brand) => {
    setEditBrand(brand);
    setLogoUrl(brand.logo || '');
    setBannerUrl(brand.banner || '');
    reset({
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo,
      banner: brand.banner || '',
      country: brand.country || 'India',
      description: brand.description || '',
      marketShare: brand.marketShare || '0%',
      rating: brand.rating || 4.5,
      established: brand.established || '',
      origin: brand.origin || '',
      seoTitle: brand.seoTitle || '',
      seoDescription: brand.seoDescription || '',
      seoKeywords: brand.seoKeywords || '',
      status: brand.status || 'active'
    });
    setModalOpen(true);
  };

  const handleLogoUpload = async (e, field = 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const res = await adminApi.post('/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data?.success) {
        const fileUrl = res.data.data.url;
        if (field === 'banner') {
          setBannerUrl(fileUrl);
          toast.success('Brand banner uploaded successfully.');
        } else {
          setLogoUrl(fileUrl);
          toast.success('Brand logo uploaded successfully.');
        }
      }
    } catch (err) {
      toast.error('File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        logo: logoUrl,
        banner: bannerUrl
      };

      if (editBrand) {
        // Edit Brand
        const res = await adminApi.put(`/brands/${editBrand._id}`, payload);
        if (res.data && res.data.success) {
          toast.success('Brand updated successfully.');
          setModalOpen(false);
          fetchBrands();
        }
      } else {
        // Add Brand
        const res = await adminApi.post('/brands', payload);
        if (res.data && res.data.success) {
          toast.success('Brand cataloged successfully.');
          setModalOpen(false);
          fetchBrands();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0] || err.response?.data?.message || 'Action failed.');
    }
  };

  const handleDeleteBrand = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this brand? linked vehicles will not be deleted but they will lose their brand mapping.')) {
      try {
        const res = await adminApi.delete(`/brands/${id}`);
        if (res.data && res.data.success) {
          setBrands(brands.filter(b => b._id !== id));
          toast.success('Brand deleted successfully.');
        }
      } catch (err) {
        toast.error('Failed to delete brand.');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-display font-extrabold text-white flex items-center gap-2">
            <Award className="text-brand-primary" /> Manufacturer Brand Registry
          </h1>
          <p className="text-xs text-brand-sec-text mt-1">Configure brand detail profiles, market share percentages, and SEO details.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-brand-primary text-black font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-brand-secondary transition-colors shadow-lg"
        >
          <Plus size={16} /> Catalog Brand
        </button>
      </div>

      {/* Main Brands Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.length > 0 ? (
            brands.map((brand) => (
              <div
                key={brand._id}
                className="bg-brand-sidebar border border-brand-border rounded-[20px] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between hover:border-brand-primary/45 transition-colors group"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-12 rounded bg-brand-bg border border-brand-border flex items-center justify-center p-2 relative overflow-hidden shadow-inner shrink-0">
                      {brand.logo ? (
                        <img src={brand.logo} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <Award className="text-brand-muted" size={20} />
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8.5px] font-extrabold uppercase ${brand.status === 'active' ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-danger/10 text-brand-danger'}`}>
                      {brand.status || 'Active'}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white">{brand.name}</h3>
                  <span className="text-[10px] text-brand-muted font-semibold block mt-0.5 uppercase tracking-wide">Market Share: {brand.marketShare}</span>
                  <p className="text-xs text-brand-sec-text mt-3 leading-relaxed font-medium line-clamp-3">{brand.description || 'No description cataloged.'}</p>
                </div>

                <div className="border-t border-brand-border/60 pt-4 mt-4 flex items-center justify-between text-[10px] text-brand-muted font-bold">
                  <span>Founded: {brand.established || 'N/A'}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(brand)}
                      className="text-brand-primary hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBrand(brand._id)}
                      className="text-brand-danger hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-16 text-center text-brand-muted bg-brand-sidebar border border-brand-border rounded-2xl italic">
              No brands cataloged in registry.
            </div>
          )}
        </div>
      )}

      {/* CRUD modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-sidebar border border-brand-border rounded-2xl w-full max-w-2xl p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-brand-muted hover:text-white text-xl font-bold"
            >
              ×
            </button>

            <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-6">
              <Award className="text-brand-primary" /> {editBrand ? `Edit Brand: ${editBrand.name}` : 'Catalog Brand Registry'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-brand-text">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Brand Name</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    placeholder="e.g. Euler Motors"
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  />
                  {errors.name && <span className="text-[10px] text-brand-danger mt-1 block font-bold">{errors.name.message}</span>}
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Custom Slug (blank to auto-generate)</label>
                  <input
                    type="text"
                    {...register('slug')}
                    placeholder="e.g. euler-motors"
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Country of Origin</label>
                  <input
                    type="text"
                    {...register('country')}
                    placeholder="e.g. India"
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  />
                </div>

                {/* Founded year */}
                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Established Year</label>
                  <input
                    type="number"
                    {...register('established')}
                    placeholder="e.g. 2018"
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  />
                </div>

                {/* Market Share */}
                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Market Share Share (%)</label>
                  <input
                    type="text"
                    {...register('marketShare')}
                    placeholder="e.g. 1.2%"
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Operational Status</label>
                  <select
                    {...register('status')}
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Logo & Banner uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-brand-border pt-6">
                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5 font-semibold">Upload Brand Logo</label>
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2 bg-brand-card hover:bg-brand-bg border border-brand-border text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5">
                      <Upload size={14} /> Logo Upload
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, 'logo')}
                        className="hidden"
                      />
                    </label>
                    {uploading && <RefreshCw size={14} className="animate-spin text-brand-primary" />}
                    {logoUrl && (
                      <div className="w-10 h-10 rounded border border-brand-border overflow-hidden bg-brand-bg p-1 shrink-0">
                        <img src={logoUrl} alt="" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5 font-semibold">Upload Brand Banner</label>
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2 bg-brand-card hover:bg-brand-bg border border-brand-border text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5">
                      <Upload size={14} /> Banner Upload
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, 'banner')}
                        className="hidden"
                      />
                    </label>
                    {bannerUrl && (
                      <div className="w-16 h-10 rounded border border-brand-border overflow-hidden bg-brand-bg shrink-0">
                        <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-brand-border pt-6">
                <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Brand Overview Description</label>
                <textarea
                  rows={3}
                  {...register('description')}
                  placeholder="Euler motors makes high-performance electric cargo three-wheelers..."
                  className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                />
              </div>

              {/* Submit */}
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
                  <Save size={14} /> Save Brand
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
