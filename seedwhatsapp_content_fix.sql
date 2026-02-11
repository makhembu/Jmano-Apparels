
-- ============================================================================
-- WHATSAPP CONTENT FIX
-- Populates default WhatsApp body text for all templates that might be blank
-- ============================================================================

-- 1. Customer: Order Processing
UPDATE public.email_templates
SET whatsapp_body_text = 'Hi {{name}}! 📦 Your order #{{order_number}} is now being packed with care. We will notify you when it ships!'
WHERE name = 'order_processing';

-- 2. Customer: Order Cancelled
UPDATE public.email_templates
SET whatsapp_body_text = 'Hi {{name}}, order #{{order_number}} has been cancelled. 🛑 If you did not request this, please contact support immediately.'
WHERE name = 'order_cancelled';

-- 3. Customer: Refund Issued
UPDATE public.email_templates
SET whatsapp_body_text = 'Refund Update: 💸 A refund has been issued for order #{{order_number}}. Please allow 3-5 days for bank processing.'
WHERE name = 'order_refunded';

-- 4. Customer: Return Requested
UPDATE public.email_templates
SET whatsapp_body_text = 'Hi {{name}}, we received your return request for #{{order_number}}. ↩️ Our team is reviewing it and will update you shortly.'
WHERE name = 'return_requested';

-- 5. Customer: Return Approved
UPDATE public.email_templates
SET whatsapp_body_text = 'Good news {{name}}! ✅ Return for #{{order_number}} is approved. Please ship items to: 123 Scripture Lane, London. Keep your receipt!'
WHERE name = 'return_approved';

-- 6. Customer: Return Rejected
UPDATE public.email_templates
SET whatsapp_body_text = 'Update on order #{{order_number}}: Unfortunately, your return request was not approved at this time. Please check your email for details.'
WHERE name = 'return_rejected';

-- 7. Admin: Return Alert
UPDATE public.email_templates
SET whatsapp_body_text = '⚠️ New Return Request: {{customer_name}} wants to return items from Order #{{order_number}}. Reason: {{return_reason}}. Check Dashboard.'
WHERE name = 'admin_return_alert';

-- 8. Customer: Contact Auto-reply
UPDATE public.email_templates
SET whatsapp_body_text = 'Thanks for reaching out, {{sender_name}}! 👋 We have received your message regarding "{{subject}}" and will respond within 24 hours.'
WHERE name = 'contact_autoreply';

-- 9. Customer: Newsletter Welcome
UPDATE public.email_templates
SET whatsapp_body_text = 'Welcome to the family! 🌿 Thanks for subscribing to Jambo Apparels. Stay tuned for faithful drops and inspiration. Shop now: {{shop_url}}'
WHERE name = 'newsletter_welcome';

-- 10. Admin: Order Status Update (Generic)
UPDATE public.email_templates
SET whatsapp_body_text = 'System Alert: Order #{{order_number}} status changed to {{status}}.'
WHERE name = 'admin_order_status_update';

-- Ensure Welcome Email is set if missed
UPDATE public.email_templates
SET whatsapp_body_text = 'Welcome to Jambo Apparels, {{name}}! 🌿 We are thrilled to have you join our community. Explore our collection: {{shop_url}}'
WHERE name = 'welcome_email' AND (whatsapp_body_text IS NULL OR whatsapp_body_text = '');
