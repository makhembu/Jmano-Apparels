
import React from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { SEO } from '../components/SEO';
import { OptimizedImage } from '../components/ui/OptimizedImage';

export const Home: React.FC = () => {
  const { settings, products, categories, blogPosts, latestReviews, loading } = useApp();
  
  // OPTIMIZATION: Do not block the entire page on loading. 
  // Allow the Hero section to render immediately with defaults to fix LCP.
  
  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);

  const latestBlogs = [...blogPosts]
    .filter(post => post.status === 'published')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const displayCategories = settings.featuredCategories && settings.featuredCategories.length > 0 
    ? categories.filter(c => settings.featuredCategories!.includes(c.key))
    : categories;

  const getCardColorStyles = (index: number) => {
    const colors = [
      { bg: 'bg-brand-hope', text: 'text-slate-900', muted: 'text-slate-800/80', accent: 'text-slate-900', border: 'border-brand-hope' },
      { bg: 'bg-brand-testament', text: 'text-slate-900', muted: 'text-slate-800/80', accent: 'text-slate-900', border: 'border-brand-testament' },
      { bg: 'bg-brand-humility', text: 'text-slate-900', muted: 'text-slate-800/80', accent: 'text-slate-900', border: 'border-brand-humility' },
      { bg: 'bg-brand-patience', text: 'text-white', muted: 'text-white/90', accent: 'text-white', border: 'border-brand-patience' },
      { bg: 'bg-brand-triumph', text: 'text-slate-900', muted: 'text-slate-800/80', accent: 'text-slate-900', border: 'border-brand-triumph' },
    ];
    return colors[index % colors.length];
  };

  const defaultHeroImage = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1920&h=600&fit=crop";

  return (
    <div className="animate-fade-in bg-slate-50">
      <SEO 
        title={settings.slogan || "Faith Based Apparel"}
        description={settings.seoDescription || settings.mission}
        image={settings.heroBannerImage}
        type="website"
        schema={{
          "@type": "WebSite",
          "name": "Jambo Apparels",
          "url": "https://jamboapparels.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://jamboapparels.com/#/shop?search={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />

      {/* Hero Section - Render immediately even if settings are loading */}
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
                  <Link to="/shop" className="flex items-center justify-center px-8 py-4 text-sm font-black uppercase tracking-widest rounded-xl text-brand-dark bg-brand-hope hover:bg-white hover:text-brand-green transition-all shadow-xl shadow-brand-hope/10 active:scale-95">
                    Shop Now
                  </Link>
                  <Link to="/about" className="flex items-center justify-center px-8 py-4 text-sm font-black uppercase tracking-widest rounded-xl text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-all active:scale-95">
                    Our Mission
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </div>
        
        {/* LCP Optimization: High Priority, Eager Load */}
        <div className="relative h-64 sm:h-72 md:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 lg:h-full bg-slate-900">
           <OptimizedImage
             src={settings.heroBannerImage || defaultHeroImage}
             alt="Jambo Apparels Faith Based Clothing"
             className="h-full w-full object-cover object-center opacity-90 lg:opacity-100"
             width={1920}
             height={600} 
             priority={true} // Critical for LCP
             fit="cover"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/20 to-transparent lg:hidden"></div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-brand-dark mb-8 font-serif border-b-2 border-brand-green/20 pb-4">Featured Collections</h2>
        
        {loading ? (
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
            <div className="flex flex-wrap justify-center gap-4">
               {loading ? (
                  // Skeleton for Categories
                  [1,2,3,4].map(i => <div key={i} className="h-14 w-32 bg-white/50 rounded-2xl animate-pulse"></div>)
               ) : (
                  displayCategories.map(cat => (
                    <Link to={`/shop?cat=${cat.key}`} key={cat.key} className={`${cat.bgColorClass} text-white px-8 py-4 rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 text-base font-bold border-2 border-white/20`}>
                        {cat.label}
                    </Link>
                  ))
               )}
            </div>
         </div>
      </div>

      {/* Latest Blog Posts */}
      {!loading && latestBlogs.length > 0 && (
        <div className="bg-white py-16 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-baseline mb-10 gap-4">
               <div>
                  <h2 className="text-3xl font-serif font-bold text-brand-dark">Latest from our Journal</h2>
                  <p className="text-gray-500 mt-2">Stories of faith, style guides, and community testimonies.</p>
               </div>
               <Link to="/blog" className="text-brand-green font-bold hover:text-brand-dark transition-colors border-b-2 border-brand-green pb-1">
                  View All Journal Entries &rarr;
               </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestBlogs.map((post, idx) => {
                const colors = getCardColorStyles(idx);
                return (
                  <div 
                    key={post.id} 
                    className={`${colors.bg} rounded-2xl shadow-lg overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/10`}
                  >
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
                      <div className={`flex items-center text-[10px] font-black uppercase tracking-widest mb-3 ${colors.accent}`}>
                         <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <Link to={`/blog/${post.slug}`}>
                        <h3 className={`text-xl font-serif font-bold ${colors.text} leading-tight mb-3`}>
                          {post.title}
                        </h3>
                      </Link>
                      <p className={`${colors.muted} text-sm line-clamp-3 mb-6 flex-1 font-medium`}>
                        {post.summary}
                      </p>
                      <Link to={`/blog/${post.slug}`} className={`${colors.text} font-black text-xs uppercase tracking-widest inline-flex items-center gap-2 hover:opacity-75 transition-opacity`}>
                        Read Story <span className="text-lg">→</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reviews */}
      {!loading && settings.enableReviews && latestReviews.length > 0 && (
        <section className="bg-brand-light py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-bold text-brand-dark">Voices of the Community</h2>
              <p className="text-brand-dark/60 mt-4">Real stories from those wearing their faith boldly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestReviews.map((review, idx) => {
                const product = products.find(p => p.id === review.productId);
                const colors = getCardColorStyles(idx + 2);
                
                return (
                  <div key={review.id} className={`${colors.bg} p-8 rounded-2xl relative shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
                    <div className={`absolute top-6 right-8 opacity-20 ${colors.text}`}>
                       <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017V14H15.017C13.3591 14 12.017 12.6579 12.017 11V7C12.017 5.34315 13.3591 4 15.017 4H19.017C20.6738 4 22.017 5.34215 22.017 7V11C22.017 12.6569 20.6738 14 19.017 14V16C19.017 18.2091 17.2261 20 15.017 20L14.017 20V21ZM2.017 21L2.017 18C2.017 16.8954 2.91243 16 4.017 16H7.017V14H3.017C1.35914 14 0.017 12.6579 0.017 11V7C0.017 5.34315 1.35914 4 3.017 4H7.017C8.67386 4 10.017 5.34215 10.017 7V11C10.017 12.6569 8.67386 14 7.017 14V16C7.017 18.2091 5.22614 20 3.017 20L2.017 20V21Z"/></svg>
                    </div>
                    
                    <div className="flex mb-4 text-white drop-shadow-md">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="text-lg">
                          {i < (review.rating || 5) ? '★' : '☆'}
                        </span>
                      ))}
                    </div>

                    <p className={`${colors.text} italic mb-6 line-clamp-4 font-medium leading-relaxed`}>
                      "{review.comment}"
                    </p>

                    <div className={`mt-auto pt-6 border-t border-white/20 flex items-center justify-between`}>
                       <div>
                          <p className={`font-bold text-sm ${colors.text}`}>{review.title}</p>
                          <p className={`text-[10px] font-black uppercase tracking-wide ${colors.muted}`}>Verified Believer</p>
                       </div>
                       
                       {product && (
                         <Link to={`/product/${product.id}`} className="group flex items-center gap-2 max-w-[120px]">
                            <img src={product.images[0]} alt="" width="40" height="40" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm transition-transform group-hover:scale-110" />
                         </Link>
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};