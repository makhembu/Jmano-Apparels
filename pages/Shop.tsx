import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';

export const Shop: React.FC = () => {
  const { products, categories, settings, loading } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [sort, setSort] = useState('newest');
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);

  // Professional Dynamic SEO - Now with Category Awareness
  useEffect(() => {
    if (settings) {
      const activeCat = categories.find(c => c.key === activeCategory);
      
      // Priority: 1. Category SEO Title, 2. Global Shop SEO Title, 3. Fallback
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

  const filteredProducts = products
    .filter(p => p.isPublished !== false) // Only show published products
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

  const handleCategoryChange = (key: string) => {
    setActiveCategory(key);
    const newParams: Record<string, string> = {};
    if (key !== 'ALL') newParams.cat = key;
    if (searchTerm) newParams.search = searchTerm;
    setSearchParams(newParams);
    setIsCategoriesExpanded(false);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b pb-4 gap-4">
        <h1 className="text-3xl font-bold font-serif text-gray-900 whitespace-nowrap">Shop</h1>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64 lg:w-80">
            <input 
              type="text" 
              value={searchTerm} 
              onChange={handleSearchChange}
              placeholder="Search our collection..."
              className="w-full pl-10 pr-4 h-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green bg-white text-gray-900 placeholder-gray-400"
            />
            <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select value={sort} onChange={e => setSort(e.target.value)} className="w-full sm:w-auto border border-gray-300 rounded-lg h-10 px-3 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-green">
            <option value="newest">Newest Arrivals</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
          <div>
            {/* Collapsible Header for Mobile */}
            <button 
              onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
              className="w-full flex items-center justify-between md:mb-4 text-left group"
            >
              <h3 className="text-lg font-semibold text-brand-dark">Categories</h3>
              <svg 
                className={`w-5 h-5 text-gray-400 transition-transform md:hidden ${isCategoriesExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <ul className={`mt-4 md:mt-0 space-y-2 transition-all duration-300 ease-in-out overflow-hidden ${isCategoriesExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 md:max-h-none md:opacity-100'}`}>
              <li>
                <button onClick={() => handleCategoryChange('ALL')} className={`w-full text-left px-3 py-2 rounded transition-colors ${activeCategory === 'ALL' ? 'bg-brand-green text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                  All Products
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat.key}>
                   <button onClick={() => handleCategoryChange(cat.key)} className={`w-full text-left px-3 py-2 rounded transition-colors ${activeCategory === cat.key ? 'bg-brand-green text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
             <h3 className="text-lg font-semibold mb-4 text-brand-dark">Price Range</h3>
             <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-2 top-1 text-gray-400 text-xs">£</span>
                  <input type="number" value={priceRange[0]} onChange={e => setPriceRange([+e.target.value, priceRange[1]])} className="pl-5 w-24 border rounded h-9 text-sm bg-white text-gray-900" />
                </div>
                <span>-</span>
                <div className="relative">
                  <span className="absolute left-2 top-1 text-gray-400 text-xs">£</span>
                  <input type="number" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], +e.target.value])} className="pl-5 w-24 border rounded h-9 text-sm bg-white text-gray-900" />
                </div>
             </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          {searchTerm && (
            <div className="mb-6 text-sm text-gray-500">
              Showing {filteredProducts.length} results for "<span className="font-bold text-brand-dark">{searchTerm}</span>"
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-3">
                <EmptyState 
                  title="No products found" 
                  description={searchTerm ? `We couldn't find any products matching "${searchTerm}".` : "Try adjusting your filters."}
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