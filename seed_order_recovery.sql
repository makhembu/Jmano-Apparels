-- ============================================================================
-- JAMBO APPARELS - ORDER RECOVERY & STOCK RESTORATION
-- This procedure handles the "Cancel & Edit" logic:
-- 1. Verifies order ownership and status.
-- 2. Restores stock quantities for all items in the order.
-- 3. Marks the order as Cancelled.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cancel_and_restore_stock(
  p_order_id uuid,
  p_user_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_status text;
  v_item record;
BEGIN
  -- 1. Security Check & Status Verification
  SELECT status INTO v_order_status 
  FROM public.orders 
  WHERE id = p_order_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found or permission denied.';
  END IF;

  IF v_order_status NOT IN ('Pending Payment', 'Pending') THEN
    RAISE EXCEPTION 'This order cannot be cancelled as it is already being processed.';
  END IF;

  -- 2. Restore Stock
  -- We loop through the items array in the order
  FOR v_item IN SELECT * FROM jsonb_to_recordset((SELECT products FROM orders WHERE id = p_order_id)) 
    AS x(productId uuid, quantity int)
  LOOP
    UPDATE products 
    SET 
      stock_quantity = COALESCE(stock_quantity, 0) + v_item.quantity,
      total_sales = GREATEST(0, COALESCE(total_sales, 0) - v_item.quantity)
    WHERE id = v_item.productId;
  END LOOP;

  -- 3. Finalize Cancellation
  UPDATE orders 
  SET 
    status = 'Cancelled',
    cancelled_at = now(),
    notes = COALESCE(notes, '') || ' [System: Order cancelled and items returned to cart]'
  WHERE id = p_order_id;

END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.cancel_and_restore_stock TO authenticated;