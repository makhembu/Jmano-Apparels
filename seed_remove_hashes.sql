-- ============================================================================
-- MIGRATION: REMOVE HASHES FROM URLS
-- Updates existing email templates to use cleaner URLs (removing /#/)
-- ============================================================================

-- 1. Update Welcome Email
UPDATE public.email_templates
SET body_html = REPLACE(REPLACE(REPLACE(body_html, '/#/shop', '/shop'), '/#/blog', '/blog'), '/#/about', '/about')
WHERE name = 'welcome_email';

-- 2. Update Newsletter Welcome
UPDATE public.email_templates
SET body_html = REPLACE(body_html, '/#/shop', '/shop')
WHERE name = 'newsletter_welcome';

-- 3. Update Order Emails (Dynamic links are handled by triggers, but updating template placeholders if any)
-- Most logic is in the trigger function code, but we update the templates just in case static links exist.
UPDATE public.email_templates
SET body_html = REPLACE(body_html, '/#/', '/')
WHERE name IN ('new_order_customer', 'order_shipped', 'order_cancelled', 'order_delivered', 'admin_new_order', 'contact_notification_admin', 'contact_autoreply');

-- 4. Re-define Trigger Functions to use clean URLs

-- A. Newsletter Welcome
CREATE OR REPLACE FUNCTION handle_newsletter_welcome_email()
RETURNS trigger AS $$
DECLARE
  settings_row record;
  template_row record;
  email_body text;
  logo_url text;
  shop_url text;
BEGIN
  SELECT * INTO settings_row FROM public.app_settings WHERE id = 1;
  logo_url := COALESCE(settings_row.logo_image, 'https://i.imgur.com/pkaScEv.png');
  shop_url := 'https://jamboapparels.com';

  IF settings_row.enable_email_notifications = true AND NEW.is_subscribed = true THEN
     IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND OLD.is_subscribed = false) THEN
        SELECT * INTO template_row FROM public.email_templates WHERE name = 'newsletter_welcome';
        IF template_row IS NOT NULL THEN
           email_body := replace(template_row.body_html, '{{shop_link}}', shop_url || '/shop');
           email_body := replace(email_body, '{{shop_url}}', shop_url);
           email_body := replace(email_body, '{{logo_url}}', logo_url);
           
           PERFORM trigger_send_email(NEW.email, template_row.subject, email_body);
        END IF;
     END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B. New Order Customer
CREATE OR REPLACE FUNCTION handle_new_order_email()
RETURNS trigger AS $$
DECLARE
  settings_row record;
  template_row record;
  email_body text;
  customer record;
  logo_url text;
  shop_url text;
  contact_email text;
BEGIN
  SELECT * INTO settings_row FROM public.app_settings WHERE id = 1;
  logo_url := COALESCE(settings_row.logo_image, 'https://i.imgur.com/pkaScEv.png');
  shop_url := 'https://jamboapparels.com';
  contact_email := COALESCE(settings_row.contact_email, 'support@jamboapparels.com');

  IF settings_row.enable_email_notifications = true AND settings_row.enable_email_new_order = true THEN
    SELECT * INTO template_row FROM public.email_templates WHERE name = 'new_order_customer';
    
    IF NEW.user_id IS NOT NULL THEN
       SELECT * INTO customer FROM public.users WHERE id = NEW.user_id;
    ELSE
       customer := json_build_object('name', NEW.customer_name, 'email', NEW.customer_email);
    END IF;

    IF template_row IS NOT NULL AND customer IS NOT NULL THEN
      email_body := replace(template_row.body_html, '{{name}}', COALESCE(customer.name, 'Valued Customer'));
      email_body := replace(email_body, '{{order_number}}', NEW.order_number);
      email_body := replace(email_body, '{{total}}', NEW.total::text);
      -- CLEAN URL FIX
      email_body := replace(email_body, '{{order_link}}', shop_url || '/order/' || NEW.id);
      
      email_body := replace(email_body, '{{logo_url}}', logo_url);
      email_body := replace(email_body, '{{shop_url}}', shop_url);
      email_body := replace(email_body, '{{contact_email}}', contact_email);

      PERFORM trigger_send_email(COALESCE(customer.email, NEW.customer_email), replace(template_row.subject, '{{order_number}}', NEW.order_number), email_body);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- C. Admin Alert Order
CREATE OR REPLACE FUNCTION handle_admin_new_order_alert()
RETURNS trigger AS $$
DECLARE
  settings_row record;
  template_row record;
  email_body text;
  admin_email text;
  logo_url text;
