import { createClient } from '@supabase/supabase-js';

// 1. HTML Escaping to prevent injection and breakage
function esc(str = '') {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 2. In-memory cache for App Shell (Map for multi-domain support)
const shellCache = new Map();
const shellCachePending = new Map();

async function getShell(baseUrl) {
  if (shellCache.has(baseUrl)) return shellCache.get(baseUrl);
  
  // Prevent concurrent fetches - race condition fix
  if (shellCachePending.has(baseUrl)) {
    return shellCachePending.get(baseUrl);
  }
  
  const promise = (async () => {
    try {
      const r = await fetch(`${baseUrl}/__app_shell`);
      if (!r.ok) throw new Error('Failed to fetch app shell');
      const html = await r.text();
      shellCache.set(baseUrl, html);
      return html;
    } catch (e) {
      console.error('Shell fetch error:', e);
      return null;
    } finally {
      shellCachePending.delete(baseUrl);
    }
  })();
  
  shellCachePending.set(baseUrl, promise);
  return promise;
}

// 3. Sanitize slug helper
function sanitizeSlug(slug) {
  return slug.split('/')[0].split('?')[0].trim();
}

export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  // Use Service Role if available for robust SSR data fetching, or Anon/Publishable as fallback
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                      process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 
                      process.env.SUPABASE_ANON_KEY || 
                      process.env.VITE_SUPABASE_ANON_KEY ||
                      process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabaseKey) {
      return res.redirect('/__app_shell');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const path = req.query.path || '/'; 
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${protocol}://${host}`;

  // Robust path cleaning for canonical URL
  const cleanPath = (path || '/').split('?')[0] || '/';

  // Default Meta
  let meta = {
    title: 'Jambo Apparels | Christian Streetwear',
    description: 'Divinely threaded scriptures. Wear your faith boldly.',
    image: 'https://i.imgur.com/pkaScEv.png',
    url: `${baseUrl}${cleanPath === '/' ? '' : cleanPath}`,
    type: 'website',
    imageWidth: '1200',
    imageHeight: '630'
  };

  let structuredData = null;

  try {
    // 4. Robust Settings Query (.maybeSingle instead of .single)
    const { data: settings } = await supabase
      .from('app_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (settings) {
       meta.title = settings.seo_title || meta.title;
       meta.description = settings.seo_description || meta.description;
       // Only use default OG if specifically set, otherwise logo or fallback
       meta.image = settings.default_og_image || settings.logo_image || meta.image;
    }

    // 5. Route Logic
    if (cleanPath === '/' || cleanPath === '/index.html') {
       // Homepage specific: Use Hero Banner for social sharing if available
       if (settings?.hero_banner_image && settings.hero_banner_image.length > 5) {
          meta.image = settings.hero_banner_image;
       }
       
       // Add Organization structured data for homepage
       if (settings) {
         structuredData = {
           "@context": "https://schema.org",
           "@type": "Organization",
           "name": "Jambo Apparels",
           "url": baseUrl,
           "logo": settings.logo_image || meta.image,
           "description": meta.description
         };
       }
    } 
    else if (cleanPath.startsWith('/shop')) {
       meta.title = settings?.shop_seo_title || 'Shop Collection | Jambo Apparels';
       meta.description = settings?.shop_seo_description || meta.description;
    }
    else if (cleanPath.startsWith('/about')) {
       meta.title = settings?.about_seo_title || 'About Us | Jambo Apparels';
       meta.description = settings?.about_seo_description || meta.description;
    }
    else if (cleanPath.startsWith('/blog') && (cleanPath === '/blog' || cleanPath === '/blog/')) {
       meta.title = settings?.blog_seo_title || 'Journal | Jambo Apparels';
       meta.description = settings?.blog_seo_description || meta.description;
    }
    else if (cleanPath.includes('/product/')) {
       const parts = cleanPath.split('/product/');
       if (parts.length > 1) {
           // 6. Safer Slug Extraction
           const slug = sanitizeSlug(parts[1]);
           
           // Optimized single query with OR condition
           const { data: product } = await supabase
             .from('products')
             .select('*')
             .or(`id.eq.${slug},slug.eq.${slug}`)
             .maybeSingle();
           
           if (product) {
              meta.title = product.seo_title || `${product.title} | Jambo Apparels`;
              meta.description = product.seo_description || product.description?.substring(0, 160) || meta.description;
              
              // Safer array check
              if (Array.isArray(product.images) && product.images.length > 0) {
                 meta.image = product.images[0];
              }
              meta.type = 'product';
              
              // Add Product structured data
              structuredData = {
                "@context": "https://schema.org/",
                "@type": "Product",
                "name": product.title,
                "description": product.description || meta.description,
                "image": meta.image,
                "brand": {
                  "@type": "Brand",
                  "name": "Jambo Apparels"
                }
              };
              
              // Add offer data if price exists
              if (product.price) {
                structuredData.offers = {
                  "@type": "Offer",
                  "price": product.price,
                  "priceCurrency": product.currency || "USD",
                  "availability": product.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                  "url": meta.url
                };
              }
           }
       }
    }
    else if (cleanPath.includes('/blog/')) {
       const parts = cleanPath.split('/blog/');
       if (parts.length > 1) {
           const slug = sanitizeSlug(parts[1]);
           const { data: post } = await supabase
             .from('blog_posts')
             .select('*')
             .eq('slug', slug)
             .maybeSingle();
           
           if (post) {
              meta.title = post.seo_title || post.title;
              meta.description = post.seo_description || post.summary || meta.description;
              meta.image = post.featured_image || post.thumbnail || meta.image;
              meta.type = 'article';
              
              // Add Article structured data
              structuredData = {
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": post.title,
                "description": post.summary || meta.description,
                "image": meta.image,
                "datePublished": post.created_at,
                "dateModified": post.updated_at || post.created_at,
                "author": {
                  "@type": "Organization",
                  "name": "Jambo Apparels"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Jambo Apparels",
                  "logo": {
                    "@type": "ImageObject",
                    "url": settings?.logo_image || meta.image
                  }
                }
              };
           }
       }
    }

    // 7. Absolute URL enforcement
    if (meta.image && meta.image.startsWith('/')) {
        meta.image = `${baseUrl}${meta.image}`;
    }

    // Fetch Shell
    let html = await getShell(baseUrl);
    if (!html) {
        return res.redirect(302, '/__app_shell');
    }

    // 8. Secure Injection
    const safeTitle = esc(meta.title);
    const safeDesc = esc(meta.description);
    const safeImage = esc(meta.image);
    const safeUrl = esc(meta.url);
    const safeType = esc(meta.type);
    const safeImageWidth = esc(meta.imageWidth);
    const safeImageHeight = esc(meta.imageHeight);

    // Strip existing tags to prevent duplicates
    html = html.replace(/<meta[^>]+property="og:[^"]+"[^>]*>/gi, '');
    html = html.replace(/<meta[^>]+name="description"[^>]*>/gi, '');
    html = html.replace(/<meta[^>]+name="twitter:[^"]+"[^>]*>/gi, '');
    html = html.replace(/<link[^>]+rel="canonical"[^>]*>/gi, '');

    // Replace Title
    if (html.includes('<title>')) {
        html = html.replace(/<title>.*?<\/title>/i, `<title>${safeTitle}</title>`);
    } else {
        html = html.replace(/<head>/i, `<head><title>${safeTitle}</title>`);
    }
    
    // Construct Meta Tags with canonical URL and image dimensions
    const tags = `
    <link rel="canonical" href="${safeUrl}" />
    <meta name="description" content="${safeDesc}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:image:width" content="${safeImageWidth}" />
    <meta property="og:image:height" content="${safeImageHeight}" />
    <meta property="og:url" content="${safeUrl}" />
    <meta property="og:type" content="${safeType}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />
    <meta name="twitter:image" content="${safeImage}" />
    `;

    // Inject meta tags before </head>
    html = html.replace(/<\/head>/i, `${tags}</head>`);
    
    // Inject structured data if exists
    if (structuredData) {
      const safeStructuredData = JSON.stringify(structuredData)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e');
      
      html = html.replace(
        /<\/head>/i,
        `<script type="application/ld+json">${safeStructuredData}</script></head>`
      );
    }

    // 9. Debug Header
    res.setHeader('x-meta-image', safeImage);

    // 10. Cache Strategy
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');
    
    res.status(200).send(html);

  } catch (e) {
    console.error('SSR Error:', e);
    // In case of error, redirect to the app shell so the site still loads (CSR fallback)
    res.redirect(302, '/__app_shell');
  }
}