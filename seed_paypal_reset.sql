
-- ============================================================================
-- RESET PAYPAL CREDENTIALS
-- Use this script to manually fix your PayPal configuration in the DB.
-- ============================================================================

-- 1. Ensure the app_settings row exists with required columns
INSERT INTO public.app_settings (id, slogan, mission, vision, core_values)
VALUES (1, 'Divinely threaded.', 'Mission', 'Vision', 'Values')
ON CONFLICT (id) DO NOTHING;

-- 2. Update with your REAL credentials from https://developer.paypal.com
-- REPLACE THE PLACEHOLDERS BELOW WITH YOUR ACTUAL KEYS
UPDATE public.app_settings
SET 
  paypal_client_id = 'AfVsjOsJNCcgKNns03cv7pK_WR3WiikShjXt3PxFtYlQvx6R2up6AdFtTV38TVL8uZEkoJMK_cTTBVe0',
  paypal_secret_key = 'EHNhUT4qsbKoazm8XFm7cyxD4UpFpDw7CI4ds4xYcUOo0pDVtL8KWRTorGASCi90GkFDIyDDnhpwCNkG',
  paypal_mode = 'sandbox', -- Change to 'live' when ready
  payment_gateway_enabled = true
WHERE id = 1;

-- 3. Verify the lengths (Debug helper)
SELECT 
  id,
  LEFT(paypal_client_id, 8) || '...' as client_id_start,
  LENGTH(paypal_client_id) as client_id_len,
  LENGTH(paypal_secret_key) as secret_key_len,
  paypal_mode
FROM public.app_settings
WHERE id = 1;
