
import { supabase } from './supabaseClient';
import { 
  Product, Category, AppSettings, BlogPost, User, Order, ProductReview, 
  ShippingAddress, CartItem, BlogCategory, ShippingZone, DiscountCode, 
  UserAddress, EmailTemplate, AnalyticsOverview, DailyAnalytics, ProductPerformance, TrafficSource, GeoStat, PageStat, LiveVisitor, ShippingOption
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
  
  getOrdersPaginated: async (page: number = 1, limit: number = 20, status: string = 'ALL') => {
    const { data, error } = await (supabase.rpc as any)('get_orders_paginated', {
      page_num: Number(page),
      page_size: Number(limit),
      status_filter: (status === 'ALL' || !status) ? null : status
    });
    if (error) throw error;
    
    const responseData = data as any;
    const orders = (responseData.data || []).map((o: any) => Mappers.toOrder(o));
    
    return {
      data: orders as Order[],
      total: responseData.total || 0,
      page: responseData.page || 1,
      totalPages: responseData.totalPages || 1
    };
  },

  getAdminPaymentsPaginated: async (page: number, limit: number, status: string, method: string) => {
    const { data, error } = await (supabase.rpc as any)('get_admin_payments_paginated', {
      p_page: page,
      p_page_size: limit,
      p_status: status,
      p_method: method
    });
    if (error) throw error;
    
    const responseData = data as any;
    const orders = (responseData.data || []).map((o: any) => Mappers.toOrder(o));
    
    return {
      data: orders as Order[],
      stats: responseData.stats,
      total: responseData.total || 0,
      totalPages: responseData.totalPages || 1
    };
  },

  getLowStockProducts: async (limit: number = 5) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('stock_quantity', { ascending: true })
      .limit(20); 

    if (error) throw error;

    return (data || [])
      .filter((p: any) => (p.stock_quantity ?? 0) <= (p.low_stock_threshold ?? 5))
      .slice(0, limit)
      .map(Mappers.toProduct);
  },

  getTopSellingProducts: (limit: number = 5) => productService.getTopSellers(limit),

  getOrderById: (id: string) => orderService.getById(id),
  createOrder: (order: Partial<Order> & { shippingAddress: ShippingAddress }) => orderService.create(order),
  adminUpdateOrder: (id: string, updates: any) => orderService.update(id, updates),
  cancelOrder: (orderId: string, userId: string) => orderService.cancelOrder(orderId, userId),
  
  cancelAndRestoreStock: async (orderId: string, userId: string) => {
      const { data, error } = await (supabase.rpc as any)('cancel_and_restore_stock', { 
        p_order_id: orderId, 
        p_user_id: userId 
      });
      if (error) throw error;
      if (data && (data as any).success === false) throw new Error((data as any).error || 'Restoration failed');
      return { success: true };
  },

  requestReturn: async (orderId: string, userId: string, reason: string) => {
    const { error } = await (supabase
      .from('orders') as any)
      .update({
        status: 'Return Requested',
        return_reason: reason,
        return_requested_at: new Date().toISOString(),
        return_status: 'requested'
      })
      .match({ id: orderId, user_id: userId });
    
    if (error) throw error;

    try {
      const order = await orderService.getById(orderId);
      const settings = await settingsService.get();
      
      if (order && order.customerEmail) {
         settingsService.sendTransactionalEmail('return_requested', order.customerEmail, {
             '{{name}}': order.customerName || 'Customer',
             '{{order_number}}': order.orderNumber,
             '{{return_reason}}': reason
         });
         
         if (settings?.contactEmail) {
             settingsService.sendTransactionalEmail('admin_return_alert', settings.contactEmail, {
                 '{{customer_name}}': order.customerName || 'Customer',
                 '{{order_number}}': order.orderNumber,
                 '{{return_reason}}': reason,
                 '{{admin_link}}': `https://jamboapparels.com/admin/orders/${orderId}`
             });
         }
      }
    } catch (e) {
      console.error("Failed to send return email", e);
    }

    return { success: true };
  },

  adminProcessReturn: async (orderId: string, returnStatus: any, notes?: string) => {
    const statusMap: Record<string, string> = {
      'approved': 'Return Approved',
      'rejected': 'Return Rejected',
      'completed': 'Returned'
    };
    
    const updates: any = { return_status: returnStatus };
    if (statusMap[returnStatus]) {
      updates.status = statusMap[returnStatus];
    }
    if (notes) {
      updates.notes = notes;
    }

    const { error } = await (supabase.from('orders') as any).update(updates).eq('id', orderId);
    if (error) throw error;

    try {
      const order = await orderService.getById(orderId);
      if (order && order.customerEmail) {
          if (returnStatus === 'approved') {
              settingsService.sendTransactionalEmail('return_approved', order.customerEmail, {
                  '{{name}}': order.customerName || 'Customer',
                  '{{order_number}}': order.orderNumber
              });
          } else if (returnStatus === 'rejected') {
              settingsService.sendTransactionalEmail('return_rejected', order.customerEmail, {
                  '{{name}}': order.customerName || 'Customer',
                  '{{order_number}}': order.orderNumber,
                  '{{rejection_reason}}': notes || 'Return criteria not met.'
              });
          }
      }
    } catch (e) {
      console.error("Failed to send return decision email", e);
    }

    return { success: true };
  },

  issueFullRefund: async (orderId: string) => {
    const response = await fetch('/api/paypal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'refund', orderId })
    });
    
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Refund failed');
    }

    try {
      const order = await orderService.getById(orderId);
      if (order && order.customerEmail) {
          settingsService.sendTransactionalEmail('order_refunded', order.customerEmail, {
              '{{name}}': order.customerName || 'Customer',
              '{{order_number}}': order.orderNumber
          });
      }
    } catch (e) {
      console.error("Failed to send refund email", e);
    }

    return data;
  },

  fetchCart: (userId: string) => cartService.fetch(userId),
  syncCart: (userId: string, items: CartItem[]) => cartService.sync(userId, items),

  getShippingZones: () => shippingService.getZones(),
  createShippingZone: (z: Partial<ShippingZone>) => shippingService.createZone(z),
  updateShippingZone: (id: string, z: Partial<ShippingZone>) => shippingService.updateZone(id, z),
  deleteShippingZone: (id: string) => shippingService.deleteZone(id),
  addShippingOption: (zoneId: string, option: Partial<ShippingOption>) => shippingService.addOption(zoneId, option),
  deleteShippingOption: (id: string) => shippingService.deleteOption(id),

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
  adminBulkUpdateBlogPosts: async (ids: string[], updates: Partial<BlogPost>) => {
    for (const id of ids) await blogService.updatePost(id, updates);
  },
  adminBulkDeleteBlogPosts: async (ids: string[]) => {
    for (const id of ids) await blogService.deletePost(id);
  },
  incrementBlogPostView: (id: string) => blogService.incrementViewCount(id),
  incrementBlogPostLike: async (postId: string) => {
    const { data, error } = await (supabase.rpc as any)('increment_blog_like', { post_id_to_inc: postId });
    if (error) throw error;
    return data;
  },
  getBlogComments: async (postId: string) => {
    const { data, error } = await supabase
      .from('blog_comments')
      .select('*, user:users(name)')
      .eq('post_id', postId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as any[];
  },
  addBlogComment: async (postId: string, userId: string, comment: string): Promise<void> => {
    const { error } = await (supabase.from('blog_comments') as any).insert({
      post_id: postId,
      user_id: userId,
      comment: comment
    });
    if (error) throw error;
  },

  getAppSettings: () => settingsService.get(),
  getAdminSettings: () => settingsService.getAdminSettings(),
  updateAppSettings: (id: number, s: Partial<AppSettings>) => settingsService.update(id, s),
  getPublicPaymentSettings: () => settingsService.getPublicPaymentSettings(),
  getEmailTemplates: () => settingsService.getEmailTemplates(),
  updateEmailTemplate: (id: string, t: Partial<EmailTemplate>) => settingsService.updateEmailTemplate(id, t),
  // FIX: Changed settingsService.sendTestEmail to settingsService.sendTestTemplate
  sendTestEmail: (to: string, subject: string, body: string) => settingsService.sendTestTemplate(to, subject, body),
  checkEmailHealth: (email: string, key?: string, from?: string) => settingsService.checkEmailHealth(email, key, from),
  sendTransactionalEmail: (templateName: string, recipient: string, vars: Record<string, string>) => settingsService.sendTransactionalEmail(templateName, recipient, vars),

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
  getPublicUsers: () => userService.getPublicProfiles(),
  
  getPaginatedUsers: async (page: number = 1, limit: number = 20, search: string = '') => {
    const { data, error } = await (supabase.rpc as any)('get_users_paginated', {
        page_num: page,
        page_size: limit,
        search_term: search || null
    });
    if (error) throw error;
    
    const responseData = data as any;
    const users = (responseData.data || []).map((u: any) => Mappers.toUser(u));
    
    return {
        data: users as User[],
        total: responseData.total || 0,
        page: responseData.page || 1,
        totalPages: responseData.totalPages || 1
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
  
  getUserActivity: async (userId: string, limit: number = 50) => {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      created_at: row.created_at,
      eventType: row.event_type,
      path: row.path,
      metadata: row.metadata,
      duration: row.duration,
      geo_country: row.geo_country,
      geo_city: row.geo_city,
    }));
  },

  deleteUserAccount: async (userId: string) => {
    return await (supabase.rpc as any)('anonymize_and_delete_user', { target_user_id: userId });
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
    const { data, error } = await (supabase.rpc as any)('get_analytics_overview', {
      time_range_start: start.toISOString(),
      time_range_end: end.toISOString()
    });
    if (error) {
        console.error("Analytics Error", error);
        return { visitors: 0, pageviews: 0, orders: 0, revenue: 0, conversion_rate: 0 };
    }
    return data as unknown as AnalyticsOverview;
  },

  getAdminDashboardStats: async () => {
    const { data, error } = await (supabase.rpc as any)('get_admin_stats');
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
  
  getAdminProductStats: async (productId: string) => {
    const { data, error } = await (supabase.rpc as any)('get_product_sales_stats', { p_product_id: productId });
    if (error) throw error;
    const rpcData = data as any;
    const stats = {
        revenue: rpcData.stats.revenue || 0,
        unitsSold: rpcData.stats.unitsSold || 0,
        orderCount: rpcData.stats.orderCount || 0
    };
    const recentOrders = (rpcData.recentOrders || []).map(Mappers.toOrder);
    return { stats, recentOrders };
  },

  getDailyAnalytics: async (days: number): Promise<DailyAnalytics[]> => {
    const { data, error } = await (supabase.rpc as any)('get_daily_analytics', { days_lookback: days });
    if (error) {
        console.error("Analytics Error", error);
        return [];
    }
    return data as unknown as DailyAnalytics[];
  },

  getProductAnalytics: async (days: number = 30): Promise<ProductPerformance[]> => {
    const { data, error } = await (supabase.rpc as any)('get_product_analytics', { limit_count: 8, days_lookback: days });
    if (error) {
        console.error("Analytics Error", error);
        return [];
    }
    return data as unknown as ProductPerformance[];
  },

  getTrafficSources: async (days: number): Promise<TrafficSource[]> => {
    const { data, error } = await (supabase.rpc as any)('get_traffic_sources', { days_lookback: days });
    if (error) {
      console.error("Analytics Error", error);
      return [];
    }
    return data as unknown as TrafficSource[];
  },

  getGeoStats: async (days: number): Promise<GeoStat[]> => {
    const { data, error } = await (supabase.rpc as any)('get_geo_stats', { days_lookback: days });
    if (error) { console.error("Analytics Error", error); return []; }
    return data as unknown as GeoStat[];
  },

  getPagePerformance: async (days: number): Promise<PageStat[]> => {
    const { data, error } = await (supabase.rpc as any)('get_page_analytics', { days_lookback: days });
    if (error) { console.error("Analytics Error", error); return []; }
    return data as unknown as PageStat[];
  },

  getLiveVisitors: async (lookback_minutes: number = 5): Promise<LiveVisitor[]> => {
    const { data, error } = await (supabase.rpc as any)('get_live_visitors', { lookback_minutes });
    if (error) { console.error("Analytics Error", error); return []; }
    return data as unknown as LiveVisitor[];
  },
  
  persistSystemLogs: async (logs: any[]) => {
    const { error } = await (supabase.from('system_logs') as any).insert(logs.map(l => ({
      operation: l.operation,
      context: l.context,
      level: l.level,
      details: l.details,
      timestamp: new Date(l.timestamp).toISOString()
    })));
    if (error) throw error;
  }
};