
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  keywords?: string[];
  schema?: Record<string, any>;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image,
  type = 'website',
  canonical,
  noindex = false,
  nofollow = false,
  keywords = [],
  schema
}) => {
  const { settings } = useApp();
  const location = useLocation();

  // --- 1. Defaults & Logic ---
  const siteName = 'Jambo Apparels';
  const defaultTitle = settings.seoTitle || siteName;
  const defaultDescription = settings.seoDescription || 'Divinely threaded scriptures.';
  const defaultImage = settings.defaultOgImage || settings.logoImage || 'https://i.imgur.com/pkaScEv.png';
  
  const finalTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const finalDesc = description || defaultDescription;
  const finalImage = image || defaultImage;
  
  // --- SMART CANONICAL LOGIC (CRITICAL FOR SEO) ---
  // 1. Get the path without query params (e.g. "/shop" instead of "/shop?sort=price")
  // 2. Remove trailing slash if present (standardize to no-trailing-slash)
  // 3. Prepend production domain.
  // This forces Google to ignore junk params like "?products-2-order=asc"
  
  let cleanPath = location.pathname;
  if (cleanPath !== '/' && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }

  const autoCanonical = `https://jamboapparels.com${cleanPath}`;
  const finalCanonical = canonical || autoCanonical;

  const robotsContent = `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`;

  // --- 2. Side Effect to Update DOM ---
  useEffect(() => {
    // Title
    document.title = finalTitle;

    // Helper to update/create meta tags
    const updateMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to update/create link tags
    const updateLink = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Standard Meta
    updateMeta('description', finalDesc);
    updateMeta('keywords', keywords.join(', '));
    updateMeta('robots', robotsContent);

    // Open Graph
    updateMeta('og:title', finalTitle, 'property');
    updateMeta('og:description', finalDesc, 'property');
    updateMeta('og:image', finalImage, 'property');
    updateMeta('og:url', finalCanonical, 'property');
    updateMeta('og:type', type, 'property');
    updateMeta('og:site_name', siteName, 'property');

    // Twitter
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', finalTitle);
    updateMeta('twitter:description', finalDesc);
    updateMeta('twitter:image', finalImage);

    // Canonical - THE MOST IMPORTANT FIX
    updateLink('canonical', finalCanonical);

    // JSON-LD Structured Data
    let schemaScript = document.getElementById('json-ld-schema');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'json-ld-schema';
      schemaScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(schemaScript);
    }

    const baseSchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://jamboapparels.com/#organization",
          "name": siteName,
          "url": "https://jamboapparels.com",
          "logo": {
            "@type": "ImageObject",
            "url": settings.logoImage
          }
        },
        schema // Merge specific page schema
      ].filter(Boolean)
    };

    schemaScript.textContent = JSON.stringify(baseSchema);

    return () => {
      // Optional cleanup
    };
  }, [finalTitle, finalDesc, finalImage, type, finalCanonical, robotsContent, keywords, schema, settings]);

  return null;
};
