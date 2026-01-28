
export default async function handler(req, res) {
  // Try standard, Vite-prefixed, or the specific custom variable from the user's Vercel settings
  let url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  
  // Ensure protocol is present
  if (url && !url.startsWith('http')) {
      url = `https://${url}`;
  }
  
  const supabaseUrl = url;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  const BASE_URL = 'https://jamboapparels.com';

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase Environment Variables Missing. Available keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
    return res.status(500).json({ 
      error: 'Supabase environment variables missing in Vercel project.',
      debug: 'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY (or VITE_SUPABASE_ANON_KEY) are set in Vercel.'
    });
  }

  const fetchOpts = {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  };

  try {
    // Parallel fetch using Supabase REST API (No SDK required here to keep it lightweight)
    const [productsRes, postsRes, catsRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/products?select=id,created_at,is_published&is_published=eq.true`, fetchOpts),
      fetch(`${supabaseUrl}/rest/v1/blog_posts?select=slug,created_at,status&status=eq.published`, fetchOpts),
      fetch(`${supabaseUrl}/rest/v1/categories?select=key`, fetchOpts)
    ]);

    const products = await productsRes.json();
    const posts = await postsRes.json();
    const categories = await catsRes.json();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Static Routes
    const staticRoutes = ['', '/shop', '/about', '/blog', '/terms', '/privacy', '/returns', '/cookies', '/contact'];
    const currentDate = new Date().toISOString().split('T')[0];

    staticRoutes.forEach(route => {
       xml += `
  <url>
    <loc>${BASE_URL}/#${route}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`;
    });

    // Dynamic Products
    if(Array.isArray(products)) {
        products.forEach(p => {
            const date = p.created_at ? p.created_at.split('T')[0] : currentDate;
            xml += `
  <url>
    <loc>${BASE_URL}/#/product/${p.id}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
        });
    }

    // Dynamic Blog Posts
    if(Array.isArray(posts)) {
        posts.forEach(p => {
            const date = p.created_at ? p.created_at.split('T')[0] : currentDate;
            xml += `
  <url>
    <loc>${BASE_URL}/#/blog/${p.slug}</loc>
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
    <loc>${BASE_URL}/#/shop?cat=${c.key}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });
    }

    xml += `
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    // Cache for 1 hour (3600s) on CDN, staled response allowed while revalidating
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
    res.status(200).send(xml);

  } catch (e) {
    console.error("Sitemap Error:", e);
    res.status(500).json({ error: e.message });
  }
}
