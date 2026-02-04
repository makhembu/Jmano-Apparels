import { supabase } from './supabaseClient';
import { 
  Product, Category, AppSettings, BlogPost, User, Order, ProductReview, 
  ShippingAddress, CartItem, BlogCategory, ShippingZone, DiscountCode, 
  UserAddress, EmailTemplate, AnalyticsOverview, DailyAnalytics, ProductPerformance, TrafficSource, GeoStat, PageStat, LiveVisitor
} from '../types';

import { ProductService, CategoryService, ReviewService, ProductFilters } from './services/catalog';
import { OrderService, CartService, ShippingService, DiscountService } from './services/commerce';
import { BlogService, SettingsService, SupportService } from './services/content';
import { UserService, WishlistService } from './services/user';
import { StorageService } from './services/storage';
import { Mappers } from './mappers';

// Instantiate Services
const productService = new ProductService();
const categoryService = new CategoryService();
const reviewService = new ReviewService();
const orderService = new OrderService();
const cartService = new CartService();
const shippingService = new ShippingService();
const discountService = new DiscountService();
const blogService = new BlogService();
const settingsService = new SettingsService();
const supportService = new SupportService();
const userService = new UserService();
const wishlistService = new WishlistService();
const storageService = new StorageService();

// Helper for hybrid routing redirect
const getRedirectUrl = () => {
  const isProd = window.location.hostname === 'jamboapparels.com' || window.location.hostname === 'www.jamboapparels.com';
  return `${window.location.origin}${isProd ? '' : '/#'}/update-password`;
};

