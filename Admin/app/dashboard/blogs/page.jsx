'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../context/AdminAuthContext';
import { BookOpen, Plus, Trash2, Edit, Save, X, Calendar, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function BlogsManager() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/blogs');
      if (res.data?.success) {
        setBlogs(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load blog posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const openAddModal = () => {
    setEditItem(null);
    reset({
      title: '',
      category: 'Fleet Operations',
      author: 'Fleet Analyst',
      readTime: '5 min read',
      summary: '',
      content: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    reset({
      title: item.title,
      category: item.category,
      author: item.author,
      readTime: item.readTime,
      summary: item.summary,
      content: item.content
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editItem) {
        const res = await adminApi.put(`/blogs/${editItem.id}`, data);
        if (res.data?.success) {
          toast.success('Blog post updated successfully.');
          setModalOpen(false);
          loadBlogs();
        }
      } else {
        const res = await adminApi.post('/blogs', data);
        if (res.data?.success) {
          toast.success('Blog post created successfully.');
          setModalOpen(false);
          loadBlogs();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this blog post?')) {
      try {
        const res = await adminApi.delete(`/blogs/${id}`);
        if (res.data?.success) {
          toast.success('Blog post deleted successfully.');
          loadBlogs();
        }
      } catch (err) {
        toast.error('Failed to delete blog post.');
      }
    }
  };

  return (
    <div className="space-y-6 text-brand-text">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-display font-extrabold text-white flex items-center gap-2">
            <BookOpen className="text-brand-primary" /> Business Blogs Desk
          </h1>
          <p className="text-xs text-brand-sec-text mt-1">Publish fleet optimization strategies, maintenance checklists, and electric rickshaw running comparisons.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-brand-primary text-black font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-brand-secondary transition-colors shadow-lg"
        >
          <Plus size={16} /> Write Blog Post
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogs.length > 0 ? (
            blogs.map((item) => (
              <div
                key={item.id}
                className="bg-brand-sidebar border border-brand-border rounded-[20px] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between hover:border-brand-primary/45 transition-colors group"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="px-2 py-0.5 bg-brand-card border border-brand-border rounded text-[9px] font-bold uppercase text-brand-primary">
                      {item.category}
                    </span>
                    <span className="text-[9.5px] text-brand-muted font-semibold flex items-center gap-0.5">
                      <Calendar size={10} /> {item.date}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white leading-snug line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-brand-sec-text mt-3 leading-relaxed font-medium line-clamp-3">{item.summary}</p>
                </div>

                <div className="border-t border-brand-border/60 pt-4 mt-4 flex items-center justify-between text-[10px] text-brand-muted font-bold">
                  <span className="flex items-center gap-1"><User size={11} /> {item.author} ({item.readTime})</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(item)} className="text-brand-primary hover:underline">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="text-brand-danger hover:underline">Delete</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 py-16 text-center text-brand-muted bg-brand-sidebar border border-brand-border rounded-2xl italic">
              No blog posts published.
            </div>
          )}
        </div>
      )}

      {/* Write Blog Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-sidebar border border-brand-border rounded-2xl w-full max-w-2xl p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-brand-muted hover:text-white text-xl font-bold">×</button>

            <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-6">
              <BookOpen className="text-brand-primary" /> {editItem ? 'Edit Blog Post' : 'Write Blog Post'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Blog Title</label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  placeholder="Fleet Operations Optimization Guide..."
                  className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                />
                {errors.title && <span className="text-[10px] text-brand-danger mt-1 block font-bold">{errors.title.message}</span>}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Category</label>
                  <input
                    type="text"
                    {...register('category')}
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Author</label>
                  <input
                    type="text"
                    {...register('author')}
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Read Time</label>
                  <input
                    type="text"
                    {...register('readTime')}
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Blog Summary (Short excerpt)</label>
                <textarea
                  rows={2}
                  {...register('summary')}
                  className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-brand-sec-text uppercase tracking-wider mb-1.5">Full Blog Content</label>
                <textarea
                  rows={8}
                  {...register('content', { required: 'Content is required' })}
                  className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-lg text-xs p-2.5 outline-none font-sans leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-brand-border/40 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-brand-border rounded-xl text-xs font-bold hover:bg-brand-card">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-brand-primary text-black font-bold text-xs rounded-xl">Save Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