BEGIN
  SELECT * INTO settings_row FROM public.app_settings WHERE id = 1;
  admin_email := settings_row.contact_email; 
  logo_url := COALESCE(settings_row.logo_image, 'https://i.imgur.com/pkaScEv.png');

  IF settings_row.enable_email_notifications = true AND settings_row.enable_email_admin_new_order = true AND admin_email IS NOT NULL THEN
    SELECT * INTO template_row FROM public.email_templates WHERE name = 'admin_new_order';
    
    IF template_row IS NOT NULL THEN
      email_body := replace(template_row.body_html, '{{order_number}}', NEW.order_number);
      email_body := replace(email_body, '{{customer_name}}', COALESCE(NEW.customer_name, 'Guest'));
      email_body := replace(email_body, '{{total}}', NEW.total::text);
      -- CLEAN URL FIX
      email_body := replace(email_body, '{{admin_link}}', 'https://jamboapparels.com/admin/orders/' || NEW.id);
      
      email_body := replace(email_body, '{{logo_url}}', logo_url);
      
      PERFORM trigger_send_email(admin_email, replace(template_row.subject, '{{order_number}}', NEW.order_number), email_body);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- D. Order Status Update (Admin + Customer)
CREATE OR REPLACE FUNCTION handle_order_status_update()
RETURNS trigger AS $$
DECLARE
  settings_row record;
  template_row record;
  email_body text;
  email_subject text;
  customer record;
  template_name text;
  logo_url text;
  shop_url text;
  contact_email text;
  admin_email text;
BEGIN
  SELECT * INTO settings_row FROM public.app_settings WHERE id = 1;
  logo_url := COALESCE(settings_row.logo_image, 'https://i.imgur.com/pkaScEv.png');
  shop_url := 'https://jamboapparels.com';
  contact_email := COALESCE(settings_row.contact_email, 'support@jamboapparels.com');
  admin_email := settings_row.contact_email;

  IF settings_row.enable_email_notifications = true AND NEW.status IS DISTINCT FROM OLD.status THEN
    
    -- 1. Notify Admin of Status Change
    IF admin_email IS NOT NULL THEN
       SELECT * INTO template_row FROM public.email_templates WHERE name = 'admin_order_status_update';
       IF template_row IS NOT NULL THEN
          email_body := replace(template_row.body_html, '{{order_number}}', NEW.order_number);
          email_body := replace(email_body, '{{status}}', NEW.status);
          email_body := replace(email_body, '{{customer_name}}', COALESCE(NEW.customer_name, 'Guest'));
          -- CLEAN URL FIX
          email_body := replace(email_body, '{{admin_link}}', 'https://jamboapparels.com/admin/orders/' || NEW.id);
          
          PERFORM trigger_send_email(admin_email, replace(template_row.subject, '{{order_number}}', NEW.order_number), email_body);
       END IF;
    END IF;

    -- 2. Notify Customer
    IF NEW.status = 'Shipped' AND settings_row.enable_email_order_shipped = true THEN
      template_name := 'order_shipped';
    ELSIF NEW.status = 'Cancelled' THEN
      template_name := 'order_cancelled';
    ELSIF NEW.status = 'Delivered' THEN
      template_name := 'order_delivered';
    ELSIF NEW.status = 'Processing' THEN
      template_name := 'order_processing';
    ELSE
      template_name := NULL;
    END IF;

    IF template_name IS NOT NULL THEN
      SELECT * INTO template_row FROM public.email_templates WHERE name = template_name;
      
      IF NEW.user_id IS NOT NULL THEN
         SELECT * INTO customer FROM public.users WHERE id = NEW.user_id;
      ELSE
         customer := json_build_object('name', NEW.customer_name, 'email', NEW.customer_email);
      END IF;

      IF template_row IS NOT NULL AND customer IS NOT NULL THEN
        email_subject := replace(template_row.subject, '{{order_number}}', NEW.order_number);
        
        email_body := replace(template_row.body_html, '{{name}}', COALESCE(customer.name, 'Customer'));
        email_body := replace(email_body, '{{order_number}}', NEW.order_number);

        IF NEW.status = 'Shipped' THEN
          email_body := replace(email_body, '{{tracking_number}}', COALESCE(NEW.tracking_number, 'N/A'));
        END IF;
        
        IF NEW.status = 'Delivered' THEN
           -- CLEAN URL FIX: Handle {{product_id}} if available, assuming first product from array
           -- Note: This requires complex JSONB parsing in PG, simplified here
           email_body := replace(email_body, '{{shop_url}}', shop_url);
           email_body := replace(email_body, '/#/product/', '/product/');
        END IF;

        -- Globals
        email_body := replace(email_body, '{{logo_url}}', logo_url);
        email_body := replace(email_body, '{{shop_url}}', shop_url);
        email_body := replace(email_body, '{{contact_email}}', contact_email);

        PERFORM trigger_send_email(COALESCE(customer.email, NEW.customer_email), email_subject, email_body);
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
