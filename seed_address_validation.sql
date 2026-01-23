-- This script hardens the create_order_secure function by adding
-- robust server-side validation for the shipping address JSONB payload.

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
  -- Validation variables
  v_address1 text;
  v_city text;
  v_postcode text;
  v_country text;
BEGIN
  -- 0. VALIDATE SHIPPING ADDRESS
  IF jsonb_typeof(p_shipping_address) != 'object' THEN
    RAISE EXCEPTION 'Invalid shipping address: not a JSON object.';
  END IF;

  v_address1 := p_shipping_address->>'address1';
  v_city     := p_shipping_address->>'city';
  v_postcode := p_shipping_address->>'postcode';
  v_country  := p_shipping_address->>'country';

  IF v_address1 IS NULL OR trim(v_address1) = '' THEN RAISE EXCEPTION 'Shipping address requires "address1".'; END IF;
  IF v_city IS NULL OR trim(v_city) = '' THEN RAISE EXCEPTION 'Shipping address requires "city".'; END IF;
  IF v_postcode IS NULL OR trim(v_postcode) = '' THEN RAISE EXCEPTION 'Shipping address requires "postcode".'; END IF;
  IF v_country IS NULL OR trim(v_country) = '' THEN RAISE EXCEPTION 'Shipping address requires "country".'; END IF;
  IF length(v_address1) > 255 OR length(v_city) > 100 OR length(v_postcode) > 20 OR length(v_country) > 100 THEN
    RAISE EXCEPTION 'One or more address fields exceed maximum length.';
  END IF;

  -- Fetch dynamic tax rate from app_settings
  SELECT tax_rate INTO v_tax_rate FROM public.app_settings WHERE id = 1;
  IF v_tax_rate IS NULL THEN v_tax_rate := 0.20; END IF;
  IF v_tax_rate > 1 THEN v_tax_rate := v_tax_rate / 100; END IF;

  -- 1. Calculate Subtotal and Weight
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id uuid, quantity int, size text, selected_color text)
  LOOP
    SELECT price, weight, stock_quantity INTO v_product_price, v_product_weight, v_product_stock
    FROM products WHERE id = v_item.product_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found', v_item.product_id;
    END IF;

    IF COALESCE(v_product_stock, 0) < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product %', v_item.product_id;
    END IF;

    v_subtotal := v_subtotal + (v_product_price * v_item.quantity);
    v_total_weight := v_total_weight + (COALESCE(v_product_weight, 0) * v_item.quantity);
  END LOOP;

  -- 2. Calculate Shipping
  v_shipping_country := p_shipping_address->>'country';
  
  SELECT base_rate, per_kg_rate, free_shipping_threshold 
  INTO v_zone_base_rate, v_zone_per_kg_rate, v_zone_free_threshold
  FROM shipping_zones 
  WHERE v_shipping_country = ANY(countries)
  LIMIT 1;
  
  IF NOT FOUND THEN
    SELECT base_rate, per_kg_rate, free_shipping_threshold 
    INTO v_zone_base_rate, v_zone_per_kg_rate, v_zone_free_threshold
    FROM shipping_zones 
    WHERE 'Other' = ANY(countries)
    LIMIT 1;
  END IF;

  v_shipping_cost := COALESCE(v_zone_base_rate, 24.99);
  
  IF v_zone_free_threshold IS NOT NULL AND v_subtotal >= v_zone_free_threshold THEN
    v_shipping_cost := 0;
  ELSE
    v_shipping_cost := v_shipping_cost + (COALESCE(v_zone_per_kg_rate, 0) * v_total_weight);
  END IF;

  -- 3. Apply Discount
  IF p_discount_code IS NOT NULL AND p_discount_code != '' THEN
    SELECT * INTO v_discount_record FROM discount_codes 
    WHERE code = p_discount_code AND is_active = true 
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until >= NOW());
    
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

  -- 4. Calculate Tax
  v_tax_amount := (GREATEST(0, v_subtotal - v_discount_amount) * v_tax_rate) / (1 + v_tax_rate);

  -- 5. Final Total
  v_order_total := GREATEST(0, v_subtotal + v_shipping_cost - v_discount_amount);
  v_order_number := 'ORD-' || to_char(NOW(), 'YYMMDD') || '-' || upper(substring(md5(random()::text) from 1 for 4));

  -- 6. Insert Order
  INSERT INTO orders (
    user_id, order_number, date, status, 
    subtotal, shipping_cost, discount_amount, discount_code, tax_amount, total,
    products, shipping_address, notes, payment_status
  ) VALUES (
    p_user_id, v_order_number, NOW(), 'Pending',
    v_subtotal, v_shipping_cost, v_discount_amount, p_discount_code, v_tax_amount, v_order_total,
    p_items, p_shipping_address, p_notes, 'paid'
  ) RETURNING id INTO v_order_id;

  -- 7. Update Stock AND Sales Count
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id uuid, quantity int)
  LOOP
    UPDATE products 
    SET 
        stock_quantity = COALESCE(stock_quantity, 0) - v_item.quantity,
        total_sales = COALESCE(total_sales, 0) + v_item.quantity
    WHERE id = v_item.product_id;
  END LOOP;

  RETURN (SELECT row_to_json(o) FROM orders o WHERE id = v_order_id);
END;
$$;