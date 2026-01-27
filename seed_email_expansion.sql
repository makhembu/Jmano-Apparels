-- ============================================================================
-- JAMBO APPARELS - EMAIL SYSTEM EXPANSION
-- Adds Admin Alerts, Newsletter Welcome, and Contact Form Auto-reply
-- ============================================================================

-- 1. Add New Notification Settings to App Settings Table
ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS enable_email_admin_new_order BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_email_contact_admin BOOLEAN DEFAULT true;

-- Ensure default is ON for existing rows
UPDATE public.app_settings 
SET enable_email_admin_new_order = true, enable_email_contact_admin = true 
WHERE id = 1;


-- 2. Insert New Email Templates
INSERT INTO public.email_templates (name, subject, description, body_html)
VALUES
    ('admin_new_order', '[ADMIN] New Sale: Order #{{order_number}}', 'Alert sent to admin when a new order is placed.', 
    '<h3>New Order Received!</h3><p>Order #{{order_number}} has been placed by {{customer_name}}.</p><p><strong>Total: £{{total}}</strong></p><p><a href="{{admin_link}}" class="button">View Order in Dashboard</a></p>'),
    
    ('contact_notification_admin', '[ADMIN] New Message from {{sender_name}}', 'Alert sent to admin when contact form is used.',
    '<h3>New Contact Inquiry</h3><p><strong>From:</strong> {{sender_name}} ({{sender_email}})</p><p><strong>Subject:</strong> {{subject}}</p><hr><p>{{message}}</p><hr><p><a href="mailto:{{sender_email}}">Reply Directly</a></p>'),
    
    ('contact_autoreply', 'We received your message!', 'Auto-reply sent to user after contact form submission.',
    '<p>Hi {{sender_name}},</p><p>Thanks for reaching out to Jambo Apparels. We have received your message regarding "<strong>{{subject}}</strong>".</p><p>Our team will review it and get back to you as soon as possible.</p><p>Blessings,<br>The Jambo Team</p>'),

    ('newsletter_welcome', 'Welcome to the Jambo Journal!', 'Sent to new newsletter subscribers.',
    '<p>Hi there,</p><p>Thank you for subscribing to the Jambo Apparels newsletter! You are now part of a community that wears their faith boldly.</p><p>Stay tuned for exclusive updates, styling tips, and testimonies.</p><p>In the meantime, <a href="{{shop_link}}">browse our latest collection</a>.</p>')
ON CONFLICT (name) DO NOTHING;


-- 3. Trigger: New Order -> Email Admin
CREATE OR REPLACE FUNCTION handle_admin_new_order_alert()
RETURNS trigger AS $$
DECLARE
  settings_row record;
  template_row record;
  email_body text;
  admin_email text;
BEGIN
  SELECT * INTO settings_row FROM public.app_settings WHERE id = 1;
  -- Use contact_email as the admin notification address
  admin_email := settings_row.contact_email; 

  IF settings_row.enable_email_notifications = true AND settings_row.enable_email_admin_new_order = true AND admin_email IS NOT NULL THEN
    SELECT * INTO template_row FROM public.email_templates WHERE name = 'admin_new_order';
    
    IF template_row IS NOT NULL THEN
      email_body := replace(template_row.body_html, '{{order_number}}', NEW.order_number);
      email_body := replace(email_body, '{{customer_name}}', COALESCE(NEW.customer_name, 'Guest'));
      email_body := replace(email_body, '{{total}}', NEW.total::text);
      -- Replace with your actual deployed URL
      email_body := replace(email_body, '{{admin_link}}', 'https://jamboapparels.com/#/admin/orders/' || NEW.id);
      
      PERFORM trigger_send_email(admin_email, replace(template_row.subject, '{{order_number}}', NEW.order_number), email_body);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_order_admin_alert ON public.orders;
CREATE TRIGGER on_new_order_admin_alert
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION handle_admin_new_order_alert();


-- 4. Trigger: Contact Form -> Email Admin & Auto-reply User
CREATE OR REPLACE FUNCTION handle_contact_submission_email()
RETURNS trigger AS $$
DECLARE
  settings_row record;
  admin_template record;
  user_template record;
  email_body text;
  admin_email text;
  final_subject text;
BEGIN
  SELECT * INTO settings_row FROM public.app_settings WHERE id = 1;
  admin_email := settings_row.contact_email;

  IF settings_row.enable_email_notifications = true THEN
     -- A) Email Admin
     IF settings_row.enable_email_contact_admin = true AND admin_email IS NOT NULL THEN
        SELECT * INTO admin_template FROM public.email_templates WHERE name = 'contact_notification_admin';
        IF admin_template IS NOT NULL THEN
           email_body := replace(admin_template.body_html, '{{sender_name}}', NEW.name);
           email_body := replace(email_body, '{{sender_email}}', NEW.email);
           email_body := replace(email_body, '{{subject}}', COALESCE(NEW.subject, 'General Inquiry'));
           email_body := replace(email_body, '{{message}}', NEW.message);
           
           final_subject := replace(admin_template.subject, '{{sender_name}}', NEW.name);
           
           PERFORM trigger_send_email(admin_email, final_subject, email_body);
        END IF;
     END IF;

     -- B) Auto-reply to User (Always send if notifications enabled globally)
     SELECT * INTO user_template FROM public.email_templates WHERE name = 'contact_autoreply';
     IF user_template IS NOT NULL THEN
        email_body := replace(user_template.body_html, '{{sender_name}}', NEW.name);
        email_body := replace(email_body, '{{subject}}', COALESCE(NEW.subject, 'General Inquiry'));
        
        PERFORM trigger_send_email(NEW.email, user_template.subject, email_body);
     END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_contact_submission ON public.contact_submissions;
CREATE TRIGGER on_contact_submission
  AFTER INSERT ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION handle_contact_submission_email();


-- 5. Trigger: Newsletter Subscribe -> Welcome Email
CREATE OR REPLACE FUNCTION handle_newsletter_welcome_email()
RETURNS trigger AS $$
DECLARE
  settings_row record;
  template_row record;
  email_body text;
BEGIN
  SELECT * INTO settings_row FROM public.app_settings WHERE id = 1;

  -- Send only if global notifications enabled AND it's a new active subscription
  IF settings_row.enable_email_notifications = true AND NEW.is_subscribed = true THEN
     -- Avoid sending if just updating an existing active sub (though logic below handles inserts/updates usually)
     -- We check if it's an INSERT or if OLD.is_subscribed was false
     IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND OLD.is_subscribed = false) THEN
        SELECT * INTO template_row FROM public.email_templates WHERE name = 'newsletter_welcome';
        IF template_row IS NOT NULL THEN
           email_body := replace(template_row.body_html, '{{shop_link}}', 'https://jamboapparels.com/#/shop');
           PERFORM trigger_send_email(NEW.email, template_row.subject, email_body);
        END IF;
     END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_newsletter_sub ON public.newsletter_subscribers;
CREATE TRIGGER on_newsletter_sub
  AFTER INSERT OR UPDATE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION handle_newsletter_welcome_email();
