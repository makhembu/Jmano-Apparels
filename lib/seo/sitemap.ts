
import { api } from '../db';

const BASE_URL = 'https://jamboapparels.com';

export const generateSitemap = async () => {
  const [products, posts, categories] = await Promise.all([
    api.getProducts(),
    api.getBlogPosts(),
    api.getCategories()
  ]);

  const staticRoutes = [
    '',
    '/shop',
    '/about',
    '/blog',
    '/terms',
    '/privacy',
    '/returns',
    '/cookies',
    '/contact'
  ];

  const currentDate = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // 1. Static Routes
  staticRoutes.forEach(route => {
    xml += `
  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`;
  });

  // 2. Products
  products.filter(p => p.isPublished !== false).forEach(p => {
    xml += `
  <url>
    <loc>${BASE_URL}/product/${p.slug || p.id}</loc>
    <lastmod>${new Date(p.createdAt || Date.now()).toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
  });

  // 3. Blog Posts
  posts.filter(p => p.status === 'published').forEach(p => {
    xml += `
  <url>
    <loc>${BASE_URL}/blog/${p.slug}</loc>
    <lastmod>${new Date(p.createdAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  // 4. Categories
  categories.forEach(c => {
    xml += `
  <url>
    <loc>${BASE_URL}/shop?cat=${c.key}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  xml += `
</urlset>`;

  return xml;
};

export const generateRobotsTxt = () => {
  return `User-agent: *
Allow: /

# Prevent crawling of admin and sensitive user areas
Disallow: /admin/
Disallow: /dashboard/
Disallow: /checkout/
Disallow: /cart/
Disallow: /login/
Disallow: /forgot-password/
Disallow: /update-password/

# Sitemap location
Sitemap: https://jamboapparels.com/sitemap.xml
`;
};