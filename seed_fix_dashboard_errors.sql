-- ============================================================================
-- FIX DASHBOARD ERRORS
-- 1. Fix "column created_at does not exist" in get_orders_paginated
-- 2. Fix "function get_product_analytics signature" mismatch
-- ============================================================================

-- 1. Fix Order Pagination (Use 'date' instead of 'created_at')
CREATE OR REPLACE FUNCTION public.get_orders_paginated(
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

  -- Count total
  SELECT COUNT(*) INTO v_total
  FROM orders
  WHERE status_filter IS NULL OR status_filter = 'ALL' OR status = status_filter;

  -- Fetch Data (Ordering by 'date' which exists, instead of 'created_at')
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


-- 2. Fix Product Analytics (Ensure parameters match frontend)
-- Overloading the function to handle both calls safely
CREATE OR REPLACE FUNCTION public.get_product_analytics(
  limit_count int DEFAULT 5,
  days_lookback int DEFAULT 30
) 
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Check Admin
  IF NOT public.check_is_admin(auth.uid()) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  
  SELECT jsonb_agg(t) INTO result FROM (
    SELECT 
      metadata->>'product_title' as title,
      COUNT(*) FILTER (WHERE event_type = 'view_item') as views,
      COUNT(*) FILTER (WHERE event_type = 'add_to_cart') as adds,
      COUNT(*) FILTER (WHERE event_type = 'purchase_item') as sales
    FROM analytics_events
    WHERE metadata->>'product_title' IS NOT NULL
      AND created_at > (now() - (days_lookback || ' days')::interval)
    GROUP BY 1
    ORDER BY views DESC
    LIMIT limit_count
  ) t;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Grant permissions again just in case
GRANT EXECUTE ON FUNCTION public.get_orders_paginated TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_product_analytics TO authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload config';
