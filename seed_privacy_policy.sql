-- ============================================================================
-- JAMBO APPARELS - PRIVACY POLICY UPDATE
-- Run this script to update the privacy policy text in the database.
-- ============================================================================

-- 1. Ensure the column exists
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS privacy_policy TEXT;

-- 2. Update the policy text
UPDATE public.app_settings
SET privacy_policy = '🔒 PRIVACY POLICY

Last Updated: May 2025

At Jambo Apparels, we respect your privacy and are committed to protecting your personal information.

1. INFORMATION WE COLLECT
We collect information you provide directly to us, such as when you create an account, place an order, or subscribe to our newsletter. This includes:
• Name, email address, phone number, and shipping address.
• Payment information (processed securely by our payment partners; we do not store full card details).
• Communications you send to us.

2. HOW WE USE YOUR INFORMATION
We use the information we collect to:
• Process and fulfill your orders.
• Communicate with you about your account and orders.
• Send you marketing communications (if you have opted in).
• Monitor and analyze trends, usage, and activities.
• Detect, investigate, and prevent fraudulent transactions.

3. DATA SHARING
We do not sell your personal data. We may share your information with third-party service providers who perform services on our behalf, such as:
• Payment processing (PayPal, Stripe)
• Order fulfillment and shipping
• Email marketing services
• Data analytics

4. YOUR RIGHTS
Depending on your location, you may have rights regarding your personal data, including:
• Accessing and receiving a copy of your data.
• Updating or correcting your data.
• Requesting deletion of your data (Right to be Forgotten).
• Objecting to the processing of your data.

To exercise these rights, please contact us at privacy@jamboapparels.com or use the data tools in your account dashboard.

5. SECURITY
We implement reasonable security measures to protect your personal information. However, no security system is impenetrable.

6. CONTACT US
If you have any questions about this Privacy Policy, please contact us at:
Email: privacy@jamboapparels.com'
WHERE id = 1;
