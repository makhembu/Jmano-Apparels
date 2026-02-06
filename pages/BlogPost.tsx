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
    // FIX: Corrected property name from `window.clientHeight` to `window.innerHeight`.
    const clientHeight = el.clientHeight || window.innerHeight; // window height
    
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

// --- Custom Renderer for Hashtags ---
const ParagraphWithHashtags = ({ children }: { children?: React.ReactNode }) => {
  const processChildren = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === 'string') {
      const parts = node.split(/(#\w+)/g);
      return parts.map((part, i) =>
        part.startsWith('#') ? (
          <Link key={i} to={`/blog?tag=${part.substring(1)}`} className="text-brand-testament font-bold no-underline hover:underline">
            {part}
          </Link>
        ) : (
          part
        )
      );
    }
    if (Array.isArray(node)) {
      return node.map(processChildren);
    }
    return node;
  };

  return <p>{processChildren(children)}</p>;
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
  
  // --- Content Parsing for Embeds ---
  const contentBlocks = post.content.split(/(\n@\[product:[a-zA-Z0-9-]+\]\n)/g);

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
              {contentBlocks.map((block, index) => {
                  const match = block.match(/@\[product:([a-zA-Z0-9-]+)\]/);
                  if (match) {
                      const productId = match[1];
                      const product = products.find(p => p.id === productId);
                      return product ? (
                          <div key={index} className="my-12 not-prose">
                              <ProductCard product={product} />
                          </div>
                      ) : null;
                  }
                  return (
                      <ReactMarkdown key={index} remarkPlugins={[remarkGfm]} components={{ p: ParagraphWithHashtags }}>
                          {block}
                      </ReactMarkdown>
                  );
              })}
            </article>

            {/* --- Mobile Share (Bottom) --- */}
            {/* ... (Existing Share Logic - No changes needed) ... */}
          </div>

          {/* --- Sticky Sidebar (Desktop) --- */}
          {/* ... (Existing Sidebar Logic - No changes needed) ... */}

        </div>
      </div>

      {/* --- Footer: Up Next & Related Products --- */}
      {/* ... (Existing Footer Logic - No changes needed) ... */}
    </div>
  );
};
