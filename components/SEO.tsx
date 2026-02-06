import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

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
  const { settings } = useShop();
  const location = useLocation();

  // --- Defaults & Logic ---
  const siteName = 'Jambo Apparels';
  const defaultTitle = settings.seoTitle || siteName;
  const defaultDescription = settings.seoDescription || 'Divinely threaded scriptures.';
  const defaultImage = settings.defaultOgImage || settings.logoImage || 'https://i.imgur.com/pkaScEv.png';
  
  const finalTitle = title ? (title.includes('|') ? title : `${title} | ${siteName}`) : defaultTitle;
  const finalDesc = description || defaultDescription;
  const finalImage = image || defaultImage;
  
  let cleanPath = location.pathname;
  if (cleanPath !== '/' && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }
  const autoCanonical = `https://jamboapparels.com${cleanPath}`;
  const finalCanonical = canonical || autoCanonical;
  const robotsContent = `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`;

  useEffect(() => {
    // 1. Update Title
    document.title = finalTitle;

    // 2. Helper to set meta tags
    const setMeta = (selector: string, content: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        // If not found (e.g. CSR navigation), create it
        element = document.createElement('meta');
        
        // Parse selector to set attributes
        const attrMatch = selector.match(/meta\[(name|property)="(.+?)"\]/);
        if (attrMatch) {
            element.setAttribute(attrMatch[1], attrMatch[2]);
            document.head.appendChild(element);
        }
      }
      element.setAttribute('content', content);
    };

    const setLink = (rel: string, href: string) => {
        let element = document.querySelector(`link[rel="${rel}"]`);
        if (!element) {
            element = document.createElement('link');
            element.setAttribute('rel', rel);
            document.head.appendChild(element);
        }
        element.setAttribute('href', href);
    };

    // 3. Update Standard Meta
    setMeta('meta[name="description"]', finalDesc);
    setMeta('meta[name="keywords"]', keywords.join(', '));
    setMeta('meta[name="robots"]', robotsContent);

    // 4. Update Open Graph
    setMeta('meta[property="og:title"]', finalTitle);
    setMeta('meta[property="og:description"]', finalDesc);
    setMeta('meta[property="og:image"]', finalImage);
    setMeta('meta[property="og:url"]', finalCanonical);
    setMeta('meta[property="og:type"]', type);
    setMeta('meta[property="og:site_name"]', siteName);

    // 5. Update Twitter
    setMeta('meta[name="twitter:card"]', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', finalTitle);
    setMeta('meta[name="twitter:description"]', finalDesc);
    setMeta('meta[name="twitter:image"]', finalImage);

    // 6. Update Canonical
    setLink('canonical', finalCanonical);

    // 7. Update JSON-LD Schema
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

  }, [finalTitle, finalDesc, finalImage, type, finalCanonical, robotsContent, keywords, schema, settings]);

  return null;
};