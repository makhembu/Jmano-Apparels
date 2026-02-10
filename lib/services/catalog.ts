import { supabase } from '../supabaseClient';
import { supabasePublic } from '../supabasePublicClient';
import { Mappers } from '../mappers';
import { log } from '../logger';
import { Product, Category, ProductReview, DbProduct, DbCategory } from '../../types';

export interface ProductFilters {
  categoryKey?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'low-high' | 'high-low';
  adminMode?: boolean; // For admin panel to fetch unpublished items
}

export interface PaginatedResult {
  data: Product[];
  total: number;
  hasMore: boolean;
  page: number;
}

export class ProductService {
  // Legacy method kept for Admin/Home compatibility, but restricted
  async getAll(): Promise<Product[]> {
    log('SELECT', 'products', 'ALL');
    // Use public client for reading products
    const { data, error } = await supabasePublic.from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return ((data || []) as DbProduct[]).map(Mappers.toProduct);
  }

  // New: Get Top Selling Products (Source of Truth: Products Table)
  async getTopSellers(limit: number = 5): Promise<Product[]> {
    log('SELECT', 'products', `ORDER BY total_sales DESC LIMIT ${limit}`);
    const { data, error } = await supabasePublic
      .from('products')
      .select('*')
      .order('total_sales', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return ((data || []) as DbProduct[]).map(Mappers.toProduct);
  }

  // Replaced RPC with Supabase-js query builder to ensure all fields (incl. slug) are returned
  async getPaginated(page: number = 1, pageSize: number = 12, filters: ProductFilters = {}): Promise<PaginatedResult> {
    log('SELECT', 'products (paginated)', { page, ...filters });

    const client = filters.adminMode ? supabase : supabasePublic;

    let query = client
      .from('products')
      .select('*', { count: 'exact' });

    // Filter by published status for public-facing shop
    if (!filters.adminMode) {
      query = query.eq('is_published', true);
    }
    
    // Apply filters
    if (filters.categoryKey) {
      query = query.eq('category_key', filters.categoryKey);
    }
    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }
    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    // Apply sorting
    const sortMap = {
      'newest': { column: 'created_at', ascending: false },
      'low-high': { column: 'price', ascending: true },
      'high-low': { column: 'price', ascending: false },
    };
    const sort = sortMap[filters.sortBy || 'newest'];
    query = query.order(sort.column, { ascending: sort.ascending, nullsFirst: false });

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize - 1;
    query = query.range(startIndex, endIndex);

    const { data, error, count } = await query;
    if (error) throw error;

    const mappedProducts = (data || []).map(Mappers.toProduct);
    const total = count || 0;

    return {
      data: mappedProducts,
      total: total,
      hasMore: endIndex < total - 1,
      page: page,
    };
  }

  async getById(id: string): Promise<Product | null> {
    log('SELECT', 'products', id);
    // Use public client
    const { data, error } = await supabasePublic.from('products').select('*').eq('id', id).single();
    if (error) return null;
    return Mappers.toProduct(data as any);
  }

  async create(product: Partial<Product>): Promise<void> {
    log('INSERT', 'products', product);
    const dbProduct = this.prepareDbProduct(product);
    
    const { error } = await supabase.from('products').insert(dbProduct as any);
    if (error) throw error;
  }

  async update(id: string, product: Partial<Product>): Promise<void> {
    log('UPDATE', 'products', id);
    const dbProduct = this.prepareDbProduct(product);
    
    const { error } = await supabase.from('products').update(dbProduct as any).eq('id', id);
    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    log('DELETE', 'products', id);
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  }

  private prepareDbProduct(product: Partial<Product>) {
    return {
      title: product.title,
      price: product.price,
      sale_price: product.salePrice,
      is_on_sale: product.isOnSale,
      category_key: product.categoryKey,
      images: product.images,
      description: product.description,
      sizes: product.sizes,
      colors: product.colors,
      tags: product.tags,
      is_featured: product.isFeatured,
      is_published: product.isPublished,
      sku: product.sku,
      slug: product.slug,
      stock_quantity: product.stockQuantity,
      low_stock_threshold: product.lowStockThreshold,
      weight: product.weight,
      is_free_shipping: product.isFreeShipping,
      
      // SEO
      seo_title: product.seoTitle,
      seo_description: product.seoDescription,
      canonical_url: product.canonicalUrl,
      is_noindex: product.isNoIndex,
      is_nofollow: product.isNoFollow,
      keywords: product.keywords
    };
  }
}

export class CategoryService {
  async getAll(): Promise<Category[]> {
    log('SELECT', 'categories');
    // Use public client
    const { data, error } = await supabasePublic.from('categories').select('*');
    if (error) throw error;
    return ((data || []) as any[]).map(Mappers.toCategory);
  }

  async create(category: Category): Promise<void> {
    log('INSERT', 'categories', category);
    const { error } = await supabase.from('categories').insert({
      key: category.key,
      label: category.label,
      color: category.color,
      bg_class: category.bgColorClass,
      // SEO (Partial support in creation for now)
      seo_title: category.seoTitle,
      seo_description: category.seoDescription
    } as any);
    if (error) throw error;
  }

  async update(key: string, category: Partial<Category>): Promise<void> {
    log('UPDATE', 'categories', key);
    const { error } = await supabase.from('categories').update({
      label: category.label,
      color: category.color,
      bg_class: category.bgColorClass,
      seo_title: category.seoTitle,
      seo_description: category.seoDescription
    } as any).eq('key', key);
    if (error) throw error;
  }

  async delete(key: string): Promise<void> {
    log('DELETE', 'categories', key);
    const { error } = await supabase.from('categories').delete().eq('key', key);
    if (error) throw error;
  }
}

export class ReviewService {
  async getByProduct(productId: string): Promise<ProductReview[]> {
    log('SELECT', 'product_reviews', productId);
    // Use public client
    const { data, error } = await supabasePublic
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return ((data || []) as any[]).map(Mappers.toProductReview);
  }

  async getRecent(limit: number = 5): Promise<ProductReview[]> {
    log('SELECT', 'product_reviews', `LIMIT ${limit}`);
    // Use public client
    const { data, error } = await supabasePublic
      .from('product_reviews')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return ((data || []) as any[]).map(Mappers.toProductReview);
  }

  async add(review: Partial<ProductReview>): Promise<void> {
    log('INSERT', 'product_reviews', review);
    const { error } = await supabase.from('product_reviews').insert({
      product_id: review.productId,
      user_id: review.userId,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      verified_purchase: review.verifiedPurchase,
      is_approved: true // Default to true for prototype
    } as any);
    if (error) throw error;
  }
}