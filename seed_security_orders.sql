
-- ============================================================================
-- JAMBO APPARELS - CRITICAL SECURITY PATCH (ORDERS)
-- Fixes IDOR Vulnerability: Restricts Order Access
-- ============================================================================

-- 1. Enable RLS on Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing insecure/default policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow update orders" ON public.orders;

-- 3. Policy: Users see ONLY their own orders
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR 
  (customer_email = auth.jwt()->>'email') -- Fallback for guest-to-registered conversion
);

-- 4. Policy: Admins can do EVERYTHING
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR ALL
TO authenticated
USING (public.check_is_admin(auth.uid()))
WITH CHECK (public.check_is_admin(auth.uid()));

-- 5. Policy: Guest Checkout (Insert Only)
-- Anyone (anon or auth) can create an order.
CREATE POLICY "Allow public insert orders"
ON public.orders
FOR INSERT
WITH CHECK (true);

-- 6. Policy: Guest Tracking (Limited Read)
-- Strict policy for order tracking page if implemented later.
-- For now, we restrict anon reads completely to prevent enumeration.
-- Users must log in or use a secure token link (not implemented) to view orders.

-- 7. Ensure Items RLS (Cart Items)
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own cart" ON public.cart_items;

CREATE POLICY "Users view own cart" 
ON public.cart_items FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- 8. Ensure Reviews RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Users insert reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Admin manage reviews" ON public.product_reviews;

CREATE POLICY "Public read reviews" 
ON public.product_reviews FOR SELECT 
USING (is_approved = true);

CREATE POLICY "Users insert reviews" 
ON public.product_reviews FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin manage reviews" 
ON public.product_reviews FOR ALL 
TO authenticated 
USING (public.check_is_admin(auth.uid()));
