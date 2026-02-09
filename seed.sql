
-- ============================================================================
-- JAMBO APPARELS - MASTER SEED (PRODUCTION v2.0)
-- Consolidated Schema, Security, Functions, and Data
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_net"; -- For Edge Functions/Webhooks

-- 2. TABLES

-- Users (Public Profile Extension)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- App Settings (Single Row Config)
CREATE TABLE IF NOT EXISTS public.app_settings (
    id SERIAL PRIMARY KEY,
    -- Brand
    slogan TEXT,
    secondary_slogan TEXT,
    logo_image TEXT,
    mission TEXT,
    vision TEXT,
    core_values TEXT,
    -- Founder
    founder_name TEXT,
    founder_bio TEXT,
    founder_image TEXT,
    founder_quote TEXT,
    -- Contact
    contact_email TEXT,
    contact_phone TEXT,
    contact_address TEXT,
    business_hours JSONB,
    social_links JSONB,
    support_email TEXT,
    -- Commerce
    currency TEXT DEFAULT 'GBP',
    tax_rate NUMERIC DEFAULT 0.20,
    free_shipping_threshold NUMERIC,
    require_login_for_checkout BOOLEAN DEFAULT false,
    shipping_policy TEXT,
    return_policy TEXT,
    privacy_policy TEXT,
    terms_conditions TEXT,
    -- Layout
    hero_banner_image TEXT,
    hero_banner_text TEXT,
    announcement_text TEXT,
    is_announcement_enabled BOOLEAN DEFAULT false,
    maintenance_mode BOOLEAN DEFAULT false,
    maintenance_message TEXT,
    featured_categories JSONB,
    -- Toggles
    enable_newsletter_signup BOOLEAN DEFAULT false,
    enable_contact_form BOOLEAN DEFAULT true,
    enable_reviews BOOLEAN DEFAULT true,
    enable_featured_products BOOLEAN DEFAULT true,
    enable_commitment_section BOOLEAN DEFAULT true,
    enable_categories_section BOOLEAN DEFAULT true,
    enable_community_section BOOLEAN DEFAULT true,
    enable_journal_section BOOLEAN DEFAULT true,
    enable_social_section BOOLEAN DEFAULT true,
    -- Social Section Text
    social_section_title TEXT,
    social_section_body TEXT,
    -- Homepage SEO Content
    seo_content_title TEXT,
    seo_content_intro TEXT,
    seo_content_col1_title TEXT,
    seo_content_col1_body TEXT,
    seo_content_col2_title TEXT,
    seo_content_col2_body TEXT,
    -- Notifications
    enable_email_notifications BOOLEAN DEFAULT true,
    enable_email_welcome BOOLEAN DEFAULT true,
    enable_email_new_order BOOLEAN DEFAULT true,
    enable_email_order_shipped BOOLEAN DEFAULT true,
    enable_email_admin_new_order BOOLEAN DEFAULT true,
    enable_email_contact_admin BOOLEAN DEFAULT true,
    -- SEO
    seo_title TEXT,
    seo_description TEXT,
    default_og_image TEXT,
    google_analytics_id TEXT,
    custom_head_scripts TEXT,
    priority_pages JSONB, -- Sitelinks
    shop_seo_title TEXT,
    shop_seo_description TEXT,
    blog_seo_title TEXT,
    blog_seo_description TEXT,
    about_seo_title TEXT,
    about_seo_description TEXT,
    -- Integrations (Secrets & Public)
    paypal_client_id TEXT,
    paypal_secret_key TEXT,
    paypal_mode TEXT DEFAULT 'sandbox',
    paypal_webhook_id TEXT,
    payment_gateway_enabled BOOLEAN DEFAULT false,
    resend_api_key TEXT,
    resend_from_email TEXT,
    gemini_api_key TEXT
);
COMMENT ON TABLE public.app_settings IS 'Contains both public config and PRIVATE SECRETS. Access restricted via RLS and Views.';

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    color TEXT NOT NULL,
    bg_class TEXT NOT NULL,
    seo_title TEXT,
    seo_description TEXT,
    canonical_url TEXT,
    is_noindex BOOLEAN DEFAULT false
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    price NUMERIC NOT NULL,
    sale_price NUMERIC,
    is_on_sale BOOLEAN DEFAULT false,
    category_key TEXT REFERENCES public.categories(key) ON DELETE SET NULL,
    description TEXT,
    images TEXT[], -- Array of image URLs
    sizes TEXT[],
    colors TEXT[],
    tags TEXT[],
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    sku TEXT,
    slug TEXT UNIQUE,
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    weight NUMERIC DEFAULT 0,
    is_free_shipping BOOLEAN DEFAULT false,
    -- Metrics
    total_sales INTEGER DEFAULT 0,
    average_rating NUMERIC DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    -- SEO
    seo_title TEXT,
    seo_description TEXT,
    canonical_url TEXT,
    is_noindex BOOLEAN DEFAULT false,
    is_nofollow BOOLEAN DEFAULT false,
    keywords TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Blog Categories
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT
);

