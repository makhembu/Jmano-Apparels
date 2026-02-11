
-- ============================================================================
-- CRITICAL SECURITY PATCH
-- 1. Redefines create_order_secure to prevent price manipulation
-- 2. Enables RLS on cart_items
-- ============================================================================

-- 1. Secure Order Creation Logic
-- This function recalculates the total based on DB prices, ignoring client-sent prices
CREATE OR REPLACE FUNCTION public.create_order_secure(
    p_user_id uuid,
    p_customer_email text,
    p_customer_name text,
    p_items jsonb,
    p_shipping_address jsonb,
    p_discount_code text DEFAULT NULL,
    p_notes text DEFAULT NULL,
    p_payment_status text DEFAULT 'pending',
    p_payment_intent_id text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_order_id uuid;
    v_order_number text;
    v_total numeric := 0;
    v_subtotal numeric := 0;
    v_shipping_cost numeric := 0;
    v_item jsonb;
    v_product_price numeric;
    v_product_sale_price numeric;
    v_product_on_sale boolean;
    v_final_price numeric;
    v_qty integer;
    v_product_id uuid;
    v_secure_products jsonb := '[]'::jsonb;
    v_discount_amount numeric := 0;
    v_discount_type text;
    v_discount_val numeric;
    v_min_purchase numeric;
BEGIN
    -- Generate Order Number
    v_order_number := 'ORD-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(md5(random()::text), 1, 4));

    -- Loop through items to calculate real price from DB
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::uuid;
        v_qty := (v_item->>'quantity')::integer;

        -- Fetch current price from DB
        SELECT price, sale_price, is_on_sale 
        INTO v_product_price, v_product_sale_price, v_product_on_sale
        FROM products 
        WHERE id = v_product_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product % not found', v_product_id;
        END IF;

        -- Determine effective price
        IF v_product_on_sale AND v_product_sale_price IS NOT NULL THEN
            v_final_price := v_product_sale_price;
        ELSE
            v_final_price := v_product_price;
        END IF;

        -- Accumulate Subtotal
        v_subtotal := v_subtotal + (v_final_price * v_qty);

        -- Reconstruct item JSON with secure price
        v_secure_products := v_secure_products || jsonb_build_object(
            'productId', v_product_id,
            'title', v_item->>'title',
            'quantity', v_qty,
            'size', v_item->>'size',
            'selectedColor', v_item->>'selected_color',
            'image', v_item->>'image',
            'price', v_final_price -- OVERWRITE with DB price
        );
    END LOOP;

    -- Calculate Discount (Server Side)
    IF p_discount_code IS NOT NULL THEN
        SELECT discount_type, discount_value, minimum_purchase
        INTO v_discount_type, v_discount_val, v_min_purchase
        FROM discount_codes
        WHERE code = p_discount_code AND is_active = true
        AND (valid_until IS NULL OR valid_until > now());

        IF FOUND THEN
            IF v_min_purchase IS NULL OR v_subtotal >= v_min_purchase THEN
                IF v_discount_type = 'percentage' THEN
                    v_discount_amount := v_subtotal * (v_discount_val / 100);
                ELSE
                    v_discount_amount := v_discount_val;
                END IF;
            END IF;
        END IF;
    END IF;

    -- Calculate Totals (Simple logic, can be expanded for zones)
    -- Default shipping logic (fallback)
    IF v_subtotal >= 75 THEN
        v_shipping_cost := 0;
    ELSE
        v_shipping_cost := 4.99;
    END IF;

    v_total := v_subtotal - v_discount_amount + v_shipping_cost;
    IF v_total < 0 THEN v_total := 0; END IF;

    -- Insert Order
    INSERT INTO orders (
        user_id,
        customer_email,
        customer_name,
        order_number,
        products,
        subtotal,
        discount_code,
        discount_amount,
        shipping_cost,
        total,
        shipping_address,
        status,
        payment_status,
        payment_intent_id,
        date
    ) VALUES (
        p_user_id,
        p_customer_email,
        p_customer_name,
        v_order_number,
        v_secure_products, -- Use validated products
        v_subtotal,
        p_discount_code,
        v_discount_amount,
        v_shipping_cost,
        v_total,
        p_shipping_address,
        'Pending', -- Default status
        p_payment_status,
        p_payment_intent_id,
        now()
    ) RETURNING id INTO v_order_id;

    -- Decrement Stock
    FOR v_item IN SELECT * FROM jsonb_array_elements(v_secure_products)
    LOOP
        UPDATE products 
        SET stock_quantity = stock_quantity - (v_item->>'quantity')::integer,
            total_sales = total_sales + (v_item->>'quantity')::integer
        WHERE id = (v_item->>'productId')::uuid;
    END LOOP;

    -- Return the full order row
    RETURN (SELECT row_to_json(orders) FROM orders WHERE id = v_order_id);
END;
$function$;

-- 2. Secure Cart Items Table
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Remove existing lax policies if any
DROP POLICY IF EXISTS "Enable all access for all users" ON public.cart_items;
DROP POLICY IF EXISTS "Users can manage their own cart" ON public.cart_items;

-- Users can only see/edit their own cart rows
CREATE POLICY "Users manage own cart" ON public.cart_items
    FOR ALL
    TO public
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all carts (optional, for debugging)
CREATE POLICY "Admins view all carts" ON public.cart_items
    FOR SELECT
    TO authenticated
    USING (check_is_admin(auth.uid()));
