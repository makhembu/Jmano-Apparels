
-- ============================================================================
-- JAMBO APPARELS - ANALYTICS V2 (Advanced Tracking)
-- ============================================================================

-- 1. UPGRADE TABLE (Safe Alterations)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analytics_events' AND column_name='geo_country') THEN
        ALTER TABLE public.analytics_events ADD COLUMN geo_country TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analytics_events' AND column_name='geo_city') THEN
        ALTER TABLE public.analytics_events ADD COLUMN geo_city TEXT;
    END IF;

    -- Duration in seconds (for page_view events updated later or specific time_on_page events)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analytics_events' AND column_name='duration') THEN
        ALTER TABLE public.analytics_events ADD COLUMN duration INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. GEOGRAPHY ANALYTICS
CREATE OR REPLACE FUNCTION get_geo_stats(
  days_lookback int DEFAULT 30
) 
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_agg(t) INTO result FROM (
    SELECT 
      COALESCE(geo_country, 'Unknown') as country,
      COUNT(DISTINCT session_id) as visitors,
      COUNT(*) FILTER (WHERE event_type = 'purchase') as orders,
      COALESCE(SUM((metadata->>'total')::numeric) FILTER (WHERE event_type = 'purchase'), 0) as revenue
    FROM analytics_events
    WHERE created_at > (now() - (days_lookback || ' days')::interval)
    GROUP BY 1
    ORDER BY visitors DESC
    LIMIT 10
  ) t;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- 3. PAGE PERFORMANCE (Time & Exits)
CREATE OR REPLACE FUNCTION get_page_analytics(
  days_lookback int DEFAULT 30
) 
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_agg(t) INTO result FROM (
    SELECT 
      path,
      COUNT(*) as views,
      ROUND(AVG(COALESCE(duration, 0)), 1) as avg_time,
      -- Exit Rate approximation: Sessions where this was the last event
      -- (Simplified for prototype: Pages with high bounce usually have low duration)
      COUNT(DISTINCT session_id) as unique_visitors
    FROM analytics_events
    WHERE event_type = 'page_view'
      AND created_at > (now() - (days_lookback || ' days')::interval)
    GROUP BY 1
    ORDER BY views DESC
    LIMIT 15
  ) t;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- 4. UPDATE TOP PRODUCTS (To Respect Time Range)
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_geo_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_page_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_product_analytics TO authenticated;
