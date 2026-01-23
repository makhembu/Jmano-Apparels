-- This script updates the database schema to support multiple product images.

-- 1. Add the new 'images' array column (as text array)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS images TEXT[];

-- 2. Migrate data from the old 'image' column to the new 'images' array
-- This runs only if the old 'image' column still exists
DO $$
BEGIN
   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='image') THEN
      UPDATE public.products
      SET images = ARRAY[image]
      WHERE image IS NOT NULL AND image != '';
   END IF;
END $$;


-- 3. Drop the old 'image' column after data is migrated
-- This runs only if the old 'image' column still exists
DO $$
BEGIN
   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='image') THEN
      ALTER TABLE public.products
      DROP COLUMN image;
   END IF;
END $$;


-- 4. Add more images to a few products for demonstration purposes
UPDATE public.products
SET images = images || ARRAY[
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=1000&fit=crop',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop'
]
WHERE slug = 'hope-hoodie-gold';

UPDATE public.products
SET images = images || ARRAY[
  'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=1000&fit=crop'
]
WHERE slug = 'hope-hoodie-black';

UPDATE public.products
SET images = images || ARRAY[
  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1000&fit=crop'
]
WHERE slug = 'testament-tee-purple';

-- 5. Ensure all products have at least an empty array if images is null
UPDATE public.products
SET images = ARRAY[]::text[]
WHERE images IS NULL;

-- 6. Update the 'create_order_secure' function to get the primary image from the 'images' array
CREATE OR REPLACE FUNCTION public.create_order_secure(
  p_user_id uuid,
  p_items jsonb,
  p_shipping_address jsonb,
  p_discount_code text DEFAULT NULL,
  p_notes text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_total numeric := 0;
  v_subtotal numeric := 0;
  v_item record;
  v_product_record record;
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
  v_order_items jsonb := '[]'::jsonb;
BEGIN
  SELECT tax_rate INTO v_tax_rate FROM public.app_settings WHERE id = 1;
  IF v_tax_rate IS NULL THEN v_tax_rate := 0.20; END IF;
  IF v_tax_rate > 1 THEN v_tax_rate := v_tax_rate / 100; END IF;

  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id uuid, quantity int, size text, selected_color text)
  LOOP
    SELECT * INTO v_product_record FROM products WHERE id = v_item.product_id;
    
    IF NOT FOUND THEN RAISE EXCEPTION 'Product % not found', v_item.product_id; END IF;
    IF COALESCE(v_product_record.stock_quantity, 0) < v_item.quantity THEN RAISE EXCEPTION 'Insufficient stock for product %', v_item.product_id; END IF;

    v_subtotal := v_subtotal + (v_product_record.price * v_item.quantity);
    v_total_weight := v_total_weight + (COALESCE(v_product_record.weight, 0) * v_item.quantity);

    -- Build the order items JSONB with the primary image
    v_order_items := v_order_items || jsonb_build_object(
      'productId', v_item.product_id,
      'quantity', v_item.quantity,
      'size', v_item.size,
      'selectedColor', v_item.selected_color,
      'title', v_product_record.title,
      'price', v_product_record.price,
      'image', v_product_record.images[1] -- Get the first image from the array
    );
  END LOOP;

  v_shipping_country := p_shipping_address->>'country';
  SELECT base_rate, per_kg_rate, free_shipping_threshold INTO v_zone_base_rate, v_zone_per_kg_rate, v_zone_free_threshold FROM shipping_zones WHERE v_shipping_country = ANY(countries) LIMIT 1;
  IF NOT FOUND THEN SELECT base_rate, per_kg_rate, free_shipping_threshold INTO v_zone_base_rate, v_zone_per_kg_rate, v_zone_free_threshold FROM shipping_zones WHERE 'Other' = ANY(countries) LIMIT 1; END IF;
  v_shipping_cost := COALESCE(v_zone_base_rate, 24.99);
  IF v_zone_free_threshold IS NOT NULL AND v_subtotal >= v_zone_free_threshold THEN v_shipping_cost := 0; ELSE v_shipping_cost := v_shipping_cost + (COALESCE(v_zone_per_kg_rate, 0) * v_total_weight); END IF;

  IF p_discount_code IS NOT NULL AND p_discount_code != '' THEN
    SELECT * INTO v_discount_record FROM discount_codes WHERE code = p_discount_code AND is_active = true AND (valid_from IS NULL OR valid_from <= NOW()) AND (valid_until IS NULL OR valid_until >= NOW());
    IF FOUND THEN IF v_discount_record.minimum_purchase IS NULL OR v_subtotal >= v_discount_record.minimum_purchase THEN IF v_discount_record.discount_type = 'percentage' THEN v_discount_amount := v_subtotal * (v_discount_record.discount_value / 100); ELSE v_discount_amount := v_discount_record.discount_value; END IF; END IF; END IF;
  END IF;

  v_tax_amount := (GREATEST(0, v_subtotal - v_discount_amount) * v_tax_rate) / (1 + v_tax_rate);
  v_order_total := GREATEST(0, v_subtotal + v_shipping_cost - v_discount_amount);
  v_order_number := 'ORD-' || to_char(NOW(), 'YYMMDD') || '-' || upper(substring(md5(random()::text) from 1 for 4));

  INSERT INTO orders (user_id, order_number, date, status, subtotal, shipping_cost, discount_amount, discount_code, tax_amount, total, products, shipping_address, notes, payment_status)
  VALUES (p_user_id, v_order_number, NOW(), 'Pending', v_subtotal, v_shipping_cost, v_discount_amount, p_discount_code, v_tax_amount, v_order_total, v_order_items, p_shipping_address, p_notes, 'paid')
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id uuid, quantity int) LOOP
    UPDATE products SET stock_quantity = COALESCE(stock_quantity, 0) - v_item.quantity, total_sales = COALESCE(total_sales, 0) + v_item.quantity WHERE id = v_item.product_id;
  END LOOP;

  RETURN (SELECT row_to_json(o) FROM orders o WHERE id = v_order_id);
END;
$$;
