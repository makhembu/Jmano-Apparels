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
  const defaultTitle = settings.seoTitle || "Jambo Apparels | Christian Streetwear & Faith Based Fashion";
  const defaultDescription = settings.seoDescription || "Wear your scriptures in Humility and Boldness. Premium Christian streetwear, hoodies, and tees designed to spread the Gospel.";
  const defaultImage = settings.defaultOgImage || settings.logoImage || 'https://i.imgur.com/pkaScEv.png';
  
  const finalTitle = title 
    ? (title.includes('|') ? title : `${title} | ${siteName}`) 
    : defaultTitle;
    
  const finalDesc = description || defaultDescription;
  const finalImage = image || defaultImage;
  
  // Construct absolute canonical URL
  let cleanPath = location.pathname;
  if (cleanPath !== '/' && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }
  // Ensure we don't have double slashes if path is root
  const autoCanonical = `https://jamboapparels.com${cleanPath === '/' ? '' : cleanPath}`;
  const finalCanonical = canonical || autoCanonical;
  
  const robotsContent = `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`;

  // Default keywords
  const baseKeywords = ["Christian Clothing", "Faith Apparel", "Streetwear", "Scripture Hoodies", "Jambo Apparels"];
  const finalKeywords = keywords.length > 0 ? keywords : baseKeywords;

  // Prepare Social Links for Schema
  const socialSameAs = settings.socialLinks ? Object.values(settings.socialLinks).filter(Boolean) : [];

  useEffect(() => {
    // 1. Update Title
    document.title = finalTitle;

    // 2. Helper to set meta tags safely
    const setMeta = (selector: string, content: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        const nameMatch = selector.match(/meta\[name="(.+?)"\]/);
        const propMatch = selector.match(/meta\[property="(.+?)"\]/);
        if (nameMatch) element.setAttribute('name', nameMatch[1]);
        if (propMatch) element.setAttribute('property', propMatch[1]);
        document.head.appendChild(element);
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
    setMeta('meta[name="keywords"]', finalKeywords.join(', '));
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

    // 6. Update Canonical (Critical for SEO)
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
          },
          "sameAs": socialSameAs,
          "contactPoint": {
             "@type": "ContactPoint",
             "telephone": settings.contactPhone,
             "contactType": "customer service",
             "email": settings.contactEmail
          }
        },
        schema // Merge specific page schema (product, article, etc)
      ].filter(Boolean)
    };

    schemaScript.textContent = JSON.stringify(baseSchema);

  }, [finalTitle, finalDesc, finalImage, type, finalCanonical, robotsContent, finalKeywords, schema, settings, socialSameAs]);

  return null;
};