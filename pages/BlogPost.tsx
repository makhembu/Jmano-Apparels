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

  const recommendedProducts = products
    .filter(p => p.isPublished !== false)
    .filter(p => p.categoryKey === post?.categoryId || p.isFeatured)
    .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
    .slice(0, 4);

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
      document.title = title;
    }
  }, [post]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!post) return <div className="p-32 text-center"><h1 className="text-4xl font-serif font-bold text-brand-dark mb-6">Entry Not Found</h1><Link to="/blog"><Button>Back to Journal</Button></Link></div>;

  return (
    <div className="bg-white min-h-screen">
      {/* Unified editorial Post Header */}
      <header className="relative bg-brand-light pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden border-b border-brand-green/10">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-brand-hope/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="mb-12">
            <BackButton to="/blog" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-brand-green bg-white px-5 py-2 rounded-full shadow-sm border border-brand-green/5" />
          </div>
          
          <div className="space-y-8 text-center md:text-left">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
              <span className="bg-brand-dark text-brand-hope px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                {category?.label || 'The Testimony'}
              </span>
              <span className="text-brand-green text-[10px] font-black uppercase tracking-[0.2em]">
                {post.readingTime} Min Read
              </span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-serif font-bold text-brand-dark leading-[1.05] tracking-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-col md:flex-row items-center gap-6 pt-10 border-t border-brand-green/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-green text-white flex items-center justify-center font-serif font-black text-xl shadow-lg shadow-brand-green/20">
                  {post.author?.[0]}
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authored By</p>
                  <p className="font-bold text-slate-800">{post.author}</p>
                </div>
              </div>
              <div className="hidden md:block w-px h-8 bg-slate-200"></div>
              <div className="text-left">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Journalled On</p>
                 <p className="font-bold text-slate-800">{new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Feature Content - Reduced roundedness to 2xl */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 md:-mt-24 mb-20 relative z-20">
        <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl border-[12px] border-white ring-1 ring-slate-100">
           <img src={post.featuredImage} alt="" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-32">
        <article className="prose prose-lg md:prose-2xl max-w-none text-slate-700 font-light leading-relaxed 
          prose-headings:font-serif prose-headings:text-brand-dark prose-headings:font-bold prose-headings:tracking-tight 
          prose-a:text-brand-green prose-a:font-black prose-a:no-underline prose-a:border-b-2 prose-a:border-brand-green/20 hover:prose-a:border-brand-green
          prose-blockquote:border-brand-hope prose-blockquote:bg-brand-light/20 prose-blockquote:p-10 prose-blockquote:rounded-2xl prose-blockquote:not-italic prose-blockquote:text-brand-dark prose-blockquote:font-serif">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </article>

        {/* Share & Signature */}
        <div className="mt-24 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex flex-col items-center md:items-start gap-4">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Share the Message</span>
              <div className="flex gap-3">
                 <button className="bg-slate-100 p-4 rounded-xl text-slate-500 hover:bg-brand-green hover:text-white transition-all shadow-sm">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                 </button>
                 <button className="bg-slate-100 p-4 rounded-xl text-slate-500 hover:bg-brand-green hover:text-white transition-all shadow-sm">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
                 </button>
              </div>
           </div>
           <Link to="/blog" className="text-brand-green font-black text-xs uppercase tracking-widest border-b-2 border-brand-green/20 hover:border-brand-green pb-1">Back to Journal</Link>
        </div>
      </div>

      {/* Up Next - Royal Style */}
      {nextPost && (
        <section className="bg-brand-testament py-24 md:py-32 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
           <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
              <span className="text-brand-light text-[10px] font-black uppercase tracking-[0.4em] mb-6 inline-block">Continuing the Faith</span>
              <h2 className="text-xs font-black text-brand-hope uppercase tracking-[0.3em] mb-4">Up Next</h2>
              <Link to={`/blog/${nextPost.slug}`} className="group block">
                <h3 className="text-3xl md:text-6xl font-serif font-bold text-white mb-10 leading-tight group-hover:text-brand-hope transition-colors">{nextPost.title}</h3>
                <div className="inline-flex items-center gap-4 bg-white/10 px-10 py-5 rounded-xl text-white font-black text-[10px] uppercase tracking-widest border border-white/20 group-hover:bg-white/20 transition-all">
                  Read Next Story <span className="text-xl">&rarr;</span>
                </div>
              </Link>
           </div>
        </section>
      )}

      {/* Recommended Context */}
      <section className="bg-slate-50 py-32 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
           <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
              <div>
                 <h2 className="text-xs font-black text-brand-green uppercase tracking-[0.4em] mb-4">Inspired by this read</h2>
                 <h3 className="text-3xl md:text-6xl font-serif font-bold text-brand-dark">Shop the Story</h3>
              </div>
              <Link to="/shop" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-green transition-all">Entire Collection &rarr;</Link>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {recommendedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
           </div>
        </div>
      </section>
    </div>
  );
};