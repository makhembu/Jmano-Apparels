
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../lib/db';
import { BlogPost as BlogPostType, BlogCategory } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { BackButton } from '../components/ui/BackButton';
import { SEO } from '../components/SEO';

// --- Reading Progress Component ---
const ReadingProgress = () => {
  const [width, setWidth] = useState(0);

  const scrollHeight = () => {
    const el = document.documentElement;
    const ScrollTop = el.scrollTop || document.body.scrollTop;
    const ScrollHeight = el.scrollHeight || document.body.scrollHeight;
    const clientHeight = el.clientHeight || document.body.clientHeight; // window height
    
    // Total scrollable height
    const height = ScrollHeight - clientHeight;
    const percent = (ScrollTop / height) * 100;
    setWidth(percent);
  };

  useEffect(() => {
    window.addEventListener('scroll', scrollHeight);
    return () => window.removeEventListener('scroll', scrollHeight);
  });

  return (
    <div className="fixed top-0 left-0 h-1.5 bg-gray-100 w-full z-[100]">
      <div 
        className="h-full bg-brand-green transition-all duration-150 ease-out" 
        style={{ width: `${width}%` }} 
      />
    </div>
  );
};

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, blogPosts, categories } = useShop();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([]);

  useEffect(() => {
    api.getBlogCategories().then(setBlogCategories).catch(() => {});
  }, []);

  const productCategory = categories.find(c => c.key === post?.categoryId);
  const blogCategory = blogCategories.find(c => c.id === post?.categoryId);
  
  const categoryLabel = productCategory?.label || blogCategory?.name || 'Testimony';

  // Fetch recommended products based on category
  const recommendedProducts = products
    .filter(p => p.isPublished !== false)
    .filter(p => (productCategory && p.categoryKey === productCategory.key) || p.isFeatured)
    .slice(0, 3);

  // Determine Next Post
  const publishedPosts = blogPosts.filter(p => p.status === 'published');
  const currentIndex = publishedPosts.findIndex(p => p.slug === slug);
  const nextPost = currentIndex !== -1 && publishedPosts.length > 1
    ? publishedPosts[(currentIndex + 1) % publishedPosts.length]
    : null;

  useEffect(() => {
    if (slug) {
      setLoading(true);
      api
        .getBlogPostBySlug(slug)
        .then(p => {
          if (p && p.status === 'published') {
            setPost(p);
            api.incrementBlogPostView(p.id);
          } else {
            setPost(null);
          }
        })
        .catch(() => setPost(null))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!post) return <div className="p-32 text-center"><h1 className="text-4xl font-serif font-bold text-brand-dark mb-6">Entry Not Found</h1><Link to="/blog"><Button>Back to Journal</Button></Link></div>;

  // Social Share URLs
  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(post.title);

  return (
    <div className="bg-white min-h-screen font-sans">
      <ReadingProgress />
      <SEO 
        title={post.seoTitle || post.title}
        description={post.seoDescription || post.summary}
        image={post.featuredImage || post.thumbnail}
        type="article"
        canonical={post.canonicalUrl}
        noindex={post.isNoIndex}
        nofollow={post.isNoFollow}
        keywords={post.keywords}
        schema={{
          "@type": "BlogPosting",
          "headline": post.title,
          "image": post.featuredImage,
          "author": { "@type": "Person", "name": post.author },
          "publisher": {
            "@type": "Organization",
            "name": "Jambo Apparels",
            "logo": { "@type": "ImageObject", "url": "https://i.imgur.com/pkaScEv.png" }
          },
          "datePublished": post.createdAt,
          "articleBody": post.content ? post.content.replace(/<[^>]*>?/gm, '').substring(0, 160) : ""
        }}
      />

      {/* --- Editorial Header --- */}
      <header className="relative pt-24 pb-12 md:pt-32 md:pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="flex justify-center items-center gap-3">
             <Link to="/blog" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-brand-green transition-colors">The Journal</Link>
             <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green bg-brand-light/30 px-3 py-1 rounded-full">
                {categoryLabel}
             </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-serif font-bold text-brand-dark leading-[1.1] tracking-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-center gap-6 text-sm text-slate-500 border-t border-b border-slate-100 py-4 w-fit mx-auto px-8 mt-8">
             <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-brand-dark text-white flex items-center justify-center font-serif font-bold text-xs">
                   {post.author?.[0]}
                </div>
                <span className="font-medium text-slate-900">{post.author}</span>
             </div>
             <span className="w-px h-4 bg-slate-200"></span>
             <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
             <span className="w-px h-4 bg-slate-200 hidden sm:block"></span>
             <span className="hidden sm:block">{post.readingTime} min read</span>
          </div>
        </div>
      </header>

      {/* --- Featured Image --- */}
      <div className="max-w-5xl mx-auto px-4 mb-16">
        <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden shadow-2xl">
           <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
        </div>
        {/* Optional Caption could go here */}
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* --- Main Content Column --- */}
          <div className="lg:col-span-8 lg:col-start-2">
            <article className="prose prose-lg prose-slate max-w-none 
              font-serif text-slate-700 leading-8
              prose-p:mb-6 prose-p:text-[1.1rem] prose-p:font-light 
              prose-headings:font-sans prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-brand-dark
              prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
              prose-a:text-brand-green prose-a:font-bold prose-a:no-underline prose-a:border-b-2 prose-a:border-brand-green/20 hover:prose-a:border-brand-green hover:prose-a:bg-brand-light/20 prose-a:transition-all
              prose-blockquote:border-l-4 prose-blockquote:border-brand-hope prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:text-slate-800
              prose-img:rounded-xl prose-img:shadow-lg
              prose-strong:font-black prose-strong:text-slate-900
              first-letter:float-left first-letter:text-6xl first-letter:pr-3 first-letter:font-black first-letter:text-brand-dark first-letter:mt-[-4px]
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </article>

            {/* --- Mobile Share (Bottom) --- */}
            <div className="lg:hidden mt-12 pt-8 border-t border-slate-100">
               <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 text-center">Share this story</p>
               <div className="flex justify-center gap-4">
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer" className="p-3 rounded-full bg-slate-50 text-slate-600 hover:bg-[#1877F2] hover:text-white transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
                  <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`} target="_blank" rel="noreferrer" className="p-3 rounded-full bg-slate-50 text-slate-600 hover:bg-[#1DA1F2] hover:text-white transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg></a>
               </div>
            </div>
          </div>

          {/* --- Sticky Sidebar (Desktop) --- */}
          <aside className="hidden lg:block lg:col-span-3">
             <div className="sticky top-32 space-y-12">
                
                {/* About Author */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                   <h4 className="font-sans font-bold text-sm text-brand-dark mb-3">About the Author</h4>
                   <p className="font-serif text-sm text-slate-600 leading-relaxed italic mb-4">
                      "{post.author} is a dedicated contributor to the Jambo mission, sharing insights on faith, lifestyle, and the modern believer's walk."
                   </p>
                   <Link to="/about" className="text-xs font-black uppercase tracking-widest text-brand-green hover:underline">Read our Story</Link>
                </div>

                {/* Share Tools */}
                <div>
                   <h4 className="font-sans font-bold text-xs text-slate-400 uppercase tracking-widest mb-4">Share this Entry</h4>
                   <div className="flex gap-2">
                      <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer" className="flex-1 py-2 rounded-lg border border-slate-200 text-center text-slate-600 hover:border-[#1877F2] hover:text-[#1877F2] transition-colors"><span className="text-xs font-bold">Facebook</span></a>
                      <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`} target="_blank" rel="noreferrer" className="flex-1 py-2 rounded-lg border border-slate-200 text-center text-slate-600 hover:border-[#1DA1F2] hover:text-[#1DA1F2] transition-colors"><span className="text-xs font-bold">Twitter</span></a>
                   </div>
                </div>

                {/* Contextual CTA */}
                <div className="bg-brand-dark text-white p-6 rounded-2xl shadow-xl shadow-brand-dark/20 text-center relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-hope/30 transition-colors"></div>
                   <div className="relative z-10">
                      <h4 className="font-serif font-bold text-xl mb-2">Inspired?</h4>
                      <p className="text-brand-light text-sm mb-6 leading-relaxed">Wear the message. Explore our collection of scripture-threaded apparel.</p>
                      <Link to="/shop">
                         <Button variant="secondary" className="w-full text-xs h-10 shadow-none">Visit Shop</Button>
                      </Link>
                   </div>
                </div>

             </div>
          </aside>

        </div>
      </div>

      {/* --- Footer: Up Next & Related Products --- */}
      <div className="bg-slate-50 border-t border-slate-200">
         <div className="max-w-7xl mx-auto px-4 py-20">
            
            {/* Next Post */}
            {nextPost && (
               <div className="mb-20 text-center max-w-2xl mx-auto">
                  <span className="text-brand-green text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">Continue Reading</span>
                  <Link to={`/blog/${nextPost.slug}`} className="group block">
                     <h3 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-4 group-hover:text-brand-green transition-colors leading-tight">
                        {nextPost.title}
                     </h3>
                     <p className="text-slate-500 font-serif italic mb-6">Read next &rarr;</p>
                  </Link>
               </div>
            )}

            {/* Related Products */}
            {recommendedProducts.length > 0 && (
               <div>
                  <div className="flex justify-between items-end mb-10 border-b border-slate-200 pb-4">
                     <h3 className="text-2xl font-serif font-bold text-brand-dark">Curated for this Story</h3>
                     <Link to="/shop" className="text-xs font-bold text-brand-green hover:underline">View All</Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                     {recommendedProducts.map((product, idx) => (
                        <ProductCard key={product.id} product={product} index={idx} />
                     ))}
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};
