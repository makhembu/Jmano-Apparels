-- ============================================================================
-- JAMBO APPARELS - PAYMENTS SCALABILITY FIX
-- Server-side pagination and aggregation for the Admin Payments Dashboard.
-- ============================================================================

CREATE OR REPLACE FUNCTION get_admin_payments_paginated(
  p_page int,
  p_page_size int,
  p_status text DEFAULT 'ALL',
  p_method text DEFAULT 'ALL'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offset int;
  v_total_count int;
  v_orders jsonb;
  v_stats jsonb;
BEGIN
  -- Check Admin
  IF NOT public.check_is_admin(auth.uid()) THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  v_offset := (p_page - 1) * p_page_size;

  -- 1. Calculate Aggregates (Efficiently)
  -- We do this in one pass or separate optimised queries depending on table size.
  -- For now, separate aggregates on the full table is fine as long as we don't return rows.
  SELECT jsonb_build_object(
    'totalRevenue', COALESCE(SUM(total) FILTER (WHERE payment_status = 'paid'), 0),
    'pendingRevenue', COALESCE(SUM(total) FILTER (WHERE payment_status = 'pending'), 0),
    'paidCount', COUNT(*) FILTER (WHERE payment_status = 'paid'),
    'failedCount', COUNT(*) FILTER (WHERE payment_status = 'failed')
  ) INTO v_stats
  FROM orders;

  -- 2. Fetch Paginated Rows
  SELECT jsonb_agg(t.*) INTO v_orders
  FROM (
    SELECT 
      id, order_number, created_at, customer_name, customer_email, 
      total, payment_status, payment_intent_id, status
    FROM orders
    WHERE 
      (p_status = 'ALL' OR payment_status = lower(p_status))
      AND
      (p_method = 'ALL' OR 
        (p_method = 'PAYPAL' AND payment_intent_id IS NOT NULL) OR
        (p_method = 'MANUAL' AND payment_intent_id IS NULL)
      )
    ORDER BY created_at DESC
    LIMIT p_page_size
    OFFSET v_offset
  ) t;

  -- 3. Get Total Count for Pagination (filtered)
  SELECT COUNT(*) INTO v_total_count
  FROM orders
  WHERE 
    (p_status = 'ALL' OR payment_status = lower(p_status))
    AND
    (p_method = 'ALL' OR 
      (p_method = 'PAYPAL' AND payment_intent_id IS NOT NULL) OR
      (p_method = 'MANUAL' AND payment_intent_id IS NULL)
    );

  RETURN jsonb_build_object(
    'data', COALESCE(v_orders, '[]'::jsonb),
    'stats', v_stats,
    'total', v_total_count,
    'totalPages', CEIL(v_total_count::numeric / p_page_size)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_payments_paginated TO authenticated;
