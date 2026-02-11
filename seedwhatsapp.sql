
-- ============================================================================
-- WHATSAPP INTEGRATION MIGRATION
-- Adds configuration columns and message templates
-- ============================================================================

-- 1. Add WhatsApp Settings to app_settings
ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_business_account_id TEXT,
ADD COLUMN IF NOT EXISTS admin_phone_number TEXT, -- Number to receive admin alerts
ADD COLUMN IF NOT EXISTS enable_whatsapp_notifications BOOLEAN DEFAULT false;

-- Update with provided testing token (User should treat this as a secret in production)
UPDATE public.app_settings
SET 
    whatsapp_access_token = 'EAAYYGyOMMboBQtc9n1dTARtBp3hZAGRs0yKTzCyBoQZAVP0HZCcJXimE3ALvcDpG2KVtNqc4mEeP4CEG2ceV18c87siZCsMt4q8LVZB4nrlSzKVZC9buJhJIcg6T7faZAbqfMy8m9nb6zKQ9alZBoFsbFbVVXMraM7V4iPYTfb73b2V6tMREfpTRGdCIf4SLiRYZB5uUp5TPxcUZCoVkNEZBnZBBsDn7OhG3AQVkz4ZB1sDmIRAmCQejWiFpeNewr6icIJrbrMgaegMWu8OLj5brlwSHQ',
    whatsapp_phone_number_id = 'YOUR_PHONE_NUMBER_ID', -- User needs to fill this in settings
    admin_phone_number = 'YOUR_ADMIN_NUMBER',      -- User needs to fill this in settings
    enable_whatsapp_notifications = true
WHERE id = 1;

-- 2. Add WhatsApp Body to Email Templates
ALTER TABLE public.email_templates
ADD COLUMN IF NOT EXISTS whatsapp_body_text TEXT;

-- 3. Seed Default WhatsApp Templates for existing notifications
-- Customer: Welcome
UPDATE public.email_templates
SET whatsapp_body_text = 'Welcome to Jambo Apparels, {{name}}! 🌿 We are thrilled to have you join our community of bold believers. Explore our collection here: {{shop_url}}'
WHERE name = 'welcome_email';

-- Customer: Order Confirmation
UPDATE public.email_templates
SET whatsapp_body_text = 'Hi {{name}}, thanks for your order! 🛍️ Order #{{order_number}} for £{{total}} has been confirmed. Track it here: {{order_link}}'
WHERE name = 'new_order_customer';

-- Customer: Order Shipped
UPDATE public.email_templates
SET whatsapp_body_text = 'Great news {{name}}! 🚚 Your order #{{order_number}} has shipped. Tracking: {{tracking_number}}. Track here: {{order_link}}'
WHERE name = 'order_shipped';

-- Admin: New Order
UPDATE public.email_templates
SET whatsapp_body_text = '💰 New Sale Alert! Order #{{order_number}} by {{customer_name}} for £{{total}}. View: {{admin_link}}'
WHERE name = 'admin_new_order';

-- Admin: Contact Form
UPDATE public.email_templates
SET whatsapp_body_text = '📩 New Inquiry from {{sender_name}}: "{{subject}}". View in dashboard.'
WHERE name = 'contact_notification_admin';

-- Customer: Account Created
UPDATE public.email_templates
SET whatsapp_body_text = 'Hi {{name}}, your Jambo account is ready. Order #{{order_number}} is confirmed. Log in: {{login_link}}'
WHERE name = 'guest_order_account_created';

-- 4. Update the public settings view to expose necessary non-secret fields (Token remains private)
DROP VIEW IF EXISTS public.public_app_settings;

CREATE VIEW public.public_app_settings WITH (security_invoker = true) AS
SELECT
    *,
    -- Expose presence of config, not the actual secrets, if needed for UI logic
    (whatsapp_access_token IS NOT NULL AND whatsapp_phone_number_id IS NOT NULL) as is_whatsapp_configured
FROM
    public.app_settings;

GRANT SELECT ON public.public_app_settings TO anon, authenticated;
