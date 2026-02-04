-- ============================================================================
-- JAMBO APPARELS - CRITICAL SECURITY REMEDIATION
-- Fixes: Secrets Exposure, Analytics IDOR
-- ============================================================================

-- 1. SECURE APP SETTINGS (Secrets Exposure Fix)
-- Problem: app_settings table contains secrets. RLS on rows doesn't easily hide columns from API SELECT *.
-- Solution: Create a View for public consumption and lock down the Table.

-- A. Create Secure View
CREATE OR REPLACE VIEW public.public_app_settings AS
SELECT
  id,
  slogan,
  secondary_slogan,
  logo_image,
  mission,
  vision,
  core_values,
  founder_name,
  founder_bio,
  founder_image,
  founder_quote,
  contact_email,
  contact_phone,
  contact_address,
  business_hours,
  social_links,
  support_email,
  currency,
  tax_rate,
  free_shipping_threshold,
  require_login_for_checkout,
  shipping_policy,
  return_policy,
  privacy_policy,
  terms_conditions,
  hero_banner_image,
  hero_banner_text,
  announcement_text,
  is_announcement_enabled,
  maintenance_mode,
  maintenance_message,
  featured_categories,
  enable_newsletter_signup,
  enable_contact_form,
  enable_reviews,
  enable_email_notifications, -- Boolean flags are safe
  seo_title,
  seo_description,
  default_og_image,
  google_analytics_id,
  custom_head_scripts,
  shop_seo_title,
  shop_seo_description,
  blog_seo_title,
  blog_seo_description,
  about_seo_title,
  about_seo_description,
  paypal_client_id, -- Public ID is safe
  paypal_mode,
  payment_gateway_enabled
FROM public.app_settings;

-- B. Grant Access to View
GRANT SELECT ON public.public_app_settings TO anon, authenticated;

-- C. Revoke Access to Table (Force usage of View or Admin RPC)
-- We remove permissions for anon/authenticated to read the raw table directly.
REVOKE SELECT ON public.app_settings FROM anon, authenticated;

-- D. Admin Access Policy (RLS)
-- Admins can still select/update via the 'authenticated' role, IF they pass RLS.
-- Since we revoked SELECT on the table, we need to ensure Admins can still access it.
-- However, standard Supabase Auth maps 'authenticated' to the Postgres role 'authenticated'.
-- To allow Admins to read secrets (for the Admin Dashboard), we can either:
-- 1. Use a separate RPC `get_admin_settings` (Best Practice)
-- 2. Grant SELECT back to 'authenticated' but rely on RLS.
-- We will go with Option 1 for maximum security, but existing Admin Code uses direct select.
-- Compromise: Grant SELECT to 'authenticated' but ENFORCE STRICT RLS.

GRANT SELECT ON public.app_settings TO authenticated;

DROP POLICY IF EXISTS "Allow public read app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Allow admin full access app_settings" ON public.app_settings;

CREATE POLICY "Allow admin full access app_settings"
ON public.app_settings
FOR ALL
TO authenticated
USING (public.check_is_admin(auth.uid()))
WITH CHECK (public.check_is_admin(auth.uid()));

-- NOTE: There is NO policy allowing non-admins to SELECT from app_settings.
-- They MUST use public_app_settings view.


-- 2. SECURE ANALYTICS (IDOR Fix)
-- Update all analytics functions to check for Admin role.

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
  -- SECURITY CHECK
  IF NOT public.check_is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required.';
  END IF;

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

-- Repeat Admin Check for other analytics functions
CREATE OR REPLACE FUNCTION get_daily_analytics(days_lookback int DEFAULT 30) 
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
      COALESCE(SUM((metadata->>'total')::numeric) FILTER (WHERE event_type = 'purchase'), 0) as revenue
    FROM analytics_events
    WHERE created_at > (now() - (days_lookback || ' days')::interval)
    GROUP BY 1 ORDER BY 1 ASC
  ) t;
  RETURN COALESCE(result, '[]'::jsonb);
