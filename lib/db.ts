
import { ProductService, CategoryService, ReviewService } from './services/catalog';
import { OrderService, CartService, ShippingService, DiscountService } from './services/commerce';
import { UserService, WishlistService } from './services/user';
import { SettingsService, BlogService } from './services/content';
import { StorageService } from './services/storage';
import { AnalyticsService } from './services/analytics';
import { log } from './logger';

// Instantiate services
const productService = new ProductService();
const categoryService = new CategoryService();
const reviewService = new ReviewService();
const orderService = new OrderService();
const cartService = new CartService();
const shippingService = new ShippingService();
const discountService = new DiscountService();
const userService = new UserService();
const wishlistService = new WishlistService();
const settingsService = new SettingsService();
const blogService = new BlogService();
const storageService = new StorageService();
const analyticsService = new AnalyticsService();

// Export aggregated API
export const api = {
  // --- CATALOG ---
  getProducts: () => productService.getAll(),
  getTopSellingProducts: (limit?: number) => productService.getTopSellers(limit),
  getPaginatedProducts: (page: number, size: number, filters: any) => productService.getPaginated(page, size, filters),
  getProductById: (id: string) => productService.getById(id),
  adminCreateProduct: (p: any) => productService.create(p),
  adminUpdateProduct: (id: string, p: any) => productService.update(id, p),
  adminDeleteProduct: (id: string) => productService.delete(id),
  adminBulkUpdateProducts: (ids: string[], updates: any) => productService.bulkUpdate(ids, updates),
  adminBulkDeleteProducts: (ids: string[]) => productService.bulkDelete(ids),
  getLowStockProducts: (limit?: number) => productService.getLowStockProducts(limit),

  getCategories: () => categoryService.getAll(),
  createCategory: (c: any) => categoryService.create(c),
  updateCategory: (key: string, c: any) => categoryService.update(key, c),
  deleteCategory: (key: string) => categoryService.delete(key),

  getProductReviews: (pid: string) => reviewService.getByProduct(pid),
  getRecentReviews: (limit?: number) => reviewService.getRecent(limit),
  addProductReview: (r: any) => reviewService.add(r),

  // --- COMMERCE ---
  getUserOrders: (uid: string) => orderService.getUserOrders(uid),
  getAllOrders: (limit?: number) => orderService.getAll(limit),
  getOrderById: (id: string) => orderService.getById(id),
  getOrders: (uid: string) => orderService.getUserOrders(uid), // Alias for backward compatibility
  getOrdersPaginated: (page: number, size: number, status?: string) => orderService.getOrdersPaginated(page, size, status),
  getAdminPaymentsPaginated: (page: number, size: number, status: string, method: string) => orderService.getAdminPaymentsPaginated(page, size, status, method),
  createOrder: (o: any) => orderService.create(o),
  adminUpdateOrder: (id: string, updates: any) => orderService.update(id, updates),
  cancelOrder: (oid: string, uid: string) => orderService.cancelOrder(oid, uid),
  cancelAndRestoreStock: (oid: string, uid: string) => orderService.cancelAndRestoreStock(oid, uid),
  requestReturn: (oid: string, uid: string, reason: string) => orderService.requestReturn(oid, uid, reason),
  adminProcessReturn: (oid: string, status: any, notes?: string) => orderService.adminProcessReturn(oid, status, notes),
  issueFullRefund: (oid: string) => orderService.issueFullRefund(oid),

  syncCart: (uid: string, items: any[]) => cartService.sync(uid, items),
  fetchCart: (uid: string) => cartService.fetch(uid),

  getShippingZones: () => shippingService.getZones(),
  createShippingZone: (z: any) => shippingService.createZone(z),
  updateShippingZone: (id: string, z: any) => shippingService.updateZone(id, z),
  deleteShippingZone: (id: string) => shippingService.deleteZone(id),
  addShippingOption: (zid: string, opt: any) => shippingService.addOption(zid, opt),
  deleteShippingOption: (oid: string) => shippingService.deleteOption(oid),

  validateDiscountCode: (code: string, total: number) => discountService.validate(code, total),
  getDiscountCodes: () => discountService.getAll(),
  createDiscountCode: (d: any) => discountService.create(d),
  updateDiscountCode: (id: string, d: any) => discountService.update(id, d),
  deleteDiscountCode: (id: string) => discountService.delete(id),
  getPublicPaymentSettings: async () => {
      const s = await settingsService.get();
      return {
          paypalClientId: s?.paypalClientId,
          paypalMode: s?.paypalMode,
          paymentGatewayEnabled: s?.paymentGatewayEnabled
      };
  },

  // --- USERS ---
  getUsers: () => userService.getAll(),
  getPublicUsers: () => userService.getPublicProfiles(),
  getUserProfile: (uid: string) => userService.getProfile(uid),
  updateUserProfile: (uid: string, updates: any) => userService.updateProfile(uid, updates),
  createUserProfile: (u: any) => userService.createProfile(u),
  adminDeleteUser: (uid: string) => userService.deleteUser(uid),
  updateUserPassword: (pass: string) => userService.updateUserPassword(pass),
  requestPasswordReset: (email: string, url?: string) => userService.requestPasswordReset(email, url || window.location.origin + '/update-password'),
  adminSendPasswordReset: (email: string) => userService.adminSendPasswordReset(email),
  adminSendMagicLink: (email: string) => userService.adminSendMagicLink(email),
  getPaginatedUsers: (page: number, size: number, search: string) => userService.getPaginatedUsers(page, size, search),
  getUserActivity: (uid: string, limit?: number) => userService.getUserActivity(uid, limit),
  deleteUserAccount: (uid: string) => userService.deleteUserAccount(uid),
  
  getUserAddresses: (uid: string) => userService.getUserAddresses(uid),
  saveUserAddress: (uid: string, addr: any) => userService.saveUserAddress(uid, addr),
  deleteUserAddress: (id: string) => userService.deleteUserAddress(id),

  getWishlist: (uid: string) => wishlistService.getIds(uid),
  getWishlistProducts: (uid: string) => wishlistService.getProducts(uid),
  toggleWishlist: (uid: string, pid: string) => wishlistService.toggle(uid, pid),

  // --- CONTENT ---
  // App Settings
  getAppSettings: () => settingsService.get(), // Public
  updateAppSettings: (id: number, s: any) => settingsService.updateSettings(s),
  
  // Emails & Notifications
  getEmailTemplates: () => settingsService.getEmailTemplates(),
  updateEmailTemplate: (id: string, t: any) => settingsService.updateEmailTemplate(id, t),
  sendTestEmail: (to: string, subj: string, body: string) => settingsService.sendTestTemplate(to, subj, body),
  checkEmailHealth: (email: string, key?: string, from?: string) => settingsService.checkEmailHealth(email, key, from),
  sendWhatsAppMessage: (to: string, text: string) => settingsService.sendWhatsAppMessage(to, text),
  sendTransactionalEmail: (template: string, recipient: string, vars: any) => settingsService.sendTransactionalEmail(template, recipient, vars),

  // Blog
  getBlogPosts: () => blogService.getAll(),
  getBlogPostBySlug: (slug: string) => blogService.getBySlug(slug),
  adminCreateBlogPost: (post: any) => blogService.create(post),
  adminUpdateBlogPost: (id: string, post: any) => blogService.update(id, post),
  adminDeleteBlogPost: (id: string) => blogService.delete(id),
  adminBulkUpdateBlogPosts: (ids: string[], updates: any) => blogService.bulkUpdate(ids, updates),
  adminBulkDeleteBlogPosts: (ids: string[]) => blogService.bulkDelete(ids),
  incrementBlogPostView: (id: string) => blogService.incrementView(id),
  incrementBlogPostLike: (id: string) => blogService.incrementLike(id),
  getBlogCategories: () => blogService.getCategories(),
  createBlogCategory: (c: any) => blogService.createCategory(c),
  deleteBlogCategory: (id: string) => blogService.deleteCategory(id),
  getBlogComments: (pid: string) => blogService.getComments(pid),
  addBlogComment: (pid: string, uid: string, comment: string) => blogService.addComment(pid, uid, comment),

  // Contact
  submitContact: async (data: any) => {
      // Direct supabase insert for public contact form
      const { error } = await (settingsService as any).supabasePublic.from('contact_submissions').insert(data); // Casting to access private if needed or just use import
      if (error) throw error;
      // Trigger notification logic in backend via edge function or direct call if allowed
      // Here we trust the UI to call sendTransactionalEmail if needed, or DB trigger
  },
  getContactSubmissions: async () => {
      // Only admin
      const { data, error } = await (settingsService as any).supabase.from('contact_submissions').select('*').order('created_at', {ascending:false});
      if(error) throw error;
      return (data || []).map(Mappers.toContactSubmission);
  },
  deleteContactSubmission: async (id: string) => {
      const { error } = await (settingsService as any).supabase.from('contact_submissions').delete().eq('id', id);
      if(error) throw error;
  },
  markContactAsRead: async (id: string) => {
      const { error } = await (settingsService as any).supabase.from('contact_submissions').update({ is_read: true }).eq('id', id);
      if(error) throw error;
  },

  // Newsletter
  subscribeToNewsletter: async (email: string) => {
      const { error } = await (settingsService as any).supabasePublic.from('newsletter_subscribers').upsert({ email, is_subscribed: true });
      if (error) throw error;
  },
  getNewsletterSubscribers: async () => {
      const { data, error } = await (settingsService as any).supabase.from('newsletter_subscribers').select('*').order('subscribed_at', {ascending:false});
      if(error) throw error;
      return (data || []).map(Mappers.toNewsletterSubscriber);
  },
  deleteNewsletterSubscriber: async (id: string) => {
      const { error } = await (settingsService as any).supabase.from('newsletter_subscribers').delete().eq('id', id);
      if(error) throw error;
  },

  // --- STORAGE ---
  uploadImage: (file: File) => storageService.uploadImage(file),

  // --- ANALYTICS ---
  getAnalyticsOverview: (start: Date, end: Date) => analyticsService.getAnalyticsOverview(start, end),
  getAdminDashboardStats: () => analyticsService.getAdminDashboardStats(),
  getAdminProductStats: (pid: string) => analyticsService.getAdminProductStats(pid),
  getDailyAnalytics: (days: number) => analyticsService.getDailyAnalytics(days),
  getProductAnalytics: (days?: number) => analyticsService.getProductAnalytics(days),
  getTrafficSources: (days?: number) => analyticsService.getTrafficSources(days),
  getGeoStats: (days?: number) => analyticsService.getGeoStats(days),
  getPagePerformance: (days?: number) => analyticsService.getPagePerformance(days),
  getLiveVisitors: (min?: number) => analyticsService.getLiveVisitors(min),
  persistSystemLogs: (logs: any[]) => analyticsService.persistSystemLogs(logs),
};
