
import React, { useEffect, useState, useMemo } from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';
import { SEO } from '../components/SEO';

export const Blog: React.FC = () => {
  const { blogPosts, settings, loading } = useShop();
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 9;

  const blogCategories = [
    { key: 'TESTIMONY', label: 'Testimonies' },
    { key: 'STYLE', label: 'Style Guides' },
    { key: 'FAITH', label: 'Faith & Living' },
    { key: 'BEHIND', label: 'Behind the Scenes' }
  ];

  const filteredPosts = useMemo(() => {
    let posts = blogPosts.filter(post => post.status === 'published');
    
    // 1. Filter by Category
    if (activeCategory) {
      posts = posts.filter(post => {
        const lowerCategory = activeCategory.toLowerCase();
        // Simple approximation based on title if no explicit category logic matches yet
        // In a full implementation, check post.categoryId against category lookup
        return post.title.toLowerCase().includes(lowerCategory) || (post.keywords && post.keywords.some(k => k.toLowerCase() === lowerCategory));
      });
    }

    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(q) || 
        post.summary?.toLowerCase().includes(q)
      );
    }

    return posts;
  }, [blogPosts, activeCategory, searchQuery]);

  // Reset to page 1 when filters change
  const resetPage = () => setCurrentPage(1);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [activeCategory, searchQuery]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const getCardColorStyles = (index: number) => {
    // Most text set to text-brand-dark per user request
    const colors = [
      { bg: 'bg-brand-hope', text: 'text-brand-dark', muted: 'text-slate-800/80', accent: 'bg-brand-dark text-white', border: 'border-brand-hope' },
      { bg: 'bg-brand-testament', text: 'text-brand-dark', muted: 'text-slate-800/80', accent: 'bg-brand-dark text-white', border: 'border-brand-testament' },
      { bg: 'bg-brand-humility', text: 'text-brand-dark', muted: 'text-slate-800/80', accent: 'bg-white text-brand-green', border: 'border-brand-humility' },
      { bg: 'bg-brand-patience', text: 'text-white', muted: 'text-white/90', accent: 'bg-white text-brand-patience', border: 'border-brand-patience' },
      { bg: 'bg-brand-triumph', text: 'text-brand-dark', muted: 'text-slate-800/80', accent: 'bg-brand-dark text-white', border: 'border-brand-triumph' },
    ];
    return colors[index % colors.length];
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="bg-slate-50 min-h-screen">
      <SEO
        title={settings.blogSeoTitle || "The Journal | Jambo Apparels"}
        description={settings.blogSeoDescription || "Stories of faith, style guides, and community testimonies."}
        type="website"
      />
      
      {/* Desktop Hero (Matches Shop Layout) */}
      <header className="hidden md:block relative bg-brand-dark pt-16 pb-20 overflow-hidden text-center border-b border-brand-green/20">
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <span className="text-brand-dark text-[10px] font-black uppercase tracking-[0.5em] mb-4 inline-block bg-brand-hope px-6 py-2 rounded-full shadow-lg">
            Digital Witness
          </span>
          <h1 className="text-6xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tighter leading-none">
            Journeys of <span className="text-white">Journaled faith</span>
          </h1>
          <p className="text-xl text-brand-light font-light max-w-2xl mx-auto leading-relaxed italic">
            "Threading faith into the fabric of everyday life."
          </p>
        </div>
      </header>

      {/* Mobile Sticky Filter Bar (Matches Shop) */}
      <div className="md:hidden sticky top-16 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm transition-all">
         <div className="px-4 py-3 space-y-3">
<div className="relative">
                 <input 
                   type="text" 
                   placeholder="Search articles..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full bg-slate-100 border-none rounded-xl py-2 pl-9 pr-10 text-sm focus:ring-2 focus:ring-brand-green/20 outline-none"
                 />
                 <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                 {searchQuery && (
                   <button 
                     onClick={() => setSearchQuery('')}
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                   >
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                 )}
              </div>
              <div className="flex overflow-x-auto gap-2 no-scrollbar pb-1">
                 {blogCategories.map(cat => (
                   <button
                     key={cat.key}
                     onClick={() => { setActiveCategory(activeCategory === cat.key ? '' : cat.key); resetPage(); }}
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:-mt-12 relative z-20 pt-6 md:pt-0 pb-32">
        
        {/* Desktop Category Bar (Matches Shop Card Style) */}
        <div className="hidden md:flex bg-white p-3 rounded-2xl shadow-lg border border-slate-100 max-w-3xl mx-auto relative z-10 mb-8 flex-row items-center justify-between gap-4">
           {/* Search Row */}
<div className="flex-1 max-w-xs">
               <input 
                   type="text" 
                   placeholder="Search..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-8 text-sm focus:ring-2 focus:ring-brand-green/20 outline-none transition-all"
               />
               <svg className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               {searchQuery && (
                 <button 
                   onClick={() => setSearchQuery('')}
                   className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                 >
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
               )}
            </div>
            
            {/* Categories Row */}
            <div className="flex gap-2 flex-wrap">
             {blogCategories.map(cat => (
               <button
                 key={cat.key}
                 onClick={() => setActiveCategory(activeCategory === cat.key ? '' : cat.key)}
                 className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-[0.15em] whitespace-nowrap ${
                   activeCategory === cat.key
                     ? 'bg-brand-green text-white'
                     : 'bg-transparent text-slate-400 hover:text-brand-dark hover:bg-brand-light/30'
                 }`}
               >
                 {cat.label}
               </button>
             ))}
           </div>
        </div>

        {filteredPosts.length > 0 ? (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {paginatedPosts.map((post, idx) => {
              const globalIdx = (currentPage - 1) * POSTS_PER_PAGE + idx;
              const colors = getCardColorStyles(globalIdx);
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
          <div className="mt-12">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
          </>
        ) : (
          <div className="py-32 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-serif italic text-2xl mb-6">
                {searchQuery ? `No entries matching "${searchQuery}"` : "This chapter is currently being threaded."}
            </p>
            <Button                 onClick={() => { setSearchQuery(''); setActiveCategory('ALL'); setCurrentPage(1); }} variant="primary" size="sm">Reset Filters</Button>
          </div>
        )}
      </div>
    </div>
  );
};
