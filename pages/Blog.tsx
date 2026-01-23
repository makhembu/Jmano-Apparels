import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

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
      <h1 className="text-3xl font-bold font-serif mb-12 text-center text-brand-green uppercase tracking-wide">
        Journey of Journalled Faith
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {publishedPosts.length > 0 ? (
          publishedPosts.map(post => (
            <div
              key={post.id}
              className="group bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 border border-gray-100"
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
                <div className="flex items-center text-xs font-bold text-brand-green uppercase tracking-widest mb-3">
                  <span className="bg-brand-light px-2 py-0.5 rounded mr-3">New Entry</span>
                  <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>

                <Link to={`/blog/${post.slug}`} className="block">
                  <h3 className="text-xl font-serif font-bold text-gray-900 mb-3 group-hover:text-brand-green transition-colors duration-300 line-clamp-2">
                    {post.title}
                  </h3>
                </Link>

                <p className="text-gray-600 text-sm font-light leading-relaxed flex-1 mb-6 line-clamp-3">
                  {post.summary}
                </p>

                <Link
                  to={`/blog/${post.slug}`}
                  className="text-brand-dark font-bold text-sm uppercase tracking-tighter self-start inline-flex items-center gap-1 group/btn"
                >
                  Read the Story 
                  <span className="text-lg transition-transform duration-300 group-hover:translate-x-2 group-hover:text-brand-green">&rarr;</span>
                </Link>
              </div>
            </div>
          ))
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