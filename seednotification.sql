-- ============================================================================
-- JAMBO APPARELS - EMAIL NOTIFICATION SYSTEM SETUP
-- Version: 1.0
-- This script sets up the database infrastructure for automated email notifications.
-- ============================================================================

-- 1. Create Email Templates Table
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE, -- e.g., 'new_order', 'welcome_email'
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for email_templates (Admins can manage, all can read for triggers)
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admin full access" ON public.email_templates FOR ALL USING (check_is_admin(auth.uid())) WITH CHECK (check_is_admin(auth.uid()));
CREATE POLICY "Allow read access to authenticated users" ON public.email_templates FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Add Notification Toggles to App Settings
ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS enable_email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_email_welcome BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_email_new_order BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_email_order_shipped BOOLEAN DEFAULT true;


-- 3. Insert Default Email Templates (with placeholders)
-- NOTE: A more robust system would have a full HTML wrapper, but this is sufficient for the prototype.
INSERT INTO public.email_templates (name, subject, description, body_html)
VALUES
    ('welcome_email', 'Welcome to Jambo Apparels!', 'Sent to new users upon sign-up.', 
    '<p>Hi {{name}},</p><p>Welcome to the Jambo Apparels family! We are thrilled to have you join our community of believers who wear their faith in humility and boldness.</p><p>Explore our latest collections and find pieces that speak to your testimony.</p><p>Blessings,<br>The Jambo Apparels Team</p>'),
    
    ('new_order_customer', 'Your Jambo Apparels Order #{{order_number}} is Confirmed!', 'Sent to customers after a new order is placed.', 
    '<p>Hi {{name}},</p><p>Thank you for your order! We''ve received it and are preparing to thread your scriptures. You can view your order details here: {{order_link}}</p><h3>Order Summary</h3><p>Order Number: #{{order_number}}</p><p>Total: £{{total}}</p><p>We will notify you again once your order has been shipped.</p><p>In His Grace,<br>Jambo Apparels</p>'),
    
    ('order_shipped', 'Your Jambo Apparels Order #{{order_number}} has shipped!', 'Sent when an order status is updated to "Shipped".', 
    '<p>Hi {{name}},</p><p>Great news! Your order is on its way. You can track its journey to you using the details below.</p><h3>Shipment Details</h3><p>Order Number: #{{order_number}}</p><p>Tracking Number: {{tracking_number}}</p><p>Thank you for letting us be a part of your testimony.</p><p>Faithfully,<br>Jambo Apparels</p>'),

    ('order_cancelled', 'Your Jambo Apparels Order #{{order_number}} has been cancelled.', 'Sent when an order status is updated to "Cancelled".',
    '<p>Hi {{name}},</p><p>This email is to confirm that your order #{{order_number}} has been successfully cancelled as requested.</p><p>If you have any questions or this was a mistake, please contact our support team immediately.</p><p>Blessings,<br>Jambo Apparels</p>')
ON CONFLICT (name) DO NOTHING;


-- 4. Create a placeholder function for sending emails
-- In a real Supabase project, this function would securely call a Supabase Edge Function
-- which then uses an email service provider (like SendGrid, Resend, etc.) with the SMTP settings.
-- For this prototype, it serves as a hook for our triggers.
CREATE OR REPLACE FUNCTION trigger_send_email(recipient text, subject text, body text)
RETURNS void AS $$
BEGIN
  -- This is a placeholder. In a real application, you would use pg_net
  -- to call a Supabase Edge Function that handles the actual email sending.
  -- Example:
  -- PERFORM net.http_post(
  --   url:='https://<project_ref>.supabase.co/functions/v1/send-email',
  --   headers:='{"Authorization": "Bearer <anon_key>", "Content-Type": "application/json"}'::jsonb,
  --   body:=jsonb_build_object('to', recipient, 'subject', subject, 'body', body)
  -- );
  RAISE LOG 'Email Triggered: To=%, Subject=%', recipient, subject;
END;
$$ LANGUAGE plpgsql;


