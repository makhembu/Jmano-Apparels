import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

const colorThemes = [
  {
    bg: 'bg-brand-light',
    border: 'border-brand-green/20',
    text: 'text-brand-dark',
    accent: 'text-brand-green',
    summaryText: 'text-brand-dark/70',
    hoverAccent: 'group-hover:text-brand-green'
  },
  {
    bg: 'bg-brand-hope/10',
    border: 'border-brand-hope/20',
    text: 'text-yellow-900',
    accent: 'text-brand-hope',
    summaryText: 'text-yellow-900/70',
    hoverAccent: 'group-hover:text-brand-hope'
  },
  {
    bg: 'bg-brand-testament/10',
    border: 'border-brand-testament/20',
    text: 'text-purple-900',
    accent: 'text-brand-testament',
    summaryText: 'text-purple-900/70',
    hoverAccent: 'group-hover:text-brand-testament'
  },
  {
    bg: 'bg-brand-humility/10',
    border: 'border-brand-humility/20',
    text: 'text-green-900',
    accent: 'text-brand-humility',
    summaryText: 'text-green-900/70',
    hoverAccent: 'group-hover:text-brand-humility'
  },
  {
    bg: 'bg-brand-patience/10',
    border: 'border-brand-patience/20',
    text: 'text-red-900',
    accent: 'text-brand-patience',
    summaryText: 'text-red-900/70',
    hoverAccent: 'group-hover:text-brand-patience'
  },
];

export const Blog: React.FC = () => {
  const { blogPosts, settings } = useShop();

  // Only show published posts to the public
  const publishedPosts = blogPosts.filter(post => post.status === 'published');

  // Dynamic SEO
  useEffect(() => {
    if (settings) {
      const title = settings.blogSeoTitle || `The Journal | Jambo Apparels`;
      const desc = settings.blogSeoDescription || `Explore faith stories and community testimonies.`;
      
      document.title = title;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) metaDescription.setAttribute('content', desc);
      
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', title);
    }
  }, [settings]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold font-serif mb-12 text-center text-brand-dark uppercase tracking-wide">
        Journey of Journalled Faith
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {publishedPosts.length > 0 ? (
          publishedPosts.map((post, index) => {
            const theme = colorThemes[index % colorThemes.length];
            return (
              <div
                key={post.id}
                className={`group ${theme.bg} rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-all duration-500 ease-out hover:-translate-y-2 border ${theme.border}`}
              >
                {/* Image Container with Zoom */}
                <Link to={`/blog/${post.slug}`} className="block relative overflow-hidden h-56">
                  <img
                    src={post.thumbnail || post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                </Link>

                {/* Content Area */}
                <div className="p-8 flex-1 flex flex-col">
                  <div className={`flex items-center text-xs font-bold ${theme.accent} uppercase tracking-widest mb-3`}>
                    <span className="bg-white px-2 py-0.5 rounded mr-3 shadow-sm border border-black/5">New Entry</span>
                    <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <Link to={`/blog/${post.slug}`} className="block">
                    <h3 className={`text-xl font-serif font-bold ${theme.text} mb-3 ${theme.hoverAccent} transition-colors duration-300 line-clamp-2`}>
                      {post.title}
                    </h3>
                  </Link>

                  <p className={`${theme.summaryText} text-sm font-light leading-relaxed flex-1 mb-6 line-clamp-3`}>
                    {post.summary}
                  </p>

                  <Link
                    to={`/blog/${post.slug}`}
                    className={`${theme.text} font-bold text-sm uppercase tracking-tighter self-start inline-flex items-center gap-1 group/btn`}
                  >
                    Read the Story 
                    <span className={`text-lg transition-transform duration-300 group-hover:translate-x-2 ${theme.hoverAccent}`}>&rarr;</span>
                  </Link>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-gray-500 font-serif italic text-lg">Our journal is currently being threaded with new stories. Check back soon.</p>
            <Link to="/shop" className="inline-block mt-6 text-brand-green font-bold border-b border-brand-green">Explore the Shop &rarr;</Link>
          </div>
        )}
      </div>
    </div>
  );
};
