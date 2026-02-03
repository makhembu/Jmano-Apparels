
-- ============================================================================
-- JAMBO APPARELS - PERFORMANCE OPTIMIZATION
-- Required indexes to support timeout-free queries.
-- ============================================================================

-- 1. Users (Auth & Profile Sync)
-- Crucial for AuthContext syncProfile without timeouts
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 2. Products (Shop Filtering)
-- Crucial for getPaginatedProducts RPC performance
CREATE INDEX IF NOT EXISTS idx_products_category_key ON public.products(category_key);
CREATE INDEX IF NOT EXISTS idx_products_is_published ON public.products(is_published);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- 3. Analytics (Dashboard Speed)
-- Crucial for Admin Dashboard live metrics
CREATE INDEX IF NOT EXISTS idx_analytics_created_at_desc ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type);

-- 4. Orders (User History)
-- Crucial for instant "My Orders" load
-- Fixed: use 'date' column instead of 'created_at' as per orders schema
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_date_desc ON public.orders(date DESC);

-- 5. Blog
-- Fixed: use 'date' column instead of 'created_at' as per schema
CREATE INDEX IF NOT EXISTS idx_blog_status_date ON public.blog_posts(status, date DESC);
