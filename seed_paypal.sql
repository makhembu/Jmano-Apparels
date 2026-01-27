
-- 1. Add PayPal Configuration Columns to App Settings
ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS paypal_client_id TEXT,
ADD COLUMN IF NOT EXISTS paypal_secret_key TEXT,
ADD COLUMN IF NOT EXISTS paypal_mode TEXT DEFAULT 'sandbox', -- 'sandbox' or 'live'
ADD COLUMN IF NOT EXISTS payment_gateway_enabled BOOLEAN DEFAULT false;

-- 2. Secure RPC to get ONLY public payment settings (Client ID)
-- This ensures the Secret Key is never exposed to the frontend
CREATE OR REPLACE FUNCTION get_public_payment_settings()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'paypal_client_id', paypal_client_id,
    'paypal_mode', paypal_mode,
    'payment_gateway_enabled', payment_gateway_enabled,
    'currency', currency
  ) INTO result
  FROM public.app_settings
  WHERE id = 1;
  
  RETURN result;
END;
$$;

-- 3. Grant execute permission to public/anon for the public settings
GRANT EXECUTE ON FUNCTION get_public_payment_settings TO anon, authenticated, service_role;

-- 4. Update create_order_secure to support Pending status and PayPal IDs
-- We drop it first to ensure signature changes are applied cleanly
DROP FUNCTION IF EXISTS public.create_order_secure;

