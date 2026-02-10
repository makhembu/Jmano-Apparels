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

// 2. In-memory cache for App Shell
const shellCache = new Map();
const shellCachePending = new Map();

async function getShell(baseUrl) {
  if (shellCache.has(baseUrl)) return shellCache.get(baseUrl);
  
  if (shellCachePending.has(baseUrl)) {
    return shellCachePending.get(baseUrl);
  }
  
  const promise = (async () => {
    try {
      const r = await fetch(`${baseUrl}/index.html`);
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
  return (slug || '').split('/')[0].split('?')[0].trim();
}

export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${protocol}://${host}`;
  const path = req.query.path || '/';

  // Fetch the base HTML shell first. If this fails, we can't proceed.
  let html = await getShell(baseUrl);
  if (!html) {
    return res.status(500).send('Could not load application shell.');
  }
  
  // Defensively strip any existing title/desc tags from the shell
  html = html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta name="description"[\s\S]*?>/i, '');


  try {
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials not configured.');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const cleanPath = path.split('?')[0];
    const canonicalUrl = `${baseUrl}${cleanPath === '/' ? '' : cleanPath}`;

    // --- 1. Fetch Global Settings for Fallbacks ---
    const { data: settings } = await supabase.from('app_settings').select('*').limit(1).maybeSingle();

    // --- 2. Define Default Meta ---
    const meta = {
      title: settings?.seo_title || 'Jambo Apparels | Premium Christian Streetwear',
      description: settings?.seo_description || 'Divinely threaded scriptures. Wear your faith boldly.',
      image: settings?.default_og_image || settings?.logo_image || 'https://i.imgur.com/pkaScEv.png',
      url: canonicalUrl,
      type: 'website',
      isNoIndex: false, // For robots tag
      isNoFollow: false, // For robots tag
    };

    let structuredData = null; // for JSON-LD
    let extraMeta = ''; // For context-specific tags like article dates

    // --- 3. Route-Specific Logic to Override Meta ---
    if (cleanPath.startsWith('/product/')) {
        const slug = sanitizeSlug(cleanPath.split('/product/')[1]);
        if (slug) {
            const { data: product } = await supabase.from('products').select('*').eq('is_published', true).or(`slug.eq.${slug},id.eq.${slug}`).maybeSingle();
            if (product) {
                meta.title = product.seo_title || `${product.title} | Jambo Apparels`;
                meta.description = product.seo_description || product.description?.substring(0, 160) || meta.description;
                meta.image = product.images?.[0] || meta.image;
                meta.type = 'product';
                meta.isNoIndex = product.is_noindex || false;
                meta.isNoFollow = product.is_nofollow || false;
                structuredData = { "@type": "Product", name: product.title, description: meta.description, image: meta.image, sku: product.sku || product.id, brand: { "@type": "Brand", name: "Jambo Apparels" }, offers: { "@type": "Offer", url: meta.url, priceCurrency: settings?.currency || "GBP", price: String(product.sale_price || product.price), availability: (product.stock_quantity > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", itemCondition: "https://schema.org/NewCondition" } };
            }
        }
    } else if (cleanPath.startsWith('/blog/')) {
        const slug = sanitizeSlug(cleanPath.split('/blog/')[1]);
        if (!slug) { // Blog index page
            meta.title = settings?.blog_seo_title || 'Journal | Jambo Apparels';
            meta.description = settings?.blog_seo_description || 'Stories of faith, style guides, and community testimonies.';
        } else { // Blog post page
            const { data: post } = await supabase.from('blog_posts').select('*, updated_at').eq('slug', slug).eq('status', 'published').maybeSingle();
            if (post) {
                meta.title = post.seo_title || post.title;
                meta.description = post.seo_description || post.summary || meta.description;
                meta.image = post.featured_image || post.thumbnail || meta.image;
                meta.type = 'article';
                meta.isNoIndex = post.is_noindex || false;
                meta.isNoFollow = post.is_nofollow || false;
                
                const publishedTime = new Date(post.date).toISOString();
                const modifiedTime = new Date(post.updated_at || post.date).toISOString();
                extraMeta = `
      <meta property="article:published_time" content="${publishedTime}" />
      <meta property="article:modified_time" content="${modifiedTime}" />
    `;

                structuredData = { 
                    "@type": "BlogPosting", 
                    headline: post.title, 
                    description: meta.description, 
                    image: meta.image, 
                    datePublished: publishedTime,
                    dateModified: modifiedTime,
                    author: { "@type": "Organization", name: "Jambo Apparels" },
                    mainEntityOfPage: { "@type": "WebPage", "@id": meta.url }
                };
            }
        }
    } else if (cleanPath.startsWith('/shop')) {
        meta.title = settings?.shop_seo_title || 'Shop Collection | Jambo Apparels';
        meta.description = settings?.shop_seo_description || meta.description;
    } else if (cleanPath.startsWith('/about')) {
        meta.title = settings?.about_seo_title || 'About Us | Jambo Apparels';
        meta.description = settings?.about_seo_description || meta.description;
    }

    // --- 4. Finalize and Inject ---
    if (meta.image && meta.image.startsWith('/')) {
        meta.image = `${baseUrl}${meta.image}`;
    }
    // Guard against empty image and description
    if (!meta.image || meta.image.trim() === '') {
      meta.image = settings?.default_og_image || 'https://i.imgur.com/pkaScEv.png';
    }
    meta.description = meta.description.slice(0, 155);

    const safeTitle = esc(meta.title);
    const safeDesc = esc(meta.description);
    const safeImage = esc(meta.image);
    const safeUrl = esc(meta.url);
    const safeType = esc(meta.type);
    const robotsContent = `${meta.isNoIndex ? 'noindex' : 'index'},${meta.isNoFollow ? 'nofollow' : 'follow'}`;

    const headTags = `
      <title>${safeTitle}</title>
      <link rel="canonical" href="${safeUrl}" />
      <meta name="description" content="${safeDesc}" />
      <meta name="robots" content="${robotsContent}" />
      
      <meta property="og:title" content="${safeTitle}" />
      <meta property="og:description" content="${safeDesc}" />
      <meta property="og:image" content="${safeImage}" />
      <meta property="og:image:alt" content="${safeTitle}" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content="${safeUrl}" />
      <meta property="og:type" content="${safeType}" />
      <meta property="og:site_name" content="Jambo Apparels" />
      ${extraMeta}
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@jamboapparels" />
      <meta name="twitter:title" content="${safeTitle}" />
      <meta name="twitter:description" content="${safeDesc}" />
      <meta name="twitter:image" content="${safeImage}" />
      <meta name="twitter:image:alt" content="${safeTitle}" />
    `;

    // Inject JSON-LD
    let schemaInjection = '';
    if (structuredData) {
        const safeStructuredData = JSON.stringify({ "@context": "https://schema.org", ...structuredData }).replace(/</g, '\\u003c');
        schemaInjection = `<script type="application/ld+json">${safeStructuredData}</script>`;
    }
    
    // Replace placeholder with generated tags
    html = html.replace(
      /<!--SSR_META_TAGS_START-->[\s\S]*?<!--SSR_META_TAGS_END-->/,
      `<!--SSR_META_TAGS_START-->\n${headTags}\n${schemaInjection}\n<!--SSR_META_TAGS_END-->`
    );
    
    const isDynamic = cleanPath.startsWith('/product/') || cleanPath.startsWith('/blog/');
    const cacheControl = isDynamic
        ? 's-maxage=600, stale-while-revalidate=86400' // 10 minutes for dynamic
        : 's-maxage=3600, stale-while-revalidate=86400'; // 1 hour for static

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', cacheControl);
    res.status(200).send(html);

  } catch (e) {
    console.error(`SSR Error for path ${path}:`, e);
    // On error, serve the original shell without modification instead of redirecting.
    // This provides a graceful fallback for crawlers with default tags.
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  }
}