-- 5. Create Trigger Function for New User Welcome Email
CREATE OR REPLACE FUNCTION handle_new_user_welcome()
RETURNS trigger AS $$
DECLARE
  settings_row record;
  template_row record;
  email_body text;
BEGIN
  SELECT * INTO settings_row FROM public.app_settings WHERE id = 1;
  IF settings_row.enable_email_notifications = true AND settings_row.enable_email_welcome = true THEN
    SELECT * INTO template_row FROM public.email_templates WHERE name = 'welcome_email';
    IF template_row IS NOT NULL THEN
      email_body := replace(template_row.body_html, '{{name}}', NEW.name);
      PERFORM trigger_send_email(NEW.email, template_row.subject, email_body);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on the users table
DROP TRIGGER IF EXISTS on_new_user_welcome ON public.users;
CREATE TRIGGER on_new_user_welcome
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_welcome();

-- 6. Create Trigger Function for New Orders
CREATE OR REPLACE FUNCTION handle_new_order_email()
RETURNS trigger AS $$
DECLARE
  settings_row record;
  template_row record;
  email_body text;
  customer record;
BEGIN
  SELECT * INTO settings_row FROM public.app_settings WHERE id = 1;
  IF settings_row.enable_email_notifications = true AND settings_row.enable_email_new_order = true THEN
    SELECT * INTO template_row FROM public.email_templates WHERE name = 'new_order_customer';
    SELECT * INTO customer FROM public.users WHERE id = NEW.user_id;
    IF template_row IS NOT NULL AND customer IS NOT NULL THEN
      email_body := replace(template_row.body_html, '{{name}}', customer.name);
      email_body := replace(email_body, '{{order_number}}', NEW.order_number);
      email_body := replace(email_body, '{{total}}', NEW.total::text);
      -- In a real app, you'd generate a proper link.
      email_body := replace(email_body, '{{order_link}}', '/#/order/' || NEW.id);
      PERFORM trigger_send_email(customer.email, replace(template_row.subject, '{{order_number}}', NEW.order_number), email_body);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on the orders table
DROP TRIGGER IF EXISTS on_new_order ON public.orders;
CREATE TRIGGER on_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION handle_new_order_email();

-- 7. Create Trigger Function for Order Status Updates
CREATE OR REPLACE FUNCTION handle_order_status_update()
RETURNS trigger AS $$
DECLARE
  settings_row record;
  template_row record;
  email_body text;
  email_subject text;
  customer record;
  template_name text;
BEGIN
  SELECT * INTO settings_row FROM public.app_settings WHERE id = 1;

  -- Only proceed if notifications are on and status has actually changed
  IF settings_row.enable_email_notifications = true AND NEW.status IS DISTINCT FROM OLD.status THEN
    
    -- Determine which template to use
    IF NEW.status = 'Shipped' AND settings_row.enable_email_order_shipped = true THEN
      template_name := 'order_shipped';
    ELSIF NEW.status = 'Cancelled' THEN
      template_name := 'order_cancelled';
    ELSE
      template_name := NULL;
    END IF;

    IF template_name IS NOT NULL THEN
      SELECT * INTO template_row FROM public.email_templates WHERE name = template_name;
      SELECT * INTO customer FROM public.users WHERE id = NEW.user_id;

      IF template_row IS NOT NULL AND customer IS NOT NULL THEN
        email_subject := replace(template_row.subject, '{{order_number}}', NEW.order_number);
        
        email_body := replace(template_row.body_html, '{{name}}', customer.name);
        email_body := replace(email_body, '{{order_number}}', NEW.order_number);

        -- Add tracking number if available for shipped email
        IF NEW.status = 'Shipped' THEN
          email_body := replace(email_body, '{{tracking_number}}', COALESCE(NEW.tracking_number, 'N/A'));
        END IF;

        PERFORM trigger_send_email(customer.email, email_subject, email_body);
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on the orders table for updates
DROP TRIGGER IF EXISTS on_order_update ON public.orders;
CREATE TRIGGER on_order_update
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION handle_order_status_update();
