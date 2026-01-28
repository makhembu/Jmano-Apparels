
import { Tables, Json } from './database.types';

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface SeoConfig {
  canonicalUrl?: string;
  isNoIndex?: boolean;
  isNoFollow?: boolean;
  keywords?: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface UserAddress {
  id: string;
  userId: string;
  label: string;
  address1: string;
  address2?: string;
  city: string;
  postcode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface Category extends SeoConfig {
  key: string;
  label: string;
  color: string;
  bgColorClass: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Product extends SeoConfig {
  id: string;
  title: string;
  price: number;
  salePrice?: number | null;
  isOnSale?: boolean;
  categoryKey: string;
  images: string[];
  description: string;
  sizes: string[];
  colors?: string[];
  tags?: string[];
  isFeatured: boolean;
  isPublished?: boolean;
  sku?: string;
  slug?: string;
  stockQuantity?: number;
  lowStockThreshold?: number;
  weight?: number;
  createdAt?: string;
  averageRating?: number;
  reviewCount?: number;
  totalSales?: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId?: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
  isApproved?: boolean;
}

export interface DiscountCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  description: string;
  minimumPurchase?: number;
  validFrom: string;
  validUntil: string;
  maxUses?: number;
  isActive: boolean;
  applicableCategories?: string[];
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  baseRate: number;
  perKgRate?: number;
  freeShippingThreshold?: number;
  estimatedDays: string;
  isActive: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor?: string;
}

export interface ShippingAddress {
  address1: string;
  address2?: string;
  city: string;
  postcode: string;
  country: string;
  phone?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  size: string;
  title: string;
  price: number;
  selectedColor?: string;
  image?: string;
}

export interface Order {
  id: string;
  userId: string | null;
  customerName?: string;
  customerEmail?: string;
  orderNumber?: string;
  products: OrderItem[];
  total: number;
  subtotal?: number;
  shippingCost?: number;
  taxAmount?: number;
  discountAmount?: number;
  discountCode?: string;
  status: string;
  createdAt: string;
  shippingAddress?: ShippingAddress;
  paymentStatus?: string;
  paymentIntentId?: string; 
  trackingNumber?: string;
  notes?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

export interface BlogPost extends SeoConfig {
  id: string;
  title: string;
  summary: string;
  content: string;
  thumbnail: string;
  featuredImage?: string;
  slug?: string;
  status?: string;
  author: string;
  createdAt: string;
  readingTime?: number;
  categoryId?: string;
  viewCount?: number;
}

export interface AppSettings {
  id: number;
  slogan: string;
  secondarySlogan: string;
  logoImage?: string;
  mission: string;
  vision: string;
  coreValues: string;
  founderName?: string;
  founderBio?: string;
  founderImage?: string;
  founderQuote?: string;
  
  // SEO Global
  seoTitle?: string;
  seoDescription?: string;
  defaultOgImage?: string; 
  googleAnalyticsId?: string; 
  customHeadScripts?: string; 
  
  shopSeoTitle?: string;
  shopSeoDescription?: string;
  blogSeoTitle?: string;
  blogSeoDescription?: string;
  aboutSeoTitle?: string;
  aboutSeoDescription?: string;
  
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  businessHours?: Record<string, string>;
  socialLinks?: Record<string, string>;
  supportEmail?: string;
  currency?: string;
  taxRate?: number;
  freeShippingThreshold?: number;
  requireLoginForCheckout?: boolean;
  shippingPolicy?: string;
  returnPolicy?: string;
  privacyPolicy?: string;
  termsConditions?: string;
  heroBannerImage?: string;
  heroBannerText?: string;
  announcementText?: string;
  isAnnouncementEnabled?: boolean;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  featuredCategories?: string[];
  
  // Email Settings
  emailProvider?: 'smtp' | 'resend';
  smtpSettings?: Record<string, any>;
  
  // AI Settings
  geminiApiKey?: string;

  // Notification Settings
  enableEmailNotifications?: boolean;
  enableEmailWelcome?: boolean;
  enableEmailNewOrder?: boolean;
  enableEmailOrderShipped?: boolean;
  enableEmailAdminNewOrder?: boolean; 
  enableEmailContactAdmin?: boolean; 
  
  // Feature Flags
  enableNewsletterSignup?: boolean;
  enableContactForm?: boolean;
  enableReviews?: boolean;
  
  // PayPal Settings
  paypalClientId?: string; 
  paypalSecretKey?: string; 
  paypalMode?: 'sandbox' | 'live'; 
  paymentGatewayEnabled?: boolean; 
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  bodyHtml: string;
  description?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  source?: string;
  isSubscribed: boolean;
  subscribedAt: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  subject?: string;
  phone?: string;
  isRead: boolean;
  createdAt: string;
}

// --- DB Raw Types ---
export type DbProduct = Tables<'products'>;
export type DbCategory = Tables<'categories'>;
export type DbBlogCategory = Tables<'blog_categories'>;
export type DbAppSettings = Tables<'app_settings'>;
export type DbEmailTemplate = Tables<'email_templates'>;
export type DbBlogPost = Tables<'blog_posts'>;
export type DbOrder = Tables<'orders'>;
export type DbProductReview = Tables<'product_reviews'>;
export type DbUser = Tables<'users'>;
export type DbNewsletterSubscriber = Tables<'newsletter_subscribers'>;
export type DbContactSubmission = Tables<'contact_submissions'>;
