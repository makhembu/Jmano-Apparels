import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const Home: React.FC = () => {
  const { settings, products, categories, loading } = useApp();
  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);

  // Filter categories based on settings, or show all if none are featured
  const displayCategories = settings.featuredCategories && settings.featuredCategories.length > 0 
    ? categories.filter(c => settings.featuredCategories!.includes(c.key))
    : categories;

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="relative bg-brand-dark overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-brand-dark sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl font-serif">
                  <span className="block xl:inline">Wear your scriptures</span>{' '}
                  <span className="block text-brand-hope xl:inline">in Humility and Boldness</span>
                </h1>
                <p className="mt-3 text-base text-brand-light sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  {settings.mission}
                </p>
                {/* Mobile Friendly Buttons: Stacked on mobile, row on desktop */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link to="/shop" className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-brand-dark bg-brand-hope hover:bg-yellow-400 md:py-4 md:text-lg md:px-10 transition">
                      Shop Now
                    </Link>
                  </div>
                  <div>
                    <Link to="/about" className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-green-800 hover:bg-green-700 md:py-4 md:text-lg md:px-10 transition">
                      Our Mission
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-gray-200">
           {/* Increased height on mobile from h-56 to h-64 for better impact, removed opacity for clarity */}
           <img 
             className="h-64 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full" 
             src={settings.heroBannerImage || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1920&h=600&fit=crop"} 
             alt="Faith apparel" 
           />
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif border-b pb-2">Featured Collections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.length > 0 ? (
            featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-4 text-center py-10 text-gray-500">
              No featured products available at the moment.
            </div>
          )}
        </div>
      </div>

      {/* Categories Banner */}
      <div className="bg-white py-12">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold font-serif mb-8">Shop by Category</h2>
            <div className="flex flex-wrap justify-center gap-4">
               {displayCategories.map(cat => (
                  <Link to={`/shop?cat=${cat.key}`} key={cat.key} className={`${cat.bgColorClass} text-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition transform hover:-translate-y-1 text-sm font-semibold`}>
                     {cat.label}
                  </Link>
               ))}
               {displayCategories.length === 0 && (
                 <p className="text-gray-500">No categories highlighted.</p>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};