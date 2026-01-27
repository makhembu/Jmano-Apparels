
-- 1. Add PayPal Secret Key Column to App Settings
ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS paypal_secret_key TEXT;

-- 2. Ensure RLS Policies allow Admins to read/write this
-- (Assuming existing RLS policies cover the table, but we ensure the column is available)

-- 3. IMPORTANT: Update the 'get_public_payment_settings' function
-- We MUST ensure this function does NOT return the secret key to the frontend context
-- for non-admin users. The existing function explicitly builds a json object
-- with specific keys, so excluding paypal_secret_key there keeps it safe from
-- the public cart checkout page.

CREATE OR REPLACE FUNCTION get_public_payment_settings()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- explicitly selecting ONLY public fields
  SELECT jsonb_build_object(
    'paypal_client_id', paypal_client_id,
    'paypal_mode', paypal_mode,
    'payment_gateway_enabled', payment_gateway_enabled,
    'currency', currency
  ) INTO result
  FROM public.app_settings
  WHERE id = 1;
  
  RETURN result;
END;
$$;
