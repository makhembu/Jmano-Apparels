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

// 2. In-memory cache for App Shell to reduce latency/fetch costs
let cachedShell = null;

async function getShell(baseUrl) {
  if (cachedShell) return cachedShell;
  try {
    const r = await fetch(`${baseUrl}/__app_shell`);
    if (!r.ok) throw new Error('Failed to fetch app shell');
    cachedShell = await r.text();
    return cachedShell;
  } catch (e) {
    console.error('Shell fetch error:', e);
    return null;
  }
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

  // Default Meta
  let meta = {
    title: 'Jambo Apparels | Christian Streetwear',
    description: 'Divinely threaded scriptures. Wear your faith boldly.',
    image: 'https://i.imgur.com/pkaScEv.png',
    url: `${baseUrl}${path}`,
    type: 'website'
  };

  try {
    // 3. Robust Settings Query (.maybeSingle instead of .single)
    const { data: settings } = await supabase
      .from('app_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (settings) {
       meta.title = settings.seo_title || meta.title;
       meta.description = settings.seo_description || meta.description;
       meta.image = settings.default_og_image || settings.logo_image || meta.image;
    }

    // 4. Improved Path Logic & Homepage Detection
    const cleanPath = (path || '/').split('?')[0];

    if (cleanPath === '/' || cleanPath === '/index.html') {
       // Homepage specific: Use Hero Banner for social sharing if available
       if (settings?.hero_banner_image && settings.hero_banner_image.length > 5) {
          meta.image = settings.hero_banner_image;
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
           // 5. Safer Slug Extraction
           const slug = parts[1].split('/')[0];
           
           // Try ID first, then Slug using maybeSingle
           let { data: product } = await supabase.from('products').select('*').eq('id', slug).maybeSingle();
           if (!product) {
              const { data: pSlug } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle();
              product = pSlug;
           }
           
           if (product) {
              meta.title = product.seo_title || `${product.title} | Jambo Apparels`;
              meta.description = product.seo_description || product.description?.substring(0, 160) || meta.description;
              meta.image = product.images?.[0] || meta.image;
              meta.type = 'product';
           }
       }
    }
    else if (cleanPath.includes('/blog/')) {
       const parts = cleanPath.split('/blog/');
       if (parts.length > 1) {
           const slug = parts[1].split('/')[0];
           const { data: post } = await supabase.from('blog_posts').select('*').eq('slug', slug).maybeSingle();
           
           if (post) {
              meta.title = post.seo_title || post.title;
              meta.description = post.seo_description || post.summary || meta.description;
              meta.image = post.featured_image || post.thumbnail || meta.image;
              meta.type = 'article';
           }
       }
    }

    // 6. Absolute URL enforcement
    if (meta.image && meta.image.startsWith('/')) {
        meta.image = `${baseUrl}${meta.image}`;
    }

    // Fetch Shell
    let html = await getShell(baseUrl);
    if (!html) {
        return res.redirect(302, '/__app_shell');
    }

    // 7. Secure Injection
    const safeTitle = esc(meta.title);
    const safeDesc = esc(meta.description);
    const safeImage = esc(meta.image);
    const safeUrl = esc(meta.url);
    const safeType = esc(meta.type);

    // Replace Title
    if (html.includes('<title>')) {
        html = html.replace(/<title>.*?<\/title>/, `<title>${safeTitle}</title>`);
    } else {
        html = html.replace('<head>', `<head><title>${safeTitle}</title>`);
    }
    
    // Construct Meta Tags
    const tags = `
    <meta name="description" content="${safeDesc}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:url" content="${safeUrl}" />
    <meta property="og:type" content="${safeType}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />
    <meta name="twitter:image" content="${safeImage}" />
    `;

    // Inject before </head>
    html = html.replace('</head>', `${tags}</head>`);

    // 8. Debug Header
    res.setHeader('x-meta-image', safeImage);

    // 9. Cache Strategy
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');
    
    res.status(200).send(html);

  } catch (e) {
    console.error('SSR Error:', e);
    // In case of error, redirect to the app shell so the site still loads (CSR fallback)
    res.redirect(302, '/__app_shell');
  }
}