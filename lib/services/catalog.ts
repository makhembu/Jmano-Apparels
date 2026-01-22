import { supabase } from '../supabaseClient';
import { Mappers } from '../mappers';
import { log } from '../logger';
import { Product, Category, ProductReview, DbProduct, DbCategory } from '../../types';

export class ProductService {
  async getAll(): Promise<Product[]> {
    log('SELECT', 'products');
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data as DbProduct[]).map(Mappers.toProduct);
  }

  async getById(id: string): Promise<Product | null> {
    log('SELECT', 'products', id);
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) return null;
    return Mappers.toProduct(data as DbProduct);
  }

  async create(product: Partial<Product>): Promise<void> {
    log('INSERT', 'products', product);
    const dbProduct = this.prepareDbProduct(product);
    const { error } = await supabase.from('products').insert(dbProduct);
    if (error) throw error;
  }

  async update(id: string, product: Partial<Product>): Promise<void> {
    log('UPDATE', 'products', id);
    const dbProduct = this.prepareDbProduct(product);
    const { error } = await supabase.from('products').update(dbProduct).eq('id', id);
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
      image: product.image,
      description: product.description,
      sizes: product.sizes,
      colors: product.colors,
      tags: product.tags,
      is_featured: product.isFeatured,
      sku: product.sku,
      slug: product.slug,
      stock_quantity: product.stockQuantity,
      low_stock_threshold: product.lowStockThreshold,
      weight: product.weight,
      seo_title: product.seoTitle,
      seo_description: product.seoDescription
    };
  }
}

export class CategoryService {
  async getAll(): Promise<Category[]> {
    log('SELECT', 'categories');
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    return (data as DbCategory[]).map(Mappers.toCategory);
  }
}

export class ReviewService {
  async getByProduct(productId: string): Promise<ProductReview[]> {
    log('SELECT', 'product_reviews', productId);
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return (data as any[]).map(Mappers.toProductReview);
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
      is_approved: true // Default to true for prototype so reviews appear immediately
    });
    if (error) throw error;
  }
}