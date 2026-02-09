import React from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { SEO } from '../components/SEO';
import { OptimizedImage } from '../components/ui/OptimizedImage';
import { Button } from '../components/ui/Button';
import ReactMarkdown from 'react-markdown';

// FIX: Explicitly typed the ReactElement to include SVGProps, resolving the cloneElement type error.
const SocialIcons: Record<string, React.ReactElement<React.SVGProps<SVGSVGElement>>> = {
  facebook: (
    <svg className="" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
  ),
  twitter: (
    <svg className="" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
  ),
  instagram: (
    <svg className="" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.646.07-4.85.07-3.204 0-3.584-.012-4.85-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.646-.07-4.85s.012-3.584.07-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.646-.07 4.85-.07zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12s.014 3.667.072 4.948c.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24s3.667-.014 4.948-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.948C21.726 2.69 19.302.274 14.948.073 13.667.014 13.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" /></svg>
  ),
  tiktok: <svg className="" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.23-.16 1.82.23 1.05.84 1.97 1.76 2.44 1.08.54 2.37.56 3.46.49.27-.02.53-.08.78-.15.56-.15 1.11-.36 1.62-.62.08-.43.16-.86.24-1.28.2-1.09.18-2.22.11-3.33-.03-1.54-.53-3.04-1.4-4.25-1.11-1.52-2.86-2.34-4.65-2.22-.05 1.49-.01 2.99-.01 4.47.98-.32 2.13-.24 2.99.38.67.43 1.15 1.08 1.38 1.8.24.74.18 1.62.18 2.38-.01 1.6-.53 3.15-1.56 4.35-1.13 1.32-2.82 2.04-4.52 1.93-1.16-.07-2.29-.4-3.2-.99-1.49-.94-2.43-2.5-2.52-4.12-.03-.53 0-1.07.01-1.6.23-1.7 1.2-3.2 2.5-4.15 1.48-1.08 3.33-1.48 5.1-1.06.01-1.49-.01-2.99 0-4.48z" /></svg>,
  linkedin: <svg className="" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>,
};

