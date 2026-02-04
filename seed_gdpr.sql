
-- ============================================================================
-- JAMBO APPARELS - GDPR RIGHT TO ERASURE LOGIC
-- ============================================================================

-- Function to securely anonymize and delete a user's data
CREATE OR REPLACE FUNCTION public.anonymize_and_delete_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Verify the user exists and matches the authenticated user (Self-Deletion)
  -- Or allow if admin.
  IF auth.uid() != target_user_id AND NOT public.check_is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: You can only delete your own account.';
  END IF;

  -- 2. Anonymize Orders (Retain record for Tax/Accounting, remove PII)
  UPDATE public.orders
  SET 
    customer_name = 'Deleted User',
    customer_email = 'deleted@jamboapparels.com',
    shipping_address = jsonb_build_object(
      'address1', 'REDACTED',
      'city', 'REDACTED',
      'country', COALESCE(shipping_address->>'country', 'Unknown'),
      'postcode', 'REDACTED'
    ),
    notes = NULL
  WHERE user_id = target_user_id;

  -- 3. Delete Personal Data Tables
  DELETE FROM public.user_addresses WHERE user_id = target_user_id;
  DELETE FROM public.wishlists WHERE user_id = target_user_id;
  DELETE FROM public.product_reviews WHERE user_id = target_user_id;
  DELETE FROM public.analytics_events WHERE user_id = target_user_id;
  DELETE FROM public.cart_items WHERE user_id = target_user_id;

  -- 4. Unlink User from Orders (to prevent FK constraint issues on user deletion)
  -- We keep the order row but set user_id to NULL
  UPDATE public.orders SET user_id = NULL WHERE user_id = target_user_id;

  -- 5. Delete from Public Profile
  DELETE FROM public.users WHERE id = target_user_id;

  -- 6. Delete from Auth (Supabase Auth)
  -- This requires the Postgres role to have permission on auth.users, which it usually does in triggers/RPCs
  DELETE FROM auth.users WHERE id = target_user_id;

END;
$$;
