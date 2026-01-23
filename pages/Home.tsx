import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const Home: React.FC = () => {
  const { settings, products, categories, blogPosts, latestReviews, loading } = useApp();
  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);

  // Dynamic SEO Update - Purely Professional
  useEffect(() => {
    if (settings) {
      // Priority: 1. seoTitle, 2. slogan, 3. Default Brand Name
      const brandName = "Jambo Apparels";
      document.title = settings.seoTitle || (settings.slogan ? `${brandName} | ${settings.slogan}` : brandName);
      
      // Meta Description Update
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', settings.seoDescription || settings.mission || '');
      }

      // Open Graph Updates for social sharing
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', document.title);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', settings.seoDescription || settings.secondarySlogan || '');
      
      // Update og:image to a consistent, high-quality brand image from settings
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && settings.heroBannerImage) {
        ogImage.setAttribute('content', settings.heroBannerImage);
      }
    }
  }, [settings]);

  // Get the 3 latest published blog posts
  const latestBlogs = [...blogPosts]
    .filter(post => post.status === 'published')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

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
           <img 
             className="h-64 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full" 
             src={settings.heroBannerImage || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1920&h=600&fit=crop"} 
             alt="Jambo Apparels Faith Based Clothing" 
           />
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 font-serif border-b pb-4">Featured Collections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
      <div className="bg-white py-16 border-t border-gray-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
               <h2 className="text-3xl font-bold font-serif text-brand-dark mb-4">Shop by Category</h2>
               <p className="text-gray-500">Explore our curated collections, each designed with a specific spiritual intention.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
               {displayCategories.map(cat => (
                  <Link to={`/shop?cat=${cat.key}`} key={cat.key} className={`${cat.bgColorClass} text-white px-8 py-4 rounded-full shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 text-base font-bold`}>
                     {cat.label}
                  </Link>
               ))}
               {displayCategories.length === 0 && (
                 <p className="text-gray-500">No categories highlighted.</p>
               )}
            </div>
         </div>
      </div>

      {/* Latest Blog Posts Section */}
      {latestBlogs.length > 0 && (
        <div className="bg-gray-50 py-16 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-baseline mb-10 gap-4">
               <div>
                  <h2 className="text-3xl font-serif font-bold text-brand-dark">Latest from our Journal</h2>
                  <p className="text-gray-500 mt-2">Stories of faith, style guides, and community testimonies.</p>
               </div>
               <Link to="/blog" className="text-brand-green font-bold hover:text-brand-dark transition-colors border-b-2 border-brand-green">
                  View All Journal Entries &rarr;
               </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestBlogs.map(post => (
                <div 
                  key={post.id} 
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300"
                >
                  <Link to={`/blog/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden">
                    <img 
                      src={post.thumbnail || post.featuredImage} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  </Link>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center text-xs font-bold text-brand-green uppercase tracking-widest mb-3">
                       <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                       {post.readingTime && (
                         <>
                           <span className="mx-2 opacity-30">•</span>
                           <span className="text-gray-400">{post.readingTime} min read</span>
                         </>
                       )}
                    </div>
                    <Link to={`/blog/${post.slug}`}>
                      <h3 className="text-xl font-serif font-bold text-gray-900 group-hover:text-brand-green transition-colors line-clamp-2 mb-3">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                      {post.summary}
                    </p>
                    <Link to={`/blog/${post.slug}`} className="text-brand-dark font-bold text-sm hover:text-brand-green inline-flex items-center gap-1 transition-colors">
                      Read Story <span className="text-lg">→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Testimonials / Reviews Section */}
      {latestReviews.length > 0 && (
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-bold text-brand-dark">Voices of the Community</h2>
              <p className="text-gray-500 mt-4">Real stories from those wearing their faith boldly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestReviews.map(review => {
                const product = products.find(p => p.id === review.productId);
                return (
                  <div key={review.id} className="bg-gray-50 p-8 rounded-3xl relative border border-gray-100 hover:shadow-lg transition-all duration-300">
                    <div className="absolute top-6 right-8 text-brand-green opacity-20">
                       <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017V14H15.017C13.3591 14 12.017 12.6579 12.017 11V7C12.017 5.34315 13.3591 4 15.017 4H19.017C20.6738 4 22.017 5.34215 22.017 7V11C22.017 12.6569 20.6738 14 19.017 14V16C19.017 18.2091 17.2261 20 15.017 20L14.017 20V21ZM2.017 21L2.017 18C2.017 16.8954 2.91243 16 4.017 16H7.017V14H3.017C1.35914 14 0.017 12.6579 0.017 11V7C0.017 5.34315 1.35914 4 3.017 4H7.017C8.67386 4 10.017 5.34215 10.017 7V11C10.017 12.6569 8.67386 14 7.017 14V16C7.017 18.2091 5.22614 20 3.017 20L2.017 20V21Z"/></svg>
                    </div>
                    
                    <div className="flex text-yellow-500 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="text-lg">
                          {i < (review.rating || 5) ? '★' : '☆'}
                        </span>
                      ))}
                    </div>

                    <p className="text-gray-700 italic mb-6 line-clamp-4 font-light leading-relaxed">
                      "{review.comment}"
                    </p>

                    <div className="mt-auto pt-6 border-t border-gray-200 flex items-center justify-between">
                       <div>
                          <p className="font-bold text-gray-900 text-sm">{review.title}</p>
                          <p className="text-xs text-gray-400">Verified Believer</p>
                       </div>
                       
                       {product && (
                         <Link to={`/product/${product.id}`} className="group flex items-center gap-2 max-w-[120px]">
                            <img src={product.images[0]} alt="" className="w-10 h-10 rounded-full object-cover border border-white shadow-sm transition-transform group-hover:scale-110" />
                            <span className="text-[10px] font-bold text-brand-green hover:underline truncate uppercase tracking-tighter">View {product.title.split(' ')[0]}</span>
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