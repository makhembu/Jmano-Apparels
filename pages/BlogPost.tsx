import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import { api } from '../lib/db';
import { BlogPost as BlogPostType } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      api.getBlogPostBySlug(slug).then(p => {
        setPost(p);
        if (p) api.incrementBlogPostView(p.id);
      }).finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!post) return <div className="p-20 text-center">Post not found</div>;

  return (
    <>
      <Helmet>
        <title>{post.seoTitle || post.title} | Jambo Apparels</title>
        <meta name="description" content={post.seoDescription || post.summary} />
      </Helmet>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
        <Link to="/blog" className="text-brand-green hover:underline mb-6 inline-block">&larr; Back to Journal</Link>
        
        {post.featuredImage && (
          <div className="w-full h-64 md:h-96 rounded-xl overflow-hidden mb-8 shadow-lg">
            <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <header className="mb-8 border-b pb-8">
          <h1 className="text-4xl font-serif font-bold text-brand-dark mb-4">{post.title}</h1>
          <div className="flex items-center text-gray-500 text-sm">
            <span>{new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
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

        <article className="prose prose-lg max-w-none text-gray-700 font-light leading-relaxed">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-3xl font-bold font-serif text-brand-dark mt-8 mb-4" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-bold font-serif text-brand-green mt-6 mb-3" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2" {...props} />,
              p: ({node, ...props}) => <p className="mb-4" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-brand-green pl-4 italic text-gray-600 my-4" {...props} />,
            }}
          >
            {post.content}
          </ReactMarkdown>
        </article>

        <div className="mt-12 pt-8 border-t">
          <h3 className="text-xl font-bold font-serif mb-4">Share this story</h3>
          <div className="flex space-x-4">
            <button className="text-gray-500 hover:text-brand-green">Facebook</button>
            <button className="text-gray-500 hover:text-brand-green">Twitter</button>
            <button className="text-gray-500 hover:text-brand-green">Email</button>
          </div>
        </div>
      </div>
    </>
  );
};