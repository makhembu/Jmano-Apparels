
-- ============================================================================
-- JAMBO APPARELS - REAL-TIME ANALYTICS
-- ============================================================================

-- Function to get users active in the last X minutes (Default 5)
-- Returns the latest page view for each unique session
CREATE OR REPLACE FUNCTION get_live_visitors(lookback_minutes int DEFAULT 5)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_agg(t) INTO result FROM (
    SELECT DISTINCT ON (session_id)
      session_id,
      user_id,
      (SELECT email FROM auth.users WHERE id = analytics_events.user_id) as user_email,
      path,
      geo_country,
      geo_city,
      created_at
    FROM analytics_events
    WHERE created_at > (now() - (lookback_minutes || ' minutes')::interval)
    ORDER BY session_id, created_at DESC
  ) t;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION get_live_visitors TO authenticated;
