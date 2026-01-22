import { 
  Product, Category, AppSettings, BlogPost, User, Order, 
  DbProduct, DbCategory, DbAppSettings, ShippingAddress, OrderItem,
  DbBlogPost, DbOrder, ProductReview, DiscountCode, ShippingZone, CartItem,
  BlogCategory, DbBlogCategory
} from '../types';

export const Mappers = {
  toProduct: (p: DbProduct): Product => ({
    id: p.id,
    title: p.title,
    price: p.price,
    salePrice: p.sale_price,
    isOnSale: p.is_on_sale || false,
    categoryKey: p.category_key || '',
    image: p.image || '',
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
    seoTitle: p.seo_title || undefined,
    seoDescription: p.seo_description || undefined,
    createdAt: p.created_at || undefined,
    averageRating: p.average_rating || 0,
    reviewCount: p.review_count || 0,
    totalSales: p.total_sales || 0
  }),

  toCategory: (c: DbCategory): Category => ({
    key: c.key,
    label: c.label,
    color: c.color,
    bgColorClass: c.bg_class
  }),

  toBlogCategory: (c: DbBlogCategory): BlogCategory => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description || undefined
  }),

  toAppSettings: (s: DbAppSettings): AppSettings => ({
    id: s.id,
    slogan: s.slogan || '',
    secondarySlogan: s.secondary_slogan || '',
    mission: s.mission || '',
    vision: s.vision || '',
    coreValues: s.core_values || '',
    contactEmail: s.contact_email || undefined,
    contactPhone: s.contact_phone || undefined,
    contactAddress: s.contact_address || undefined,
    businessHours: (s.business_hours as Record<string, string>) || undefined,
    socialLinks: (s.social_links as Record<string, string>) || undefined,
    supportEmail: s.support_email || undefined,
    currency: s.currency || 'GBP',
    taxRate: s.tax_rate || 0.2,
    freeShippingThreshold: s.free_shipping_threshold || undefined,
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
    smtpSettings: (s.smtp_settings as Record<string, any>) || undefined
  }),

  toBlogPost: (b: DbBlogPost): BlogPost => ({
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
    seoTitle: b.seo_title || undefined,
    seoDescription: b.seo_description || undefined,
    viewCount: b.view_count || 0
  }),

  toOrder: (o: DbOrder): Order => {
    // The products column is JSONB.
    const rawData = o.products as any;
    let products: OrderItem[] = [];
    let shippingAddress: ShippingAddress | undefined = undefined;

    if (Array.isArray(rawData)) {
      products = rawData as OrderItem[];
    } else if (rawData && typeof rawData === 'object') {
      products = (rawData.items || []) as OrderItem[];
      shippingAddress = rawData.shippingAddress as ShippingAddress;
    }

    // Fallback if not found in JSON, though type def says it's in json usually
    if (!shippingAddress && (o as any).shipping_address) {
       shippingAddress = (o as any).shipping_address;
    }

    return {
      id: o.id,
      userId: o.user_id || '',
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
      trackingNumber: o.tracking_number || undefined,
      shippedAt: o.shipped_at || undefined,
      deliveredAt: o.delivered_at || undefined,
      cancelledAt: o.cancelled_at || undefined
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
    createdAt: u.created_at
  })
};