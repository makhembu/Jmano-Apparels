
import React from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { SEO } from '../components/SEO';
import { OptimizedImage } from '../components/ui/OptimizedImage';
import { Button } from '../components/ui/Button';

export const Home: React.FC = () => {
  const { settings, products, categories, blogPosts, latestReviews, loading } = useApp();
  
  const showSkeletons = loading && products.length === 0;
  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);

  const latestBlogs = [...blogPosts]
    .filter(post => post.status === 'published')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const displayCategories = settings.featuredCategories && settings.featuredCategories.length > 0 
    ? categories.filter(c => settings.featuredCategories!.includes(c.key))
    : categories;

  const defaultHeroImage = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1920&h=600&fit=crop";

  return (
    <div className="animate-fade-in bg-slate-50">
      <SEO 
        title={settings.slogan || "Faith Based Apparel"}
        description={settings.seoDescription || settings.mission}
        image={settings.heroBannerImage}
        type="website"
      />

      {/* Hero Section */}
      <div className="relative bg-brand-dark overflow-hidden flex flex-col lg:block min-h-[400px]">
        <div className="max-w-7xl mx-auto w-full">
          <div className="relative z-10 bg-brand-dark lg:max-w-2xl lg:w-full pb-12 lg:pb-28 xl:pb-32">
            <main className="pt-10 lg:pt-28 mx-auto max-w-7xl px-6 sm:px-8 lg:px-8">
              <div className="text-left lg:text-left">
                <h1 className="text-4xl sm:text-5xl md:text-6xl tracking-tight font-serif font-bold text-white leading-tight">
                  <span className="block">Wear your scriptures</span>
                  <span className="block text-brand-hope">in Humility and</span>
                  <span className="block text-brand-hope">Boldness</span>
                </h1>
                <p className="mt-6 text-sm sm:text-lg text-brand-light font-light max-w-xl leading-relaxed opacity-90 min-h-[3rem]">
                  {settings.mission || "Loading mission..."}
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <Link to="/shop">
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto shadow-xl">
                      Shop Now
                    </Button>
                  </Link>
                  <Link to="/about">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="w-full sm:w-auto !bg-transparent !text-white !border-white/30 hover:!bg-white hover:!text-brand-dark hover:!border-white transition-all backdrop-blur-sm"
                    >
                      Our Mission
                    </Button>
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </div>
        
        <div className="relative h-64 sm:h-72 md:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 lg:h-full bg-slate-900">
           <OptimizedImage
             src={settings.heroBannerImage || defaultHeroImage}
             alt="Jambo Apparels"
             className="h-full w-full object-cover object-center opacity-90 lg:opacity-100"
             width={1920}
             height={600} 
             priority={true} 
             fit="cover"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/20 to-transparent lg:hidden"></div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-brand-dark mb-8 font-serif border-b-2 border-brand-green/20 pb-4">Featured Collections</h2>
        
        {showSkeletons ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1,2,3,4].map(i => (
                 <div key={i} className="h-96 bg-gray-100 rounded-2xl animate-pulse"></div>
              ))}
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))
            ) : (
              <div className="col-span-4 text-center py-10 text-gray-500">
                No featured products available at the moment.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="bg-brand-light py-16 border-t border-brand-green/10">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
               <h2 className="text-3xl font-bold font-serif text-brand-dark mb-4">Shop by Category</h2>
               <p className="text-brand-dark/70">Explore our curated collections, each designed with a specific spiritual intention.</p>
            </div>
            {/* Mobile Grid (2 cols) | Desktop Flex */}
            <div className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-3 md:gap-4">
               {showSkeletons ? (
                  [1,2,3,4].map(i => <div key={i} className="h-20 md:h-14 w-full md:w-32 bg-white/50 rounded-2xl animate-pulse"></div>)
               ) : (
                  displayCategories.map(cat => {
                    const isLightBg = cat.bgColorClass.includes('hope') || cat.key === 'HOPEHOODIES';
                    const textColor = isLightBg ? 'text-brand-dark' : 'text-white';
                    
                    return (
                      <Link 
                        to={`/shop?cat=${cat.key}`} 
                        key={cat.key} 
                        className={`${cat.bgColorClass} ${textColor} px-4 py-4 md:px-8 md:py-4 rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 text-sm md:text-base font-bold border-2 border-white/20 flex items-center justify-center text-center h-full min-h-[4.5rem]`}
                      >
                          {cat.label}
                      </Link>
                    );
                  })
               )}
            </div>
         </div>
      </div>

      {/* Latest Blog Posts */}
      {!showSkeletons && latestBlogs.length > 0 && (
        <div className="bg-white py-16 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-baseline mb-10 gap-4">
               <div>
                  <h2 className="text-3xl font-serif font-bold text-brand-dark">Latest from our Journal</h2>
                  <p className="text-gray-500 mt-2">Stories of faith, style guides, and community testimonies.</p>
               </div>
               <Link to="/blog">
                  <Button variant="ghost" className="text-brand-green font-bold">View All Journal Entries &rarr;</Button>
               </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestBlogs.map((post) => (
                  <div key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 border border-slate-100">
                    <Link to={`/blog/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden">
                      <OptimizedImage
                        src={post.thumbnail || post.featuredImage || ''}
                        alt={post.title}
                        width={600}
                        height={375}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center text-[10px] font-black uppercase tracking-widest mb-3 text-slate-400">
                         <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <Link to={`/blog/${post.slug}`}>
                        <h3 className="text-xl font-serif font-bold text-slate-900 leading-tight mb-3 group-hover:text-brand-green transition-colors">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-1 font-medium">
                        {post.summary}
                      </p>
                      <Link to={`/blog/${post.slug}`}>
                        <Button variant="outline" size="sm" className="w-full">Read Story</Button>
                      </Link>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
