-- ============================================================================
-- JAMBO APPARELS - PRODUCTION ANALYTICS REPAIR
-- Fixes "No Data" issues by sourcing Sales/Revenue directly from Orders table
-- while keeping Views/Traffic from Analytics Events.
-- ============================================================================

-- 1. ROBUST ANALYTICS OVERVIEW
-- Pulls Financials from 'orders' table (Real Truth)
-- Pulls Traffic from 'analytics_events' table (Estimated Truth)
CREATE OR REPLACE FUNCTION get_analytics_overview(
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
  -- Count valid orders for conversion calculation
  SELECT COUNT(*) INTO total_orders
  FROM orders 
  WHERE date BETWEEN time_range_start AND time_range_end
  AND status NOT IN ('Cancelled', 'Refunded', 'Pending Payment');

  -- Sum revenue for PAID orders
  SELECT COALESCE(SUM(total), 0) INTO total_revenue
  FROM orders 
  WHERE date BETWEEN time_range_start AND time_range_end
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

-- 2. ROBUST PRODUCT ANALYTICS
-- Merges 'Views' (Analytics) with 'Sales' (Orders JSONB)
CREATE OR REPLACE FUNCTION get_product_analytics(
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
  IF NOT public.check_is_admin(auth.uid()) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  
  -- CTE 1: Views/Adds from Analytics (Client Side)
  WITH event_metrics AS (
    SELECT
      metadata->>'product_title' as title,
      COUNT(*) FILTER (WHERE event_type = 'view_item') as views,
      COUNT(*) FILTER (WHERE event_type = 'add_to_cart') as adds
    FROM analytics_events
    WHERE created_at > (now() - (days_lookback || ' days')::interval)
    AND metadata->>'product_title' IS NOT NULL
    GROUP BY 1
  ),
  -- CTE 2: Actual Sales from Orders (Server Side Source of Truth)
  order_metrics AS (
    SELECT
      item->>'title' as title,
      SUM(COALESCE((item->>'quantity')::int, 1)) as sales
    FROM orders,
    jsonb_array_elements(products) as item
    WHERE date > (now() - (days_lookback || ' days')::interval)
    AND payment_status = 'paid' -- More accurate than status check for sales
    GROUP BY 1
  )
  -- Merge Results
  SELECT jsonb_agg(t) INTO result FROM (
    SELECT 
        COALESCE(om.title, em.title) as title,
        COALESCE(em.views, 0) as views,
        COALESCE(em.adds, 0) as adds,
        COALESCE(om.sales, 0) as sales
    FROM order_metrics om
    FULL OUTER JOIN event_metrics em ON om.title = em.title
    ORDER BY sales DESC, views DESC
    LIMIT limit_count
  ) t;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- 3. ENSURE GEO & PAGE STATS EXIST
-- (Simple wrapper to prevent errors if table is empty)
CREATE OR REPLACE FUNCTION get_geo_stats(days_lookback int DEFAULT 30) 
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.check_is_admin(auth.uid()) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  SELECT jsonb_agg(t) INTO result FROM (
    SELECT 
      COALESCE(geo_country, 'Unknown') as country,
      COUNT(DISTINCT session_id) as visitors,
      0 as revenue -- Simplified for geo view
    FROM analytics_events
    WHERE created_at > (now() - (days_lookback || ' days')::interval)
    GROUP BY 1 ORDER BY visitors DESC LIMIT 10
  ) t;
  RETURN COALESCE(result, '[]'::jsonb);
END; $$;

-- 4. GRANT PERMISSIONS
GRANT EXECUTE ON FUNCTION get_analytics_overview TO authenticated;
GRANT EXECUTE ON FUNCTION get_product_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_geo_stats TO authenticated;