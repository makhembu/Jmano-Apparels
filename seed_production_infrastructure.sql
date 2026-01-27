-- ============================================================================
-- JAMBO APPARELS - PRODUCTION INFRASTRUCTURE UPDATE
-- ============================================================================

-- 1. SECURITY: Remove Secrets from App Settings
ALTER TABLE public.app_settings 
DROP COLUMN IF EXISTS paypal_secret_key;

-- 2. EMAIL: Update Trigger Function to use Edge Function
-- Requires pg_net extension to be enabled in Supabase Dashboard > Database > Extensions
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.trigger_send_email(recipient text, subject text, body text)
RETURNS void AS $$
DECLARE
  -- Replace with your actual project URL and Anon Key if they differ
  project_url text := 'https://irsurnyfjgjmlhlrkbeh.supabase.co'; 
  anon_key text := 'sb_publishable_Zqgj49fvzbeSxzKBaRM38Q_6bLHV2rZ';
BEGIN
  -- Perform an async HTTP request to the Edge Function
  PERFORM net.http_post(
    url := project_url || '/functions/v1/send-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key
    ),
    body := jsonb_build_object(
      'to', recipient,
      'subject', subject,
      'htmlBody', body
    )
  );
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Failed to trigger email to %: %', recipient, SQLERRM;
END;
$$ LANGUAGE plpgsql;


-- 3. PAGINATION: Create Optimized Product Fetch RPC
CREATE OR REPLACE FUNCTION get_products_paginated(
  p_page int,
  p_page_size int,
  p_category_key text DEFAULT NULL,
  p_search_query text DEFAULT NULL,
  p_min_price numeric DEFAULT NULL,
  p_max_price numeric DEFAULT NULL,
  p_sort_by text DEFAULT 'newest'
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_offset int;
  v_products jsonb;
  v_total_count int;
  v_has_more boolean;
BEGIN
  v_offset := (p_page - 1) * p_page_size;

  -- 1. Get Total Count (for filtering)
  SELECT COUNT(*) INTO v_total_count
  FROM products p
  WHERE p.is_published = true
    AND (p_category_key IS NULL OR p_category_key = 'ALL' OR p.category_key = p_category_key)
    AND (p_search_query IS NULL OR p_search_query = '' OR 
         p.title ILIKE '%' || p_search_query || '%' OR 
         p.description ILIKE '%' || p_search_query || '%')
    AND (p_min_price IS NULL OR p.price >= p_min_price)
    AND (p_max_price IS NULL OR p.price <= p_max_price);

  -- 2. Fetch Data
  SELECT jsonb_agg(t.*) INTO v_products
  FROM (
    SELECT *
    FROM products p
    WHERE p.is_published = true
      AND (p_category_key IS NULL OR p_category_key = 'ALL' OR p.category_key = p_category_key)
      AND (p_search_query IS NULL OR p_search_query = '' OR 
           p.title ILIKE '%' || p_search_query || '%' OR 
           p.description ILIKE '%' || p_search_query || '%')
      AND (p_min_price IS NULL OR p.price >= p_min_price)
      AND (p_max_price IS NULL OR p.price <= p_max_price)
    ORDER BY 
      CASE WHEN p_sort_by = 'low-high' THEN p.price END ASC,
      CASE WHEN p_sort_by = 'high-low' THEN p.price END DESC,
      CASE WHEN p_sort_by = 'newest' THEN p.created_at END DESC,
      p.id -- tie breaker
    LIMIT p_page_size
    OFFSET v_offset
  ) t;

  v_has_more := (v_total_count > (v_offset + p_page_size));

  RETURN jsonb_build_object(
    'data', COALESCE(v_products, '[]'::jsonb),
    'total', v_total_count,
    'hasMore', v_has_more,
    'page', p_page
  );
END;
$$;