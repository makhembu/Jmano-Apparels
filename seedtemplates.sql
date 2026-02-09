
-- ============================================================================
-- MISSING EMAIL TEMPLATES MIGRATION
-- Adds templates for Returns, Refunds, Processing, and Admin Alerts
-- ============================================================================

INSERT INTO public.email_templates (name, subject, body_html, description)
VALUES 
(
  'order_processing',
  'Order #{{order_number}} is being packed',
  '<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 30px;">
        <img src="{{logo_url}}" alt="Jambo Apparels" style="height: 50px; width: auto;" />
    </div>
    <h2>We are working on it!</h2>
    <p>Hi {{name}},</p>
    <p>Good news! Your payment for order <strong>#{{order_number}}</strong> has been confirmed. Our team is currently picking and packing your items with care.</p>
    <p>You will receive another email as soon as your package ships.</p>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #888;">
        <p>Thank you for choosing Jambo Apparels.</p>
    </div>
  </div>',
  'Sent to customer when payment is confirmed and order status moves to Processing.'
),
(
  'order_refunded',
  'Refund Issued for Order #{{order_number}}',
  '<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 30px;">
        <img src="{{logo_url}}" alt="Jambo Apparels" style="height: 50px; width: auto;" />
    </div>
    <h2>Refund Processed</h2>
    <p>Hi {{name}},</p>
    <p>We have issued a refund for your order <strong>#{{order_number}}</strong>.</p>
    <p>It may take 3-5 business days for the funds to appear in your account, depending on your bank.</p>
    <p>If you have any questions, please simply reply to this email.</p>
  </div>',
  'Sent when an order is fully refunded.'
),
(
  'return_requested',
  'Return Request Received - Order #{{order_number}}',
  '<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 30px;">
        <img src="{{logo_url}}" alt="Jambo Apparels" style="height: 50px; width: auto;" />
    </div>
    <h2>We received your request</h2>
    <p>Hi {{name}},</p>
    <p>We have received your return request for order <strong>#{{order_number}}</strong>.</p>
    <p><strong>Reason provided:</strong> {{return_reason}}</p>
    <p>Our team will review your request within 24-48 hours and get back to you with the next steps.</p>
  </div>',
  'Confirmation to user that return request was submitted.'
),
(
  'return_approved',
  'Return Approved - Instructions for Order #{{order_number}}',
  '<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 30px;">
        <img src="{{logo_url}}" alt="Jambo Apparels" style="height: 50px; width: auto;" />
    </div>
    <h2 style="color: #166534;">Return Approved</h2>
    <p>Hi {{name}},</p>
    <p>Your return request for order <strong>#{{order_number}}</strong> has been approved.</p>
    
    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; font-size: 16px;">Shipping Instructions</h3>
        <p>Please package the item(s) securely and ship them to:</p>
        <p style="font-weight: bold;">
            Jambo Apparels Returns<br/>
            123 Scripture Lane<br/>
            London, UK, W1A 1AA
        </p>
        <p style="font-size: 13px; color: #666;">Please include your Order Number inside the package.</p>
    </div>
    <p>Once we receive and inspect the items, we will process your refund.</p>
  </div>',
  'Sent when admin approves a return request.'
),
(
  'return_rejected',
  'Update regarding your return request #{{order_number}}',
  '<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 30px;">
        <img src="{{logo_url}}" alt="Jambo Apparels" style="height: 50px; width: auto;" />
    </div>
    <h2>Return Request Update</h2>
    <p>Hi {{name}},</p>
    <p>Regarding your request to return items from order <strong>#{{order_number}}</strong>.</p>
    <p>After reviewing the details, we are unable to approve this return at this time.</p>
    <p><strong>Reason:</strong> {{rejection_reason}}</p>
    <p>If you believe this is an error, please contact us at {{contact_email}}.</p>
  </div>',
  'Sent when admin rejects a return.'
),
(
  'admin_return_alert',
  '[Action Required] New Return Request #{{order_number}}',
  '<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
    <h2>New Return Request</h2>
    <p><strong>Customer:</strong> {{customer_name}}</p>
    <p><strong>Order:</strong> #{{order_number}}</p>
    <p><strong>Reason:</strong> {{return_reason}}</p>
    <div style="margin-top: 20px;">
        <a href="{{admin_link}}" style="background-color: #333; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Request</a>
    </div>
  </div>',
  'Notifies admin of a new return request.'
),
(
  'admin_order_status_update',
  '[System] Order #{{order_number}} Updated',
  '<div style="font-family: sans-serif; color: #333;">
    <p>Order <strong>#{{order_number}}</strong> status changed to <strong>{{status}}</strong>.</p>
    <p>Customer: {{customer_name}}</p>
    <a href="{{admin_link}}">View Order</a>
  </div>',
  'Internal admin alert for status changes.'
),
(
  'contact_autoreply',
  'We received your message',
  '<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 30px;">
        <img src="{{logo_url}}" alt="Jambo Apparels" style="height: 50px; width: auto;" />
    </div>
    <p>Hi {{sender_name}},</p>
    <p>Thanks for reaching out! We have received your message regarding "<strong>{{subject}}</strong>".</p>
    <p>Our team usually responds within 24 hours.</p>
    <p>Blessings,<br/>Jambo Apparels Team</p>
  </div>',
  'Auto-response to contact form submissions.'
),
(
  'order_delivered',
  'Your order #{{order_number}} has arrived!',
  '<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 30px;">
        <img src="{{logo_url}}" alt="Jambo Apparels" style="height: 50px; width: auto;" />
    </div>
    <h2 style="color: #166534; text-align: center;">Delivered!</h2>
    <p>Hi {{name}},</p>
    <p>Your order <strong>#{{order_number}}</strong> has been delivered.</p>
    <p>We hope the items bless you. We would love to hear what you think!</p>
    <div style="text-align: center; margin-top: 30px;">
        <a href="{{shop_url}}/product/{{product_id}}#reviews" style="background-color: #166534; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Leave a Review</a>
    </div>
  </div>',
  'Notification when order is marked as Delivered.'
),
(
  'order_shipped',
  'Order #{{order_number}} is on the way',
  '<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 30px;">
        <img src="{{logo_url}}" alt="Jambo Apparels" style="height: 50px; width: auto;" />
    </div>
    <h2>It''s on the way!</h2>
    <p>Hi {{name}},</p>
    <p>Your order <strong>#{{order_number}}</strong> has been shipped.</p>
    
    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #bbf7d0; text-align: center;">
        <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #166534; font-weight: bold;">Tracking Number</p>
        <p style="margin: 10px 0 0 0; font-size: 24px; font-family: monospace; font-weight: bold; color: #166534;">{{tracking_number}}</p>
    </div>

    <div style="text-align: center; margin-bottom: 25px;">
        <a href="{{order_link}}" style="background-color: #333; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">View Order & Track</a>
    </div>

    <p style="font-size: 13px; color: #666; text-align: center;">Please allow 24 hours for the tracking information to update.</p>
  </div>',
  'Sent when order is marked as Shipped. Requires tracking number.'
)
ON CONFLICT (name) DO UPDATE SET
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  description = EXCLUDED.description;
