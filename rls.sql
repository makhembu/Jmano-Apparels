-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. APP SETTINGS
-- Public Read, Admin Write
CREATE POLICY "Public Read Settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admin Write Settings" ON public.app_settings FOR ALL USING (public.is_admin());

-- 2. BLOG & CATEGORIES
-- Public Read, Admin Write
CREATE POLICY "Public Read BlogCats" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Admin Write BlogCats" ON public.blog_categories FOR ALL USING (public.is_admin());

CREATE POLICY "Public Read BlogTags" ON public.blog_tags FOR SELECT USING (true);
CREATE POLICY "Admin Write BlogTags" ON public.blog_tags FOR ALL USING (public.is_admin());

-- Posts: Public see published, Admin see all
CREATE POLICY "Public Read Published Posts" ON public.blog_posts FOR SELECT USING (status = 'published' OR public.is_admin());
CREATE POLICY "Admin Manage Posts" ON public.blog_posts FOR ALL USING (public.is_admin());

-- 3. PRODUCTS & CATEGORIES
-- Public Read (Published), Admin Write
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin Write Categories" ON public.categories FOR ALL USING (public.is_admin());

CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (is_published = true OR public.is_admin());
CREATE POLICY "Admin Manage Products" ON public.products FOR ALL USING (public.is_admin());

-- 4. USERS
-- Users read/write own, Admin read all
CREATE POLICY "Users Read Self" ON public.users FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users Update Self" ON public.users FOR UPDATE USING (auth.uid() = id);
-- Note: Insert is usually handled by trigger on auth.users, but if client creates:
CREATE POLICY "Users Insert Self" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. ORDERS
-- Users read own, Admin read all. Insert handled by RPC usually, but allow insert for auth user.
CREATE POLICY "Users Read Own Orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users Create Orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin Manage Orders" ON public.orders FOR UPDATE USING (public.is_admin());

-- 6. CART ITEMS
-- Users manage own cart
CREATE POLICY "Users Manage Cart" ON public.cart_items FOR ALL USING (auth.uid() = user_id);

-- 7. WISHLISTS
-- Users manage own wishlist
CREATE POLICY "Users Manage Wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);

-- 8. PRODUCT REVIEWS
-- Public Read, Authenticated Insert Own, Admin Manage
CREATE POLICY "Public Read Reviews" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "Users Write Reviews" ON public.product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update own reviews? Optional. Let's allow it.
CREATE POLICY "Users Edit Own Reviews" ON public.product_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin Manage Reviews" ON public.product_reviews FOR DELETE USING (public.is_admin());

-- 9. SHIPPING ZONES
-- Public Read, Admin Write
CREATE POLICY "Public Read Shipping" ON public.shipping_zones FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admin Manage Shipping" ON public.shipping_zones FOR ALL USING (public.is_admin());

-- 10. DISCOUNT CODES
-- Public Read Active, Admin Write
CREATE POLICY "Public Read Discounts" ON public.discount_codes FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admin Manage Discounts" ON public.discount_codes FOR ALL USING (public.is_admin());

-- 11. CONTACT & NEWSLETTER
-- Contact: Public Insert, Admin Read
CREATE POLICY "Public Contact Submit" ON public.contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Read Contact" ON public.contact_submissions FOR SELECT USING (public.is_admin());

-- Newsletter: Public Upsert (by Email matching? Hard with RLS alone for anon, usually relies on service role or unrestricted insert). 
-- Simple policy: Allow insert for anyone.
CREATE POLICY "Public Subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Manage Subscribers" ON public.newsletter_subscribers FOR ALL USING (public.is_admin());
