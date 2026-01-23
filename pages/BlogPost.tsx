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

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, blogPosts } = useShop();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);

  // Recommended products
  const recommendedProducts = products
    .filter(p => p.isPublished !== false)
    .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
    .slice(0, 4);

  // Post Navigation (Only among published posts)
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
          // Only set the post if it's published or if we're in a dev/admin context (simplified for prototype)
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

  // Dynamic SEO Update for Posts
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

  // Graceful Exit for Missing Posts
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/blog')} 
          className="flex items-center text-sm font-medium text-gray-500 hover:text-brand-green mb-6 transition-colors group"
        >
          <svg className="w-5 h-5 mr-1 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Journal
        </button>

        {post.featuredImage && (
          <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-lg border border-gray-100">
            <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <header className="mb-8 border-b pb-8">
          <h1 className="text-4xl font-serif font-bold text-brand-dark mb-4 leading-tight">{post.title}</h1>
          <div className="flex items-center text-gray-500 text-sm">
            <span className="bg-brand-light text-brand-green px-2 py-0.5 rounded font-bold mr-3">Journal Entry</span>
            <span>
              {new Date(post.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <span className="mx-2">•</span>
            <span>By {post.author}</span>
            {post.readingTime && (
              <>
                <span className="mx-2">•</span>
                <span>{post.readingTime} min read</span>
              </>
            )}
          </div>
        </header>

        <article className="prose prose-lg max-w-none text-gray-700 font-light leading-relaxed prose-headings:font-serif prose-headings:text-brand-dark prose-a:text-brand-green prose-img:rounded-xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </article>

        {nextPost && (
          <div className="mt-16 pt-8 border-t border-gray-100">
            <Link 
              to={`/blog/${nextPost.slug}`} 
              className="group block bg-gray-50 hover:bg-brand-light p-6 md:p-8 rounded-2xl transition-all border border-gray-100 hover:border-brand-green/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <p className="text-xs font-bold text-brand-green uppercase tracking-widest mb-2">Up Next</p>
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-brand-dark group-hover:text-brand-green transition-colors line-clamp-2">
                    {nextPost.title}
                  </h3>
                </div>
                <div className="flex-shrink-0 bg-white p-3 rounded-full shadow-sm group-hover:shadow-md transition-all text-brand-green group-hover:translate-x-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        )}

        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-xl font-bold font-serif mb-2 text-brand-dark">Share this story</h3>
            <div className="flex space-x-4">
              <button className="text-gray-400 hover:text-brand-green transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
              </button>
              <button className="text-gray-400 hover:text-brand-green transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
              </button>
              <button className="text-gray-400 hover:text-brand-green transition-colors">
                <span className="sr-only">Email</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </button>
            </div>
          </div>
          <Link to="/blog" className="text-brand-green font-bold hover:text-brand-dark transition-colors border-b-2 border-brand-green">
            Explore more Journal entries &rarr;
          </Link>
        </div>
      </div>

      {recommendedProducts.length > 0 && (
        <section className="mt-24 border-t border-gray-100 pt-16">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-serif font-bold text-brand-dark">Faith-Inspired Apparel</h2>
              <p className="text-gray-500 mt-2">Wear your scriptures in humility and boldness.</p>
            </div>
            <Link to="/shop" className="text-brand-green font-bold hover:underline">
              View Entire Collection &rarr;
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {recommendedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};