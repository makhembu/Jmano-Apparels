-- ============================================================================
-- JAMBO APPARELS - SCALABILITY & PAGINATION RPCs
-- Fixes: "Data Bomb" crashes in Admin Dashboard
-- ============================================================================

-- 1. ADMIN DASHBOARD STATS (Aggregated on Server)
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Check Admin Permissions
  IF NOT public.check_is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_build_object(
    'revenue', COALESCE((SELECT SUM(total) FROM orders WHERE payment_status = 'paid'), 0),
    'orders', (SELECT COUNT(*) FROM orders WHERE status NOT IN ('Cancelled', 'Refunded', 'Pending Payment')),
    'users', (SELECT COUNT(*) FROM users),
    'products', (SELECT COUNT(*) FROM products),
    'low_stock', (SELECT COUNT(*) FROM products WHERE stock_quantity <= low_stock_threshold),
    'pending_orders', (SELECT COUNT(*) FROM orders WHERE status IN ('Pending', 'Processing', 'Pending Payment'))
  ) INTO result;
  
  RETURN result;
END;
$$;

-- 2. PAGINATED USERS FETCH
CREATE OR REPLACE FUNCTION get_users_paginated(
  page_num int DEFAULT 1,
  page_size int DEFAULT 20,
  search_term text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offset int;
  v_total int;
  v_data jsonb;
BEGIN
  -- Check Admin Permissions
  IF NOT public.check_is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  v_offset := (page_num - 1) * page_size;

  -- Count total matches
  SELECT COUNT(*) INTO v_total
  FROM users
  WHERE search_term IS NULL 
     OR name ILIKE '%' || search_term || '%' 
     OR email ILIKE '%' || search_term || '%';

  -- Fetch Page
  SELECT jsonb_agg(t.*) INTO v_data
  FROM (
    SELECT id, email, name, role, created_at
    FROM users
    WHERE search_term IS NULL 
       OR name ILIKE '%' || search_term || '%' 
       OR email ILIKE '%' || search_term || '%'
    ORDER BY created_at DESC
    LIMIT page_size
    OFFSET v_offset
  ) t;

  RETURN jsonb_build_object(
    'data', COALESCE(v_data, '[]'::jsonb),
    'total', v_total,
    'page', page_num,
    'totalPages', CEIL(v_total::numeric / page_size)
  );
END;
$$;

-- 3. PAGINATED ORDERS FETCH
CREATE OR REPLACE FUNCTION get_orders_paginated(
  page_num int DEFAULT 1,
  page_size int DEFAULT 20,
  status_filter text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offset int;
  v_total int;
  v_data jsonb;
BEGIN
  -- Check Admin Permissions
  IF NOT public.check_is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  v_offset := (page_num - 1) * page_size;

  SELECT COUNT(*) INTO v_total
  FROM orders
  WHERE status_filter IS NULL OR status_filter = 'ALL' OR status = status_filter;

  SELECT jsonb_agg(t.*) INTO v_data
  FROM (
    SELECT *
    FROM orders
    WHERE status_filter IS NULL OR status_filter = 'ALL' OR status = status_filter
    ORDER BY date DESC
    LIMIT page_size
    OFFSET v_offset
  ) t;

  RETURN jsonb_build_object(
    'data', COALESCE(v_data, '[]'::jsonb),
    'total', v_total,
    'page', page_num,
    'totalPages', CEIL(v_total::numeric / page_size)
  );
END;
$$;

-- 4. PRODUCT-SPECIFIC SALES STATS
CREATE OR REPLACE FUNCTION get_product_sales_stats(p_product_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats jsonb;
  v_recent_orders jsonb;
BEGIN
  -- Check Admin Permissions
  IF NOT public.check_is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Calculate stats
  WITH product_orders AS (
    SELECT
      o.id,
      (item->>'quantity')::int as quantity,
      (item->>'price')::numeric as price
    FROM public.orders o,
    jsonb_array_elements(o.products) as item
    WHERE (item->>'productId')::uuid = p_product_id
    AND o.status NOT IN ('Cancelled', 'Refunded')
  )
  SELECT jsonb_build_object(
    'revenue', COALESCE(SUM(po.price * po.quantity), 0),
    'unitsSold', COALESCE(SUM(po.quantity), 0),
    'orderCount', COUNT(DISTINCT po.id)
  )
  INTO v_stats
  FROM product_orders po;

  -- Get recent orders containing this product
  SELECT jsonb_agg(t)
  INTO v_recent_orders
  FROM (
    SELECT o.*
    FROM public.orders o,
    jsonb_array_elements(o.products) as item
    WHERE (item->>'productId')::uuid = p_product_id
    AND o.status NOT IN ('Cancelled', 'Refunded')
    ORDER BY o.created_at DESC
    LIMIT 5
  ) t;

  -- Combine and return
  RETURN jsonb_build_object(
    'stats', v_stats,
    'recentOrders', COALESCE(v_recent_orders, '[]'::jsonb)
  );
END;
$$;


-- Grant permissions
GRANT EXECUTE ON FUNCTION get_admin_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_paginated TO authenticated;
GRANT EXECUTE ON FUNCTION get_orders_paginated TO authenticated;
GRANT EXECUTE ON FUNCTION get_product_sales_stats TO authenticated;