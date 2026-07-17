'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import newsData from '@/data/news.json';
import { Calendar, Clock, User, ArrowLeft, Share2 } from 'lucide-react';

export default function NewsDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (apiUrl) {
        try {
          const response = await fetch(`${apiUrl}/news/${id}`);
          const result = await response.json();
          if (result.success && result.data) {
            setArticle(result.data);
            return;
          }
        } catch (err) {
          console.error('Failed to fetch live news article, trying fallback static file:', err);
        }
      }

      // Fallback
      const match = newsData.find(n => n.id === id);
      if (match) {
        setArticle(match);
      }
    };
    fetchArticle();
  }, [id]);

  if (!article) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
          <h2 className="text-2xl font-black text-brand-dark">News Article Not Found</h2>
          <p className="text-xs text-gray-500">The article you are trying to read does not exist.</p>
          <Link href="/news" className="inline-block bg-primary text-white text-xs font-bold px-6 py-2.5 rounded-lg">Return to News Hub &larr;</Link>
        </div>
        <Footer />
      </>
    );
  }

  // Filter 4 recent news articles for sidebar
  const recentArticles = newsData.filter(n => n.id !== article.id).slice(0, 4);

  // JSON-LD News Schema
  const newsSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "datePublished": article.date,
    "description": article.summary,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "3Pahia",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.3pahia.in/images/logo.png"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsSchema) }}
      />
      <Header />
      <main className="bg-brand-bg flex-grow min-h-screen py-8 text-brand-dark">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* breadcrumb */}
          <div className="text-xs text-gray-400 font-medium mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link> &gt;{' '}
            <Link href="/news" className="hover:text-primary transition-colors">News Hub</Link> &gt;{' '}
            <span className="text-brand-dark font-semibold truncate max-w-[200px] inline-block align-bottom">{article.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Main article body */}
            <article className="lg:col-span-8 bg-white border border-brand-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              
              <div className="space-y-3">
                <span className="bg-primary-light text-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                  {article.category}
                </span>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-black leading-snug text-brand-dark">{article.title}</h1>
                
                {/* Meta details */}
                <div className="flex flex-wrap items-center text-xs text-gray-400 gap-4 border-b border-gray-100 pb-4 font-semibold uppercase tracking-wider">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {article.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.readTime}</span>
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> By {article.author}</span>
                </div>
              </div>

              {/* Big decorative banner graphic */}
              <div className="h-64 md:h-80 bg-gray-100 rounded-xl flex items-center justify-center font-black text-2xl text-primary border shadow-inner uppercase tracking-wider">
                Industry Update
              </div>

              {/* Article Content */}
              <div className="text-xs md:text-sm text-gray-600 leading-relaxed space-y-4 font-medium">
                <p className="font-extrabold text-brand-dark text-sm leading-relaxed">{article.summary}</p>
                {article.content.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {/* Share links */}
              <div className="border-t pt-6 flex items-center justify-between text-xs font-bold text-gray-400">
                <span>SHARE THIS CV ARTICLE:</span>
                <div className="flex space-x-2">
                  <button aria-label="Share on Facebook" className="p-2 bg-gray-100 rounded-full hover:bg-primary hover:text-white transition-colors"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg></button>
                  <button aria-label="Share on Twitter" className="p-2 bg-gray-100 rounded-full hover:bg-primary hover:text-white transition-colors"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></button>
                  <button aria-label="Share on LinkedIn" className="p-2 bg-gray-100 rounded-full hover:bg-primary hover:text-white transition-colors"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></button>
                </div>
              </div>

            </article>

            {/* RIGHT COLUMN: Sidebar (Recent news) */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-white border border-brand-border rounded-xl p-5 shadow-sm sticky top-24">
                <h3 className="text-sm font-black text-brand-dark mb-4 pb-2 border-b uppercase">Recent Industry News</h3>
                
                <div className="space-y-4">
                  {recentArticles.map(news => (
                    <div key={news.id} className="space-y-1">
                      <span className="text-[9px] font-bold text-primary uppercase">{news.category}</span>
                      <h4 className="text-xs font-extrabold text-brand-dark hover:text-primary leading-snug line-clamp-2">
                        <Link href={`/news/${news.id}`}>{news.title}</Link>
                      </h4>
                      <span className="text-[9px] text-gray-400 block font-semibold">{news.date}</span>
                    </div>
                  ))}
                </div>

                <Link 
                  href="/news"
                  className="w-full text-center bg-gray-50 hover:bg-gray-100 border border-brand-border text-brand-dark text-xs font-bold py-2.5 rounded-lg mt-6 block transition-colors"
                >
                  Browse All News &rarr;
                </Link>
              </div>
            </aside>

          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
