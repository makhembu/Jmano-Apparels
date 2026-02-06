-- ============================================================================
-- JAMBO APPARELS - REVENUE CALCULATION FIX
-- Updates aggregation functions to strictly count 'paid' orders as revenue.
-- ============================================================================

-- 1. Update Admin Dashboard Stats
CREATE OR REPLACE FUNCTION public.get_admin_stats()
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
    -- FIX: Only count orders with payment_status = 'paid' for revenue
    'revenue', COALESCE((SELECT SUM(total) FROM orders WHERE payment_status = 'paid'), 0),
    'orders', (SELECT COUNT(*) FROM orders),
    'users', (SELECT COUNT(*) FROM users),
    'products', (SELECT COUNT(*) FROM products),
    'low_stock', (SELECT COUNT(*) FROM products WHERE stock_quantity <= low_stock_threshold),
    'pending_orders', (SELECT COUNT(*) FROM orders WHERE status IN ('Pending', 'Processing', 'Pending Payment'))
  ) INTO result;
  
  RETURN result;
END;
$$;


-- 2. Update Analytics Overview
CREATE OR REPLACE FUNCTION public.get_analytics_overview(
  time_range_start timestamptz,
  time_range_end timestamptz
) 
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_visitors int;
  total_pageviews int;
  total_orders int;
  total_revenue numeric;
  conversion_rate numeric;
BEGIN
  -- Check Permissions
  IF NOT public.check_is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- 1. Traffic Metrics (From Analytics Events)
  SELECT COUNT(DISTINCT session_id) INTO total_visitors
  FROM analytics_events 
  WHERE created_at BETWEEN time_range_start AND time_range_end;

  SELECT COUNT(*) INTO total_pageviews
  FROM analytics_events 
  WHERE event_type = 'page_view' 
  AND created_at BETWEEN time_range_start AND time_range_end;

  -- 2. Financial Metrics (From Real Orders)
  -- Count all orders for conversion calculation
  SELECT COUNT(*) INTO total_orders
  FROM orders 
  WHERE created_at BETWEEN time_range_start AND time_range_end
  AND status NOT IN ('Cancelled', 'Refunded');

  -- FIX: Only sum revenue for PAID orders
  SELECT COALESCE(SUM(total), 0) INTO total_revenue
  FROM orders 
  WHERE created_at BETWEEN time_range_start AND time_range_end
  AND payment_status = 'paid';

  -- 3. Calculate Conversion
  IF total_visitors > 0 THEN
    conversion_rate := (total_orders::numeric / total_visitors::numeric) * 100;
  ELSE
    conversion_rate := 0;
  END IF;

  RETURN jsonb_build_object(
    'visitors', total_visitors,
    'pageviews', total_pageviews,
    'orders', total_orders,
    'revenue', total_revenue,
    'conversion_rate', conversion_rate
  );
END;
$$;


-- 3. Update Daily Analytics (Graph consistency)
CREATE OR REPLACE FUNCTION public.get_daily_analytics(days_lookback int DEFAULT 30) 
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.check_is_admin(auth.uid()) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  SELECT jsonb_agg(t) INTO result FROM (
    SELECT 
      to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as date,
      COUNT(DISTINCT session_id) as visitors,
      COUNT(*) FILTER (WHERE event_type = 'page_view') as pageviews,
      COUNT(*) FILTER (WHERE event_type = 'purchase') as orders,
      -- FIX: Daily revenue trend should only show paid amounts
      COALESCE(SUM(total) FILTER (WHERE payment_status = 'paid'), 0) as revenue
    FROM orders
    FULL OUTER JOIN analytics_events ON date_trunc('day', orders.created_at) = date_trunc('day', analytics_events.created_at)
    WHERE (analytics_events.created_at > (now() - (days_lookback || ' days')::interval)
       OR orders.created_at > (now() - (days_lookback || ' days')::interval))
    GROUP BY 1
    ORDER BY 1 ASC
  ) t;
  RETURN COALESCE(result, '[]'::jsonb);
END; $$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_admin_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_analytics_overview TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_daily_analytics TO authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload config';