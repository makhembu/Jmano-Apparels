
-- ============================================================================
-- JAMBO APPARELS - RETURNS & REFUNDS INFRASTRUCTURE
-- ============================================================================

-- 1. Update Orders Table with Return Columns
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS return_reason TEXT,
ADD COLUMN IF NOT EXISTS return_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS return_status TEXT DEFAULT 'none';

-- 2. Expand Order Status Constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status IN (
  'Pending', 'Processing', 'Shipped', 'Delivered', 
  'Cancelled', 'Refunded', 'Pending Payment',
  'Return Requested', 'Return Approved', 'Return Rejected', 'Returned'
));

-- 3. Update Return Status Constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_return_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_return_status_check 
CHECK (return_status IN ('none', 'requested', 'approved', 'rejected', 'completed'));

-- 4. Add Webhook ID to App Settings
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS paypal_webhook_id TEXT;

-- 5. Update public settings RPC to include safe webhook ID visibility (optional but helpful for status checks)
CREATE OR REPLACE FUNCTION get_public_site_settings()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT 
    jsonb_build_object(
      'id', id,
      'slogan', slogan,
      'secondary_slogan', secondary_slogan,
      'logo_image', logo_image,
      'mission', mission,
      'vision', vision,
      'core_values', core_values,
      'currency', currency,
      'tax_rate', tax_rate,
      'free_shipping_threshold', free_shipping_threshold,
      'is_announcement_enabled', is_announcement_enabled,
      'announcement_text', announcement_text,
      'maintenance_mode', maintenance_mode,
      'paypal_client_id', paypal_client_id,
      'paypal_mode', paypal_mode,
      'payment_gateway_enabled', payment_gateway_enabled,
      -- Check if webhook is configured without showing ID
      'is_webhook_configured', (paypal_webhook_id IS NOT NULL AND paypal_webhook_id != '')
    )
  INTO result
  FROM public.app_settings
  WHERE id = 1;
  
  RETURN result;
END;
$$;
