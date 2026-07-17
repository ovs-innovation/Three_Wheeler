'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import staticNews from '@/data/news.json';
import { Newspaper, Calendar, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const NEWS_CATEGORIES = [
  'All News', 'Commercial Vehicle News', 'Electric Vehicle News', 'Government Policies', 'Business Updates', 'Launches', 'Industry Reports'
];

function NewsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All News';

  const [liveNews, setLiveNews] = useState(staticNews);

  useEffect(() => {
    const fetchLiveNews = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) return;
      try {
        const res = await fetch(`${apiUrl}/news`).then(r => r.json());
        if (res.success && res.data) {
          const newsList = Array.isArray(res.data)
            ? res.data
            : (Array.isArray(res.data.news) ? res.data.news : null);
          if (newsList) setLiveNews(newsList);
        }
      } catch (err) {
        console.error('Failed to sync live news data:', err);
      }
    };
    fetchLiveNews();
  }, []);

  const newsData = liveNews;

  const handleCategoryClick = (category) => {
    if (category === 'All News') {
      router.push('/news');
    } else {
      router.push(`/news?category=${encodeURIComponent(category)}`);
    }
  };

  // Filter News
  const filteredNews = newsData.filter(news => {
    if (activeCategory === 'All News') return true;
    return (news.category || '').toLowerCase() === activeCategory.toLowerCase();
  });

  // Featured News (Latest news of the list)
  const featuredNews = filteredNews[0];
  const gridNews = filteredNews.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* breadcrumb */}
      <div className="text-xs text-gray-400 font-medium mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link> &gt; <span>CV News & Announcements</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-black text-brand-dark mb-2">3Pahia & Commercial Vehicle News</h1>
      <p className="text-xs text-gray-500 mb-8 max-w-xl">
        Stay updated with government FAME subsidies, electric loader launches, cargo transport permits, and quarterly manufacturer sales reports in India.
      </p>

      {/* Category Chips Bar */}
      <div className="flex flex-wrap gap-2 mb-8 border-b pb-6 border-brand-border">
        {NEWS_CATEGORIES.map((cat) => (
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

      {/* FEATURED BANNER NEWS */}
      {featuredNews && activeCategory === 'All News' && (
        <div className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-sm custom-shadow grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 mb-12 hover-scale">
          <div className="lg:col-span-5 bg-gray-100 rounded-xl flex items-center justify-center font-black text-3xl text-primary border min-h-[220px]">
            CV NEWS
          </div>
          <div className="lg:col-span-7 flex flex-col justify-between py-2">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary-light px-2.5 py-1 rounded">
                Featured {featuredNews.category}
              </span>
              <h2 className="text-xl md:text-2xl font-black text-brand-dark leading-snug">
                <Link href={`/news/${featuredNews.id}`} className="hover:text-primary transition-colors">
                  {featuredNews.title}
                </Link>
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                {featuredNews.summary}
              </p>
            </div>
            
            <div className="flex items-center justify-between border-t pt-4 mt-6">
              <div className="flex items-center text-xs text-gray-400 font-medium gap-4">
                <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {featuredNews.date}</span>
                <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {featuredNews.readTime}</span>
              </div>
              <Link 
                href={`/news/${featuredNews.id}`}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                Read Full Story <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* GRID NEWS */}
      {filteredNews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeCategory === 'All News' ? gridNews : filteredNews).map((news) => (
            <div 
              key={news.id} 
              className="bg-white border border-brand-border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between hover-scale custom-shadow"
            >
              <div className="h-44 bg-gray-50 border-b flex items-center justify-center font-black text-xl text-gray-300">
                3PAHIA NEWS
              </div>
              
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-primary uppercase tracking-wider">{news.category}</span>
                  <h3 className="font-extrabold text-sm text-brand-dark leading-snug line-clamp-2 hover:text-primary transition-colors">
                    <Link href={`/news/${news.id}`}>{news.title}</Link>
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed font-medium">
                    {news.summary}
                  </p>
                </div>

                <div className="border-t pt-3 mt-4 flex justify-between items-center text-[10px] text-gray-400 font-semibold">
                  <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {news.date}</span>
                  <Link href={`/news/${news.id}`} className="text-primary font-bold hover:underline">Read More &rarr;</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-brand-border rounded-xl">
          <p className="text-xs text-gray-400 italic">No news articles found in this category.</p>
        </div>
      )}

    </div>
  );
}

export default function NewsPage() {
  return (
    <>
      <Header />
      <main className="bg-brand-bg flex-grow min-h-screen">
        <Suspense fallback={
          <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs font-bold text-gray-400 uppercase">
            Loading CV News...
          </div>
        }>
          <NewsContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