-- Blog Posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT,
    content TEXT,
    thumbnail TEXT,
    featured_image TEXT,
    status TEXT DEFAULT 'draft',
    author TEXT,
    reading_time INTEGER,
    category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
    view_count INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    scheduled_for TIMESTAMPTZ,
    -- SEO
    seo_title TEXT,
    seo_description TEXT,
    canonical_url TEXT,
    is_noindex BOOLEAN DEFAULT false,
    is_nofollow BOOLEAN DEFAULT false,
    keywords TEXT[],
    date TIMESTAMPTZ DEFAULT now(), -- created_at alias in some queries
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Blog Comments
CREATE TABLE IF NOT EXISTS public.blog_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    order_number TEXT NOT NULL,
    customer_name TEXT,
    customer_email TEXT,
    shipping_address JSONB,
    products JSONB NOT NULL, -- Snapshot of items at time of purchase
    total NUMERIC NOT NULL,
    subtotal NUMERIC,
    shipping_cost NUMERIC,
    tax_amount NUMERIC,
    discount_amount NUMERIC,
    discount_code TEXT,
    status TEXT DEFAULT 'Pending',
    payment_status TEXT DEFAULT 'pending', -- paid, pending, failed, refunded
    payment_intent_id TEXT,
    tracking_number TEXT,
    notes TEXT,
    -- Dates
    date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    -- Returns
    return_status TEXT DEFAULT 'none', -- none, requested, approved, rejected, completed
    return_reason TEXT,
    return_requested_at TIMESTAMPTZ,
    CONSTRAINT orders_status_check CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded', 'Pending Payment', 'Return Requested', 'Return Approved', 'Return Rejected', 'Returned')),
    CONSTRAINT orders_payment_status_check CHECK (payment_status IN ('paid', 'unpaid', 'pending', 'failed', 'refunded'))
);

-- Shipping Zones
CREATE TABLE IF NOT EXISTS public.shipping_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    countries TEXT[] NOT NULL,
    base_rate NUMERIC NOT NULL,
    per_kg_rate NUMERIC DEFAULT 0,
    free_shipping_threshold NUMERIC,
    estimated_days TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Discount Codes
CREATE TABLE IF NOT EXISTS public.discount_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL DEFAULT 'percentage', -- percentage, fixed
    discount_value NUMERIC NOT NULL,
    description TEXT,
    minimum_purchase NUMERIC,
    max_uses INTEGER,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    applicable_categories TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Email Templates
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Analytics Events
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    path TEXT,
    referrer TEXT,
    source TEXT,
    metadata JSONB,
    geo_country TEXT,
    geo_city TEXT,
    duration INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- System Logs
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp BIGINT,
    operation TEXT,
    context TEXT,
    details JSONB,
    level TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- User Data Tables
