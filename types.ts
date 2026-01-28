
import { Tables, Json } from './database.types';

// ... (Existing types unchanged)

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  salePrice?: number;
  isOnSale: boolean;
  categoryKey: string;
  images: string[];
  description: string;
  sizes: string[];
  colors: string[];
  tags: string[];
  isFeatured: boolean;
  isPublished: boolean;
  sku?: string;
  slug?: string;
  stockQuantity: number;
  lowStockThreshold: number;
  weight: number;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  isNoIndex?: boolean;
  isNoFollow?: boolean;
  keywords?: string[];
  createdAt?: string;
  averageRating: number;
  reviewCount: number;
  totalSales: number;
}

export interface Category {
  key: string;
  label: string;
  color: string;
  bgColorClass: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  isNoIndex?: boolean;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  thumbnail: string;
  featuredImage?: string;
  slug?: string;
  status: 'draft' | 'published' | 'archived';
  author: string;
  createdAt: string;
  readingTime?: number;
  categoryId?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  isNoIndex?: boolean;
  isNoFollow?: boolean;
  keywords?: string[];
  viewCount: number;
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
  image: string;
}

export interface Order {
  id: string;
  userId: string | null;
  customerName?: string;
  customerEmail?: string;
  orderNumber: string;
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
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  notes?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
  isApproved: boolean;
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
  emailProvider?: 'smtp' | 'resend';
  smtpSettings?: Record<string, any>;
  geminiApiKey?: string;
  enableEmailNotifications?: boolean;
  enableEmailWelcome?: boolean;
  enableEmailNewOrder?: boolean;
  enableEmailOrderShipped?: boolean;
  enableEmailAdminNewOrder?: boolean;
  enableEmailContactAdmin?: boolean;
  enableNewsletterSignup?: boolean;
  enableContactForm?: boolean;
  enableReviews?: boolean;
  paypalClientId?: string;
  paypalSecretKey?: string;
  paypalMode?: 'sandbox' | 'live';
  paymentGatewayEnabled?: boolean;
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  baseRate: number;
  perKgRate?: number;
  freeShippingThreshold?: number;
  estimatedDays?: string;
  isActive: boolean;
}

export interface DiscountCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  description: string;
  validFrom?: string;
  validUntil?: string;
  isActive: boolean;
  applicableCategories?: string[];
  minimumPurchase?: number;
  maxUses?: number;
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

export interface SeoConfig {
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  isNoIndex?: boolean;
  isNoFollow?: boolean;
  keywords?: string[];
}

export interface AnalyticsEvent {
  eventType: 'page_view' | 'add_to_cart' | 'purchase' | 'view_item' | 'purchase_item';
  path?: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsOverview {
  visitors: number;
  pageviews: number;
  orders: number;
  revenue: number;
  conversion_rate: number;
}

export interface DailyAnalytics {
  date: string;
  visitors: number;
  pageviews: number;
  orders: number;
  revenue: number;
}

export interface ProductPerformance {
  title: string;
  views: number;
  adds: number;
  sales: number;
}

export interface TrafficSource {
  source: string;
  visitors: number;
  orders: number;
  revenue: number;
}

// Database Row Types (for mappers)
export type DbProduct = Tables<'products'>;
export type DbCategory = Tables<'categories'>;
export type DbAppSettings = Tables<'app_settings'>;
export type DbBlogPost = Tables<'blog_posts'>;
export type DbBlogCategory = Tables<'blog_categories'>;
export type DbOrder = Tables<'orders'>;
export type DbNewsletterSubscriber = Tables<'newsletter_subscribers'>;
export type DbContactSubmission = Tables<'contact_submissions'>;
export type DbEmailTemplate = Tables<'email_templates'>;
