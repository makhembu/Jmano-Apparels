
import { Database, Json } from './database.types';

// Helper to extract tables from Database type
type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  avatarUrl?: string;
  bio?: string;
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
  isFreeShipping?: boolean;
  shippingClass?: string; // New field
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
  updatedAt?: string;
  readingTime?: number;
  categoryId?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  isNoIndex?: boolean;
  isNoFollow?: boolean;
  keywords?: string[];
  viewCount: number;
  scheduledFor?: string;
  likes: number;
}

export interface BlogComment {
  id: string;
  postId: string;
  userId: string;
  comment: string;
  createdAt: string;
  isApproved: boolean;
  user: { name: string };
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

export type ReturnStatus = 'none' | 'requested' | 'approved' | 'rejected' | 'completed';

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
  shippingMethod?: string; // New field
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
  // Return fields
  returnReason?: string;
  returnRequestedAt?: string;
  returnStatus?: ReturnStatus;
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

export interface PriorityPage {
  pageUrl: string;
  pageTitle: string;
  pageDescription: string;
  priority: number;
  enabled: boolean;
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
  resendApiKey?: string;
  resendFromEmail?: string;
  geminiApiKey?: string;
  
  // NOTIFICATIONS
  enableEmailNotifications?: boolean;
  
  // Customer Order Flow
  enableEmailWelcome?: boolean;
  enableEmailNewOrder?: boolean;
  enableEmailOrderProcessing?: boolean; // New
  enableEmailOrderShipped?: boolean;
  enableEmailOrderCancelled?: boolean; // New
  enableEmailOrderRefunded?: boolean; // New
  
  // Customer Returns
  enableEmailReturnRequested?: boolean; // New
  enableEmailReturnApproved?: boolean; // New
  enableEmailReturnRejected?: boolean; // New

  // Other Customer
  enableEmailContactAutoreply?: boolean; // New
  enableEmailNewsletterWelcome?: boolean; // New

  // Admin Alerts
  enableEmailAdminNewOrder?: boolean;
  enableEmailContactAdmin?: boolean;
  enableEmailAdminReturnAlert?: boolean; // New

  enableNewsletterSignup?: boolean;
  enableContactForm?: boolean;
  enableReviews?: boolean;
  paypalClientId?: string;
  paypalSecretKey?: string;
  paypalMode?: 'sandbox' | 'live';
  paypalWebhookId?: string;
  paymentGatewayEnabled?: boolean;
  // Homepage Section Toggles
  enableFeaturedProducts?: boolean;
  enableCommitmentSection?: boolean;
  enableCategoriesSection?: boolean;
  enableCommunitySection?: boolean;
  enableJournalSection?: boolean;
  enableSocialSection?: boolean;
  // Homepage SEO Content
  seoContentTitle?: string;
  seoContentIntro?: string;
  seoContentCol1Title?: string;
  seoContentCol1Body?: string;
  seoContentCol2Title?: string;
  seoContentCol2Body?: string;
  // Social Section Text
  socialSectionTitle?: string;
  socialSectionBody?: string;
  // Sitelinks Management
  priorityPages?: PriorityPage[];
  // Business Info
  companyName?: string;
  registrationNumber?: string;
  vatNumber?: string;
  paymentInstructions?: string;
  paymentTerms?: string;

  // About Page Content
  aboutHeroTag?: string;
  aboutHeroTitle?: string;
  aboutFounderTag?: string;
  aboutMissionTitle?: string;
  aboutMissionBody?: string;
  aboutVisionTitle?: string;
  aboutVisionBody?: string;
  aboutValuesTag?: string;
  aboutValuesTitle?: string;
  aboutValuesIntro?: string;
  
  aboutValue1Title?: string;
  aboutValue1Body?: string;
  aboutValue2Title?: string;
  aboutValue2Body?: string;
  aboutValue3Title?: string;
  aboutValue3Body?: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  rate: number;
  description?: string;
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  baseRate: number; // Fallback if no options
  freeShippingThreshold?: number;
  isActive: boolean;
  options: ShippingOption[]; // Array of methods
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
  id: number;
  created_at: string;
  eventType: 'page_view' | 'add_to_cart' | 'purchase' | 'view_item' | 'purchase_item' | 'page_leave';
  path?: string;
  metadata?: Record<string, any>;
  duration?: number;
  geo_country?: string;
  geo_city?: string;
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

export interface GeoStat {
  country: string;
  visitors: number;
  revenue: number;
}

export interface PageStat {
  path: string;
  views: number;
  avg_time: number;
  unique_visitors: number;
}

export interface LiveVisitor {
  session_id: string;
  user_id?: string;
  user_email?: string;
  path: string;
  geo_country: string;
  geo_city: string;
  created_at: string;
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
export type DbBlogComment = Tables<'blog_comments'>;
