
-- ============================================================================
-- JAMBO APPARELS - CLEANUP
-- Removing Database Triggers for Emails (Moved to Application Layer)
-- ============================================================================

-- 1. Drop Triggers
DROP TRIGGER IF EXISTS on_new_order ON public.orders;
DROP TRIGGER IF EXISTS on_order_update ON public.orders;
DROP TRIGGER IF EXISTS on_new_order_admin_alert ON public.orders;
DROP TRIGGER IF EXISTS on_contact_submission ON public.contact_submissions;
DROP TRIGGER IF EXISTS on_newsletter_sub ON public.newsletter_subscribers;
DROP TRIGGER IF EXISTS on_new_user_welcome ON public.users;

-- 2. Drop Functions
DROP FUNCTION IF EXISTS handle_new_order_email();
DROP FUNCTION IF EXISTS handle_order_status_update();
DROP FUNCTION IF EXISTS handle_admin_new_order_alert();
DROP FUNCTION IF EXISTS handle_contact_submission_email();
DROP FUNCTION IF EXISTS handle_newsletter_welcome_email();
DROP FUNCTION IF EXISTS handle_new_user_welcome();
DROP FUNCTION IF EXISTS trigger_send_email(text, text, text);

-- 3. Cleanup pg_net if not used elsewhere (Optional, keeping it safe)
-- DROP EXTENSION IF EXISTS pg_net;
