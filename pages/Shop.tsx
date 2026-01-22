import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';

export const Shop: React.FC = () => {
  const { products, categories, loading } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [sort, setSort] = useState('newest');

  useEffect(() => {
     const cat = searchParams.get('cat');
     setActiveCategory(cat || 'ALL');
  }, [searchParams]);

  const filteredProducts = products
    .filter(p => p.isPublished !== false) // Only show published products
    .filter(p => activeCategory === 'ALL' || p.categoryKey === activeCategory)
    .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    .sort((a, b) => {
       if (sort === 'low-high') return a.price - b.price;
       if (sort === 'high-low') return b.price - a.price;
       return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  const handleCategoryChange = (key: string) => {
    setActiveCategory(key);
    if(key === 'ALL') setSearchParams({});
    else setSearchParams({cat: key});
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-end mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold font-serif text-gray-900">Shop</h1>
        <div className="flex items-center gap-4">
           <select value={sort} onChange={e => setSort(e.target.value)} className="border border-gray-300 rounded p-2 text-sm bg-white text-gray-900">
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
            <h3 className="text-lg font-semibold mb-4 text-brand-dark">Categories</h3>
            <ul className="space-y-2">
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
                <input type="number" value={priceRange[0]} onChange={e => setPriceRange([+e.target.value, priceRange[1]])} className="w-20 border rounded p-1 bg-white text-gray-900" />
                <span>-</span>
                <input type="number" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], +e.target.value])} className="w-20 border rounded p-1 bg-white text-gray-900" />
             </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-3">
                <EmptyState 
                  title="No products found" 
                  description="Try adjusting your filters."
                  actionLabel="Reset Filters"
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