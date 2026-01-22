import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const Home: React.FC = () => {
  const { settings, products, categories, loading } = useShop();
  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);

  const displayCategories = settings.featuredCategories && settings.featuredCategories.length > 0 
    ? categories.filter(c => settings.featuredCategories!.includes(c.key))
    : categories;

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="animate-fade-in">
      {/* Dynamic Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden bg-brand-dark">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover opacity-60 scale-105" 
            src={settings.heroBannerImage || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1920&h=1080&fit=crop"} 
            alt="Faith and Fashion" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark to-transparent opacity-80"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-6">
              Wear Your <span className="text-brand-hope">Scriptures</span> Boldly
            </h1>
            <p className="text-xl md:text-2xl text-brand-light font-light mb-8 leading-relaxed">
              {settings.mission || "Divinely threaded apparel designed to carry the gospel to every corner of the earth."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/shop" 
                className="bg-brand-hope hover:bg-yellow-400 text-brand-dark font-bold px-10 py-4 rounded-full transition transform hover:scale-105 text-center"
              >
                Explore Collection
              </Link>
              <Link 
                to="/about" 
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold px-10 py-4 rounded-full transition text-center"
              >
                Our Mission
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Scripture Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-2">Shop by Testimony</h2>
            <p className="text-gray-500 italic">"Faith comes by hearing, and hearing by the word of God."</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {displayCategories.map(cat => (
              <Link 
                to={`/shop?cat=${cat.key}`} 
                key={cat.key} 
                className={`group relative h-40 rounded-2xl overflow-hidden shadow-sm transition transform hover:-translate-y-2 ${cat.bgColorClass || 'bg-brand-green'}`}
              >
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <span className="text-white text-center font-bold text-sm uppercase tracking-widest leading-tight group-hover:scale-110 transition">
                    {cat.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-serif font-bold text-gray-900">Weekly Highlights</h2>
              <p className="text-gray-600">Our most loved scripture-threaded pieces.</p>
            </div>
            <Link to="/shop" className="text-brand-green font-bold hover:underline hidden sm:block">
              View All Products &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-4 text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-400">Loading the latest arrivals...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Scripture Banner */}
      <section className="py-20 bg-brand-green text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <blockquote className="text-3xl md:text-4xl font-serif italic mb-6">
            "For I am not ashamed of the gospel, because it is the power of God that brings salvation to everyone who believes."
          </blockquote>
          <cite className="text-brand-hope font-bold uppercase tracking-widest not-italic">
            Romans 1:16
          </cite>
        </div>
      </section>
    </div>
  );
};