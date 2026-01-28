
-- ============================================================================
-- JAMBO APPARELS - CUSTOM ANALYTICS ENGINE
-- ============================================================================

-- 1. Create Analytics Events Table
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- 'page_view', 'add_to_cart', 'purchase', 'view_item'
    path TEXT,
    referrer TEXT,
    source TEXT, -- 'direct', 'google', 'newsletter', etc.
    metadata JSONB DEFAULT '{}'::jsonb, -- Store product_id, order_total, etc.
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON public.analytics_events(session_id);

-- 3. RLS Policies
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon) to INSERT events (tracking)
DROP POLICY IF EXISTS "Allow public insert of analytics" ON public.analytics_events;
CREATE POLICY "Allow public insert of analytics" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (true);

-- Allow only Admins to SELECT (view dashboard)
DROP POLICY IF EXISTS "Allow admins to view analytics" ON public.analytics_events;
CREATE POLICY "Allow admins to view analytics" 
ON public.analytics_events 
FOR SELECT 
USING (public.check_is_admin(auth.uid()));

-- 4. AGGREGATION FUNCTIONS (Server-Side Calculation for Speed)

-- A. Get Main KPI Overview
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
  prev_visitors int;
  conversion_rate numeric;
BEGIN
  -- Current Period Metrics
  SELECT COUNT(DISTINCT session_id) INTO total_visitors
  FROM analytics_events 
  WHERE created_at BETWEEN time_range_start AND time_range_end;

  SELECT COUNT(*) INTO total_pageviews
  FROM analytics_events 
  WHERE event_type = 'page_view' 
  AND created_at BETWEEN time_range_start AND time_range_end;

  SELECT COUNT(*) INTO total_orders
  FROM analytics_events 
  WHERE event_type = 'purchase' 
  AND created_at BETWEEN time_range_start AND time_range_end;

  SELECT COALESCE(SUM((metadata->>'total')::numeric), 0) INTO total_revenue
  FROM analytics_events 
  WHERE event_type = 'purchase' 
  AND created_at BETWEEN time_range_start AND time_range_end;

  -- Calculate Conversion Rate
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

-- B. Get Daily Trends for Charts
CREATE OR REPLACE FUNCTION get_daily_analytics(
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
      to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as date,
      COUNT(DISTINCT session_id) as visitors,
      COUNT(*) FILTER (WHERE event_type = 'page_view') as pageviews,
      COUNT(*) FILTER (WHERE event_type = 'purchase') as orders,
      COALESCE(SUM((metadata->>'total')::numeric) FILTER (WHERE event_type = 'purchase'), 0) as revenue
    FROM analytics_events
    WHERE created_at > (now() - (days_lookback || ' days')::interval)
    GROUP BY 1
    ORDER BY 1 ASC
  ) t;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- C. Get Top Products (Views vs Sales)
CREATE OR REPLACE FUNCTION get_product_analytics(
  limit_count int DEFAULT 5
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
    GROUP BY 1
    ORDER BY views DESC
    LIMIT limit_count
  ) t;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- D. Get Traffic Sources
CREATE OR REPLACE FUNCTION get_traffic_sources(
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
      COALESCE(source, 'direct') as source,
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

GRANT EXECUTE ON FUNCTION get_analytics_overview TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_product_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_traffic_sources TO authenticated;