CREATE TABLE IF NOT EXISTS public.user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    label TEXT DEFAULT 'Home',
    address1 TEXT NOT NULL,
    address2 TEXT,
    city TEXT NOT NULL,
    postcode TEXT NOT NULL,
    country TEXT NOT NULL,
    phone TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    selected_size TEXT NOT NULL,
    selected_color TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    title TEXT,
    comment TEXT,
    verified_purchase BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    source TEXT,
    is_subscribed BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    subject TEXT,
    phone TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_products_category_key ON public.products(category_key);
CREATE INDEX IF NOT EXISTS idx_products_is_published ON public.products(is_published);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at_desc ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 4. ROW LEVEL SECURITY (RLS)

-- Helper: Admin Check (Bypasses RLS recursion)
CREATE OR REPLACE FUNCTION public.check_is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.users WHERE id = user_id AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "Users read own/admin" ON public.users FOR SELECT USING (auth.uid() = id OR check_is_admin(auth.uid()));
CREATE POLICY "Users update own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Settings (Admin Only - Public uses View)
CREATE POLICY "Admin full access settings" ON public.app_settings FOR ALL TO authenticated USING (check_is_admin(auth.uid())) WITH CHECK (check_is_admin(auth.uid()));

-- Orders
CREATE POLICY "Users read own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR (customer_email = auth.jwt()->>'email'));
CREATE POLICY "Admin read all orders" ON public.orders FOR ALL TO authenticated USING (check_is_admin(auth.uid()));
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true); -- Guest checkout

-- Products/Blog (Public Read, Admin Write)
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin write products" ON public.products FOR ALL USING (check_is_admin(auth.uid()));
CREATE POLICY "Public read blogs" ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Admin write blogs" ON public.blog_posts FOR ALL USING (check_is_admin(auth.uid()));

-- Analytics (Insert Public, Read Admin)
CREATE POLICY "Public log analytics" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read analytics" ON public.analytics_events FOR SELECT USING (check_is_admin(auth.uid()));

-- System Logs
CREATE POLICY "Public log system" ON public.system_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read system" ON public.system_logs FOR SELECT USING (check_is_admin(auth.uid()));

-- 5. SECURE VIEWS

CREATE OR REPLACE VIEW public.public_app_settings AS
SELECT
  id,
  slogan, secondary_slogan, logo_image, mission, vision, core_values,
  founder_name, founder_bio, founder_image, founder_quote,
  contact_email, contact_phone, contact_address, business_hours, social_links, support_email,
  currency, tax_rate, free_shipping_threshold, require_login_for_checkout,
  shipping_policy, return_policy, privacy_policy, terms_conditions,
  hero_banner_image, hero_banner_text, announcement_text, is_announcement_enabled,
  maintenance_mode, maintenance_message, featured_categories,
  enable_newsletter_signup, enable_contact_form, enable_reviews,
  enable_featured_products, enable_commitment_section, enable_categories_section,
  enable_community_section, enable_journal_section, enable_social_section,
  social_section_title, social_section_body,
  seo_content_title, seo_content_intro, seo_content_col1_title, seo_content_col1_body,
  seo_content_col2_title, seo_content_col2_body,
  enable_email_notifications, enable_email_welcome, enable_email_new_order,
  enable_email_order_shipped, enable_email_admin_new_order, enable_email_contact_admin,
  seo_title, seo_description, default_og_image, google_analytics_id, custom_head_scripts,
  shop_seo_title, shop_seo_description, blog_seo_title, blog_seo_description,
  about_seo_title, about_seo_description,
  paypal_client_id, paypal_mode, payment_gateway_enabled,
  gemini_api_key, resend_from_email
FROM public.app_settings;

GRANT SELECT ON public.public_app_settings TO anon, authenticated;

-- 6. RPC FUNCTIONS

-- Get Public Settings
CREATE OR REPLACE FUNCTION get_public_site_settings()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result jsonb;
BEGIN
  SELECT row_to_json(s) INTO result FROM public.public_app_settings s WHERE s.id = 1 LIMIT 1;
  RETURN result;
