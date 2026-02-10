-- Fix for 'column "created_at" does not exist' in orders table functions

-- 1. Fix get_admin_payments_paginated
DROP FUNCTION IF EXISTS public.get_admin_payments_paginated(integer, integer, text, text);

CREATE OR REPLACE FUNCTION public.get_admin_payments_paginated(
  p_page integer DEFAULT 1,
  p_page_size integer DEFAULT 20,
  p_status text DEFAULT NULL,
  p_method text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
STABLE
AS $function$
DECLARE
  v_offset integer;
  v_total integer;
  v_data json;
  v_total_pages integer;
BEGIN
  v_offset := (p_page - 1) * p_page_size;
  
  -- Get total count
  SELECT COUNT(*) INTO v_total
  FROM orders
  WHERE (p_status IS NULL OR payment_status = p_status)
    AND (p_method IS NULL OR payment_method = p_method);
  
  -- Get paginated data
  SELECT json_agg(row_to_json(t.*)) INTO v_data
  FROM (
    SELECT *
    FROM orders
    WHERE (p_status IS NULL OR payment_status = p_status)
      AND (p_method IS NULL OR payment_method = p_method)
    ORDER BY date DESC  -- Fixed: Use 'date' instead of 'created_at'
    LIMIT p_page_size
    OFFSET v_offset
  ) t;
  
  v_total_pages := CEIL(v_total::numeric / p_page_size)::integer;
  
  RETURN json_build_object(
    'data', COALESCE(v_data, '[]'::json),
    'total', v_total,
    'page', p_page,
    'totalPages', v_total_pages,
    'stats', json_build_object(
      'totalRevenue', (SELECT COALESCE(SUM(total), 0) FROM orders WHERE p_status IS NULL OR payment_status = p_status),
      'ordersCount', v_total
    )
  );
END
$function$;

-- 2. Fix get_orders_paginated
DROP FUNCTION IF EXISTS public.get_orders_paginated(integer, integer, text);

CREATE OR REPLACE FUNCTION public.get_orders_paginated(
  page_num integer DEFAULT 1,
  page_size integer DEFAULT 20,
  status_filter text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
STABLE
AS $function$
DECLARE
  v_offset integer;
  v_total integer;
  v_data json;
  v_total_pages integer;
BEGIN
  v_offset := (page_num - 1) * page_size;
  
  -- Get total count
  SELECT COUNT(*) INTO v_total
  FROM orders
  WHERE status_filter IS NULL OR status = status_filter;
  
  -- Get paginated data
  SELECT json_agg(row_to_json(t.*)) INTO v_data
  FROM (
    SELECT *
    FROM orders
    WHERE status_filter IS NULL OR status = status_filter
    ORDER BY date DESC  -- Fixed: Use 'date' instead of 'created_at'
    LIMIT page_size
    OFFSET v_offset
  ) t;
  
  v_total_pages := CEIL(v_total::numeric / page_size)::integer;
  
  RETURN json_build_object(
    'data', COALESCE(v_data, '[]'::json),
    'total', v_total,
    'page', page_num,
    'totalPages', v_total_pages
  );
END
$function$;