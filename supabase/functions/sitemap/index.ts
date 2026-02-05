
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

serve(async (req) => {
  // Fix: Explicitly return 200 OK for OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const sbUrl = Deno.env.get('SUPABASE_URL');
    const sbAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_DEFAULT_KEY');

    const supabaseClient = createClient(
      sbUrl ?? '',
      sbAnonKey ?? ''
    );

    const BASE_URL = 'https://jamboapparels.com';

    const [products, posts, categories] = await Promise.all([
        supabaseClient.from('products').select('id, slug, created_at, is_published').eq('is_published', true),
        supabaseClient.from('blog_posts').select('slug, created_at, status').eq('status', 'published'),
        supabaseClient.from('categories').select('key')
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    const staticRoutes = ['', '/shop', '/about', '/blog', '/terms', '/privacy', '/returns', '/cookies', '/contact'];
    const currentDate = new Date().toISOString().split('T')[0];

    staticRoutes.forEach(route => {
       xml += `\n  <url>\n    <loc>${BASE_URL}${route}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${route === '' ? '1.0' : '0.8'}</priority>\n  </url>`;
    });

    products.data?.forEach((p: any) => {
       const date = p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : currentDate;
       const identifier = p.slug || p.id;
       xml += `\n  <url>\n    <loc>${BASE_URL}/product/${identifier}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`;
    });

    posts.data?.forEach((p: any) => {
       const date = p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : currentDate;
       xml += `\n  <url>\n    <loc>${BASE_URL}/blog/${p.slug}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
    });

    categories.data?.forEach((c: any) => {
       xml += `\n  <url>\n    <loc>${BASE_URL}/shop?cat=${c.key}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
    });

    xml += `\n</urlset>`;

    return new Response(xml, {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
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
