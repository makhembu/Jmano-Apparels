
-- SQL Migration to add Guest Account Creation Email Template

INSERT INTO public.email_templates (name, subject, body_html, description)
VALUES (
  'guest_order_account_created',
  'Order #{{order_number}} Confirmed - Account Created',
  '<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 30px;">
        <img src="{{logo_url}}" alt="Jambo Apparels" style="height: 50px; width: auto;" />
    </div>
    
    <h2>Thank you for your order, {{name}}!</h2>
    <p>Your order <strong>#{{order_number}}</strong> has been successfully placed.</p>
    <p>Total: <strong>£{{total}}</strong></p>
    
    <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;" />
    
    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 12px; border: 1px solid #bbf7d0;">
      <h3 style="margin-top: 0; color: #166534;">Account Created</h3>
      <p style="margin-bottom: 15px;">For your convenience, we have automatically created an account for you. This allows you to track your order status and checkout faster next time.</p>
      
      <div style="background-color: white; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0; margin-bottom: 20px;">
          <p style="margin: 5px 0;"><strong>Email:</strong> {{email}}</p>
          <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #eee; padding: 2px 6px; rounded: 4px; font-size: 1.1em;">{{generated_password}}</code></p>
      </div>
      
      <div style="text-align: center;">
          <a href="{{login_link}}" style="background-color: #166534; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: bold; display: inline-block;">Log In to Your Account</a>
      </div>
    </div>
    
    <p style="font-size: 13px; color: #666; margin-top: 20px; text-align: center;">
        We recommend changing your password after your first login via the Profile settings.
    </p>
    
    <div style="text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
      <a href="{{order_link}}" style="color: #166534; font-weight: bold; text-decoration: none;">View Order Details</a>
    </div>
  </div>',
  'Sent to guest users when an account is auto-created during checkout'
)
ON CONFLICT (name) DO UPDATE SET
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html;
