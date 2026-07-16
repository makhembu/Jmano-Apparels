import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import DOMPurify from 'dompurify';
import { api } from '../lib/db';
import { BlogPost as BlogPostType, BlogCategory } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useShop } from '../context/ShopContext';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/SEO';
import { AuthorBio } from '../components/blog/AuthorBio';
import { BlogComments } from '../components/blog/BlogComments';
import { NextPost } from '../components/blog/NextPost';
import { RelatedProducts } from '../components/blog/RelatedProducts';
import { BlogShare } from '../components/blog/BlogShare';
import { VideoEmbed } from '../components/ui/VideoEmbed';
import { ProductCard } from '../components/ProductCard';

// --- Reading Progress Component ---
const ReadingProgress = () => {
  const [width, setWidth] = useState(0);

  const scrollHeight = () => {
    const el = document.documentElement;
    const ScrollTop = el.scrollTop || document.body.scrollTop;
    const ScrollHeight = el.scrollHeight || document.body.scrollHeight;
    const clientHeight = el.clientHeight || window.innerHeight;
    
    const height = ScrollHeight - clientHeight;
    const percent = (ScrollTop / height) * 100;
    setWidth(percent);
  };

  useEffect(() => {
    window.addEventListener('scroll', scrollHeight, { passive: true });
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
  const { products, blogPosts, categories, settings } = useShop();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([]);

  // --- Hashtag and Styling Logic (Markdown Only) ---
  const processNode = (node: React.ReactNode, key: string | number): React.ReactNode => {
      if (React.isValidElement<{ children: React.ReactNode }>(node)) {
          if (node.props.children) {
              return React.cloneElement(node, {
                  ...node.props,
                  key,
                  children: processChildren(node.props.children)
              });
          }
          return React.cloneElement(node, { ...node.props, key });
      }
      if (typeof node === 'string') {
          const parts = node.split(/(#\w+)/g);
          return parts.map((part, i) =>
              part.startsWith('#') ? (
                  <span key={`${key}-${i}`} className="text-brand-green font-bold">{part}</span>
              ) : (
                  part
              )
          );
      }
      return node;
  };

  const processChildren = (children: React.ReactNode): React.ReactNode => {
      if (Array.isArray(children)) {
          return children.map((child, index) => processNode(child, index));
      }
      return processNode(children, 0);
  };
  
  const markdownComponents = {
      p: (props: any) => <p {...props}>{processChildren(props.children)}</p>,
      li: (props: any) => <li {...props}>{processChildren(props.children)}</li>,
      blockquote: (props: any) => <blockquote {...props}>{processChildren(props.children)}</blockquote>,
  };
  // --- End Styling Logic ---

  useEffect(() => {
    api.getBlogCategories().then(setBlogCategories).catch(() => {});
  }, []);
  
  const productCategory = categories.find(c => c.key === post?.categoryId);
  const blogCategory = blogCategories.find(c => c.id === post?.categoryId);
  
  const categoryLabel = productCategory?.label || blogCategory?.name || 'Testimony';

  const recommendedProducts = products
    .filter(p => p.isPublished !== false && ( (productCategory && p.categoryKey === productCategory.key) || p.isFeatured) )
    .slice(0, 4);

  const publishedPosts = blogPosts.filter(p => p.status === 'published');
  const currentIndex = publishedPosts.findIndex(p => p.slug === slug);
  const nextPost = currentIndex !== -1 && publishedPosts.length > 1
    ? publishedPosts[(currentIndex + 1) % publishedPosts.length]
    : null;

  useEffect(() => {
    if (slug) {
      setLoading(true);
      setPost(null); // Clear previous post
      api
        .getBlogPostBySlug(slug)
        .then(p => {
          if (p && p.status === 'published') {
            setPost(p);
            api.incrementBlogPostView(p.id);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!post) return <div className="p-32 text-center"><h1 className="text-4xl font-serif font-bold text-brand-dark mb-6">Entry Not Found</h1><Link to="/blog"><Button>Back to Journal</Button></Link></div>;

  // Decode HTML entities that Tiptap may have escaped (e.g. &lt; → <)
  const unescapeHtml = (str: string): string => {
    if (!str.includes('&lt;') && !str.includes('&amp;lt;')) return str;
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
  };

  const isHtml = (content: string) => {
    return /<[a-z][\s\S]*>/i.test(content) && !content.trim().startsWith('#');
  };

  const renderContent = () => {
     const raw = unescapeHtml(post.content);
     if (isHtml(raw)) {
         // Sanitize HTML — allow iframe tags for video embeds
         const cleanHtml = DOMPurify.sanitize(raw, {
           ADD_TAGS: ['iframe'],
           ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'loading'],
         });
         return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
     } else {
         const contentBlocks = raw.split(/(\n@\[product:[a-zA-Z0-9-]+\]\n)/g);
         return contentBlocks.map((block, index) => {
            const match = block.match(/@\[product:([a-zA-Z0-9-]+)\]/);
            if (match) {
                const product = products.find(p => p.id === match[1]);
                return product ? <div key={index} className="my-12 not-prose"><ProductCard product={product} /></div> : null;
            }
            return <ReactMarkdown key={index} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>{block}</ReactMarkdown>;
         });
     }
  };

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
          "@type": "BlogPosting", "headline": post.title, "image": post.featuredImage,
          "author": { "@type": "Person", "name": post.author },
          "publisher": { "@type": "Organization", "name": "Jambo Apparels", "logo": { "@type": "ImageObject", "url": settings.logoImage } },
          "datePublished": post.createdAt,
          "articleBody": post.content.replace(/<[^>]*>?/gm, '').substring(0, 160)
        }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
        <header className="text-center space-y-6">
          <div className="flex justify-center items-center gap-3">
             <Link to="/blog" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-brand-green transition-colors">The Journal</Link>
             <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green bg-brand-light/30 px-3 py-1 rounded-full">{categoryLabel}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-serif font-bold text-brand-dark leading-[1.1] tracking-tight">{post.title}</h1>

          <div className="flex items-center justify-center gap-6 text-sm text-slate-500 border-t border-b border-slate-100 py-4 w-fit mx-auto px-8 mt-8">
             <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-brand-dark text-white flex items-center justify-center font-serif font-bold text-xs">{post.author?.[0]}</div>
                <span className="font-medium text-slate-900">{post.author}</span>
             </div>
             <span className="w-px h-4 bg-slate-200"></span>
             <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
             <span className="w-px h-4 bg-slate-200 hidden sm:block"></span>
             <span className="hidden sm:block">{post.readingTime} min read</span>
          </div>
        </header>

        {post.featuredImage && (
          <div className="my-8 md:my-12 rounded-xl overflow-hidden shadow-2xl shadow-slate-200/50">
             <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {post.heroVideo && (
          <div className="my-8 md:my-12 rounded-xl overflow-hidden shadow-2xl shadow-slate-200/50">
             <VideoEmbed url={post.heroVideo} title={post.title} />
          </div>
        )}

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
          <div className="lg:col-span-8">
            <article className="prose prose-lg max-w-none text-slate-700 leading-relaxed font-light
              prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-brand-dark
              prose-blockquote:border-l-4 prose-blockquote:border-brand-hope prose-blockquote:bg-gray-50/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:text-slate-800
              prose-a:text-brand-green prose-a:font-bold prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl prose-img:shadow-lg
              prose-strong:font-black prose-strong:text-brand-green">
              
              {renderContent()}

            </article>

            {/* Mobile-only author/share section */}
            <div className="lg:hidden mt-16 space-y-8">
              <AuthorBio authorName={post.author} />
              <BlogShare post={post} />
            </div>

            <BlogComments postId={post.id} initialLikes={post.likes} />

          </div>
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-28 space-y-8">
              <AuthorBio authorName={post.author} />
              <BlogShare post={post} />
            </div>
          </aside>
        </div>
      </div>

      {nextPost && <NextPost post={nextPost} />}
      {recommendedProducts.length > 0 && <RelatedProducts products={recommendedProducts} />}

    </div>
  );
};