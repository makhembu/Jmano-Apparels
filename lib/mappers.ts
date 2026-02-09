
import { 
  Product, Category, AppSettings, BlogPost, User, Order, 
  DbProduct, DbCategory, DbAppSettings, ShippingAddress, OrderItem,
  DbBlogPost, DbOrder, ProductReview, DiscountCode, ShippingZone, CartItem,
  BlogCategory, DbBlogCategory, NewsletterSubscriber, ContactSubmission,
  DbNewsletterSubscriber, DbContactSubmission, DbEmailTemplate, EmailTemplate
} from '../types';

export const Mappers = {
  toProduct: (p: any): Product => ({
    id: p.id,
    title: p.title,
    price: p.price,
    salePrice: p.sale_price,
    isOnSale: p.is_on_sale || false,
    categoryKey: p.category_key || '',
    images: p.images || [],
    description: p.description || '',
    sizes: p.sizes || [],
    colors: p.colors || [],
    tags: p.tags || [],
    isFeatured: p.is_featured || false,
    isPublished: p.is_published ?? true,
    sku: p.sku || undefined,
    slug: p.slug || undefined,
    stockQuantity: p.stock_quantity ?? 0,
    lowStockThreshold: p.low_stock_threshold || 5,
    weight: p.weight || 0,
    // Map isFreeShipping
    isFreeShipping: p.is_free_shipping || false,
    
    // SEO
    seoTitle: p.seo_title || undefined,
    seoDescription: p.seo_description || undefined,
    canonicalUrl: p.canonical_url || undefined,
    isNoIndex: p.is_noindex || false,
    isNoFollow: p.is_nofollow || false,
    keywords: p.keywords || [],

    createdAt: p.created_at || undefined,
    averageRating: p.average_rating || 0,
    reviewCount: p.review_count || 0,
    totalSales: p.total_sales || 0
  }),

  toCategory: (c: any): Category => ({
    key: c.key,
    label: c.label || c.key, 
    color: c.color,
    bgColorClass: c.bg_class,
    seoTitle: c.seo_title || undefined,
    seoDescription: c.seo_description || undefined,
    canonicalUrl: c.canonical_url || undefined,
    isNoIndex: c.is_noindex || false
  }),

  toBlogCategory: (c: DbBlogCategory): BlogCategory => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description || undefined
  }),

  toAppSettings: (s: any): AppSettings => ({
    id: s.id,
    slogan: s.slogan || '',
    secondarySlogan: s.secondary_slogan || '',
    logoImage: s.logo_image || undefined,
    mission: s.mission || '',
    vision: s.vision || '',
    coreValues: s.core_values || '',
    founderName: s.founder_name || undefined,
    founderBio: s.founder_bio || undefined,
    founderImage: s.founder_image || undefined,
    founderQuote: s.founder_quote || undefined,
    
    // Global SEO & Scripts
    seoTitle: s.seo_title || undefined,
    seoDescription: s.seo_description || undefined,
    defaultOgImage: s.default_og_image || undefined,
    googleAnalyticsId: s.google_analytics_id || undefined,
    customHeadScripts: s.custom_head_scripts || undefined,

    shopSeoTitle: s.shop_seo_title || undefined,
    shopSeoDescription: s.shop_seo_description || undefined,
    blogSeoTitle: s.blog_seo_title || undefined,
    blogSeoDescription: s.blog_seo_description || undefined,
    aboutSeoTitle: s.about_seo_title || undefined,
    aboutSeoDescription: s.about_seo_description || undefined,
    contactEmail: s.contact_email || undefined,
    contactPhone: s.contact_phone || undefined,
    contactAddress: s.contact_address || undefined,
    businessHours: (s.business_hours as Record<string, string>) || undefined,
    socialLinks: (s.social_links as Record<string, string>) || undefined,
    supportEmail: s.support_email || undefined,
    currency: s.currency || 'GBP',
    taxRate: s.tax_rate || 0.2,
    freeShippingThreshold: s.free_shipping_threshold || undefined,
    requireLoginForCheckout: s.require_login_for_checkout || false,
    shippingPolicy: s.shipping_policy || undefined,
    returnPolicy: s.return_policy || undefined,
    privacyPolicy: s.privacy_policy || undefined,
    termsConditions: s.terms_conditions || undefined,
    heroBannerImage: s.hero_banner_image || undefined,
    heroBannerText: s.hero_banner_text || undefined,
    announcementText: s.announcement_text || undefined,
    isAnnouncementEnabled: s.is_announcement_enabled || false,
    maintenanceMode: s.maintenance_mode || false,
    maintenanceMessage: s.maintenance_message || undefined,
    featuredCategories: (s.featured_categories as string[]) || undefined,
    
    // Resend Email Settings
    resendApiKey: s.resend_api_key || undefined,
    resendFromEmail: s.resend_from_email || undefined,

    // AI Configuration
    geminiApiKey: s.gemini_api_key || undefined,
    
    // Notifications
    enableEmailNotifications: s.enable_email_notifications ?? false,
    enableEmailWelcome: s.enable_email_welcome ?? false,
    enableEmailNewOrder: s.enable_email_new_order ?? false,
    enableEmailOrderShipped: s.enable_email_order_shipped ?? false,
    enableEmailAdminNewOrder: s.enable_email_admin_new_order ?? false,
    enableEmailContactAdmin: s.enable_email_contact_admin ?? false,
    
    // Features
    enableNewsletterSignup: s.enable_newsletter_signup ?? false,
    enableContactForm: s.enable_contact_form ?? true,
    enableReviews: s.enable_reviews ?? true,
    
    // PayPal Mapping
    paypalClientId: s.paypal_client_id || undefined,
    paypalSecretKey: s.paypal_secret_key || undefined,
    paypalMode: s.paypal_mode || 'sandbox',
    paypalWebhookId: s.paypal_webhook_id || undefined,
    paymentGatewayEnabled: s.payment_gateway_enabled || false,
    
    // Homepage Section Toggles
    enableFeaturedProducts: s.enable_featured_products ?? true,
    enableCommitmentSection: s.enable_commitment_section ?? true,
    enableCategoriesSection: s.enable_categories_section ?? true,
    enableCommunitySection: s.enable_community_section ?? true,
    enableJournalSection: s.enable_journal_section ?? true,
    enableSocialSection: s.enable_social_section ?? true,

    // Homepage SEO Content
    seoContentTitle: s.seo_content_title || 'Faith & Fashion: The Jambo Difference',
    seoContentIntro: s.seo_content_intro || 'At Jambo Apparels, we believe that clothing is more than just fabric—it\'s a statement. As a premier Christian streetwear brand, we bridge the gap between modern style and timeless truth. Our collection of scripture-inspired hoodies, t-shirts, and accessories are designed for the believer who isn\'t afraid to stand out.',
    seoContentCol1Title: s.seo_content_col1_title || 'Why Choose Christian Streetwear?',
    seoContentCol1Body: s.seo_content_col1_body || 'Fashion is a language. What you wear speaks before you do. Faith-based fashion allows you to carry a message of hope, humility, and boldness into every room you enter. Whether it\'s the gym, the campus, or the coffee shop, our apparel is designed to be a conversation starter for the Gospel.',
    seoContentCol2Title: s.seo_content_col2_title || 'Ethical, Sustainable, Faithful',
    seoContentCol2Body: s.seo_content_col2_body || 'We don\'t compromise on quality or integrity. Our commitment to ethical manufacturing reflects our stewardship of God\'s creation. Every stitch in our Christian clothing collection is placed with care, ensuring that your apparel lasts as long as your testimony.',
    
    // Social Section Text
    socialSectionTitle: s.social_section_title || 'Follow Our Journey',
    socialSectionBody: s.social_section_body || 'Join our community on social media for behind-the-scenes content, new drops, and daily inspiration.',

    // Sitelinks
    priorityPages: (s.priority_pages as any[]) || undefined,
  }),

  toEmailTemplate: (t: DbEmailTemplate): EmailTemplate => ({
    id: t.id,
    name: t.name,
    subject: t.subject,
    bodyHtml: t.body_html,
    description: t.description || undefined
  }),

  toBlogPost: (b: any): BlogPost => ({
    id: b.id,
    title: b.title,
    summary: b.summary || '',
    content: b.content,
    thumbnail: b.thumbnail || '',
    featuredImage: b.featured_image || undefined,
    slug: b.slug || undefined,
    status: b.status || 'draft',
    author: b.author || '',
    createdAt: b.date || new Date().toISOString(),
    readingTime: b.reading_time || undefined,
    categoryId: b.category_id || undefined,
    
    // SEO
    seoTitle: b.seo_title || undefined,
    seoDescription: b.seo_description || undefined,
    canonicalUrl: b.canonical_url || undefined,
    isNoIndex: b.is_noindex || false,
    isNoFollow: b.is_nofollow || false,
    keywords: b.keywords || [],

    viewCount: b.view_count || 0,
    scheduledFor: b.scheduled_for || undefined,
    likes: b.likes || 0,
  }),

  toOrder: (o: DbOrder): Order => {
    const rawData = o.products as any;
    let products: OrderItem[] = [];
    let shippingAddress: ShippingAddress | undefined = undefined;

    if (Array.isArray(rawData)) {
      products = rawData.map((item: any) => ({
         productId: item.productId || item.product_id || '',
         quantity: item.quantity || 1,
         size: item.size || 'N/A',
         title: item.title || 'Product Piece',
         price: item.price || 0,
         selectedColor: item.selectedColor || item.selected_color,
         image: item.image || ''
      }));
    } else if (rawData && typeof rawData === 'object') {
      const items = rawData.items || [];
      products = items.map((item: any) => ({
         productId: item.productId || item.product_id || '',
         quantity: item.quantity || 1,
         size: item.size || 'N/A',
         title: item.title || 'Product Piece',
         price: item.price || 0,
         selectedColor: item.selectedColor || item.selected_color,
         image: item.image || ''
      }));
      shippingAddress = rawData.shippingAddress as ShippingAddress;
    }

    if (!shippingAddress && (o as any).shipping_address) {
       shippingAddress = (o as any).shipping_address;
    }

    return {
      id: o.id,
      userId: o.user_id || null, 
      customerName: (o as any).customer_name,
      customerEmail: (o as any).customer_email,
      orderNumber: o.order_number || o.id.slice(0, 8),
      products: products,
      total: o.total,
      subtotal: o.subtotal || undefined,
      shippingCost: o.shipping_cost || undefined,
      taxAmount: o.tax_amount || undefined,
      discountAmount: o.discount_amount || undefined,
      discountCode: o.discount_code || undefined,
      status: o.status || 'Pending',
      createdAt: o.date || new Date().toISOString(),
      shippingAddress: shippingAddress,
      paymentStatus: o.payment_status || 'pending',
      paymentIntentId: o.payment_intent_id || undefined,
      trackingNumber: o.tracking_number || undefined,
      shippedAt: o.shipped_at || undefined,
      deliveredAt: o.delivered_at || undefined,
      cancelledAt: o.cancelled_at || undefined,
      notes: o.notes || undefined,
      // Return fields
      returnReason: (o as any).return_reason || undefined,
      returnRequestedAt: (o as any).return_requested_at || undefined,
      returnStatus: (o as any).return_status || 'none',
    };
  },

  toProductReview: (r: any): ProductReview => ({
    id: r.id,
    productId: r.product_id,
    userId: r.user_id,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    verifiedPurchase: r.verified_purchase,
    createdAt: r.created_at,
    isApproved: r.is_approved
  }),

  toCartItem: (row: any): CartItem => {
    const p = Mappers.toProduct(row.product);
    return {
      ...p,
      quantity: row.quantity,
      selectedSize: row.selected_size,
      selectedColor: row.selected_color
    };
  },

  toShippingZone: (z: any): ShippingZone => ({
    id: z.id,
    name: z.name,
    countries: z.countries,
    baseRate: z.base_rate,
    perKgRate: z.per_kg_rate,
    freeShippingThreshold: z.free_shipping_threshold,
    estimatedDays: z.estimated_days,
    isActive: z.is_active
  }),

  toDiscountCode: (d: any): DiscountCode => ({
    id: d.id,
    code: d.code,
    discountType: d.discount_type || 'fixed',
    discountValue: d.discount_value,
    description: d.description || '',
    validFrom: d.valid_from || '',
    validUntil: d.valid_until || '',
    isActive: d.is_active || false,
    applicableCategories: d.applicable_categories || undefined,
    minimumPurchase: d.minimum_purchase || undefined,
    maxUses: d.max_uses || undefined
  }),
  
  toUser: (u: any): User => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.created_at,
    avatarUrl: u.avatar_url || undefined,
    bio: u.bio || undefined
  }),

  toNewsletterSubscriber: (n: DbNewsletterSubscriber): NewsletterSubscriber => ({
    id: n.id,
    email: n.email,
    name: n.name || undefined,
    source: n.source || undefined,
    isSubscribed: n.is_subscribed || false,
    subscribedAt: n.subscribed_at || new Date().toISOString()
  }),

  toContactSubmission: (c: DbContactSubmission): ContactSubmission => ({
    id: c.id,
    name: c.name,
    email: c.email,
    message: c.message,
    subject: c.subject || undefined,
    phone: c.phone || undefined,
    isRead: c.is_read || false,
    createdAt: c.created_at || new Date().toISOString()
  })
};
