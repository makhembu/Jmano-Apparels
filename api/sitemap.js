export default async function handler(req, res) {
  // Prioritize standard backend env vars (SUPABASE_URL), fallback to VITE_ prefixed ones for dev
  let url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  
  // Update key lookup to include the publishable default key and standard anon key
  const key = process.env.SUPABASE_ANON_KEY || 
              process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
              process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 
              process.env.VITE_SUPABASE_ANON_KEY;
  
  // Ensure protocol is present
  if (url && !url.startsWith('http')) {
      url = `https://${url}`;
  }
  
  const supabaseUrl = url;
  const supabaseKey = key;
  const BASE_URL = 'https://jamboapparels.com';

  if (!supabaseUrl || !supabaseKey) {
    console.error('[Sitemap API] Supabase Credentials Missing.');
    console.error('Available Env Keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
    
    return res.status(500).json({ 
      error: 'Configuration Error: Supabase credentials missing.',
      message: 'Please set SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_PUBLISHABLE_DEFAULT_KEY) in your Vercel Project Settings.'
    });
  }

  const fetchOpts = {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  };

  try {
    // Parallel fetch using Supabase REST API
    const [productsRes, postsRes, catsRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/products?select=id,slug,created_at,is_published&is_published=eq.true`, fetchOpts),
      fetch(`${supabaseUrl}/rest/v1/blog_posts?select=slug,date,status&status=eq.published`, fetchOpts),
      fetch(`${supabaseUrl}/rest/v1/categories?select=key`, fetchOpts)
    ]);

    if (!productsRes.ok) throw new Error(`Failed to fetch products: ${productsRes.statusText}`);
    if (!postsRes.ok) throw new Error(`Failed to fetch posts: ${postsRes.statusText}`);
    if (!catsRes.ok) throw new Error(`Failed to fetch categories: ${catsRes.statusText}`);

    const products = await productsRes.json();
    const posts = await postsRes.json();
    const categories = await catsRes.json();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Static Routes
    const staticRoutes = [
      { path: '', priority: '1.0', freq: 'daily' },
      { path: '/shop', priority: '0.9', freq: 'daily' },
      { path: '/blog', priority: '0.8', freq: 'weekly' },
      { path: '/about', priority: '0.7', freq: 'monthly' },
      { path: '/terms', priority: '0.3', freq: 'yearly' },
      { path: '/privacy', priority: '0.3', freq: 'yearly' },
      { path: '/returns', priority: '0.5', freq: 'monthly' },
      { path: '/cookies', priority: '0.3', freq: 'yearly' },
      { path: '/contact', priority: '0.6', freq: 'yearly' }
    ];
    const currentDate = new Date().toISOString().split('T')[0];

    staticRoutes.forEach(route => {
       xml += `
  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.freq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
    });

    // Dynamic Products
    if(Array.isArray(products)) {
        products.forEach(p => {
            const date = p.created_at ? p.created_at.split('T')[0] : currentDate;
            const identifier = p.slug || p.id;
            xml += `
  <url>
    <loc>${BASE_URL}/product/${identifier}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
        });
    }

    // Dynamic Blog Posts
    if(Array.isArray(posts)) {
        posts.forEach(p => {
            const date = p.date ? p.date.split('T')[0] : currentDate;
            xml += `
  <url>
    <loc>${BASE_URL}/blog/${p.slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
        });
    }

    // Categories
    if(Array.isArray(categories)) {
        categories.forEach(c => {
            xml += `
  <url>
    <loc>${BASE_URL}/shop?cat=${c.key}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });
    }

    xml += `
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
    res.status(200).send(xml);

  } catch (e) {
    console.error("[Sitemap API] Generation Error:", e);
    res.status(500).json({ error: e.message });
  }
}