export const Home: React.FC = () => {
  const { settings, products, categories, blogPosts, latestReviews, loading } = useShop();
  
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

  const coreValueDetails = [
    {
      bg: 'bg-brand-humility', textColor: 'text-white', iconBg: 'bg-white/20',
      description: "Authentic faith, transparent practices, and integrity in every stitch."
    },
    {
      bg: 'bg-brand-hope', textColor: 'text-brand-dark', iconBg: 'bg-black/10',
      description: "Striving for the highest quality to reflect the character of God."
    },
    {
      bg: 'bg-brand-patience', textColor: 'text-white', iconBg: 'bg-white/20',
      description: "Courage to share the Gospel without compromise in the modern world."
    }
  ];

  return (
    <div className="animate-fade-in bg-slate-50">
      <SEO 
        title={settings.seoTitle || "Jambo Apparels | Christian Streetwear & Scripture Clothing"}
        description={settings.seoDescription || "Wear your scriptures in Humility and Boldness. Premium faith-based apparel, hoodies, and tees designed to spread the Gospel."}
        image={settings.heroBannerImage}
        type="website"
        keywords={["Christian Streetwear", "Faith Based Apparel", "Scripture Clothing", "Christian Hoodies", "Modern Christian Fashion", "Jambo Apparels"]}
      />

      {/* Hero Section */}
      <section className="relative bg-brand-dark overflow-hidden flex flex-col lg:block min-h-[400px]" aria-labelledby="hero-heading">
        <div className="max-w-7xl mx-auto w-full">
          <div className="relative z-10 bg-brand-dark lg:max-w-2xl lg:w-full pb-12 lg:pb-28 xl:pb-32">
            <div className="pt-10 lg:pt-28 mx-auto max-w-7xl px-6 sm:px-8 lg:px-8">
              <div className="text-left lg:text-left">
                <h1 id="hero-heading" className="text-4xl sm:text-5xl md:text-6xl tracking-tight font-serif font-bold text-white leading-tight">
                  Wear Your Scriptures in Humility and Boldness
                </h1>
                <p className="mt-6 text-sm sm:text-lg text-brand-light font-light max-w-xl leading-relaxed opacity-90 min-h-[3rem]">
                  {settings.mission || "Premium Christian streetwear combining faith, style, and ethical craftsmanship"}
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <Link to="/shop" aria-label="Browse our Christian apparel collection">
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto shadow-xl">
                      Shop Now
                    </Button>
                  </Link>
                  <Link to="/about" aria-label="Learn about our mission and values">
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
            </div>
          </div>
        </div>
        
        <div className="relative h-64 sm:h-72 md:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 lg:h-full bg-slate-900">
           <OptimizedImage
             src={settings.heroBannerImage || defaultHeroImage}
             alt="Jambo Apparels - Christian streetwear featuring scripture-inspired designs"
             className="h-full w-full object-cover object-center opacity-90 lg:opacity-100"
             width={1920}
             height={600} 
             priority={true} 
             fit="cover"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/20 to-transparent lg:hidden"></div>
        </div>
      </section>

      {/* Featured Products */}
      {(settings.enableFeaturedProducts ?? true) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" aria-labelledby="featured-heading">
          <h2 id="featured-heading" className="text-3xl font-bold text-brand-dark mb-8 font-serif border-b-2 border-brand-green/20 pb-4">
            Featured Collections
          </h2>
          
          {showSkeletons ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" aria-label="Loading featured products">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-96 bg-gray-100 rounded-2xl animate-pulse" role="status" aria-label="Loading product"></div>
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
        </section>
      )}

      {/* Our Commitment */}
      {(settings.enableCommitmentSection ?? true) && (
        <section className="bg-white py-16" aria-labelledby="commitment-heading">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 id="commitment-heading" className="text-3xl font-bold text-brand-dark mb-4 font-serif">
                Our Commitment to Faith & Quality
              </h2>
              <p className="text-slate-600 font-light leading-relaxed max-w-3xl mx-auto">
                At Jambo Apparels, our mission is to thread scriptures into modern, ethical fashion. We are committed to creating high-quality Christian clothing that serves as a vehicle for the gospel.
              </p>
              <div className="w-20 h-1.5 bg-brand-hope rounded-full mt-8 mx-auto" aria-hidden="true"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(settings.coreValues || 'Honesty,Excellence,Boldness').replace(/\{.*\}/, '').split(',').map((value, index) => {
                const detail = coreValueDetails[index % coreValueDetails.length];
                const letter = value.trim().charAt(0);
                return (
                  <article key={index} className={`${detail.bg} ${detail.textColor} p-8 rounded-3xl shadow-xl text-center flex flex-col items-center`}>
                    <div className={`w-16 h-16 ${detail.iconBg} rounded-2xl flex items-center justify-center font-serif font-bold text-3xl mb-6`} aria-hidden="true">
                      {letter}
                    </div>
                    <h3 className="font-bold text-xl uppercase tracking-wider mb-3">{value.trim()}</h3>
                    <p className="text-sm font-light leading-relaxed">
                      {detail.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {(settings.enableCategoriesSection ?? true) && (
        <section className="bg-brand-light py-16 border-t border-brand-green/10" aria-labelledby="categories-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 id="categories-heading" className="text-3xl font-bold font-serif text-brand-dark mb-4">
                  Shop by Category
                </h2>
                <p className="text-brand-dark/70">Explore our curated collections, each designed with a specific spiritual intention.</p>
              </div>
              {/* Mobile Grid (2 cols) | Desktop Flex */}
              <nav className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-3 md:gap-4" aria-label="Product categories">
                {showSkeletons ? (
                    [1,2,3,4].map(i => <div key={i} className="h-20 md:h-14 w-full md:w-32 bg-white/50 rounded-2xl animate-pulse" role="status" aria-label="Loading category"></div>)
                ) : (
                    displayCategories.map(cat => {
                      const isLightBg = cat.bgColorClass.includes('hope') || cat.key === 'HOPEHOODIES';
                      const textColor = isLightBg ? 'text-brand-dark' : 'text-white';
                      
                      return (
                        <Link 
                          to={`/shop?cat=${cat.key}`} 
                          key={cat.key} 
                          className={`${cat.bgColorClass} ${textColor} px-4 py-4 md:px-8 md:py-4 rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 text-sm md:text-base font-bold border-2 border-white/20 flex items-center justify-center text-center h-full min-h-[4.5rem]`}
                          aria-label={`Browse ${cat.label} category`}
                        >
                            {cat.label}
                        </Link>
                      );
                    })
                )}
              </nav>
          </div>
        </section>
      )}

      {/* SEO Content Section (Dynamic) */}
      <section className="py-24 bg-white relative overflow-hidden" aria-labelledby="seo-content-heading">
         {/* Decorative blobs */}
         <div className="absolute top-0 left-0 w-64 h-64 bg-brand-green/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-hope/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
               <span className="text-brand-green font-bold text-xs uppercase tracking-widest mb-3 block">Our Philosophy</span>
               <h2 id="seo-content-heading" className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-6 leading-tight">
                   {settings.seoContentTitle || "Faith & Fashion: The Jambo Difference"}
               </h2>
               
               <div className="text-lg md:text-xl leading-relaxed text-slate-600">
                 <ReactMarkdown components={{
                     p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                     strong: ({node, ...props}) => <strong className="font-bold text-brand-green" {...props} />
                 }}>
                     {settings.seoContentIntro || ""}
                 </ReactMarkdown>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
               {/* Card 1 */}
               <div className="bg-brand-light rounded-[2.5rem] p-10 md:p-12 transition-transform hover:-translate-y-1 duration-300">
                  <div className="w-12 h-12 bg-brand-dark text-white rounded-2xl flex items-center justify-center mb-6 text-xl">
                    ✝️
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-brand-dark mb-4">
                      {settings.seoContentCol1Title || "Why Choose Christian Streetwear?"}
                  </h3>
                  <div className="text-brand-dark/80 font-medium leading-relaxed">
                     <ReactMarkdown components={{
                         p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                         strong: ({node, ...props}) => <strong className="font-bold text-brand-dark" {...props} />
                     }}>
                          {settings.seoContentCol1Body || ""}
                     </ReactMarkdown>
                  </div>
               </div>

               {/* Card 2 */}
               <div className="bg-brand-hope rounded-[2.5rem] p-10 md:p-12 transition-transform hover:-translate-y-1 duration-300">
                  <div className="w-12 h-12 bg-brand-dark text-white rounded-2xl flex items-center justify-center mb-6 text-xl">
                    🌿
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-brand-dark mb-4">
                      {settings.seoContentCol2Title || "Ethical, Sustainable, Faithful"}
                  </h3>
                  <div className="text-brand-dark/80 font-medium leading-relaxed">
                     <ReactMarkdown components={{
                          p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-brand-dark" {...props} />
                      }}>
                          {settings.seoContentCol2Body || ""}
                     </ReactMarkdown>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* From Our Community */}
      {(settings.enableCommunitySection ?? true) && !showSkeletons && latestReviews.length > 0 && (
        <section className="py-16 bg-slate-50 border-t border-slate-200" aria-labelledby="reviews-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 id="reviews-heading" className="text-3xl font-bold font-serif text-brand-dark mb-4">
                From Our Community
              </h2>
              <p className="text-brand-dark/70">Real testimonies from believers who wear their faith boldly.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestReviews.slice(0, 3).map((review) => (
                <article key={review.id} className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col text-center shadow-sm">
                  <div className="text-amber-400 text-2xl mb-4" role="img" aria-label={`${review.rating} out of 5 stars`}>
                    {'★'.repeat(review.rating)}<span className="text-slate-300">{'★'.repeat(5 - review.rating)}</span>
                  </div>
                  <blockquote className="text-slate-600 font-light italic leading-relaxed flex-1 mb-6">
                    "{review.comment}"
                  </blockquote>
                  <p className="font-bold text-xs text-brand-green uppercase tracking-widest">Verified Buyer</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Blog Posts */}
      {(settings.enableJournalSection ?? true) && !showSkeletons && latestBlogs.length > 0 && (
        <section className="bg-white py-16 border-y border-gray-100" aria-labelledby="blog-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-baseline mb-10 gap-4">
               <div>
                  <h2 id="blog-heading" className="text-3xl font-serif font-bold text-brand-dark">
                    Latest from our Journal
                  </h2>
                  <p className="text-gray-500 mt-2">Stories of faith, style guides, and community testimonies.</p>
               </div>
               <Link to="/blog" aria-label="View all journal entries">
                  <Button variant="ghost" className="text-brand-green font-bold">View All Journal Entries &rarr;</Button>
               </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestBlogs.map((post) => (
                  <article key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 border border-slate-100">
                    <Link to={`/blog/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden" aria-label={`Read article: ${post.title}`}>
                      <OptimizedImage
                        src={post.thumbnail || post.featuredImage || ''}
                        alt={`Featured image for article: ${post.title}`}
                        width={600}
                        height={375}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                    <div className="p-6 flex flex-col flex-1">
                      <time className="flex items-center text-[10px] font-black uppercase tracking-widest mb-3 text-slate-400" dateTime={post.createdAt}>
                         {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </time>
                      <Link to={`/blog/${post.slug}`}>
                        <h3 className="text-xl font-serif font-bold text-brand-dark leading-tight mb-3 group-hover:text-brand-green transition-colors">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-1 font-medium">
                        {post.summary}
                      </p>
                      <Link to={`/blog/${post.slug}`} aria-label={`Read full article: ${post.title}`}>
                        <Button variant="outline" size="sm" className="w-full">Read Story</Button>
                      </Link>
                    </div>
                  </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Follow Our Journey - Uses Dynamic Text */}
      {(settings.enableSocialSection ?? true) && !showSkeletons && settings.socialLinks && (
        <section className="bg-brand-dark py-16" aria-labelledby="social-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="social-heading" className="text-3xl font-bold font-serif text-white mb-4">
              {settings.socialSectionTitle || "Follow Our Journey"}
            </h2>
            <p className="text-brand-light/70 max-w-xl mx-auto mb-8">
              {settings.socialSectionBody || "Join our community on social media for behind-the-scenes content, new drops, and daily inspiration."}
            </p>
            <nav className="flex justify-center space-x-6" aria-label="Social media links">
              {Object.entries(settings.socialLinks).map(([platform, url]) =>
                url && SocialIcons[platform] ? (
                  <a
                    key={platform}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-light/70 hover:text-brand-hope transition-transform duration-300 hover:scale-110"
                    aria-label={`Follow Jambo Apparels on ${platform}`}
                  >
                    {React.cloneElement(SocialIcons[platform], { className: "w-8 h-8" })}
                  </a>
                ) : null
              )}
            </nav>
          </div>
        </section>
      )}
    </div>
  );
};