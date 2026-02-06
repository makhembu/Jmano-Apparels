import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
      // Fallback if config missing
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
    // 1. Fetch Global Settings
    const { data: settings } = await supabase.from('app_settings').select('*').single();
    if (settings) {
       meta.title = settings.seo_title || meta.title;
       meta.description = settings.seo_description || meta.description;
       meta.image = settings.default_og_image || settings.logo_image || meta.image;
    }

    // 2. Fetch Page Specific Data
    if (path === '/' || path === '/index.html') {
       // Homepage uses global settings
    } 
    else if (path.startsWith('/shop')) {
       meta.title = settings?.shop_seo_title || 'Shop Collection | Jambo Apparels';
       meta.description = settings?.shop_seo_description || meta.description;
    }
    else if (path.startsWith('/about')) {
       meta.title = settings?.about_seo_title || 'About Us | Jambo Apparels';
       meta.description = settings?.about_seo_description || meta.description;
    }
    else if (path.startsWith('/blog') && !path.startsWith('/blog/')) {
       meta.title = settings?.blog_seo_title || 'Journal | Jambo Apparels';
       meta.description = settings?.blog_seo_description || meta.description;
    }
    else if (path.includes('/product/')) {
       // Extract ID or Slug
       const parts = path.split('/product/');
       if (parts.length > 1) {
           const slug = parts[1].split('?')[0];
           // Try ID first, then Slug
           let { data: product } = await supabase.from('products').select('*').eq('id', slug).single();
           if (!product) {
              const { data: pSlug } = await supabase.from('products').select('*').eq('slug', slug).single();
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
    else if (path.includes('/blog/')) {
       const parts = path.split('/blog/');
       if (parts.length > 1) {
           const slug = parts[1].split('?')[0];
           const { data: post } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();
           
           if (post) {
              meta.title = post.seo_title || post.title;
              meta.description = post.seo_description || post.summary || meta.description;
              meta.image = post.featured_image || post.thumbnail || meta.image;
              meta.type = 'article';
           }
       }
    }

    // 3. Fetch the App Shell (Raw HTML)
    // We fetch the static file served by Vercel to ensure we have the correct built assets (JS/CSS hashes)
    const shellRes = await fetch(`${baseUrl}/__app_shell`);
    if (!shellRes.ok) throw new Error('Failed to fetch app shell');
    let html = await shellRes.text();

    // 4. Inject Metadata
    // Replace <title>
    html = html.replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`);
    
    // Construct Meta Tags
    const tags = `
    <meta name="description" content="${meta.description}" />
    <meta property="og:title" content="${meta.title}" />
    <meta property="og:description" content="${meta.description}" />
    <meta property="og:image" content="${meta.image}" />
    <meta property="og:url" content="${meta.url}" />
    <meta property="og:type" content="${meta.type}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${meta.title}" />
    <meta name="twitter:description" content="${meta.description}" />
    <meta name="twitter:image" content="${meta.image}" />
    `;

    // Inject before </head>
    html = html.replace('</head>', `${tags}</head>`);

    // Set Headers
    res.setHeader('Content-Type', 'text/html');
    // Cache for 60 seconds to balance performance and freshness
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    
    res.status(200).send(html);

  } catch (e) {
    console.error('SSR Error:', e);
    // In case of error, redirect to the app shell so the site still loads (CSR fallback)
    res.redirect(302, '/__app_shell');
  }
}