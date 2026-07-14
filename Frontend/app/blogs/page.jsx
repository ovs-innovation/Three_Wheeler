'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import staticBlogs from '@/data/blogs.json';
import { BookOpen, Calendar, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const BLOG_CATEGORIES = [
  'All Articles', 'Buying Guides', 'Maintenance Tips', 'Commercial Business', 'EV Ownership', 'Government Subsidies', 'Transport Tips', 'Last Mile Delivery', 'Profitability Guides'
];

function BlogsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All Articles';

  const [liveBlogs, setLiveBlogs] = useState(staticBlogs);

  useEffect(() => {
    const fetchLiveBlogs = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) return;
      try {
        const res = await fetch(`${apiUrl}/blogs`).then(r => r.json());
        if (res.success && res.data) {
          setLiveBlogs(res.data);
        }
      } catch (err) {
        console.error('Failed to sync live blog data:', err);
      }
    };
    fetchLiveBlogs();
  }, []);

  const blogsData = liveBlogs;

  const handleCategoryClick = (category) => {
    if (category === 'All Articles') {
      router.push('/blogs');
    } else {
      router.push(`/blogs?category=${encodeURIComponent(category)}`);
    }
  };

  // Filter Blogs
  const filteredBlogs = blogsData.filter(blog => {
    if (activeCategory === 'All Articles') return true;
    return (blog.category || '').toLowerCase() === activeCategory.toLowerCase();
  });

  const featuredBlog = filteredBlogs[0];
  const gridBlogs = filteredBlogs.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* breadcrumb */}
      <div className="text-xs text-gray-400 font-medium mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link> &gt; <span>Business Guides & Blogs</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-black text-brand-dark mb-2">Three Wheeler Business & Profitability Guides</h1>
      <p className="text-xs text-gray-500 mb-8 max-w-xl">
        Actionable articles on starting logistics deliveries, maintaining lead-acid/lithium-ion batteries, and calculating cost per kilometer for fleet operations.
      </p>

      {/* Category Chips Bar */}
      <div className="flex flex-wrap gap-2 mb-8 border-b pb-6 border-brand-border">
        {BLOG_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
              activeCategory.toLowerCase() === cat.toLowerCase()
                ? 'bg-primary border-primary text-white shadow-sm font-black'
                : 'bg-white border-brand-border text-gray-500 hover:text-brand-dark hover:border-gray-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FEATURED BANNER BLOG */}
      {featuredBlog && activeCategory === 'All Articles' && (
        <div className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-sm custom-shadow grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 mb-12 hover-scale">
          <div className="lg:col-span-5 bg-gray-100 rounded-xl flex items-center justify-center font-black text-3xl text-gray-400 border min-h-[220px]">
            CV BLOG
          </div>
          <div className="lg:col-span-7 flex flex-col justify-between py-2">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2.5 py-1 rounded">
                Featured {featuredBlog.category}
              </span>
              <h2 className="text-xl md:text-2xl font-black text-brand-dark leading-snug">
                <Link href={`/blogs/${featuredBlog.id}`} className="hover:text-primary transition-colors">
                  {featuredBlog.title}
                </Link>
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                {featuredBlog.summary}
              </p>
            </div>
            
            <div className="flex items-center justify-between border-t pt-4 mt-6">
              <div className="flex items-center text-xs text-gray-400 font-medium gap-4">
                <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {featuredBlog.date}</span>
                <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {featuredBlog.readTime}</span>
              </div>
              <Link 
                href={`/blogs/${featuredBlog.id}`}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                Read Article <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* GRID BLOGS */}
      {filteredBlogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeCategory === 'All Articles' ? gridBlogs : filteredBlogs).map((blog) => (
            <div 
              key={blog.id} 
              className="bg-white border border-brand-border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between hover-scale custom-shadow"
            >
              <div className="h-44 bg-gray-50 border-b flex items-center justify-center font-black text-xl text-gray-300">
                THREE WHEELER BLOG
              </div>
              
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{blog.category}</span>
                  <h3 className="font-extrabold text-sm text-brand-dark leading-snug line-clamp-2 hover:text-primary transition-colors">
                    <Link href={`/blogs/${blog.id}`}>{blog.title}</Link>
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed font-medium">
                    {blog.summary}
                  </p>
                </div>

                <div className="border-t pt-3 mt-4 flex justify-between items-center text-[10px] text-gray-400 font-semibold">
                  <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {blog.date}</span>
                  <Link href={`/blogs/${blog.id}`} className="text-primary font-bold hover:underline">Read Article &rarr;</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-brand-border rounded-xl">
          <p className="text-xs text-gray-400 italic">No articles found in this category.</p>
        </div>
      )}

    </div>
  );
}

export default function BlogsPage() {
  return (
    <>
      <Header />
      <main className="bg-brand-bg flex-grow min-h-screen">
        <Suspense fallback={
          <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs font-bold text-gray-400 uppercase">
            Loading Fleet Blogs...
          </div>
        }>
          <BlogsContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
