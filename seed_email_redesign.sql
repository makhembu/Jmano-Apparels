
-- ============================================================================
-- JAMBO APPARELS - PROFESSIONAL EMAIL TEMPLATES REDESIGN (COMPLETE SET)
-- Replaces text-only emails with 8 responsive, branded HTML templates.
-- Updates triggers to inject Logo and Shop URL globally.
-- ============================================================================

-- 1. Clear existing templates to avoid conflicts
DELETE FROM public.email_templates;

-- 2. Insert Professional HTML Templates
-- Design System:
-- Header: Jambo Green (#1B5E20) with Logo
-- Accents: Jambo Gold (#F1C40F)
-- Background: Neutral Gray (#F4F4F5)
-- Footer: Light Gray (#FAFAFA) with Links

INSERT INTO public.email_templates (name, subject, description, body_html)
VALUES
    -- 1. USER WELCOME
    ('welcome_email', 'Welcome to the Family! | Jambo Apparels', 'Sent to new users upon sign-up.', 
    '<!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #F4F4F5; font-family: ''Helvetica Neue'', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #E4E4E7;">
              <tr>
                <td align="center" style="background-color: #1B5E20; padding: 40px 0; background-image: linear-gradient(135deg, #1B5E20 0%, #0D3B10 100%);">
                  <img src="{{logo_url}}" alt="Jambo Apparels" width="120" style="display: block; border: 0; max-width: 150px; height: auto;" />
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 40px 30px 40px; color: #52525B; font-size: 16px; line-height: 1.6;">
                  <h1 style="color: #1B5E20; margin: 0 0 20px 0; font-family: serif; font-size: 28px; line-height: 1.2;">Welcome, {{name}}!</h1>
                  <p style="margin-bottom: 20px;">
                    We are thrilled to welcome you to the Jambo Apparels family. You have joined a community of believers who wear their faith in <strong>Humility and Boldness</strong>.
                  </p>
                  <p style="margin-bottom: 30px;">
                    Our mission is to transport the gospel news heartily. Every piece you wear is a testimony waiting to be shared.
                  </p>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center">
                        <a href="{{shop_url}}/shop" style="background-color: #F1C40F; color: #1B5E20; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; text-transform: uppercase; font-size: 13px; letter-spacing: 1px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Explore The Collection</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="background-color: #FAFAFA; padding: 30px 40px; text-align: center; border-top: 1px solid #E4E4E7;">
                  <p style="color: #A1A1AA; font-size: 12px; margin: 0 0 10px 0; font-style: italic;">"Divinely Threaded Scriptures."</p>
                  <div style="margin-bottom: 15px;">
                    <a href="{{shop_url}}" style="color: #1B5E20; text-decoration: none; font-weight: bold; font-size: 12px; margin: 0 10px;">Shop</a>
                    <a href="{{shop_url}}/#/blog" style="color: #1B5E20; text-decoration: none; font-weight: bold; font-size: 12px; margin: 0 10px;">Journal</a>
                    <a href="{{shop_url}}/#/about" style="color: #1B5E20; text-decoration: none; font-weight: bold; font-size: 12px; margin: 0 10px;">About</a>
                  </div>
                  <p style="color: #D4D4D8; font-size: 11px; margin: 0;">&copy; 2025 Jambo Apparels. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>'),
    
    -- 2. CUSTOMER ORDER CONFIRMATION
    ('new_order_customer', 'Order Confirmation #{{order_number}}', 'Sent to customers after a new order.', 
    '<!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #F4F4F5; font-family: ''Helvetica Neue'', Helvetica, Arial, sans-serif;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #E4E4E7;">
              <tr>
                <td align="center" style="background-color: #1B5E20; padding: 30px 0; background-image: linear-gradient(135deg, #1B5E20 0%, #0D3B10 100%);">
                  <img src="{{logo_url}}" alt="Jambo Apparels" width="120" style="display: block; border: 0;" />
                </td>
              </tr>
              <tr>
                <td style="padding: 40px; color: #52525B; font-size: 16px; line-height: 1.6;">
                  <h1 style="color: #18181B; margin: 0 0 10px 0; font-family: serif; font-size: 24px;">Order Confirmed</h1>
                  <p style="color: #71717A; margin-bottom: 30px;">
                    Hi {{name}}, we have received your order and are getting it ready. Thank you for supporting our mission.
                  </p>
                  
                  <div style="background-color: #F9FAFB; padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #F3F4F6;">
                    <table width="100%">
                        <tr>
                            <td style="color: #71717A; font-size: 14px; padding-bottom: 10px;">Order Number</td>
                            <td align="right" style="color: #18181B; font-weight: bold; font-size: 14px; padding-bottom: 10px;">#{{order_number}}</td>
                        </tr>
                        <tr>
                            <td style="color: #71717A; font-size: 14px; border-top: 1px solid #E5E7EB; padding-top: 10px;">Total Amount</td>
                            <td align="right" style="color: #1B5E20; font-weight: bold; font-size: 18px; border-top: 1px solid #E5E7EB; padding-top: 10px;">£{{total}}</td>
                        </tr>
                    </table>
                  </div>

                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center">
                        <a href="{{order_link}}" style="background-color: #18181B; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px;">View Order Status</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="background-color: #FAFAFA; padding: 25px; text-align: center; border-top: 1px solid #E4E4E7;">
                  <p style="color: #A1A1AA; font-size: 12px; margin: 0;">&copy; 2025 Jambo Apparels</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>'),

    -- 3. ORDER SHIPPED
    ('order_shipped', 'Your Order #{{order_number}} is on the way!', 'Sent when order is shipped.', 
    '<!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #F4F4F5; font-family: ''Helvetica Neue'', Helvetica, Arial, sans-serif;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E4E4E7;">
              <tr>
                <td align="center" style="background-color: #1B5E20; padding: 30px 0; background-image: linear-gradient(135deg, #1B5E20 0%, #0D3B10 100%);">
                  <img src="{{logo_url}}" alt="Jambo Apparels" width="120" style="display: block;" />
                </td>
              </tr>
              <tr>
                <td style="padding: 40px; color: #52525B; font-size: 16px; line-height: 1.6;">
                  <h1 style="color: #18181B; margin: 0 0 20px 0; font-family: serif;">It''s on the way!</h1>
                  <p>
                    Good news, {{name}}. Your items have been carefully packed and shipped.
                  </p>
                  
                  <div style="border-left: 4px solid #F1C40F; background-color: #FFFBEB; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                    <p style="color: #92400E; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 5px 0; font-weight: bold;">Tracking Number</p>
                    <p style="color: #18181B; font-size: 18px; font-weight: bold; margin: 0; font-family: monospace;">{{tracking_number}}</p>
                  </div>

                  <p>
                    We pray that these items bless you as much as they blessed us creating them.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #FAFAFA; padding: 25px; text-align: center; border-top: 1px solid #E4E4E7;">
                   <a href="{{shop_url}}" style="color: #1B5E20; text-decoration: none; font-size: 12px; font-weight: bold;">Visit Store</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>'),

    -- 4. ORDER CANCELLED
    ('order_cancelled', 'Order #{{order_number}} Cancelled', 'Sent when order is cancelled.',
    '<!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #F4F4F5; font-family: sans-serif;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E4E4E7;">
              <tr>
                <td align="center" style="background-color: #1B5E20; padding: 30px 0;">
                  <img src="{{logo_url}}" alt="Jambo Apparels" width="120" style="display: block;" />
                </td>
              </tr>
              <tr>
                <td style="padding: 40px; color: #52525B; font-size: 16px; line-height: 1.6;">
                  <h1 style="color: #EF4444; margin: 0 0 20px 0; font-family: serif;">Order Cancelled</h1>
                  <p>
                    Hi {{name}}, this email confirms that order <strong>#{{order_number}}</strong> has been cancelled.
                  </p>
                  <p>
                    If a refund is due, it will be processed within 5-7 business days to your original payment method.
                  </p>
                  <p>
                    If this was a mistake, please <a href="mailto:{{contact_email}}" style="color: #1B5E20; font-weight: bold;">contact us</a> immediately.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #FAFAFA; padding: 25px; text-align: center; border-top: 1px solid #E4E4E7;">
                   <p style="color: #A1A1AA; font-size: 12px; margin: 0;">&copy; 2025 Jambo Apparels</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>'),

    -- 5. ADMIN: NEW ORDER
    ('admin_new_order', '💰 New Sale: Order #{{order_number}}', 'Admin Alert.', 
    '<!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; background-color: #F4F4F5; font-family: sans-serif;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding: 20px 0;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="500" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #E4E4E7;">
              <tr>
                <td style="padding: 20px; border-bottom: 1px solid #F4F4F5; background-color: #1B5E20;">
                  <h2 style="margin: 0; color: #ffffff; font-size: 18px;">New Order Received</h2>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px;">
                  <p style="margin: 0 0 5px 0; color: #71717A; font-size: 12px; text-transform: uppercase;">Customer</p>
                  <p style="margin: 0 0 20px 0; font-weight: bold; color: #18181B; font-size: 16px;">{{customer_name}}</p>
                  
                  <p style="margin: 0 0 5px 0; color: #71717A; font-size: 12px; text-transform: uppercase;">Order Total</p>
                  <p style="margin: 0 0 25px 0; font-weight: bold; color: #1B5E20; font-size: 24px;">£{{total}}</p>
                  
                  <a href="{{admin_link}}" style="display: block; width: 100%; text-align: center; background-color: #18181B; color: #ffffff; padding: 14px 0; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">Process Order</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>'),

    -- 6. ADMIN: CONTACT FORM
    ('contact_notification_admin', '[Support] New Message from {{sender_name}}', 'Alert sent to admin when contact form is used.',
    '<!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; background-color: #F4F4F5; font-family: sans-serif;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding: 20px 0;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #E4E4E7;">
              <tr>
                <td style="padding: 20px; border-bottom: 1px solid #F4F4F5; background-color: #374151;">
                  <h2 style="margin: 0; color: #ffffff; font-size: 16px;">New Inquiry</h2>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px; font-size: 14px; line-height: 1.6; color: #374151;">
                  <p><strong>From:</strong> {{sender_name}} (<a href="mailto:{{sender_email}}">{{sender_email}}</a>)</p>
                  <p><strong>Subject:</strong> {{subject}}</p>
                  <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 20px 0;">
                  <div style="background-color: #F9FAFB; padding: 15px; border-radius: 8px; font-style: italic;">
                    "{{message}}"
                  </div>
                  <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 20px 0;">
                  <a href="mailto:{{sender_email}}" style="display: inline-block; background-color: #1B5E20; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reply to Customer</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>'),

    -- 7. USER AUTO-REPLY (CONTACT)
    ('contact_autoreply', 'We received your message', 'Contact form autoreply.',
    '<!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #F4F4F5; font-family: sans-serif;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; padding: 0; overflow: hidden; border: 1px solid #E4E4E7;">
              <tr>
                <td align="center" style="padding: 30px 0; background-color: #1B5E20;">
                   <img src="{{logo_url}}" width="100" alt="Logo" style="display: block;"/>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px; color: #52525B; line-height: 1.6;">
                  <p>Hi {{sender_name}},</p>
                  <p>Thanks for reaching out to Jambo Apparels regarding "<strong>{{subject}}</strong>".</p>
                  <p>Our team has received your message and will review it shortly. We typically respond within 24-48 hours.</p>
                  <br>
                  <p style="font-weight: bold; color: #1B5E20;">Blessings,<br>The Jambo Team</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>'),

    -- 8. NEWSLETTER WELCOME
    ('newsletter_welcome', 'Welcome to the Jambo Journal!', 'Sent to new newsletter subscribers.',
    '<!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #F4F4F5; font-family: ''Helvetica Neue'', Helvetica, Arial, sans-serif;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
              <tr>
                <td align="center" style="background-color: #1B5E20; padding: 50px 0; background-image: linear-gradient(180deg, #1B5E20 0%, #144518 100%);">
                  <img src="{{logo_url}}" alt="Jambo Apparels" width="140" style="display: block;" />
                  <h2 style="color: #F1C40F; margin-top: 20px; font-family: serif; font-size: 24px; font-weight: normal;">Divinely Threaded.</h2>
                </td>
              </tr>
              <tr>
                <td style="padding: 50px 40px; color: #52525B; font-size: 16px; line-height: 1.8;">
                  <p style="font-size: 20px; font-weight: bold; color: #1B5E20; margin-bottom: 20px;">You''re on the list!</p>
                  <p>
                    Thank you for subscribing to the Jambo Apparels newsletter. You are now part of a community that wears their faith boldly.
                  </p>
                  <p>
                    Look forward to exclusive updates, styling tips, testimonies, and early access to new collections.
                  </p>
                  
                  <div style="margin-top: 40px; text-align: center;">
                    <a href="{{shop_url}}/shop" style="background-color: #1B5E20; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">Browse Collection</a>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background-color: #FAFAFA; padding: 30px; text-align: center; border-top: 1px solid #eee; font-size: 12px; color: #9CA3AF;">
                   <p>You received this email because you signed up on our website.</p>
                   <a href="{{shop_url}}" style="color: #1B5E20; text-decoration: none;">Visit Website</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>')
ON CONFLICT (name) DO NOTHING;


-- 3. UPDATED TRIGGERS TO FETCH GLOBAL SETTINGS
-- We update the logic to fetch app_settings and replace global variables like {{logo_url}}

-- A. USER WELCOME TRIGGER
CREATE OR REPLACE FUNCTION handle_new_user_welcome()
RETURNS trigger AS $$
DECLARE
  settings_row record;
  template_row record;
  email_body text;
  logo_url text;
  shop_url text;
  contact_email text;
BEGIN
  SELECT * INTO settings_row FROM public.app_settings WHERE id = 1;
  logo_url := COALESCE(settings_row.logo_image, 'https://i.imgur.com/pkaScEv.png');
  shop_url := 'https://jamboapparels.com'; 
  contact_email := COALESCE(settings_row.contact_email, 'support@jamboapparels.com');

  IF settings_row.enable_email_notifications = true AND settings_row.enable_email_welcome = true THEN
    SELECT * INTO template_row FROM public.email_templates WHERE name = 'welcome_email';
    IF template_row IS NOT NULL THEN
      email_body := replace(template_row.body_html, '{{name}}', NEW.name);
      
      -- Inject Global Variables
      email_body := replace(email_body, '{{logo_url}}', logo_url);
      email_body := replace(email_body, '{{shop_url}}', shop_url);
      email_body := replace(email_body, '{{contact_email}}', contact_email);

      PERFORM trigger_send_email(NEW.email, template_row.subject, email_body);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- B. CUSTOMER ORDER TRIGGER
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
    
    -- Handle Guest or Registered
    IF NEW.user_id IS NOT NULL THEN
       SELECT * INTO customer FROM public.users WHERE id = NEW.user_id;
    ELSE
       -- Mock customer record for guest
       customer := json_build_object('name', NEW.customer_name, 'email', NEW.customer_email);
    END IF;

    IF template_row IS NOT NULL AND customer IS NOT NULL THEN
      email_body := replace(template_row.body_html, '{{name}}', COALESCE(customer.name, 'Valued Customer'));
      email_body := replace(email_body, '{{order_number}}', NEW.order_number);
      email_body := replace(email_body, '{{total}}', NEW.total::text);
      email_body := replace(email_body, '{{order_link}}', shop_url || '/#/order/' || NEW.id);
      
      -- Globals
      email_body := replace(email_body, '{{logo_url}}', logo_url);
      email_body := replace(email_body, '{{shop_url}}', shop_url);
      email_body := replace(email_body, '{{contact_email}}', contact_email);

      PERFORM trigger_send_email(COALESCE(customer.email, NEW.customer_email), replace(template_row.subject, '{{order_number}}', NEW.order_number), email_body);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- C. ORDER STATUS UPDATE (Shipped/Cancelled)
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
BEGIN
  SELECT * INTO settings_row FROM public.app_settings WHERE id = 1;
  logo_url := COALESCE(settings_row.logo_image, 'https://i.imgur.com/pkaScEv.png');
  shop_url := 'https://jamboapparels.com';
  contact_email := COALESCE(settings_row.contact_email, 'support@jamboapparels.com');

  IF settings_row.enable_email_notifications = true AND NEW.status IS DISTINCT FROM OLD.status THEN
    
    IF NEW.status = 'Shipped' AND settings_row.enable_email_order_shipped = true THEN
      template_name := 'order_shipped';
    ELSIF NEW.status = 'Cancelled' THEN
      template_name := 'order_cancelled';
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


-- D. ADMIN ALERT: NEW ORDER
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
      email_body := replace(email_body, '{{admin_link}}', 'https://jamboapparels.com/#/admin/orders/' || NEW.id);
      
      -- Globals
      email_body := replace(email_body, '{{logo_url}}', logo_url);
      
      PERFORM trigger_send_email(admin_email, replace(template_row.subject, '{{order_number}}', NEW.order_number), email_body);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- E. CONTACT FORM HANDLING (Admin + User)
CREATE OR REPLACE FUNCTION handle_contact_submission_email()
RETURNS trigger AS $$
DECLARE
  settings_row record;
  admin_template record;
  user_template record;
  email_body text;
  admin_email text;
  final_subject text;
  logo_url text;
  shop_url text;
BEGIN
  SELECT * INTO settings_row FROM public.app_settings WHERE id = 1;
  admin_email := settings_row.contact_email;
  logo_url := COALESCE(settings_row.logo_image, 'https://i.imgur.com/pkaScEv.png');
  shop_url := 'https://jamboapparels.com';

  IF settings_row.enable_email_notifications = true THEN
     -- A) Email Admin
     IF settings_row.enable_email_contact_admin = true AND admin_email IS NOT NULL THEN
        SELECT * INTO admin_template FROM public.email_templates WHERE name = 'contact_notification_admin';
        IF admin_template IS NOT NULL THEN
           email_body := replace(admin_template.body_html, '{{sender_name}}', NEW.name);
           email_body := replace(email_body, '{{sender_email}}', NEW.email);
           email_body := replace(email_body, '{{subject}}', COALESCE(NEW.subject, 'General Inquiry'));
           email_body := replace(email_body, '{{message}}', NEW.message);
           -- Globals
           email_body := replace(email_body, '{{logo_url}}', logo_url);
           
           final_subject := replace(admin_template.subject, '{{sender_name}}', NEW.name);
           
           PERFORM trigger_send_email(admin_email, final_subject, email_body);
        END IF;
     END IF;

     -- B) Auto-reply to User
     SELECT * INTO user_template FROM public.email_templates WHERE name = 'contact_autoreply';
     IF user_template IS NOT NULL THEN
        email_body := replace(user_template.body_html, '{{sender_name}}', NEW.name);
        email_body := replace(email_body, '{{subject}}', COALESCE(NEW.subject, 'General Inquiry'));
        
        -- Globals
        email_body := replace(email_body, '{{logo_url}}', logo_url);
        email_body := replace(email_body, '{{shop_url}}', shop_url);
        
        PERFORM trigger_send_email(NEW.email, user_template.subject, email_body);
     END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- F. NEWSLETTER WELCOME TRIGGER (Restored)
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

  -- Send only if global notifications enabled AND it's a new active subscription
  IF settings_row.enable_email_notifications = true AND NEW.is_subscribed = true THEN
     -- Avoid sending if just updating an existing active sub
     IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND OLD.is_subscribed = false) THEN
        SELECT * INTO template_row FROM public.email_templates WHERE name = 'newsletter_welcome';
        IF template_row IS NOT NULL THEN
           email_body := replace(template_row.body_html, '{{shop_link}}', shop_url || '/#/shop');
           email_body := replace(email_body, '{{shop_url}}', shop_url);
           email_body := replace(email_body, '{{logo_url}}', logo_url);
           
           PERFORM trigger_send_email(NEW.email, template_row.subject, email_body);
        END IF;
     END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply Newsletter Trigger
DROP TRIGGER IF EXISTS on_newsletter_sub ON public.newsletter_subscribers;
CREATE TRIGGER on_newsletter_sub
  AFTER INSERT OR UPDATE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION handle_newsletter_welcome_email();
