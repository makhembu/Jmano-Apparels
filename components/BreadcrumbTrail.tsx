
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

export const BreadcrumbTrail: React.FC = () => {
  const location = useLocation();
  const { products, blogPosts } = useShop();

  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) {
    return null; // No breadcrumbs on homepage
  }
  
  const breadcrumbs = pathnames.map((value, index) => {
    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
    let label = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

    // Dynamic label replacement
    if (value === 'product' && pathnames[index + 1]) {
      const productId = pathnames[index + 1];
      const product = products.find(p => p.id === productId || p.slug === productId);
      if(product) label = product.title;
    }
    if (value === 'blog' && pathnames[index + 1]) {
        const postSlug = pathnames[index + 1];
        const post = blogPosts.find(p => p.slug === postSlug);
        if(post) label = post.title;
    }
    
    // Skip UUIDs/slugs from appearing as their own breadcrumb
    if ((value !== 'product' && value !== 'blog') && index > 0 && (pathnames[index-1] === 'product' || pathnames[index-1] === 'blog')) {
        return null;
    }

    return { to, label };
  }).filter(Boolean) as { to: string; label: string }[];
  
  // Don't render a single breadcrumb item
  if (breadcrumbs.length <= 1) return null;

  // Add Home link at the beginning
  const items = [{ to: '/', label: 'Home' }, ...breadcrumbs];
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `https://jamboapparels.com${item.to}`
    }))
  };

  return (
    <div className="bg-white border-b border-gray-100 hidden lg:block">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center space-x-2 py-4">
          {items.map((item, index) => (
            <li key={item.to}>
              <div className="flex items-center">
                {index > 0 && (
                   <svg className="h-5 w-5 flex-shrink-0 text-gray-300 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" /></svg>
                )}
                <Link
                  to={item.to}
                  className={`text-xs font-medium uppercase tracking-widest ${index === items.length - 1 ? 'text-brand-green font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                  aria-current={index === items.length - 1 ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};
