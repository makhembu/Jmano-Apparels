import { Tables, Json } from './database.types';

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string; // Mapped from created_at
}

export interface Category {
  key: string;
  label: string;
  color: string;
  bgColorClass: string; // Mapped from bg_class
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  salePrice?: number | null; // Mapped from sale_price
  isOnSale?: boolean; // Mapped from is_on_sale
  categoryKey: string; // Mapped from category_key
  image: string;
  description: string;
  sizes: string[];
  colors?: string[];
  tags?: string[];
  isFeatured: boolean; // Mapped from is_featured
  isPublished?: boolean; // Mapped from is_published
  sku?: string;
  slug?: string;
  stockQuantity?: number; // Mapped from stock_quantity
  lowStockThreshold?: number; // Mapped from low_stock_threshold
  weight?: number;
  seoTitle?: string; // Mapped from seo_title
  seoDescription?: string; // Mapped from seo_description
  createdAt?: string; // Mapped from created_at
  
  // Read-only stats from DB
  averageRating?: number; // Mapped from average_rating
  reviewCount?: number; // Mapped from review_count
  totalSales?: number; // Mapped from total_sales
}

export interface ProductReview {
  id: string;
  productId: string; // Mapped from product_id
  userId?: string; // Mapped from user_id
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean; // Mapped from verified_purchase
  createdAt: string; // Mapped from created_at
  isApproved?: boolean; // Mapped from is_approved
}

export interface DiscountCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed'; // Mapped from discount_type
  discountValue: number; // Mapped from discount_value
  description: string;
  minimumPurchase?: number; // Mapped from minimum_purchase
  validFrom: string; // Mapped from valid_from
  validUntil: string; // Mapped from valid_until
  maxUses?: number; // Mapped from max_uses
  isActive: boolean; // Mapped from is_active
  applicableCategories?: string[]; // Mapped from applicable_categories
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  baseRate: number; // Mapped from base_rate
  perKgRate?: number; // Mapped from per_kg_rate
  freeShippingThreshold?: number; // Mapped from free_shipping_threshold
  estimatedDays: string; // Mapped from estimated_days
  isActive: boolean; // Mapped from is_active
}

// CartItem extends Product but exists client-side (or in cart_items table)
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
}

export interface Order {
  id: string;
  userId: string; // Mapped from user_id
  orderNumber?: string; // Mapped from order_number
  products: OrderItem[];
  
  // Financial breakdown
  total: number;
  subtotal?: number; // Mapped from subtotal
  shippingCost?: number; // Mapped from shipping_cost
  taxAmount?: number; // Mapped from tax_amount
  discountAmount?: number; // Mapped from discount_amount
  discountCode?: string; // Mapped from discount_code
  
  status: string;
  createdAt: string; // Mapped from created_at
  shippingAddress?: ShippingAddress; // Mapped from shipping_address
  paymentStatus?: string; // Mapped from payment_status
  trackingNumber?: string; // Mapped from tracking_number
  notes?: string; // Mapped from notes
  
  shippedAt?: string; // Mapped from shipped_at
  deliveredAt?: string; // Mapped from delivered_at
  cancelledAt?: string; // Mapped from cancelled_at
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  thumbnail: string;
  featuredImage?: string; // Mapped from featured_image
  slug?: string;
  status?: string;
  author: string;
  createdAt: string; // Mapped from created_at (date)
  readingTime?: number; // Mapped from reading_time
  categoryId?: string; // Mapped from category_id
  seoTitle?: string; // Mapped from seo_title
  seoDescription?: string; // Mapped from seo_description
  viewCount?: number; // Mapped from view_count
}

export interface AppSettings {
  id: number;
  slogan: string;
  secondarySlogan: string; // Mapped from secondary_slogan
  mission: string;
  vision: string;
  coreValues: string; // Mapped from core_values
  
  // Contact & Business
  contactEmail?: string; // Mapped from contact_email
  contactPhone?: string; // Mapped from contact_phone
  contactAddress?: string; // Mapped from contact_address
  businessHours?: Record<string, string>; // Mapped from business_hours
  socialLinks?: Record<string, string>; // Mapped from social_links
  supportEmail?: string; // Mapped from support_email
  
  // Commerce
  currency?: string;
  taxRate?: number; // Mapped from tax_rate
  freeShippingThreshold?: number; // Mapped from free_shipping_threshold
  
  // Policies
  shippingPolicy?: string; // Mapped from shipping_policy
  returnPolicy?: string; // Mapped from return_policy
  privacyPolicy?: string; // Mapped from privacy_policy
  termsConditions?: string; // Mapped from terms_conditions
  
  // UI/Marketing
  heroBannerImage?: string; // Mapped from hero_banner_image
  heroBannerText?: string; // Mapped from hero_banner_text
  announcementText?: string; // Mapped from announcement_text
  isAnnouncementEnabled?: boolean; // Mapped from is_announcement_enabled
  maintenanceMode?: boolean; // Mapped from maintenance_mode
  maintenanceMessage?: string; // Mapped from maintenance_message
  featuredCategories?: string[]; // Mapped from featured_categories
  smtpSettings?: Record<string, any>; // Mapped from smtp_settings
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string; // Mapped from name
  source?: string; // Mapped from source
  isSubscribed: boolean; // Mapped from is_subscribed
  subscribedAt: string; // Mapped from subscribed_at
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  subject?: string;
  phone?: string;
  isRead: boolean; // Mapped from is_read
  createdAt: string; // Mapped from created_at
}

// --- DB Raw Types (for internal mapping) ---

export type DbProduct = Tables<'products'>;
export type DbCategory = Tables<'categories'>;
export type DbBlogCategory = Tables<'blog_categories'>;
export type DbAppSettings = Tables<'app_settings'>;
export type DbBlogPost = Tables<'blog_posts'>;
export type DbOrder = Tables<'orders'>;
export type DbProductReview = Tables<'product_reviews'>;
export type DbUser = Tables<'users'>;
export type DbNewsletterSubscriber = Tables<'newsletter_subscribers'>;
export type DbContactSubmission = Tables<'contact_submissions'>;