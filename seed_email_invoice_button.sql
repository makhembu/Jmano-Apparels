
-- ============================================================================
-- JAMBO APPARELS - INVOICE EMAIL UPDATE
-- Adds "Download Invoice" button to the order confirmation email.
-- ============================================================================

-- Update the new_order_customer template
UPDATE public.email_templates
SET body_html = 
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
                      <td align="center" style="padding-bottom: 15px;">
                        <a href="{{order_link}}" style="background-color: #18181B; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px; width: 200px; text-align: center;">View Order Status</a>
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <a href="{{order_link}}?print=true" style="border: 2px solid #E4E4E7; color: #52525B; padding: 10px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px; width: 200px; text-align: center;">Download Invoice (PDF)</a>
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
    </html>'
WHERE name = 'new_order_customer';
