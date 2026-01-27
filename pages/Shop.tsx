import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';

export const Shop: React.FC = () => {
  const { 
    products, 
    categories, 
    settings, 
    loading, 
    loadMore, 
    hasMore, 
    isLoadingMore, 
    updateFilters,
    filters 
  } = useShop();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Sync URL params to Context Filters
  useEffect(() => {
     const cat = searchParams.get('cat') || 'ALL';
     const search = searchParams.get('search') || '';
     const newFilters = {
         categoryKey: cat === 'ALL' ? undefined : cat,
         search: search,
         sortBy: filters.sortBy // keep existing sort
     };
     
     // Only update if actually different to avoid loops
     if (newFilters.categoryKey !== filters.categoryKey || newFilters.search !== filters.search) {
         updateFilters(newFilters);
     }
     
     if (window.innerWidth >= 768) setShowFilters(true);
     
     // SEO
     if (settings) {
        const activeCat = categories.find(c => c.key === cat);
        const title = activeCat?.seoTitle || settings.shopSeoTitle || `Shop Our Collection | Jambo Apparels`;
        document.title = title;
     }
  }, [searchParams, settings, categories]); // Removed updateFilters/filters dep to avoid loop

  const handleCategoryChange = (key: string) => {
    const newParams: Record<string, string> = {};
    if (key !== 'ALL') newParams.cat = key;
    if (filters.search) newParams.search = filters.search;
    setSearchParams(newParams);
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

  const handlePriceChange = (min: number, max: number) => {
      updateFilters({ minPrice: min, maxPrice: max });
  };

  if (loading && products.length === 0) return <LoadingSpinner fullScreen />;

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="relative bg-brand-dark pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden text-center border-b border-brand-green/20">
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <span className="text-brand-dark text-[10px] font-black uppercase tracking-[0.5em] mb-4 inline-block bg-brand-hope px-6 py-2 rounded-full shadow-lg">
            The Collection
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tighter leading-none">
            Ethically <span className="text-brand-humility">Threaded</span>
          </h1>
          <p className="text-base md:text-xl text-brand-light font-light max-w-2xl mx-auto leading-relaxed italic border-l-4 md:border-l-0 border-brand-hope pl-6 md:pl-0">
            "{settings.secondarySlogan}"
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-10 sticky top-16 z-30 bg-white/90 backdrop-blur-xl py-4 px-6 rounded-3xl border border-slate-200 shadow-xl shadow-brand-green/5">
          <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 h-11 border rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${showFilters ? 'bg-brand-green text-white border-brand-green shadow-lg shadow-brand-green/20' : 'bg-white text-slate-700 border-slate-200 hover:border-brand-green'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>{showFilters ? 'Hide Filters' : 'Filters'}</span>
            </button>
            
            <div className="hidden sm:block text-[10px] text-slate-400 font-black uppercase tracking-widest ml-2">
               Showing {products.length} <span className="hidden xs:inline">Pieces</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <input 
                type="text" 
                value={filters.search || ''} 
                onChange={handleSearchChange}
                placeholder="Search treasures..."
                className="w-full pl-11 pr-4 h-11 text-sm border-none bg-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-green/20 text-slate-900 font-medium transition-all"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select value={filters.sortBy} onChange={handleSortChange} className="hidden sm:block bg-slate-100 border-none rounded-2xl h-11 px-4 text-xs font-black uppercase tracking-widest text-slate-700 focus:ring-2 focus:ring-brand-green/20 outline-none cursor-pointer">
              <option value="newest">Latest</option>
              <option value="low-high">£ Low-High</option>
              <option value="high-low">£ High-Low</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-0 md:gap-12 items-start relative pb-24">
          {/* Sidebar Filters */}
          <div className={`flex-shrink-0 transition-all duration-500 ease-in-out overflow-hidden ${showFilters ? 'w-full md:w-72 opacity-100 mb-8 md:mb-0' : 'w-full md:w-0 h-0 md:h-auto opacity-0'}`}>
            <aside className="w-full md:w-72">
              <div className="md:sticky md:top-40 space-y-10 bg-white p-8 rounded-3xl shadow-xl shadow-brand-green/5 border border-slate-100">
                <div>
                  <button 
                    onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
                    className="w-full flex items-center justify-between mb-6 text-left"
                  >
                    <h3 className="text-xs font-black text-brand-dark uppercase tracking-[0.2em]">Our Collections</h3>
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
                
                <div className="border-t border-slate-100 pt-10">
                   <h3 className="text-xs font-black text-brand-dark uppercase tracking-[0.2em] mb-6">Investment Range</h3>
                   <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black text-[10px]">£</span>
                        <input 
                            type="number" 
                            placeholder="0"
                            onChange={e => handlePriceChange(+e.target.value, filters.maxPrice || 1000)} 
                            className="pl-6 w-full h-10 border border-slate-200 bg-slate-50 rounded-xl text-xs font-black text-slate-900 focus:ring-2 focus:ring-brand-green/20 outline-none" 
                        />
                      </div>
                      <span className="text-slate-300 font-bold text-xs">to</span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black text-[10px]">£</span>
                        <input 
                            type="number" 
                            placeholder="Max"
                            onChange={e => handlePriceChange(filters.minPrice || 0, +e.target.value)} 
                            className="pl-6 w-full h-10 border border-slate-200 bg-slate-50 rounded-xl text-xs font-black text-slate-900 focus:ring-2 focus:ring-brand-green/20 outline-none" 
                        />
                      </div>
                   </div>
                </div>
              </div>
            </aside>
          </div>

          <div className="flex-grow min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {products.length > 0 ? (
                products.map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))
              ) : (
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
            
            {/* Load More Trigger */}
            {hasMore && (
                <div className="mt-16 text-center">
                    <Button 
                        onClick={loadMore} 
                        isLoading={isLoadingMore}
                        className="px-12 h-14 rounded-2xl shadow-xl shadow-brand-green/20 text-xs font-black uppercase tracking-widest"
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