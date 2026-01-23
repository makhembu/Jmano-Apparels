import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { getVisibleProducts } from '../lib/utils';

export const Shop: React.FC = () => {
  const { products, categories, settings, loading } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [sort, setSort] = useState('newest');
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (settings) {
      const activeCat = categories.find(c => c.key === activeCategory);
      const title = activeCat?.seoTitle || settings.shopSeoTitle || `Shop Our Collection | Jambo Apparels`;
      const desc = activeCat?.seoDescription || settings.shopSeoDescription || `Explore our premium range of faith-inspired apparel.`;
      document.title = title;
    }
  }, [settings, activeCategory, categories]);

  useEffect(() => {
     const cat = searchParams.get('cat');
     const search = searchParams.get('search');
     setActiveCategory(cat || 'ALL');
     setSearchTerm(search || '');
     if (window.innerWidth >= 768) setShowFilters(true);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    const visibleProducts = getVisibleProducts(products);
    return visibleProducts
      .filter(p => activeCategory === 'ALL' || p.categoryKey === activeCategory)
      .filter(p => {
        if (!searchTerm) return true;
        const lowerSearch = searchTerm.toLowerCase();
        return p.title.toLowerCase().includes(lowerSearch) || 
               p.description.toLowerCase().includes(lowerSearch) ||
               p.tags?.some(t => t.toLowerCase().includes(lowerSearch));
      })
      .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
      .sort((a, b) => {
         if (sort === 'low-high') return a.price - b.price;
         if (sort === 'high-low') return b.price - a.price;
         return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [products, activeCategory, searchTerm, priceRange, sort]);

  const handleCategoryChange = (key: string) => {
    setActiveCategory(key);
    const newParams: Record<string, string> = {};
    if (key !== 'ALL') newParams.cat = key;
    if (searchTerm) newParams.search = searchTerm;
    setSearchParams(newParams);
    if (window.innerWidth < 768) setShowFilters(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    const newParams: Record<string, string> = {};
    if (activeCategory !== 'ALL') newParams.cat = activeCategory;
    if (val) newParams.search = val;
    setSearchParams(newParams);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Editorial Shop Header */}
      <header className="relative bg-brand-light pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden border-b border-brand-green/10">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-brand-hope/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <span className="text-brand-green text-[10px] font-black uppercase tracking-[0.4em] mb-4 inline-block bg-white px-6 py-1.5 rounded-full shadow-sm border border-brand-green/10">
            The Collection
          </span>
          <h1 className="text-4xl md:text-7xl font-serif font-bold text-brand-dark mb-6 tracking-tight">Ethically <span className="text-brand-green">Threaded</span></h1>
          <p className="text-sm md:text-xl text-slate-600 font-light italic max-w-2xl mx-auto border-l-2 md:border-l-0 border-brand-hope pl-4 md:pl-0">
            "{settings.secondarySlogan}"
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        {/* Modern Controls Bar - Restructured for Mobile */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-10 sticky top-16 z-30 bg-white/90 backdrop-blur-xl py-4 px-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 h-11 border rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${showFilters ? 'bg-brand-dark text-white border-brand-dark shadow-lg shadow-brand-dark/20' : 'bg-white text-slate-700 border-slate-200 hover:border-brand-green'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>{showFilters ? 'Hide Filters' : 'Filters'}</span>
            </button>
            
            {/* Found count: hidden on mobile */}
            <div className="hidden sm:block text-[10px] text-slate-400 font-black uppercase tracking-widest ml-2">
               Found {filteredProducts.length} <span className="hidden xs:inline">Pieces</span>
            </div>

            {/* Mobile Sort: only visible on mobile, positioned next to filters */}
            <div className="sm:hidden flex-1 flex justify-end">
              <select value={sort} onChange={e => setSort(e.target.value)} className="bg-slate-100 border-none rounded-2xl h-11 px-4 text-[10px] font-black uppercase tracking-widest text-slate-700 focus:ring-2 focus:ring-brand-green/20 outline-none cursor-pointer max-w-[120px]">
                <option value="newest">Latest</option>
                <option value="low-high">£ Low-High</option>
                <option value="high-low">£ High-Low</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Search bar takes full row on mobile due to flex-col on parent */}
            <div className="relative w-full sm:w-64">
              <input 
                type="text" 
                value={searchTerm} 
                onChange={handleSearchChange}
                placeholder="Search treasures..."
                className="w-full pl-11 pr-4 h-11 text-sm border-none bg-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-green/20 text-slate-900 font-medium transition-all"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Desktop Sort: only visible on desktop (sm:block) */}
            <select value={sort} onChange={e => setSort(e.target.value)} className="hidden sm:block bg-slate-100 border-none rounded-2xl h-11 px-4 text-xs font-black uppercase tracking-widest text-slate-700 focus:ring-2 focus:ring-brand-green/20 outline-none cursor-pointer">
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
              <div className="md:sticky md:top-40 space-y-10 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100">
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
                        className={`w-full text-left px-5 py-3 rounded-2xl transition-all text-xs font-black uppercase tracking-widest flex items-center gap-3 ${activeCategory === 'ALL' ? 'bg-brand-dark text-white shadow-xl shadow-brand-dark/20' : 'text-slate-500 hover:bg-brand-light/50 hover:text-brand-dark'}`}
                      >
                        All Pieces
                      </button>
                    </li>
                    {categories.map(cat => {
                      const isActive = activeCategory === cat.key;
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
                        <input type="number" value={priceRange[0]} onChange={e => setPriceRange([+e.target.value, priceRange[1]])} className="pl-6 w-full h-10 border border-slate-200 bg-slate-50 rounded-xl text-xs font-black text-slate-900 focus:ring-2 focus:ring-brand-green/20 outline-none" />
                      </div>
                      <span className="text-slate-300 font-bold text-xs">to</span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black text-[10px]">£</span>
                        <input type="number" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], +e.target.value])} className="pl-6 w-full h-10 border border-slate-200 bg-slate-50 rounded-xl text-xs font-black text-slate-900 focus:ring-2 focus:ring-brand-green/20 outline-none" />
                      </div>
                   </div>
                </div>
              </div>
            </aside>
          </div>

          <div className="flex-grow min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full pt-10">
                  <EmptyState 
                    title="No pieces found" 
                    description={searchTerm ? `We couldn't find any items matching "${searchTerm}".` : "Try adjusting your filters."}
                    actionLabel="Reset Gallery"
                    actionLink="/shop"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};