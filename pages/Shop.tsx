
import React, { useState, useEffect } from 'react';
// @ts-ignore
import { useSearchParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/SEO';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';

const ProductSkeleton = () => (
  <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
    <div className="aspect-square bg-gray-200" />
    <div className="p-3 md:p-5 flex flex-col flex-grow space-y-3">
      <div className="flex justify-between">
         <div className="h-3 w-1/3 bg-gray-200 rounded" />
         <div className="h-3 w-10 bg-gray-200 rounded" />
      </div>
      <div className="h-6 w-3/4 bg-gray-200 rounded" />
      <div className="mt-auto flex justify-between items-center">
         <div className="h-6 w-16 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

export const Shop: React.FC = () => {
  const { 
    products, categories, settings, loading, productsLoading, 
    loadMore, hasMore, isLoadingMore, updateFilters, filters 
  } = useShop();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
     const cat = searchParams.get('cat') || 'ALL';
     const search = searchParams.get('search') || '';
     const newFilters = {
         categoryKey: cat === 'ALL' ? undefined : cat,
         search: search,
         sortBy: filters.sortBy 
     };
     
     if (newFilters.categoryKey !== filters.categoryKey || newFilters.search !== filters.search) {
         updateFilters(newFilters);
     }
     
     if (window.innerWidth >= 768) setShowFilters(true);
  }, [searchParams, settings, categories]); 

  const handleCategoryChange = (key: string) => {
    const newParams: Record<string, string> = {};
    if (key !== 'ALL') newParams.cat = key;
    if (filters.search) newParams.search = filters.search;
    setSearchParams(newParams);
    // Don't auto-close filters on desktop
    if (window.innerWidth < 768) setShowFilters(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const newParams: Record<string, string> = {};
    if (filters.categoryKey) newParams.cat = filters.categoryKey;
    if (val) newParams.search = val;
    setSearchParams(newParams);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateFilters({ sortBy: e.target.value as any });
  };

  const activeCategory = categories.find(c => c.key === filters.categoryKey);
  const seoTitle = activeCategory?.seoTitle || settings.shopSeoTitle || `Shop Our Collection | Jambo Apparels`;
  const heroTitle = activeCategory?.label || "Ethically Threaded";
  const heroSubtitle = filters.search 
    ? `Searching for "${filters.search}"`
    : (activeCategory?.seoDescription || `"${settings.secondarySlogan}"`);

  // Loading Logic: Show skeletons if initial load OR if filtering/searching
  const showSkeletons = loading || (productsLoading && products.length === 0);

  return (
    <div className="bg-slate-50 min-h-screen">
      <SEO 
        title={seoTitle}
        description={activeCategory?.seoDescription || settings.shopSeoDescription}
        type="website"
        canonical={activeCategory?.canonicalUrl}
        noindex={activeCategory?.isNoIndex}
      />

      {/* --- DESKTOP HERO (Hidden on Mobile) --- */}
      <header className="hidden md:block relative bg-brand-dark pt-20 pb-28 overflow-hidden text-center border-b border-brand-green/20">
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <span className="text-brand-dark text-[10px] font-black uppercase tracking-[0.5em] mb-4 inline-block bg-brand-hope px-6 py-2 rounded-full shadow-lg">
            The Collection
          </span>
          <h1 className="text-6xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tighter leading-none">
            {heroTitle}
          </h1>
          <p className="text-xl text-brand-light font-light max-w-2xl mx-auto leading-relaxed italic">
            {heroSubtitle}
          </p>
        </div>
      </header>

      {/* --- MOBILE STICKY CONTROL BAR --- */}
      <div className="md:hidden sticky top-16 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm transition-all duration-300">
        <div className="px-4 py-3 space-y-3">
          {/* Row 1: Search & Filter Toggle */}
          <div className="flex gap-3">
            <div className="relative flex-grow">
              <input
                type="text"
                value={filters.search || ''}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand-green/20"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border transition-colors ${showFilters ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white border-slate-200 text-slate-600'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            </button>
          </div>

          {/* Row 2: Horizontal Categories Scroll */}
          <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar -mx-4 px-4">
             <button
                onClick={() => handleCategoryChange('ALL')}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border whitespace-nowrap transition-all ${!filters.categoryKey ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-slate-500 border-slate-200'}`}
             >
                All Pieces
             </button>
             {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryChange(cat.key)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border whitespace-nowrap transition-all ${filters.categoryKey === cat.key ? 'bg-brand-green text-white border-brand-green' : 'bg-white text-slate-500 border-slate-200'}`}
                >
                  {cat.label}
                </button>
             ))}
          </div>
        </div>
        
        {/* Mobile Filter Expandable (Sort/Advanced) */}
        <div className={`overflow-hidden transition-all duration-300 bg-slate-50 border-t border-slate-100 ${showFilters ? 'max-h-40 p-4' : 'max-h-0'}`}>
           <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Sort By</label>
           <select 
              value={filters.sortBy} 
              onChange={handleSortChange}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none"
           >
              <option value="newest">Newest Arrivals</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
           </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:-mt-12 relative z-20 pt-6 md:pt-0">
        
        {/* --- DESKTOP TOOLBAR (Hidden on Mobile) --- */}
        <div className="hidden md:flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-10 sticky top-24 z-30 bg-white/90 backdrop-blur-xl py-4 px-6 rounded-3xl border border-slate-200 shadow-xl shadow-brand-green/5">
          <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
            <Button 
              variant={showFilters ? "primary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              size="sm"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              }
            >
              {showFilters ? 'Hide Filters' : 'Filters'}
            </Button>
            
            <div className="hidden sm:block text-[10px] text-slate-400 font-black uppercase tracking-widest ml-2">
               Showing {products.length} <span className="hidden xs:inline">Pieces</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-64">
              <Input 
                value={filters.search || ''} 
                onChange={handleSearchChange}
                placeholder="Search treasures..."
                fullWidth
                className="shadow-none border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>
            
            <div className="hidden sm:block w-40">
              <Select 
                value={filters.sortBy} 
                onChange={handleSortChange} 
                options={[
                  { value: 'newest', label: 'Latest' },
                  { value: 'low-high', label: '£ Low-High' },
                  { value: 'high-low', label: '£ High-Low' }
                ]}
                className="shadow-none border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-0 md:gap-12 items-start relative pb-24">
          
          {/* --- DESKTOP SIDEBAR --- */}
          <div className={`hidden md:block flex-shrink-0 transition-all duration-500 ease-in-out overflow-hidden ${showFilters ? 'w-72 opacity-100' : 'w-0 opacity-0'}`}>
            <aside className="w-72">
              <div className="sticky top-40 space-y-10 bg-white p-8 rounded-3xl shadow-xl shadow-brand-green/5 border border-slate-100">
                <div>
                  <button 
                    onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
                    className="w-full flex items-center justify-between mb-6 text-left"
                  >
                    <h2 className="text-xs font-black text-brand-dark uppercase tracking-[0.2em]">Our Collections</h2>
                    <svg className={`w-4 h-4 text-brand-green transition-transform duration-300 ${isCategoriesExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  <ul className={`space-y-2 transition-all duration-500 overflow-hidden ${isCategoriesExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <li>
                      <button 
                        onClick={() => handleCategoryChange('ALL')} 
                        className={`w-full text-left px-5 py-3 rounded-2xl transition-all text-xs font-black uppercase tracking-widest flex items-center gap-3 ${!filters.categoryKey ? 'bg-brand-green text-white shadow-xl shadow-brand-green/20' : 'text-slate-500 hover:bg-brand-light/50 hover:text-brand-dark'}`}
                      >
                        All Pieces
                      </button>
                    </li>
                    {categories.map(cat => {
                      const isActive = filters.categoryKey === cat.key;
                      return (
                        <li key={cat.key}>
                          <button 
                            onClick={() => handleCategoryChange(cat.key)} 
                            className={`w-full text-left px-5 py-3 rounded-2xl transition-all text-xs font-black uppercase tracking-widest flex items-center gap-3 border-2 ${isActive ? 'text-white border-transparent' : 'text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-900'}`}
                            style={isActive ? { backgroundColor: cat.color, boxShadow: `0 10px 20px -5px ${cat.color}44` } : {}}
                          >
                            {cat.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </aside>
          </div>

          <div className="flex-grow min-w-0 relative">
            {/* PRODUCT GRID: 2 Columns on Mobile, 3 on Desktop */}
            <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-10`}>
              {showSkeletons ? (
                  // SKELETON LOADERS
                  Array.from({ length: 6 }).map((_, idx) => (
                      <div key={idx} className="h-[300px] md:h-[400px]">
                          <ProductSkeleton />
                      </div>
                  ))
              ) : products.length > 0 ? (
                // REAL PRODUCTS
                products.map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))
              ) : (
                // EMPTY STATE
                <div className="col-span-full pt-10">
                  <EmptyState 
                    title="No pieces found" 
                    description={filters.search ? `We couldn't find any items matching "${filters.search}".` : "Try adjusting your filters."}
                    actionLabel="Reset Gallery"
                    actionLink="/shop"
                  />
                </div>
              )}
            </div>
            
            {hasMore && !productsLoading && (
                <div className="mt-16 text-center">
                    <Button 
                        onClick={loadMore} 
                        isLoading={isLoadingMore}
                        size="lg"
                        className="shadow-xl shadow-brand-green/20"
                    >
                        Load More Treasures
                    </Button>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
