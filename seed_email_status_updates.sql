
-- ============================================================================
-- JAMBO APPARELS - STATUS UPDATE TEMPLATES
-- Adds templates for Processing, Delivered, and Generic Admin Alerts
-- ============================================================================

INSERT INTO public.email_templates (name, subject, description, body_html)
VALUES
    -- 1. ADMIN STATUS UPDATE ALERT
    ('admin_order_status_update', '[ADMIN] Order #{{order_number}} Updated to {{status}}', 'Alert sent to admin when an order status changes.',
    '<!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; background-color: #F4F4F5; font-family: sans-serif;">
      <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #E4E4E7; max-width: 500px; margin: 20px auto;">
        <h3 style="color: #18181B; margin-top: 0;">Order Status Update</h3>
        <p>Order <strong>#{{order_number}}</strong> has been updated to <strong style="color: #1B5E20;">{{status}}</strong>.</p>
        <hr style="border: 0; border-top: 1px solid #E4E4E7; margin: 15px 0;">
        <p style="font-size: 14px; color: #52525B;"><strong>Customer:</strong> {{customer_name}}</p>
        <p><a href="{{admin_link}}" style="background-color: #18181B; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; font-size: 12px; font-weight: bold; display: inline-block; margin-top: 10px;">View Order</a></p>
      </div>
    </body>
    </html>'),

    -- 2. CUSTOMER: PROCESSING
    ('order_processing', 'Update: Your Order #{{order_number}} is being processed', 'Sent when order moves to Processing.',
    '<!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #F4F4F5; font-family: sans-serif;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #E4E4E7;">
              <tr>
                <td align="center" style="background-color: #1B5E20; padding: 25px 0;">
                  <img src="{{logo_url}}" alt="Jambo Apparels" width="120" style="display: block;" />
                </td>
              </tr>
              <tr>
                <td style="padding: 40px; color: #52525B; line-height: 1.6;">
                  <h1 style="color: #18181B; font-size: 20px; font-family: serif; margin-top: 0;">We''re working on it!</h1>
                  <p>Hi {{name}},</p>
                  <p>Your order <strong>#{{order_number}}</strong> is now being processed by our team. We are carefully selecting and packing your items.</p>
                  <p>You will receive another email with tracking details as soon as it ships.</p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #FAFAFA; padding: 20px; text-align: center; border-top: 1px solid #E4E4E7; font-size: 12px; color: #A1A1AA;">
                   &copy; 2025 Jambo Apparels
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>'),

    -- 3. CUSTOMER: DELIVERED
    ('order_delivered', 'Delivered! Your Order #{{order_number}} has arrived', 'Sent when order is marked Delivered.',
    '<!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #F4F4F5; font-family: sans-serif;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #E4E4E7;">
              <tr>
                <td align="center" style="background-color: #1B5E20; padding: 25px 0;">
                  <img src="{{logo_url}}" alt="Jambo Apparels" width="120" style="display: block;" />
                </td>
              </tr>
              <tr>
                <td style="padding: 40px; color: #52525B; line-height: 1.6;">
                  <h1 style="color: #18181B; font-size: 20px; font-family: serif; margin-top: 0;">It has arrived!</h1>
                  <p>Hi {{name}},</p>
                  <p>Your order <strong>#{{order_number}}</strong> has been marked as delivered. We hope these pieces bless you as much as they blessed us creating them.</p>
                  
                  <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                     <p style="color: #166534; font-weight: bold; margin: 0 0 10px 0;">Tell us what you think!</p>
                     <p style="margin: 0; font-size: 14px; color: #15803D;">Your testimony helps our community grow.</p>
                     <a href="{{shop_url}}/#/product/{{product_id}}#reviews" style="display: inline-block; margin-top: 15px; background-color: #166534; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 12px; font-weight: bold;">Leave a Review</a>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background-color: #FAFAFA; padding: 20px; text-align: center; border-top: 1px solid #E4E4E7; font-size: 12px; color: #A1A1AA;">
                   &copy; 2025 Jambo Apparels
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>')
ON CONFLICT (name) DO NOTHING;
