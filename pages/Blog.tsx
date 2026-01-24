import React, { useEffect, useState, useMemo } from 'react';
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

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Unified Branded Header - Compact Version */}
      <header className="relative bg-brand-light pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden text-center border-b border-brand-green/10">
        {/* Consistent Halos */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[40rem] h-[40rem] bg-brand-hope/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-brand-green/10 rounded-full blur-[100px]"></div>

        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <span className="text-brand-green text-[10px] font-black uppercase tracking-[0.5em] mb-4 inline-block bg-white px-6 py-2 rounded-full shadow-sm border border-brand-green/10">
            Digital Witness
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-brand-dark mb-6 tracking-tighter leading-none">
            The Journey of <span className="text-brand-green">Journaled Faith</span>
          </h1>
          <p className="text-base md:text-xl text-slate-600 font-light max-w-2xl mx-auto leading-relaxed italic border-l-4 md:border-l-0 border-brand-hope pl-6 md:pl-0">
            "Threading faith into the fabric of everyday life."
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20 pb-32 overflow-visible">
        
        {/* Floating Category Nav */}
        <div className="mb-12 relative"> 
          <div className="bg-white p-2 rounded-3xl shadow-[0_20px_50px_rgba(46,125,50,0.1)] border border-slate-200 max-w-5xl mx-auto relative z-10 overflow-hidden">
            <div className="flex gap-2 overflow-x-auto no-scrollbar justify-start md:justify-center px-4 sm:px-8 py-1">
              {blogCategories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex-shrink-0 px-6 md:px-8 py-3 rounded-2xl text-[10px] font-black transition-all uppercase tracking-[0.2em] whitespace-nowrap ${
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
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-brand-green/5 transition-all duration-500 transform hover:-translate-y-2"
              >
                <Link to={`/blog/${post.slug}`} className="block relative aspect-[4/3] overflow-hidden">
                  <img
                    src={post.thumbnail || post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 to-transparent opacity-60"></div>
                  <div className="absolute bottom-6 left-6">
                    <span className="bg-brand-hope text-brand-dark text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                      {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </Link>

                <div className="p-8 flex-1 flex flex-col">
                  <Link to={`/blog/${post.slug}`} className="block mb-4">
                    <h3 className="text-xl font-serif font-bold text-slate-900 leading-tight group-hover:text-brand-green transition-colors">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-slate-500 text-sm font-light leading-relaxed flex-1 mb-8">
                    {post.summary}
                  </p>

                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <Link
                      to={`/blog/${post.slug}`}
                      className="text-brand-green font-black text-[10px] uppercase tracking-widest inline-flex items-center gap-3 hover:text-brand-dark transition-colors"
                    >
                      Read Entry 
                      <span className="text-xl">&rarr;</span>
                    </Link>
                    
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                      {post.readingTime || 5} Min Read
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-serif italic text-2xl mb-6">This chapter is currently being threaded.</p>
            <Button onClick={() => setActiveCategory('ALL')} variant="primary" className="px-10 rounded-xl font-black uppercase tracking-widest text-[10px]">View All Entries</Button>
          </div>
        )}
      </div>

      {/* Unified CTA Section */}
      <section className="bg-brand-dark py-24 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
           <h2 className="text-3xl md:text-6xl font-serif font-bold text-white mb-8">Stay <span className="text-brand-hope">Connected</span></h2>
           <p className="text-brand-light/70 text-lg mb-12 font-light">Join our list for weekly testimonies and styling secrets.</p>
           <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input type="email" placeholder="Your email address" className="flex-1 px-8 h-16 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:bg-white/20 outline-none transition-all" />
              <button className="h-16 px-10 rounded-xl bg-brand-hope text-brand-dark font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all">Join Family</button>
           </form>
        </div>
      </section>
    </div>
  );
};