END; $$;

CREATE OR REPLACE FUNCTION get_product_analytics(limit_count int DEFAULT 5, days_lookback int DEFAULT 30) 
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.check_is_admin(auth.uid()) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  SELECT jsonb_agg(t) INTO result FROM (
    SELECT 
      metadata->>'product_title' as title,
      COUNT(*) FILTER (WHERE event_type = 'view_item') as views,
      COUNT(*) FILTER (WHERE event_type = 'add_to_cart') as adds,
      COUNT(*) FILTER (WHERE event_type = 'purchase_item') as sales
    FROM analytics_events
    WHERE metadata->>'product_title' IS NOT NULL AND created_at > (now() - (days_lookback || ' days')::interval)
    GROUP BY 1 ORDER BY views DESC LIMIT limit_count
  ) t;
  RETURN COALESCE(result, '[]'::jsonb);
END; $$;

CREATE OR REPLACE FUNCTION get_traffic_sources(days_lookback int DEFAULT 30) 
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.check_is_admin(auth.uid()) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  SELECT jsonb_agg(t) INTO result FROM (
    SELECT 
      COALESCE(source, 'direct') as source,
      COUNT(DISTINCT session_id) as visitors,
      COUNT(*) FILTER (WHERE event_type = 'purchase') as orders,
      COALESCE(SUM((metadata->>'total')::numeric) FILTER (WHERE event_type = 'purchase'), 0) as revenue
    FROM analytics_events
    WHERE created_at > (now() - (days_lookback || ' days')::interval)
    GROUP BY 1 ORDER BY visitors DESC LIMIT 10
  ) t;
  RETURN COALESCE(result, '[]'::jsonb);
END; $$;

CREATE OR REPLACE FUNCTION get_geo_stats(days_lookback int DEFAULT 30) 
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.check_is_admin(auth.uid()) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  SELECT jsonb_agg(t) INTO result FROM (
    SELECT 
      COALESCE(geo_country, 'Unknown') as country,
      COUNT(DISTINCT session_id) as visitors,
      COUNT(*) FILTER (WHERE event_type = 'purchase') as orders,
      COALESCE(SUM((metadata->>'total')::numeric) FILTER (WHERE event_type = 'purchase'), 0) as revenue
    FROM analytics_events
    WHERE created_at > (now() - (days_lookback || ' days')::interval)
    GROUP BY 1 ORDER BY visitors DESC LIMIT 10
  ) t;
  RETURN COALESCE(result, '[]'::jsonb);
END; $$;

CREATE OR REPLACE FUNCTION get_page_analytics(days_lookback int DEFAULT 30) 
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.check_is_admin(auth.uid()) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  SELECT jsonb_agg(t) INTO result FROM (
    SELECT path, COUNT(*) as views, ROUND(AVG(COALESCE(duration, 0)), 1) as avg_time, COUNT(DISTINCT session_id) as unique_visitors
    FROM analytics_events
    WHERE event_type = 'page_view' AND created_at > (now() - (days_lookback || ' days')::interval)
    GROUP BY 1 ORDER BY views DESC LIMIT 15
  ) t;
  RETURN COALESCE(result, '[]'::jsonb);
END; $$;

CREATE OR REPLACE FUNCTION get_live_visitors(lookback_minutes int DEFAULT 5)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.check_is_admin(auth.uid()) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  SELECT jsonb_agg(t) INTO result FROM (
    SELECT DISTINCT ON (session_id) session_id, user_id, (SELECT email FROM auth.users WHERE id = analytics_events.user_id) as user_email, path, geo_country, geo_city, created_at
    FROM analytics_events
    WHERE created_at > (now() - (lookback_minutes || ' minutes')::interval)
    ORDER BY session_id, created_at DESC
  ) t;
  RETURN COALESCE(result, '[]'::jsonb);
END; $$;