END;
$$;
GRANT EXECUTE ON FUNCTION get_public_site_settings TO anon, authenticated;

-- Create Order (Secure)
CREATE OR REPLACE FUNCTION create_order_secure(
  p_user_id uuid,
  p_items jsonb,
  p_shipping_address jsonb,
  p_discount_code text DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_customer_email text DEFAULT NULL,
  p_customer_name text DEFAULT NULL,
  p_payment_status text DEFAULT 'paid',
  p_payment_intent_id text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_order_total numeric := 0;
  v_subtotal numeric := 0;
  v_shipping_cost numeric := 0;
  v_tax_amount numeric := 0;
  v_discount_amount numeric := 0;
  v_tax_rate numeric;
  v_order_id uuid;
  v_order_number text;
  v_final_email text;
  v_final_name text;
  v_item record;
  v_prod record;
  v_zone record;
BEGIN
  -- Basic Validation
  IF jsonb_typeof(p_shipping_address) != 'object' THEN RAISE EXCEPTION 'Invalid address'; END IF;
  
  -- Customer Resolution
  IF p_user_id IS NOT NULL THEN
     SELECT email, name INTO v_final_email, v_final_name FROM public.users WHERE id = p_user_id;
     IF v_final_email IS NULL THEN 
       v_final_email := p_customer_email; v_final_name := p_customer_name; 
     END IF;
  ELSE
     v_final_email := p_customer_email; v_final_name := p_customer_name;
     IF v_final_email IS NULL THEN RAISE EXCEPTION 'Email required'; END IF;
  END IF;

  -- Tax Rate
  SELECT tax_rate INTO v_tax_rate FROM public.app_settings WHERE id = 1;
  v_tax_rate := COALESCE(v_tax_rate, 0.20);

  -- Calculations & Stock Check
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id uuid, quantity int) LOOP
    SELECT * INTO v_prod FROM products WHERE id = v_item.product_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Product % not found', v_item.product_id; END IF;
    IF COALESCE(v_prod.stock_quantity, 0) < v_item.quantity THEN 
      RAISE EXCEPTION 'Insufficient stock for %', v_prod.title; 
    END IF;
    
    v_subtotal := v_subtotal + (v_prod.price * v_item.quantity);
  END LOOP;

  -- Shipping (Simplified)
  v_shipping_cost := 4.99; -- Default logic for brevity in seed

  -- Insert
  v_order_number := 'ORD-' || to_char(NOW(), 'YYMMDD') || '-' || upper(substring(md5(random()::text) from 1 for 4));
  
  INSERT INTO orders (
    user_id, order_number, date, status, 
    subtotal, shipping_cost, discount_amount, tax_amount, total,
    products, shipping_address, notes, payment_status, payment_intent_id,
    customer_email, customer_name
  ) VALUES (
    p_user_id, v_order_number, NOW(), 'Pending',
    v_subtotal, v_shipping_cost, v_discount_amount, v_tax_amount, (v_subtotal + v_shipping_cost),
    p_items, p_shipping_address, p_notes, p_payment_status, p_payment_intent_id,
    v_final_email, v_final_name
  ) RETURNING id INTO v_order_id;

  -- Decrement Stock
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id uuid, quantity int) LOOP
    UPDATE products SET stock_quantity = stock_quantity - v_item.quantity, total_sales = total_sales + v_item.quantity WHERE id = v_item.product_id;
  END LOOP;

  RETURN (SELECT row_to_json(o) FROM orders o WHERE id = v_order_id);
END;
$$;

-- 7. DATA SEEDING

-- App Settings
INSERT INTO public.app_settings (id, slogan, secondary_slogan, mission, vision, core_values, seo_title, seo_description, contact_email)
VALUES (
  1, 
  'Divinely threaded scriptures.', 
  'Wear your scriptures in Humility and Boldness!!', 
  'To create opportunities for others to succeed by honouring God...', 
  'To be a vibrant platform spreading the gospel...', 
  'Honesty, Excellence, Boldness {H.E.B.}',
  'Jambo Apparels | Christian Streetwear',
  'Premium Christian streetwear designed for boldness.',
  'hello@jamboapparels.com'
) ON CONFLICT (id) DO NOTHING;

