
import { supabase } from './supabaseClient';
import { 
  Product, Category, AppSettings, BlogPost, User, Order, ProductReview, 
  ShippingAddress, CartItem, BlogCategory, ShippingZone, DiscountCode, 
  UserAddress, EmailTemplate, ShippingOption
} from '../types';

import { ProductService, CategoryService, ReviewService, ProductFilters } from './services/catalog';
import { OrderService } from './services/orderService';
import { CartService } from './services/cartService';
import { ShippingService } from './services/shippingService';
import { DiscountService } from './services/discountService';
import { BlogService, SettingsService, SupportService } from './services/content';
import { UserService, WishlistService } from './services/user';
import { StorageService } from './services/storage';
import { AnalyticsService } from './services/analytics';
import { log } from './logger';

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
const analyticsService = new AnalyticsService();

// Helper for hybrid routing redirect
const getRedirectUrl = () => {
  const isProd = window.location.hostname === 'jamboapparels.com' || window.location.hostname === 'www.jamboapparels.com';
  return `${window.location.origin}${isProd ? '' : '/#'}/update-password`;
};

// Internal Helper to log admin actions
const logAudit = async (action: string, table: string, recordId?: string, details?: any) => {
  try {
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (!user) return;
      
      await supabase.from('audit_logs').insert({
          user_id: user.id,
          action,
          table_name: table,
          record_id: recordId,
          new_values: details
      } as any);
  } catch (e) {
      console.error("Failed to write audit log", e);
  }
};

