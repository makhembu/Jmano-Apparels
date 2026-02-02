
import React, { useEffect, useState, useMemo } from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';

export const Blog: React.FC = () => {
  const { blogPosts, settings, loading } = useShop();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const blogCategories = [
    { key: 'ALL', label: 'All Entries' },
    { key: 'TESTIMONY', label: 'Testimonies' },
    { key: 'STYLE', label: 'Style Guides' },
    { key: 'FAITH', label: 'Faith & Living' },
    { key: 'BEHIND', label: 'Behind the Scenes' }
  ];

  useEffect(() => {
    if (settings) {
      const title = settings.blogSeoTitle || `The Journal | Jambo Apparels`;
      const desc = settings.blogSeoDescription || `Explore faith stories and community testimonies.`;
      document.title = title;
    }
  }, [settings]);

  const filteredPosts = useMemo(() => {
    const published = blogPosts.filter(post => post.status === 'published');
    if (activeCategory === 'ALL') return published;
    return published.filter(post => {
      const lowerCategory = activeCategory.toLowerCase();
      const lowerTitle = post.title.toLowerCase();
      const lowerSummary = post.summary.toLowerCase();
      const lowerContent = post.content.toLowerCase();
      return lowerTitle.includes(lowerCategory) || 
             lowerSummary.includes(lowerCategory) ||
             lowerContent.includes(lowerCategory);
    });
  }, [blogPosts, activeCategory]);

  // Helper to rotate brand colors for cards with accessible text contrast
  const getCardColorStyles = (index: number) => {
    const colors = [
      { bg: 'bg-brand-hope', text: 'text-slate-900', muted: 'text-slate-800/80', accent: 'bg-slate-900 text-white', border: 'border-brand-hope' }, // Yellow -> Black Text
      { bg: 'bg-brand-testament', text: 'text-slate-900', muted: 'text-slate-800/80', accent: 'bg-slate-900 text-white', border: 'border-brand-testament' }, // Purple -> Black Text
      { bg: 'bg-brand-humility', text: 'text-slate-900', muted: 'text-slate-800/80', accent: 'bg-white text-brand-green', border: 'border-brand-humility' }, // Green -> Black Text
      { bg: 'bg-brand-patience', text: 'text-white', muted: 'text-white/90', accent: 'bg-white text-brand-patience', border: 'border-brand-patience' }, // Red -> White Text
      { bg: 'bg-brand-triumph', text: 'text-slate-900', muted: 'text-slate-800/80', accent: 'bg-slate-900 text-white', border: 'border-brand-triumph' }, // Orange -> Black Text
    ];
    return colors[index % colors.length];
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Unified Branded Header - Compact Version */}
      <header className="relative bg-brand-dark pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden text-center border-b border-brand-green/20">
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <span className="text-brand-dark text-[10px] font-black uppercase tracking-[0.5em] mb-4 inline-block bg-brand-hope px-6 py-2 rounded-full shadow-lg">
            Digital Witness
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tighter leading-none">
            Journey of <span className="text-brand-humility">Journalled Faith</span>
          </h1>
          <p className="text-base md:text-xl text-brand-light font-light max-w-2xl mx-auto leading-relaxed italic border-l-4 md:border-l-0 border-brand-hope pl-6 md:pl-0">
            "Threading faith into the fabric of everyday life."
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20 pb-32 overflow-visible">
        
        {/* Floating Category Nav */}
        <div className="mb-12 relative"> 
          <div className="bg-white p-2 rounded-3xl shadow-xl border border-slate-100 max-w-5xl mx-auto relative z-10 overflow-hidden">
            <div className="flex gap-2 overflow-x-auto no-scrollbar justify-start md:justify-center px-4 sm:px-8 py-1 w-full overscroll-x-contain snap-x">
              {blogCategories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex-shrink-0 px-6 md:px-8 py-3 rounded-2xl text-[10px] font-black transition-all uppercase tracking-[0.2em] whitespace-nowrap snap-center ${
                    activeCategory === cat.key
                      ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20'
                      : 'bg-transparent text-slate-400 hover:text-brand-dark hover:bg-brand-light/30'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {filteredPosts.map((post, idx) => {
              const colors = getCardColorStyles(idx);
              return (
                <article
                  key={post.id}
                  className={`group flex flex-col ${colors.bg} rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/10`}
                >
                  <Link to={`/blog/${post.slug}`} className="block relative aspect-[4/3] overflow-hidden">
                    <img
                      src={post.thumbnail || post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute bottom-4 left-4">
                      <span className={`${colors.accent} text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg`}>
                        {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </Link>

                  <div className="p-8 flex-1 flex flex-col">
                    <Link to={`/blog/${post.slug}`} className="block mb-4">
                      <h3 className={`text-xl font-serif font-bold ${colors.text} leading-tight`}>
                        {post.title}
                      </h3>
                    </Link>

                    <p className={`${colors.muted} text-sm font-medium leading-relaxed flex-1 mb-8`}>
                      {post.summary}
                    </p>

                    <div className={`pt-6 border-t border-black/10 flex items-center justify-between`}>
                      <Link
                        to={`/blog/${post.slug}`}
                        className={`${colors.text} font-black text-[10px] uppercase tracking-widest inline-flex items-center gap-3 hover:opacity-75 transition-opacity`}
                      >
                        Read Entry 
                        <span className="text-xl">&rarr;</span>
                      </Link>
                      
                      <span className={`text-[10px] font-bold ${colors.muted} uppercase tracking-widest`}>
                        {post.readingTime || 5} Min Read
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="py-32 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-serif italic text-2xl mb-6">This chapter is currently being threaded.</p>
            <Button onClick={() => setActiveCategory('ALL')} variant="primary" className="px-10 rounded-xl font-black uppercase tracking-widest text-[10px]">View All Entries</Button>
          </div>
        )}
      </div>

      {/* Unified CTA Section - Conditionally rendered based on settings */}
      {settings.enableNewsletterSignup && (
        <section className="bg-brand-dark py-24 relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
             <h2 className="text-3xl md:text-6xl font-serif font-bold text-white mb-8">Stay <span className="text-brand-hope">Connected</span></h2>
             <p className="text-brand-light/70 text-lg mb-12 font-light">Join our list for weekly testimonies and styling secrets.</p>
             <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                <input type="email" placeholder="Your email address" className="flex-1 px-8 h-16 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:bg-white/20 outline-none transition-all" />
                <button className="h-16 px-10 rounded-xl bg-brand-hope text-brand-dark font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all">Join Family</button>
             </form>
          </div>
        </section>
      )}
    </div>
  );
};