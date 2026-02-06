-- ============================================================================
-- JAMBO APPARELS - ORDER RECOVERY & STOCK RESTORATION (V2)
-- This procedure handles the "Cancel & Edit" logic safely.
-- ============================================================================

-- Drop first to ensure signature change
DROP FUNCTION IF EXISTS public.cancel_and_restore_stock(uuid, uuid);

CREATE OR REPLACE FUNCTION public.cancel_and_restore_stock(
  p_order_id uuid,
  p_user_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_status text;
  v_item record;
  v_products_json jsonb;
BEGIN
  -- 1. Security Check & Status Verification
  SELECT status, products INTO v_order_status, v_products_json
  FROM public.orders 
  WHERE id = p_order_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found or access denied.');
  END IF;

  IF v_order_status NOT IN ('Pending Payment', 'Pending') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order cannot be reversed in its current status: ' || v_order_status);
  END IF;

  -- 2. Restore Stock
  -- We parse the 'products' JSONB array which contains {productId, quantity, ...}
  FOR v_item IN SELECT * FROM jsonb_to_recordset(v_products_json) 
    AS x("productId" uuid, quantity int) -- Using double quotes for camelCase match
  LOOP
    UPDATE public.products 
    SET 
      stock_quantity = COALESCE(stock_quantity, 0) + v_item.quantity,
      total_sales = GREATEST(0, COALESCE(total_sales, 0) - v_item.quantity)
    WHERE id = v_item."productId";
  END LOOP;

  -- 3. Finalize Cancellation
  UPDATE public.orders 
  SET 
    status = 'Cancelled',
    cancelled_at = now(),
    notes = COALESCE(notes, '') || ' [System: Order reversed and items returned to cart]'
  WHERE id = p_order_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.cancel_and_restore_stock TO authenticated;

-- CRITICAL: Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload config';