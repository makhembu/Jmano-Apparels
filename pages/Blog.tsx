
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
      document.title = title;
    }
  }, [settings]);

  const filteredPosts = useMemo(() => {
    const published = blogPosts.filter(post => post.status === 'published');
    if (activeCategory === 'ALL') return published;
    return published.filter(post => {
      const lowerCategory = activeCategory.toLowerCase();
      const lowerTitle = post.title.toLowerCase();
      // Simple approximation since we don't have tags linked yet in frontend types fully
      return lowerTitle.includes(lowerCategory);
    });
  }, [blogPosts, activeCategory]);

  const getCardColorStyles = (index: number) => {
    const colors = [
      { bg: 'bg-brand-hope', text: 'text-slate-900', muted: 'text-slate-800/80', accent: 'bg-slate-900 text-white', border: 'border-brand-hope' },
      { bg: 'bg-brand-testament', text: 'text-slate-900', muted: 'text-slate-800/80', accent: 'bg-slate-900 text-white', border: 'border-brand-testament' },
      { bg: 'bg-brand-humility', text: 'text-slate-900', muted: 'text-slate-800/80', accent: 'bg-white text-brand-green', border: 'border-brand-humility' },
      { bg: 'bg-brand-patience', text: 'text-white', muted: 'text-white/90', accent: 'bg-white text-brand-patience', border: 'border-brand-patience' },
      { bg: 'bg-brand-triumph', text: 'text-slate-900', muted: 'text-slate-800/80', accent: 'bg-slate-900 text-white', border: 'border-brand-triumph' },
    ];
    return colors[index % colors.length];
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* Desktop Hero (Matches Shop Layout) */}
      <header className="hidden md:block relative bg-brand-dark pt-20 pb-28 overflow-hidden text-center border-b border-brand-green/20">
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <span className="text-brand-dark text-[10px] font-black uppercase tracking-[0.5em] mb-4 inline-block bg-brand-hope px-6 py-2 rounded-full shadow-lg">
            Digital Witness
          </span>
          <h1 className="text-6xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tighter leading-none">
            Journey of <span className="text-brand-humility">Journalled Faith</span>
          </h1>
          <p className="text-xl text-brand-light font-light max-w-2xl mx-auto leading-relaxed italic">
            "Threading faith into the fabric of everyday life."
          </p>
        </div>
      </header>

      {/* Mobile Sticky Filter Bar (Matches Shop) */}
      <div className="md:hidden sticky top-16 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
         <div className="px-4 py-3 flex overflow-x-auto gap-2 no-scrollbar">
            {blogCategories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border whitespace-nowrap transition-all ${
                  activeCategory === cat.key
                    ? 'bg-brand-green text-white border-brand-green'
                    : 'bg-white text-slate-500 border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:-mt-12 relative z-20 pt-6 md:pt-0 pb-32">
        
        {/* Desktop Category Bar (Matches Shop Card Style) */}
        <div className="hidden md:block bg-white p-2 rounded-3xl shadow-xl border border-slate-100 max-w-5xl mx-auto relative z-10 mb-12">
          <div className="flex gap-2 justify-center px-4 py-2 w-full">
            {blogCategories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black transition-all uppercase tracking-[0.2em] whitespace-nowrap ${
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

        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {filteredPosts.map((post, idx) => {
              const colors = getCardColorStyles(idx);
              return (
                <article
                  key={post.id}
                  className={`group flex flex-col ${colors.bg} border ${colors.border} rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2`}
                >
                  <Link to={`/blog/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden">
                    <img
                      src={post.thumbnail || post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`${colors.accent} text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg`}>
                        {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </Link>

                  <div className="p-6 md:p-8 flex-1 flex flex-col">
                    <div className="mb-4">
                       <span className={`text-[9px] font-black uppercase tracking-widest opacity-60 ${colors.text}`}>
                          {post.readingTime || 5} Min Read
                       </span>
                    </div>
                    
                    <Link to={`/blog/${post.slug}`} className="block mb-4">
                      <h3 className={`text-lg md:text-xl font-serif font-bold ${colors.text} leading-tight`}>
                        {post.title}
                      </h3>
                    </Link>

                    <p className={`${colors.muted} text-sm font-medium leading-relaxed flex-1 mb-6 line-clamp-3`}>
                      {post.summary}
                    </p>

                    <div className="mt-auto">
                      <Link to={`/blog/${post.slug}`}>
                         <Button variant="ghost" size="sm" className={`w-full bg-black/5 hover:bg-black/10 border-none ${colors.text}`}>Read Story &rarr;</Button>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="py-32 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-serif italic text-2xl mb-6">This chapter is currently being threaded.</p>
            <Button onClick={() => setActiveCategory('ALL')} variant="primary" size="sm">View All Entries</Button>
          </div>
        )}
      </div>
    </div>
  );
};
