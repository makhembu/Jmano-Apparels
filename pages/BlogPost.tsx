import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../lib/db';
import { BlogPost as BlogPostType } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { BackButton } from '../components/ui/BackButton';

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, blogPosts, categories } = useShop();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);

  // Recommended products based on category or featured
  const recommendedProducts = products
    .filter(p => p.isPublished !== false)
    .filter(p => p.categoryKey === post?.categoryId || p.isFeatured)
    .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
    .slice(0, 4);

  // Post Navigation (Only among published posts)
  const publishedPosts = blogPosts.filter(p => p.status === 'published');
  const currentIndex = publishedPosts.findIndex(p => p.slug === slug);
  const nextPost = currentIndex !== -1 && publishedPosts.length > 1
    ? publishedPosts[(currentIndex + 1) % publishedPosts.length]
    : null;

  const category = categories.find(c => c.key === post?.categoryId);

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

  useEffect(() => {
    if (post) {
      const title = post.seoTitle || `${post.title} | Jambo Journal`;
      const desc = post.seoDescription || post.summary || '';
      document.title = title;
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) metaDescription.setAttribute('content', desc);
      
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', title);
      
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', desc);
      
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && post.featuredImage) ogImage.setAttribute('content', post.featuredImage);
    }
  }, [post]);

  if (loading) return <LoadingSpinner fullScreen />;

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center animate-fade-in">
        <div className="mb-8 flex justify-center">
          <div className="bg-brand-light p-6 rounded-full">
            <svg className="w-16 h-16 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl font-serif font-bold text-brand-dark mb-4">Story Not Found</h1>
        <p className="text-gray-600 mb-10 text-lg max-w-md mx-auto leading-relaxed">
          The testimony or styling guide you're looking for might have been moved or is currently being journalled.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate('/blog')} variant="primary" className="px-8">
            Return to Journal
          </Button>
          <Button onClick={() => navigate('/shop')} variant="outline" className="px-8">
            Explore the Shop
          </Button>
        </div>
      </div>
    );
  }

  const pageUrl = `https://jamboapparels.com/#/blog/${post.slug}`;
  const shareTitle = encodeURIComponent(post.title);
  const encodedUrl = encodeURIComponent(pageUrl);
  
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareTitle}`;
  const emailShareUrl = `mailto:?subject=${shareTitle}&body=Check out this story from Jambo Apparels: ${encodedUrl}`;

  return (
    <div className="bg-white min-h-screen">
      {/* Editorial Header */}
      <div className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20">
          <div className="mb-10">
            <BackButton to="/blog" className="inline-flex items-center text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-green" />
          </div>
          
          <div className="space-y-6 text-center md:text-left">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
              <span className="bg-brand-green text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md shadow-brand-green/10">
                Journal Entry
              </span>
              {category && (
                <span className="text-brand-green text-[10px] font-black uppercase tracking-widest border border-brand-green/20 px-3 py-1 rounded-full">
                  {category.label}
                </span>
              )}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-brand-dark leading-tight md:leading-[1.1] max-w-4xl">
              {post.title}
            </h1>
            
            <div className="flex flex-col md:flex-row items-center gap-4 text-slate-400 text-sm border-t border-slate-200/60 pt-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand-dark font-bold text-xs">
                  {post.author?.[0] || 'A'}
                </div>
                <span className="font-bold text-slate-600">By {post.author}</span>
              </div>
              <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-200"></div>
              <span>
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              {post.readingTime && (
                <>
                  <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {post.readingTime} min read
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="max-w-6xl mx-auto px-4 -mt-10 md:-mt-16 mb-16 md:mb-24">
          <div className="w-full aspect-[16/9] md:aspect-[21/9] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white ring-1 ring-slate-100">
            <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="max-w-3xl mx-auto">
          <article className="prose prose-lg md:prose-xl max-w-none text-slate-700 font-light leading-[1.8] prose-headings:font-serif prose-headings:text-brand-dark prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand-green prose-a:font-bold prose-img:rounded-3xl prose-blockquote:border-brand-green prose-blockquote:bg-slate-50 prose-blockquote:p-8 prose-blockquote:rounded-3xl prose-blockquote:not-italic prose-blockquote:font-serif prose-blockquote:text-xl prose-blockquote:text-slate-800">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </article>

          {/* Social Share Section */}
          <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center sm:items-start gap-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Share the Testimony</span>
              <div className="flex space-x-3">
                <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer" className="bg-slate-100 text-slate-500 p-3 rounded-2xl hover:bg-brand-green hover:text-white transition-all shadow-sm">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                </a>
                <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer" className="bg-slate-100 text-slate-500 p-3 rounded-2xl hover:bg-brand-green hover:text-white transition-all shadow-sm">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
                </a>
                <a href={emailShareUrl} className="bg-slate-100 text-slate-500 p-3 rounded-2xl hover:bg-brand-green hover:text-white transition-all shadow-sm">
                  <span className="sr-only">Email</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </a>
              </div>
            </div>
            
            <Link to="/blog" className="text-brand-green font-bold text-sm uppercase tracking-widest border-b-2 border-brand-green/10 hover:border-brand-green transition-all pb-1">
              Back to Journal
            </Link>
          </div>
        </div>
      </div>

      {/* Up Next Bridge - Relocated above recommended products */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {nextPost ? (
          <div className="space-y-10">
             <div className="text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Continuing the Journey</span>
             </div>
             
             <Link 
               to={`/blog/${nextPost.slug}`} 
               className="group block relative bg-white p-10 md:p-16 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 hover:border-brand-green/30 transition-all transform hover:-translate-y-2 overflow-hidden"
             >
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-light/50 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                   {nextPost.thumbnail && (
                     <div className="w-full md:w-48 aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-white flex-shrink-0">
                        <img src={nextPost.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                     </div>
                   )}
                   
                   <div className="flex-1 text-center md:text-left">
                      <p className="text-xs font-black text-brand-green uppercase tracking-widest mb-4">Up Next</p>
                      <h4 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark group-hover:text-brand-green transition-colors leading-tight mb-6">
                        {nextPost.title}
                      </h4>
                      <p className="text-slate-500 text-sm md:text-base font-light line-clamp-2 leading-relaxed mb-8">
                        {nextPost.summary}
                      </p>
                      <div className="inline-flex items-center gap-3 text-brand-green font-black text-xs uppercase tracking-[0.2em] group-hover:gap-6 transition-all duration-300">
                         Read Next Story 
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </div>
                   </div>
                </div>
             </Link>
          </div>
        ) : (
          <div className="text-center py-10 opacity-30">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">End of Journal</span>
          </div>
        )}
      </div>

      {/* Recommended Context - Shop the Story (Now at the bottom) */}
      <div className="bg-slate-50 py-20 md:py-32 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div>
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Shop the Story</h3>
                 <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-dark">Complete the Look</h2>
              </div>
              <Link to="/shop" className="text-[10px] font-black text-brand-green uppercase tracking-widest hover:underline underline-offset-8 transition-all">Explore Entire Store &rarr;</Link>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {recommendedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};