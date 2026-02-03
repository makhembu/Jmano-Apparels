
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';

interface ProductShareProps {
  product: Product;
}

export const ProductShare: React.FC<ProductShareProps> = ({ product }) => {
  // Fix: Construct a canonical URL instead of using window.location.href to avoid blob URLs in sandboxed environments.
  const pageUrl = `https://jamboapparels.com/#/product/${product.slug || product.id}`;
  const shareTitle = encodeURIComponent(product.title);
  const encodedUrl = encodeURIComponent(pageUrl);
  const shareDescription = encodeURIComponent(`Check out this piece from Jambo Apparels: "${product.title}"`);
  
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareTitle}`;
  const emailShareUrl = `mailto:?subject=${shareTitle}&body=${shareDescription}%0A%0A${encodedUrl}`;

  return (
    <div className="mt-24 pt-16 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6 max-w-4xl mx-auto">
      <div>
        <h3 className="text-xl font-bold font-serif mb-2 text-brand-dark text-center sm:text-left">Share this Blessing</h3>
        <div className="flex space-x-4 justify-center sm:justify-start">
          <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-green transition-colors">
            <span className="sr-only">Facebook</span>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
          </a>
          <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-green transition-colors">
            <span className="sr-only">Twitter</span>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
          </a>
          <a href={emailShareUrl} className="text-gray-400 hover:text-brand-green transition-colors">
            <span className="sr-only">Email</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </a>
        </div>
      </div>
      <Link to={`/shop?cat=${product.categoryKey}`} className="text-brand-green font-bold hover:text-brand-dark transition-colors border-b-2 border-brand-green whitespace-nowrap">
        More from this collection &rarr;
      </Link>
    </div>
  );
};