export const api = {
  // Catalog
  getProducts: () => productService.getAll(),
  getPaginatedProducts: (page: number, size: number, filters: ProductFilters) => productService.getPaginated(page, size, filters),
  getProductById: (id: string) => productService.getById(id),
  adminCreateProduct: (p: Partial<Product>) => productService.create(p),
  adminUpdateProduct: (id: string, p: Partial<Product>) => productService.update(id, p),
  adminDeleteProduct: (id: string) => productService.delete(id),
  adminBulkUpdateProducts: async (ids: string[], updates: Partial<Product>) => {
    for (const id of ids) {
      await productService.update(id, updates);
    }
  },
  adminBulkDeleteProducts: async (ids: string[]) => {
    for (const id of ids) {
      await productService.delete(id);
    }
  },

  getCategories: () => categoryService.getAll(),
  createCategory: (c: Category) => categoryService.create(c),
  updateCategory: (key: string, c: Partial<Category>) => categoryService.update(key, c),
  deleteCategory: (key: string) => categoryService.delete(key),

  getProductReviews: (productId: string) => reviewService.getByProduct(productId),
  getRecentReviews: (limit: number) => reviewService.getRecent(limit),
  addProductReview: (review: Partial<ProductReview>) => reviewService.add(review),

  // Commerce
  getUserOrders: (userId: string) => orderService.getUserOrders(userId),
  getOrders: (userId: string) => orderService.getUserOrders(userId),
  getAllOrders: (limit?: number) => orderService.getAll(limit),
  
  // SCALABILITY FIX: Paginated Orders
  getOrdersPaginated: async (page: number = 1, limit: number = 20, status: string = 'ALL') => {
    const { data, error } = await supabase.rpc('get_orders_paginated', {
      page_num: page,
      page_size: limit,
      status_filter: status === 'ALL' ? null : status
    });
    if (error) throw error;
    
    // Map raw JSONB to Order objects
    const orders = (data.data || []).map((o: any) => Mappers.toOrder(o));
    
    return {
      data: orders as Order[],
      total: data.total || 0,
      page: data.page || 1,
      totalPages: data.totalPages || 1
    };
  },

  getOrderById: (id: string) => orderService.getById(id),
  createOrder: (order: Partial<Order> & { shippingAddress: ShippingAddress }) => orderService.create(order),
  adminUpdateOrder: (id: string, updates: any) => orderService.update(id, updates),
  cancelOrder: (orderId: string, userId: string) => orderService.cancelOrder(orderId, userId),

  fetchCart: (userId: string) => cartService.fetch(userId),
  syncCart: (userId: string, items: CartItem[]) => cartService.sync(userId, items),

  getShippingZones: () => shippingService.getZones(),
  createShippingZone: (z: Partial<ShippingZone>) => shippingService.createZone(z),
  updateShippingZone: (id: string, z: Partial<ShippingZone>) => shippingService.updateZone(id, z),
  deleteShippingZone: (id: string) => shippingService.deleteZone(id),

  getDiscountCodes: () => discountService.getAll(),
  validateDiscountCode: (code: string, total: number) => discountService.validate(code, total),
  createDiscountCode: (d: Partial<DiscountCode>) => discountService.create(d),
  updateDiscountCode: (id: string, d: Partial<DiscountCode>) => discountService.update(id, d),
  deleteDiscountCode: (id: string) => discountService.delete(id),

  // Content
  getBlogPosts: () => blogService.getAllPosts(),
  getBlogPostBySlug: (slug: string) => blogService.getPostBySlug(slug),
  getBlogCategories: () => blogService.getCategories(),
  createBlogCategory: (c: Partial<BlogCategory>) => blogService.createCategory(c),
  deleteBlogCategory: (id: string) => blogService.deleteCategory(id),
  adminCreateBlogPost: (p: Partial<BlogPost>) => blogService.createPost(p),
  adminUpdateBlogPost: (id: string, p: Partial<BlogPost>) => blogService.updatePost(id, p),
  adminDeleteBlogPost: (id: string) => blogService.deletePost(id),
  incrementBlogPostView: (id: string) => blogService.incrementViewCount(id),

  getAppSettings: () => settingsService.get(),
  getAdminSettings: () => settingsService.getAdminSettings(),
  updateAppSettings: (id: number, s: Partial<AppSettings>) => settingsService.update(id, s),
  getPublicPaymentSettings: () => settingsService.getPublicPaymentSettings(),
  getEmailTemplates: () => settingsService.getEmailTemplates(),
  updateEmailTemplate: (id: string, t: Partial<EmailTemplate>) => settingsService.updateEmailTemplate(id, t),
  sendTestEmail: (to: string, subject: string, body: string) => settingsService.sendTestTemplate(to, subject, body),
  checkEmailHealth: (email: string) => settingsService.checkEmailHealth(email),

  // Support / Marketing
  subscribeToNewsletter: (email: string) => supportService.subscribeNewsletter(email),
  submitContact: (data: any) => supportService.submitContact(data),
  getNewsletterSubscribers: () => supportService.getNewsletterSubscribers(),
  deleteNewsletterSubscriber: (id: string) => supportService.deleteNewsletterSubscriber(id),
  getContactSubmissions: () => supportService.getContactSubmissions(),
  markContactAsRead: (id: string) => supportService.markContactSubmissionAsRead(id),
  deleteContactSubmission: (id: string) => supportService.deleteContactSubmission(id),

  // User
  getAllUsers: () => userService.getAll(),
  
  // SCALABILITY FIX: Paginated Users
  getPaginatedUsers: async (page: number = 1, limit: number = 20, search: string = '') => {
    const { data, error } = await supabase.rpc('get_users_paginated', {
        page_num: page,
        page_size: limit,
        search_term: search || null
    });
    if (error) throw error;
    
    // Map raw JSON to User objects
    const users = (data.data || []).map((u: any) => Mappers.toUser(u));
    
    return {
        data: users as User[],
        total: data.total || 0,
        page: data.page || 1,
        totalPages: data.totalPages || 1
    };
  },

  getUserProfile: (id: string) => userService.getProfile(id),
  updateUserProfile: (id: string, data: any) => userService.updateProfile(id, data),
  createUserProfile: (data: any) => userService.createProfile(data),
  updateUserPassword: async (password: string) => {
    const { error } = await (supabase.auth as any).updateUser({ password });
    if (error) throw error;
  },
  requestPasswordReset: async (email: string) => {
    const { error } = await (supabase.auth as any).resetPasswordForEmail(email, { redirectTo: getRedirectUrl() });
    if (error) throw error;
  },
  adminDeleteUser: (id: string) => userService.deleteUser(id),
  adminSendPasswordReset: async (email: string) => {
    const { error } = await (supabase.auth as any).resetPasswordForEmail(email);
    if (error) throw error;
  },
  adminSendMagicLink: async (email: string) => {
    const { error } = await (supabase.auth as any).signInWithOtp({ email });
    if (error) throw error;
  },
  
  deleteUserAccount: async (userId: string) => {
    return await supabase.rpc('anonymize_and_delete_user', { target_user_id: userId });
  },

  getUserAddresses: (userId: string) => userService.getUserAddresses(userId),
  saveUserAddress: (userId: string, address: any) => userService.saveUserAddress(userId, address),
  deleteUserAddress: (id: string) => userService.deleteUserAddress(id),

  getWishlist: (userId: string) => wishlistService.getIds(userId),
  getWishlistProducts: (userId: string) => wishlistService.getProducts(userId),
  toggleWishlist: (userId: string, productId: string) => wishlistService.toggle(userId, productId),

  // Storage
  uploadImage: (file: File) => storageService.uploadImage(file),

  // Analytics
  getAnalyticsOverview: async (start: Date, end: Date): Promise<AnalyticsOverview> => {
    const { data, error } = await supabase.rpc('get_analytics_overview', {
      time_range_start: start.toISOString(),
      time_range_end: end.toISOString()
    });
    if (error) {
        console.error("Analytics Error", error);
        return { visitors: 0, pageviews: 0, orders: 0, revenue: 0, conversion_rate: 0 };
    }
    return data as unknown as AnalyticsOverview;
  },

  // SCALABILITY FIX: Fast Admin Dashboard Stats
  getAdminDashboardStats: async () => {
    const { data, error } = await supabase.rpc('get_admin_stats');
    if (error) throw error;
    return data as {
        revenue: number;
        orders: number;
        users: number;
        products: number;
        low_stock: number;
        pending_orders: number;
    };
  },

  getDailyAnalytics: async (days: number): Promise<DailyAnalytics[]> => {
    const { data, error } = await supabase.rpc('get_daily_analytics', { days_lookback: days });
    if (error) {
        console.error("Analytics Error", error);
        return [];
    }
    return data as unknown as DailyAnalytics[];
  },

  getProductAnalytics: async (days: number = 30): Promise<ProductPerformance[]> => {
    const { data, error } = await supabase.rpc('get_product_analytics', { limit_count: 8, days_lookback: days });
    if (error) {
        console.error("Analytics Error", error);
        return [];
    }
    return data as unknown as ProductPerformance[];
  },

  getTrafficSources: async (days: number): Promise<TrafficSource[]> => {
    const { data, error } = await supabase.rpc('get_traffic_sources', { days_lookback: days });
    if (error) {
      console.error("Analytics Error", error);
      return [];
    }
    return data as unknown as TrafficSource[];
  },

  getGeoStats: async (days: number): Promise<GeoStat[]> => {
    const { data, error } = await supabase.rpc('get_geo_stats', { days_lookback: days });
    if (error) { console.error("Analytics Error", error); return []; }
    return data as unknown as GeoStat[];
  },

  getPagePerformance: async (days: number): Promise<PageStat[]> => {
    const { data, error } = await supabase.rpc('get_page_analytics', { days_lookback: days });
    if (error) { console.error("Analytics Error", error); return []; }
    return data as unknown as PageStat[];
  },

  getLiveVisitors: async (lookback_minutes: number = 5): Promise<LiveVisitor[]> => {
    const { data, error } = await supabase.rpc('get_live_visitors', { lookback_minutes });
    if (error) { console.error("Analytics Error", error); return []; }
    return data as unknown as LiveVisitor[];
  }
};