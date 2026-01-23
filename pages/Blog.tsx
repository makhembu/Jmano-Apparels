import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const Blog: React.FC = () => {
  const { blogPosts, settings, loading } = useShop();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Standard categories for filtering
  const blogCategories = [
    { key: 'ALL', label: 'All Stories' },
    { key: 'TESTIMONY', label: 'Testimonies' },
    { key: 'STYLE', label: 'Style Guides' },
    { key: 'FAITH', label: 'Faith & Living' },
    { key: 'BEHIND', label: 'Behind the Scenes' }
  ];

  // Dynamic SEO
  useEffect(() => {
    if (settings) {
      const title = settings.blogSeoTitle || `The Journal | Jambo Apparels`;
      const desc = settings.blogSeoDescription || `Explore faith stories and community testimonies.`;
      
      document.title = title;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) metaDescription.setAttribute('content', desc);
      
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', title);
    }
  }, [settings]);

  const filteredPosts = useMemo(() => {
    const published = blogPosts.filter(post => post.status === 'published');
    if (activeCategory === 'ALL') return published;
    
    return published.filter(post => {
      const lowerCategory = activeCategory.toLowerCase();
      // Search in title, summary, or content for the category keyword if not strictly defined in DB
      return post.title.toLowerCase().includes(lowerCategory) || 
             post.summary.toLowerCase().includes(lowerCategory) ||
             post.content.toLowerCase().includes(lowerCategory);
    });
  }, [blogPosts, activeCategory]);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Editorial Header */}
      <header className="bg-white border-b border-slate-100 mb-4 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-brand-green text-[10px] font-black uppercase tracking-[0.4em] mb-4 inline-block opacity-70">
            Digital Registry
          </span>
          <h1 className="text-4xl md:text-7xl font-serif font-bold text-brand-dark mb-6 tracking-tight">
            The Journal
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">
            Threading faith into the fabric of everyday life through stories, testimonies, and creative guides.
          </p>
        </div>
      </header>

      {/* Category Swiper - Matching Shop's sticky controls */}
      <div className="sticky top-16 z-30 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/50 mb-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 py-4 overflow-x-auto no-scrollbar scroll-smooth">
            {blogCategories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex-shrink-0 px-6 py-2.5 rounded-full text-[10px] font-black transition-all uppercase tracking-[0.15em] border ${
                  activeCategory === cat.key
                    ? 'bg-brand-dark text-white border-brand-dark shadow-lg shadow-brand-dark/20'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-brand-green/30 hover:text-brand-green'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1"
              >
                {/* Image Container - Responsive aspect ratio */}
                <Link to={`/blog/${post.slug}`} className="block relative aspect-square sm:aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={post.thumbnail || post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity"></div>
                  
                  {/* Date Badge */}
                  <div className="absolute bottom-6 left-6">
                    <span className="bg-brand-green text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                      {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </Link>

                {/* Content Area - No truncation on Title or Summary */}
                <div className="p-8 flex-1 flex flex-col">
                  <Link to={`/blog/${post.slug}`} className="block mb-4">
                    <h3 className="text-2xl font-serif font-bold text-slate-900 leading-tight group-hover:text-brand-green transition-colors">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-slate-500 text-sm font-light leading-relaxed flex-1 mb-8">
                    {post.summary}
                  </p>

                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <Link
                      to={`/blog/${post.slug}`}
                      className="text-brand-dark font-black text-[10px] uppercase tracking-widest inline-flex items-center gap-2 group/btn hover:text-brand-green transition-colors"
                    >
                      Read Story 
                      <span className="text-lg transition-transform duration-300 group-hover/btn:translate-x-2">&rarr;</span>
                    </Link>
                    
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                      {post.readingTime || 5} min read
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <div className="bg-brand-light w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </div>
            <p className="text-slate-500 font-serif italic text-xl mb-4">No stories found in this chapter.</p>
            <button 
              onClick={() => setActiveCategory('ALL')}
              className="text-brand-green font-black text-xs uppercase tracking-widest border-b-2 border-brand-green/20 hover:border-brand-green transition-all pb-1"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Newsletter Section */}
      <section className="mt-20 max-w-7xl mx-auto px-4">
        <div className="bg-brand-dark rounded-[2.5rem] p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
           {/* Abstract Background Decoration */}
           <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-brand-green/20 rounded-full blur-3xl"></div>
           <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-brand-hope/10 rounded-full blur-3xl"></div>
           
           <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">Weekly Testimony</h2>
              <p className="text-brand-light/80 text-sm md:text-base font-light mb-8 leading-relaxed">
                Join our circle of believers. Get the latest styling guides and faith-led stories delivered directly to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                 <input 
                   type="email" 
                   placeholder="your@email.com" 
                   className="flex-1 px-6 h-14 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:bg-white/20 outline-none transition-all"
                 />
                 <button className="h-14 px-10 rounded-2xl bg-brand-hope text-brand-dark font-black uppercase tracking-widest text-[10px] shadow-xl shadow-brand-hope/20 hover:scale-[1.02] active:scale-95 transition-all">
                    Subscribe
                 </button>
              </div>
              <p className="text-[10px] text-white/40 mt-6 uppercase tracking-widest font-bold">No spam. Only truth & beauty.</p>
           </div>
        </div>
      </section>
    </div>
  );
};