CREATE OR REPLACE FUNCTION public.create_order_secure(
  p_user_id uuid,
  p_items jsonb,
  p_shipping_address jsonb,
  p_discount_code text DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_customer_email text DEFAULT NULL,
  p_customer_name text DEFAULT NULL,
  p_payment_status text DEFAULT 'paid', -- Default to paid for legacy/manual, 'pending' for PayPal
  p_payment_intent_id text DEFAULT NULL -- Store PayPal Order ID here
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_total numeric := 0;
  v_subtotal numeric := 0;
  v_item record;
  v_product_price numeric;
  v_product_weight numeric;
  v_total_weight numeric := 0;
  v_shipping_cost numeric := 0;
  v_tax_amount numeric := 0;
  v_discount_amount numeric := 0;
  v_shipping_country text;
  v_zone_base_rate numeric;
  v_zone_per_kg_rate numeric;
  v_zone_free_threshold numeric;
  v_discount_record record;
  v_tax_rate numeric;
  v_order_id uuid;
  v_order_number text;
  v_product_stock int;
  v_address1 text;
  v_city text;
  v_postcode text;
  v_country text;
  v_final_email text;
  v_final_name text;
  v_initial_status text;
BEGIN
  -- Validate Address
  IF jsonb_typeof(p_shipping_address) != 'object' THEN RAISE EXCEPTION 'Invalid address format'; END IF;
  v_address1 := p_shipping_address->>'address1';
  v_city := p_shipping_address->>'city';
  v_postcode := p_shipping_address->>'postcode';
  v_country := p_shipping_address->>'country';
  
  IF v_address1 IS NULL OR v_address1 = '' THEN RAISE EXCEPTION 'Address Line 1 is required'; END IF;
  IF v_postcode IS NULL OR v_postcode = '' THEN RAISE EXCEPTION 'Postcode is required'; END IF;

  -- Resolve Customer
  IF p_user_id IS NOT NULL THEN
     SELECT email, name INTO v_final_email, v_final_name FROM auth.users JOIN public.users ON auth.users.id = public.users.id WHERE public.users.id = p_user_id;
     IF v_final_email IS NULL THEN 
        v_final_email := p_customer_email;
        v_final_name := p_customer_name;
     END IF;
  ELSE
     v_final_email := p_customer_email;
     v_final_name := p_customer_name;
     IF v_final_email IS NULL THEN RAISE EXCEPTION 'Email required for guest checkout'; END IF;
  END IF;

  -- Tax Rate
  SELECT tax_rate INTO v_tax_rate FROM public.app_settings WHERE id = 1;
  v_tax_rate := COALESCE(v_tax_rate, 0.20);
  IF v_tax_rate > 1 THEN v_tax_rate := v_tax_rate / 100; END IF;

  -- Calculate Items
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id uuid, quantity int, size text, selected_color text)
  LOOP
    SELECT price, weight, stock_quantity INTO v_product_price, v_product_weight, v_product_stock
    FROM products WHERE id = v_item.product_id;
    
    IF NOT FOUND THEN RAISE EXCEPTION 'Product % not found', v_item.product_id; END IF;
    IF COALESCE(v_product_stock, 0) < v_item.quantity THEN RAISE EXCEPTION 'Insufficient stock for product %', v_item.product_id; END IF;

    v_subtotal := v_subtotal + (v_product_price * v_item.quantity);
    v_total_weight := v_total_weight + (COALESCE(v_product_weight, 0) * v_item.quantity);
  END LOOP;

  -- Shipping
  v_shipping_country := p_shipping_address->>'country';
  SELECT base_rate, per_kg_rate, free_shipping_threshold INTO v_zone_base_rate, v_zone_per_kg_rate, v_zone_free_threshold
  FROM shipping_zones WHERE v_shipping_country = ANY(countries) LIMIT 1;
  
  IF NOT FOUND THEN
    SELECT base_rate, per_kg_rate, free_shipping_threshold INTO v_zone_base_rate, v_zone_per_kg_rate, v_zone_free_threshold
    FROM shipping_zones WHERE 'Other' = ANY(countries) LIMIT 1;
  END IF;

  v_shipping_cost := COALESCE(v_zone_base_rate, 24.99);
  IF v_zone_free_threshold IS NOT NULL AND v_subtotal >= v_zone_free_threshold THEN
    v_shipping_cost := 0;
  ELSE
    v_shipping_cost := v_shipping_cost + (COALESCE(v_zone_per_kg_rate, 0) * v_total_weight);
  END IF;

  -- Discount
  IF p_discount_code IS NOT NULL AND p_discount_code != '' THEN
    SELECT * INTO v_discount_record FROM discount_codes 
    WHERE code = p_discount_code AND is_active = true 
    AND (valid_from IS NULL OR valid_from <= NOW()) AND (valid_until IS NULL OR valid_until >= NOW());
    
    IF FOUND THEN
      IF v_discount_record.minimum_purchase IS NULL OR v_subtotal >= v_discount_record.minimum_purchase THEN
        IF v_discount_record.discount_type = 'percentage' THEN
          v_discount_amount := v_subtotal * (v_discount_record.discount_value / 100);
        ELSE
          v_discount_amount := v_discount_record.discount_value;
        END IF;
      END IF;
    END IF;
  END IF;

  v_tax_amount := (GREATEST(0, v_subtotal - v_discount_amount) * v_tax_rate) / (1 + v_tax_rate);
  v_order_total := GREATEST(0, v_subtotal + v_shipping_cost - v_discount_amount);
  v_order_number := 'ORD-' || to_char(NOW(), 'YYMMDD') || '-' || upper(substring(md5(random()::text) from 1 for 4));

  -- Determine initial status based on payment
  IF p_payment_status = 'pending' THEN
    v_initial_status := 'Pending Payment';
  ELSE
    v_initial_status := 'Processing';
  END IF;

  -- Insert Order
  INSERT INTO orders (
    user_id, order_number, date, status, 
    subtotal, shipping_cost, discount_amount, discount_code, tax_amount, total,
    products, shipping_address, notes, payment_status, payment_intent_id,
    customer_email, customer_name
  ) VALUES (
    p_user_id, v_order_number, NOW(), v_initial_status,
    v_subtotal, v_shipping_cost, v_discount_amount, p_discount_code, v_tax_amount, v_order_total,
    p_items, p_shipping_address, p_notes, p_payment_status, p_payment_intent_id,
    v_final_email, v_final_name
  ) RETURNING id INTO v_order_id;

  -- Decrement Stock (Atomic)
  -- Note: We decrement stock even for pending PayPal orders to reserve items.
  -- A separate cron job should release stock for orders that stay 'Pending Payment' > 1 hour.
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id uuid, quantity int)
  LOOP
    UPDATE products 
    SET stock_quantity = COALESCE(stock_quantity, 0) - v_item.quantity,
        total_sales = COALESCE(total_sales, 0) + v_item.quantity
    WHERE id = v_item.product_id;
  END LOOP;

  RETURN (SELECT row_to_json(o) FROM orders o WHERE id = v_order_id);
END;
$$;