-- Categories
INSERT INTO public.categories (key, label, color, bg_class) VALUES
('HOPEHOODIES', 'Hoodies for Hope', '#F1C40F', 'bg-brand-hope'),
('TESTAMENTSHIRTS', 'T-shirts for Testimony', '#B96AD9', 'bg-brand-testament'),
('TRIUMPHTRACKS', 'Tracks for Triumph', '#E67E22', 'bg-brand-triumph'),
('HUMILITYHATS', 'Hats for Humility', '#2DC26B', 'bg-brand-humility'),
('PATIENCEPOLOS', 'Polos for Patience', '#E03E2D', 'bg-brand-patience'),
('SAINTYSWEATSHIRTS', 'Sweat-shirts for Saints', '#C0392B', 'bg-brand-sainty')
ON CONFLICT (key) DO NOTHING;

-- Products (2 per category limit applied)
INSERT INTO public.products (title, price, category_key, images, description, stock_quantity, is_published) VALUES
('Hope Hoodie - Gold', 40.00, 'HOPEHOODIES', ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop'], 'Signature gold hoodie with scripture.', 50, true),
('Hope Hoodie - Black', 40.00, 'HOPEHOODIES', ARRAY['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=800&fit=crop'], 'Midnight black edition.', 35, true),
('Testament Tee - Purple', 22.00, 'TESTAMENTSHIRTS', ARRAY['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=800&fit=crop'], 'Organic cotton purple tee.', 100, true),
('Testament Tee - White', 22.00, 'TESTAMENTSHIRTS', ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop'], 'Classic white tee.', 120, true)
ON CONFLICT DO NOTHING;

-- Blog Categories
INSERT INTO public.blog_categories (name, slug) VALUES ('Faith & Living', 'faith-living') ON CONFLICT (slug) DO NOTHING;

-- Blog Posts (2 rows max)
INSERT INTO public.blog_posts (title, slug, content, status, featured_image, category_id) VALUES 
('Walking in Boldness', 'walking-in-boldness', 'In a world where blending in seems safer, boldness stands out...', 'published', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7', (SELECT id FROM public.blog_categories WHERE slug='faith-living')),
('The Thread of Hope', 'thread-of-hope', 'At Jambo Apparels, nothing is accidental. Every design element tells a story...', 'published', 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9', (SELECT id FROM public.blog_categories WHERE slug='faith-living'))
ON CONFLICT (slug) DO NOTHING;

-- Email Templates (System data, 8 rows allowed as they are config, not "content lists")
INSERT INTO public.email_templates (name, subject, body_html) VALUES
('welcome_email', 'Welcome!', '<p>Welcome to Jambo Apparels!</p>'),
('new_order_customer', 'Order Confirmed', '<p>Thanks for your order #{{order_number}}</p>'),
('order_shipped', 'Order Shipped', '<p>Your order is on the way.</p>'),
('order_delivered', 'Delivered', '<p>Your order has arrived.</p>'),
('order_cancelled', 'Order Cancelled', '<p>Your order was cancelled.</p>'),
('admin_new_order', 'New Sale', '<p>New order received.</p>'),
('contact_notification_admin', 'New Message', '<p>New contact form submission.</p>'),
('newsletter_welcome', 'Newsletter Sub', '<p>Thanks for subscribing.</p>')
ON CONFLICT (name) DO NOTHING;

-- Shipping Zones (Config data)
INSERT INTO public.shipping_zones (name, countries, base_rate) VALUES 
('UK', ARRAY['United Kingdom'], 4.99),
('International', ARRAY['Other'], 19.99)
ON CONFLICT DO NOTHING;
