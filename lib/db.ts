import { Product, AppSettings, BlogPost, User, Order, ProductReview, ShippingAddress, CartItem, Category, BlogCategory, ShippingZone, DiscountCode, UserAddress, EmailTemplate } from '../types';
import { ProductService, CategoryService, ReviewService } from './services/catalog';
import { OrderService, CartService, ShippingService, DiscountService } from './services/commerce';
import { BlogService, SettingsService, SupportService } from './services/content';
import { UserService, WishlistService } from './services/user';
import { StorageService } from './services/storage';
import { supabase } from './supabaseClient';

// --- INSTANTIATE SERVICES ---

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

// --- PUBLIC API AGGREGATOR ---

export const api = {
  // PRODUCTS
  getProducts: () => productService.getAll(),
  getProduct: (id: string) => productService.getById(id),
  adminCreateProduct: (p: Partial<Product>) => productService.create(p),
  adminUpdateProduct: (id: string, p: Partial<Product>) => productService.update(id, p),
  adminDeleteProduct: (id: string) => productService.delete(id),
  adminBulkUpdateProducts: async (ids: string[], updates: Partial<Product>) => {
    const promises = ids.map(id => productService.update(id, updates));
    return Promise.all(promises);
  },
  adminBulkDeleteProducts: async (ids: string[]) => {
    const { error } = await supabase.from('products').delete().in('id', ids);
    if (error) throw error;
  },

  // CATEGORIES (PRODUCTS)
  getCategories: () => categoryService.getAll(),
  createCategory: (c: Category) => categoryService.create(c),
  deleteCategory: (key: string) => categoryService.delete(key),

  // APP SETTINGS
  getAppSettings: () => settingsService.get(),
  updateAppSettings: (id: number, s: Partial<AppSettings>) => settingsService.update(id, s),
  getPublicPaymentSettings: () => settingsService.getPublicPaymentSettings(),
  
  // EMAIL TEMPLATES
  getEmailTemplates: () => settingsService.getEmailTemplates(),
  updateEmailTemplate: (id: string, t: Partial<EmailTemplate>) => settingsService.updateEmailTemplate(id, t),

  // BLOG
  getBlogPosts: () => blogService.getAllPosts(),
  getBlogPostBySlug: (slug: string) => blogService.getPostBySlug(slug),
  getBlogCategories: () => blogService.getCategories(),
  createBlogCategory: (c: Partial<BlogCategory>) => blogService.createCategory(c),
  deleteBlogCategory: (id: string) => blogService.deleteCategory(id),
  adminCreateBlogPost: (p: Partial<BlogPost>) => blogService.createPost(p),
  adminUpdateBlogPost: (id: string, p: Partial<BlogPost>) => blogService.updatePost(id, p),
  adminDeleteBlogPost: (id: string) => blogService.deletePost(id),
  incrementBlogPostView: (id: string) => blogService.incrementViewCount(id),

  // ORDERS
  getOrders: (userId: string) => orderService.getUserOrders(userId),
  getAllOrders: () => orderService.getAll(),
  getOrderById: (id: string) => orderService.getById(id),
  createOrder: (o: Partial<Order> & { shippingAddress: ShippingAddress }) => orderService.create(o),
  adminUpdateOrder: (id: string, u: { status?: string; trackingNumber?: string; paymentStatus?: string }) => orderService.update(id, u),
  cancelOrder: (orderId: string, userId: string) => orderService.cancelOrder(orderId, userId),

  // USERS
  getAllUsers: () => userService.getAll(),
  getUserProfile: (id: string) => userService.getProfile(id),
  updateUserProfile: (id: string, u: { name: string, email: string, role?: string }) => userService.updateProfile(id, u),
  createUserProfile: (u: Partial<User>) => userService.createProfile(u),
  adminDeleteUser: (id: string) => userService.deleteUser(id),
  
  // PUBLIC SECURITY
  requestPasswordReset: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
  },
  updateUserPassword: async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  // ADMIN SECURITY
  adminSendPasswordReset: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/#/dashboard?reset=true',
    });
    if (error) throw error;
  },
  adminSendMagicLink: async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
  },
  
  // ADDRESSES
  getUserAddresses: (userId: string) => userService.getUserAddresses(userId),
  saveUserAddress: (userId: string, a: Partial<UserAddress>) => userService.saveUserAddress(userId, a),
  deleteUserAddress: (id: string) => userService.deleteUserAddress(id),

  // REVIEWS
  getProductReviews: (id: string) => reviewService.getByProduct(id),
  getRecentReviews: (limit?: number) => reviewService.getRecent(limit),
  addProductReview: (r: Partial<ProductReview>) => reviewService.add(r),

  // WISHLIST
  getWishlist: (userId: string) => wishlistService.getIds(userId),
  getWishlistProducts: (userId: string) => wishlistService.getProducts(userId),
  toggleWishlist: (userId: string, prodId: string) => wishlistService.toggle(userId, prodId),

  // CART
  syncCart: (userId: string, items: CartItem[]) => cartService.sync(userId, items),
  fetchCart: (userId: string) => cartService.fetch(userId),

  // SHIPPING & DISCOUNTS
  getShippingZones: () => shippingService.getZones(),
  createShippingZone: (z: Partial<ShippingZone>) => shippingService.createZone(z),
  deleteShippingZone: (id: string) => shippingService.deleteZone(id),
  
  validateDiscountCode: (code: string, total: number) => discountService.validate(code, total),
  getDiscountCodes: () => discountService.getAll(),
  createDiscountCode: (d: Partial<DiscountCode>) => discountService.create(d),
  deleteDiscountCode: (id: string) => discountService.delete(id),
  
  // SUPPORT
  subscribeToNewsletter: (email: string) => supportService.subscribeNewsletter(email),
  submitContact: (data: { name: string, email: string, message: string, subject?: string }) => supportService.submitContact(data),
  // Admin Support Methods
  getNewsletterSubscribers: () => supportService.getNewsletterSubscribers(),
  getContactSubmissions: () => supportService.getContactSubmissions(),
  markContactAsRead: (id: string) => supportService.markContactSubmissionAsRead(id),
  deleteContactSubmission: (id: string) => supportService.deleteContactSubmission(id),
  deleteNewsletterSubscriber: (id: string) => supportService.deleteNewsletterSubscriber(id),

  // STORAGE
  uploadImage: (file: File) => storageService.uploadImage(file),
};