export const api = {
  // Catalog
  getProducts: () => productService.getAll(),
  getPaginatedProducts: (page: number, size: number, filters: ProductFilters) => productService.getPaginated(page, size, filters),
  getProductById: (id: string) => productService.getById(id),
  
  adminCreateProduct: async (p: Partial<Product>) => {
    await productService.create(p);
    logAudit('CREATE', 'products', undefined, { title: p.title });
  },
  adminUpdateProduct: async (id: string, p: Partial<Product>) => {
    await productService.update(id, p);
    logAudit('UPDATE', 'products', id, p);
  },
  adminDeleteProduct: async (id: string) => {
    await productService.delete(id);
    logAudit('DELETE', 'products', id);
  },
  adminBulkUpdateProducts: async (ids: string[], updates: Partial<Product>) => {
    await productService.bulkUpdate(ids, updates);
    logAudit('BULK_UPDATE', 'products', undefined, { ids, updates });
  },
  adminBulkDeleteProducts: async (ids: string[]) => {
    await productService.bulkDelete(ids);
    logAudit('BULK_DELETE', 'products', undefined, { ids });
  },

  getLowStockProducts: (limit: number = 5) => productService.getLowStockProducts(limit),
  getTopSellingProducts: (limit: number = 5) => productService.getTopSellers(limit),

  getCategories: () => categoryService.getAll(),
  createCategory: (c: Category) => categoryService.create(c),
  updateCategory: (key: string, c: Partial<Category>) => categoryService.update(key, c),
  deleteCategory: (key: string) => categoryService.delete(key),

  getProductReviews: (productId: string) => reviewService.getByProduct(productId),
  getRecentReviews: (limit: number) => reviewService.getRecent(limit),
  addProductReview: (review: Partial<ProductReview>) => reviewService.add(review),

  // Commerce
  getUserOrders: (userId: string) => orderService.getUserOrders(userId),
  getOrders: (userId: string) => orderService.getUserOrders(userId), // Alias
  getAllOrders: (limit?: number) => orderService.getAll(limit),
  getOrdersPaginated: (page?: number, limit?: number, status?: string) => orderService.getOrdersPaginated(page, limit, status),
  getAdminPaymentsPaginated: (page: number, limit: number, status: string, method: string) => orderService.getAdminPaymentsPaginated(page, limit, status, method),
  getOrderById: (id: string) => orderService.getById(id),
  createOrder: (order: Partial<Order> & { shippingAddress: ShippingAddress }) => orderService.create(order),
  
  adminUpdateOrder: async (id: string, updates: any) => {
    await orderService.update(id, updates);
    logAudit('UPDATE', 'orders', id, updates);
  },
  
  cancelOrder: (orderId: string, userId: string) => orderService.cancelOrder(orderId, userId),
  cancelAndRestoreStock: (orderId: string, userId: string) => orderService.cancelAndRestoreStock(orderId, userId),
  requestReturn: (orderId: string, userId: string, reason: string) => orderService.requestReturn(orderId, userId, reason),
  
  adminProcessReturn: async (orderId: string, returnStatus: any, notes?: string) => {
    const res = await orderService.adminProcessReturn(orderId, returnStatus, notes);
    logAudit('RETURN_PROCESS', 'orders', orderId, { status: returnStatus, notes });
    return res;
  },
  
  issueFullRefund: async (orderId: string) => {
    const res = await orderService.issueFullRefund(orderId);
    logAudit('REFUND', 'orders', orderId);
    return res;
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
  
  adminCreateBlogPost: async (p: Partial<BlogPost>) => {
    await blogService.createPost(p);
    logAudit('CREATE', 'blog_posts', undefined, { title: p.title });
  },
  adminUpdateBlogPost: async (id: string, p: Partial<BlogPost>) => {
    await blogService.updatePost(id, p);
    logAudit('UPDATE', 'blog_posts', id, p);
  },
  adminDeleteBlogPost: async (id: string) => {
    await blogService.deletePost(id);
    logAudit('DELETE', 'blog_posts', id);
  },
  adminBulkUpdateBlogPosts: async (ids: string[], updates: Partial<BlogPost>) => {
    await blogService.bulkUpdate(ids, updates);
    logAudit('BULK_UPDATE', 'blog_posts', undefined, { ids, updates });
  },
  adminBulkDeleteBlogPosts: async (ids: string[]) => {
    await blogService.bulkDelete(ids);
    logAudit('BULK_DELETE', 'blog_posts', undefined, { ids });
  },
  
  incrementBlogPostView: (id: string) => blogService.incrementViewCount(id),
  incrementBlogPostLike: (postId: string) => blogService.incrementBlogPostLike(postId),
  getBlogComments: (postId: string) => blogService.getBlogComments(postId),
  addBlogComment: (postId: string, userId: string, comment: string) => blogService.addBlogComment(postId, userId, comment),

  getAppSettings: () => settingsService.get(),
  getAdminSettings: () => settingsService.getAdminSettings(),
  
  updateAppSettings: async (id: number, s: Partial<AppSettings>) => {
    await settingsService.update(id, s);
    logAudit('UPDATE', 'app_settings', String(id), s);
  },
  
  getPublicPaymentSettings: () => settingsService.getPublicPaymentSettings(),
  getEmailTemplates: () => settingsService.getEmailTemplates(),
  
  updateEmailTemplate: async (id: string, t: Partial<EmailTemplate>) => {
    await settingsService.updateEmailTemplate(id, t);
    logAudit('UPDATE', 'email_templates', id, t);
  },
  
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
  getPaginatedUsers: (page?: number, limit?: number, search?: string) => userService.getPaginatedUsers(page, limit, search),
  getUserProfile: (id: string) => userService.getProfile(id),
  updateUserProfile: (id: string, data: any) => userService.updateProfile(id, data),
  createUserProfile: (data: any) => userService.createProfile(data),
  updateUserPassword: (password: string) => userService.updateUserPassword(password),
  requestPasswordReset: (email: string) => userService.requestPasswordReset(email, getRedirectUrl()),
  
  adminDeleteUser: async (id: string) => {
    await userService.deleteUser(id);
    logAudit('DELETE', 'users', id);
  },
  adminSendPasswordReset: async (email: string) => {
    await userService.adminSendPasswordReset(email);
    logAudit('RESET_PASSWORD', 'users', undefined, { email });
  },
  adminSendMagicLink: async (email: string) => {
    await userService.adminSendMagicLink(email);
    logAudit('MAGIC_LINK', 'users', undefined, { email });
  },
  
  getUserActivity: (userId: string, limit?: number) => userService.getUserActivity(userId, limit),
  deleteUserAccount: (userId: string) => userService.deleteUserAccount(userId),

  getUserAddresses: (userId: string) => userService.getUserAddresses(userId),
  saveUserAddress: (userId: string, address: any) => userService.saveUserAddress(userId, address),
  deleteUserAddress: (id: string) => userService.deleteUserAddress(id),

  getWishlist: (userId: string) => wishlistService.getIds(userId),
  getWishlistProducts: (userId: string) => wishlistService.getProducts(userId),
  toggleWishlist: (userId: string, productId: string) => wishlistService.toggle(userId, productId),

  // Storage
  uploadImage: (file: File) => storageService.uploadImage(file),
  uploadVideo: (file: File) => storageService.uploadVideo(file),
  listVideos: () => storageService.listAllVideos(),

  // Analytics
  getAnalyticsOverview: (start: Date, end: Date) => analyticsService.getAnalyticsOverview(start, end),
  getAdminDashboardStats: () => analyticsService.getAdminDashboardStats(),
  getAdminProductStats: (productId: string) => analyticsService.getAdminProductStats(productId),
  getDailyAnalytics: (days: number) => analyticsService.getDailyAnalytics(days),
  getProductAnalytics: (days?: number) => analyticsService.getProductAnalytics(days),
  getTrafficSources: (days: number) => analyticsService.getTrafficSources(days),
  getGeoStats: (days: number) => analyticsService.getGeoStats(days),
  getPagePerformance: (days: number) => analyticsService.getPagePerformance(days),
  getLiveVisitors: (minutes?: number) => analyticsService.getLiveVisitors(minutes),
  persistSystemLogs: (logs: any[]) => analyticsService.persistSystemLogs(logs),
};
