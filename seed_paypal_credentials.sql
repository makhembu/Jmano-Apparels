
-- ============================================================================
-- JAMBO APPARELS - PAYPAL SANDBOX CREDENTIALS
-- ============================================================================

UPDATE public.app_settings
SET 
  paypal_client_id = 'ECMg71mLkF2WwTevmlNFZleJbT-sxb0WGnUHIc_Vsdu5lSeAu-2Y6cYHpOUCn7pJlLUT9i7121DhjDw0',
  paypal_secret_key = 'AS0zfN0vqFpM2z7EHkK-aBWkYDWvUz6ygcjBookC0HsB1jdh5HPCwQdU5ezM_AEnSCmKIT6aOglZ8Pyn',
  paypal_mode = 'sandbox',
  payment_gateway_enabled = true,
  currency = 'GBP' -- Ensure currency matches standard shop currency
WHERE id = 1;
