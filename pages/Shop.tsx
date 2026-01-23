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
  const [showFilters, setShowFilters] = useState(true);

  // Professional Dynamic SEO
  useEffect(() => {
    if (settings) {
      const activeCat = categories.find(c => c.key === activeCategory);
      
      const title = activeCat?.seoTitle || settings.shopSeoTitle || `Shop Our Collection | Jambo Apparels`;
      const desc = activeCat?.seoDescription || settings.shopSeoDescription || `Explore our premium range of faith-inspired apparel.`;
      
      document.title = title;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) metaDescription.setAttribute('content', desc);
      
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', title);
      
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', desc);
    }
  }, [settings, activeCategory, categories]);

  useEffect(() => {
     const cat = searchParams.get('cat');
     const search = searchParams.get('search');
     setActiveCategory(cat || 'ALL');
     setSearchTerm(search || '');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-serif font-bold text-brand-dark mb-3 tracking-tight">Our Collection</h1>
        <p className="text-lg text-gray-500 font-light">"{settings.secondarySlogan}"</p>
      </header>
      
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 sticky top-20 z-30 bg-slate-50/95 backdrop-blur py-4 -mx-4 px-4 sm:mx-0 sm:px-0 rounded-xl">
        <div className="flex items-center gap-4 w-full sm:w-auto">
           {/* Filter Toggle Button */}
           <button 
             onClick={() => setShowFilters(!showFilters)}
             className="flex items-center gap-2 px-4 h-12 border border-slate-200 bg-white rounded-xl text-sm font-bold text-brand-dark hover:border-brand-green hover:text-brand-green transition-all shadow-sm"
           >
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
             </svg>
             <span className="hidden sm:inline">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
             <span className="sm:hidden">Filters</span>
           </button>

           <div className="text-sm text-slate-500 font-medium hidden md:block">
             Showing <span className="font-bold text-brand-dark">{filteredProducts.length}</span> of <span className="font-bold text-brand-dark">{products.length}</span>
           </div>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <input 
              type="text" 
              value={searchTerm} 
              onChange={handleSearchChange}
              placeholder="Search collection..."
              className="w-full pl-11 pr-4 h-12 text-sm border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-slate-900 placeholder-slate-400 transition-all"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select value={sort} onChange={e => setSort(e.target.value)} className="border border-slate-200 rounded-xl h-12 px-4 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green font-medium cursor-pointer">
            <option value="newest">Newest Arrivals</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-0 md:gap-8 items-start relative">
        {/* Sidebar Filters */}
        <div className={`flex-shrink-0 transition-all duration-500 ease-in-out overflow-hidden ${showFilters ? 'w-full md:w-72 opacity-100 mb-8 md:mb-0' : 'w-full md:w-0 h-0 md:h-auto opacity-0'}`}>
          <aside className="w-full md:w-72">
            <div className="md:sticky md:top-36 space-y-10 bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
              {/* Categories */}
              <div>
                <button 
                  onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
                  className="w-full flex items-center justify-between mb-4 text-left group"
                >
                  <h3 className="text-xl font-serif font-bold text-brand-dark">Categories</h3>
                  <svg 
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isCategoriesExpanded ? 'rotate-180' : ''}`} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <ul className={`space-y-2 transition-all duration-300 ease-in-out overflow-hidden ${isCategoriesExpanded ? 'max-h-[1000px] opacity-100 py-1' : 'max-h-0 opacity-0'}`}>
                  <li>
                    <button 
                      onClick={() => handleCategoryChange('ALL')} 
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 text-sm font-bold flex items-center gap-3 ${activeCategory === 'ALL' ? 'bg-brand-dark text-white shadow-md' : 'text-slate-600 hover:bg-brand-light/50 hover:text-brand-dark'}`}
                    >
                      All Products
                    </button>
                  </li>
                  {categories.map(cat => {
                    const isActive = activeCategory === cat.key;
                    return (
                      <li key={cat.key}>
                        <button 
                          onClick={() => handleCategoryChange(cat.key)} 
                          className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 text-sm font-bold flex items-center gap-3 shadow-sm hover:shadow-md ${isActive ? 'text-white' : 'text-slate-600 hover:bg-gray-50'}`}
                          style={isActive ? { 
                            backgroundColor: cat.color,
                            // Add a subtle text shadow for better contrast on light colors (like yellow)
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                          } : {}}
                        >
                          {cat.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
              
              {/* Price Filter */}
              <div className="border-t border-slate-100 pt-8">
                 <h3 className="text-xl font-serif font-bold text-brand-dark mb-4">Price Range</h3>
                 <div className="flex items-center gap-2">
                    <div className="relative flex-1 min-w-0">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">£</span>
                      <input 
                        type="number" 
                        value={priceRange[0]} 
                        onChange={e => setPriceRange([+e.target.value, priceRange[1]])} 
                        className="pl-6 w-full h-12 border border-slate-200 bg-slate-50 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all" 
                      />
                    </div>
                    <span className="text-slate-300 font-bold text-sm">to</span>
                    <div className="relative flex-1 min-w-0">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">£</span>
                      <input 
                        type="number" 
                        value={priceRange[1]} 
                        onChange={e => setPriceRange([priceRange[0], +e.target.value])} 
                        className="pl-6 w-full h-12 border border-slate-200 bg-slate-50 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all" 
                      />
                    </div>
                 </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Product Grid & Controls */}
        <div className="flex-grow min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full pt-10">
                <EmptyState 
                  title="No pieces found" 
                  description={searchTerm ? `We couldn't find any items matching "${searchTerm}".` : "Try adjusting your filters or clearing your search."}
                  actionLabel="Clear All Filters"
                  actionLink="/shop"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};