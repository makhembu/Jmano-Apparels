
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  try {
    // 1. Initialize Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const BASE_URL = 'https://jamboapparels.com';

    // 2. Fetch Data Parallel
    const [products, posts, categories] = await Promise.all([
        supabaseClient.from('products').select('id, created_at, is_published').eq('is_published', true),
        supabaseClient.from('blog_posts').select('slug, created_at, status').eq('status', 'published'),
        supabaseClient.from('categories').select('key')
    ]);

    // 3. Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Static Routes
    const staticRoutes = ['', '/shop', '/about', '/blog', '/terms', '/privacy', '/returns', '/cookies', '/contact'];
    const currentDate = new Date().toISOString().split('T')[0];

    staticRoutes.forEach(route => {
       // Note: Using HashRouter paths as per app configuration
       xml += `
  <url>
    <loc>${BASE_URL}/#${route}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`;
    });

    // Dynamic Products
    products.data?.forEach((p: any) => {
       const date = p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : currentDate;
       xml += `
  <url>
    <loc>${BASE_URL}/#/product/${p.id}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    // Dynamic Blog Posts
    posts.data?.forEach((p: any) => {
       const date = p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : currentDate;
       xml += `
  <url>
    <loc>${BASE_URL}/#/blog/${p.slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // Categories
    categories.data?.forEach((c: any) => {
       xml += `
  <url>
    <loc>${BASE_URL}/#/shop?cat=${c.key}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    // 4. Return XML Response
    return new Response(xml, {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600' // Cache for 1 hour
      },
      status: 200,
    });

  } catch (error: any) {
    console.error("Sitemap generation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});