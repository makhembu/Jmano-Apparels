-- ============================================================================
-- JAMBO APPARELS - COMPLETE PRODUCTION SEED DATA
-- Version: 1.0 (10/10 Grade)
-- ============================================================================

-- 1. CATEGORIES
INSERT INTO public.categories (key, label, color, bg_class) VALUES
('HOPEHOODIES', 'Hoodies for Hope', '#F1C40F', 'bg-brand-hope'),
('TESTAMENTSHIRTS', 'T-shirts for Testimony', '#B96AD9', 'bg-brand-testament'),
('TRIUMPHTRACKS', 'Tracks for Triumph', 'rgb(241,196,15)', 'bg-brand-triumph'),
('HUMILITYHATS', 'Hats for Humility', '#2DC26B', 'bg-brand-humility'),
('PATIENCEPOLOS', 'Polos for Patience', '#E03E2D', 'bg-brand-patience'),
('SAINTYSWEATSHIRTS', 'Sweat-shirts for saints', '#E03E2D', 'bg-brand-sainty')
ON CONFLICT (key) DO NOTHING;

-- 2. APP SETTINGS (Comprehensive)
INSERT INTO public.app_settings (
  id, 
  slogan, 
  secondary_slogan, 
  mission, 
  vision, 
  core_values, 
  currency, 
  contact_email, 
  contact_phone,
  contact_address,
  free_shipping_threshold,
  social_links,
  business_hours,
  hero_banner_text,
  hero_banner_image,
  announcement_text,
  is_announcement_enabled,
  support_email,
  tax_rate,
  shipping_policy,
  return_policy,
  privacy_policy,
  terms_conditions,
  featured_categories,
  smtp_settings,
  maintenance_mode,
  maintenance_message
) 
VALUES (
  1,
  'Divinely threaded scriptures.',
  'Wear your scriptures in Humility and Boldness!!',
  'To create opportunities for others to succeed by honouring God in the work He has given us, providing a vehicle for transporting the gospel news heartily as to the Lord.',
  'To be a vibrant platform spreading the gospel through uniquely threaded wears to the ends of the earth.',
  'Honesty, Excellence, Boldness {H.E.B.}',
  'GBP',
  'hello@jamboapparels.com',
  '+44 20 7946 0958',
  '123 Scripture Lane, Westminster, London, UK, W1A 1AA',
  50.00,
  '{
    "instagram": "https://instagram.com/jamboapparels",
    "facebook": "https://facebook.com/jamboapparels",
    "twitter": "https://twitter.com/jamboapparels",
    "tiktok": "https://tiktok.com/@jamboapparels",
    "linkedin": "https://linkedin.com/company/jamboapparels"
  }'::jsonb,
  '{
    "monday": "09:00-18:00",
    "tuesday": "09:00-18:00",
    "wednesday": "09:00-18:00",
    "thursday": "09:00-18:00",
    "friday": "09:00-18:00",
    "saturday": "10:00-16:00",
    "sunday": "Closed"
  }'::jsonb,
  'Wear Your Faith Boldly 🙏',
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1920&h=600&fit=crop',
  '🎉 New Year Sale! Free Shipping on Orders Over £50 | Use Code: NEWYEAR2026',
  TRUE,
  'support@jamboapparels.com',
  20.00,
  
  '📦 SHIPPING POLICY

We are committed to delivering your faith-inspired apparel quickly and safely.

PROCESSING TIME:
• Orders are processed within 1-2 business days
• You will receive a tracking number via email once shipped

UK SHIPPING:
• Standard Delivery (3-5 business days): £4.99
• Express Delivery (1-2 business days): £9.99
• FREE shipping on orders over £50

INTERNATIONAL SHIPPING:
• Europe (7-10 business days): £12.99
• USA/Canada/Australia (10-14 business days): £19.99
• Rest of World (14-21 business days): £24.99

TRACKING:
All orders include full tracking. You''ll receive updates at every stage of delivery.

CUSTOMS & DUTIES:
International orders may be subject to import duties and taxes, which are the responsibility of the recipient.

Questions? Contact us at support@jamboapparels.com',

  '🔄 RETURN & EXCHANGE POLICY

We want you to love your Jambo Apparels! If you''re not completely satisfied, we''re here to help.

30-DAY RETURN WINDOW:
You have 30 days from receiving your order to request a return or exchange.

ELIGIBLE ITEMS:
• Items must be unworn, unwashed, and in original condition
• All tags must still be attached
• Items must be in original packaging

NON-RETURNABLE ITEMS:
• Sale items (marked as final sale)
• Gift cards
• Items marked "non-returnable"

HOW TO RETURN:
1. Contact us at returns@jamboapparels.com with your order number
2. We''ll send you a prepaid return label (UK only)
3. Pack items securely and attach the label
4. Drop off at your nearest post office

REFUNDS:
• Refunds are processed within 5-7 business days of receiving your return
• Original shipping costs are non-refundable
• Refunds issued to original payment method

EXCHANGES:
• Free exchanges for different sizes/colors (UK only)
• Subject to stock availability

DAMAGED/DEFECTIVE ITEMS:
If you receive a damaged or defective item, contact us immediately at support@jamboapparels.com with photos. We''ll send a replacement at no cost.

Questions? We''re here to help: support@jamboapparels.com',

  '🔒 PRIVACY POLICY

Last Updated: January 2026

At Jambo Apparels, we respect your privacy and are committed to protecting your personal information.

INFORMATION WE COLLECT:
• Name, email address, phone number, and shipping address
• Payment information (processed securely by Stripe)
• Browsing behavior and preferences
• Device and browser information

HOW WE USE YOUR INFORMATION:
• To process and fulfill your orders
• To communicate about your orders and account
• To send marketing emails (with your consent)
• To improve our website and services
• To prevent fraud and ensure security

DATA SHARING:
We DO NOT sell your personal information. We only share data with:
• Payment processors (Stripe) for secure transactions
• Shipping partners to deliver your orders
• Email service providers (with your consent)
• Legal authorities when required by law

YOUR RIGHTS:
• Access your personal data
• Request correction of inaccurate data
• Request deletion of your data
• Opt-out of marketing emails
• Object to data processing

COOKIES:
We use cookies to enhance your browsing experience. You can control cookie preferences in your browser settings.

DATA SECURITY:
We use industry-standard encryption (SSL/TLS) to protect your data during transmission and storage.

CHILDREN''S PRIVACY:
Our services are not directed to children under 13. We do not knowingly collect data from children.

CONTACT US:
For privacy concerns or data requests: privacy@jamboapparels.com

By using our website, you agree to this Privacy Policy.',

  '📜 TERMS & CONDITIONS

Last Updated: January 2026

Welcome to Jambo Apparels! By accessing our website and purchasing our products, you agree to these terms.

1. ACCEPTANCE OF TERMS
By using jamboapparels.com, you accept these Terms & Conditions in full. If you disagree with any part, please do not use our website.

2. PRODUCTS & PRICING
• All prices are in GBP (£) and include VAT
• We reserve the right to change prices without notice
• Product images are for illustration; actual items may vary slightly
• We strive for accuracy but cannot guarantee product descriptions are error-free

3. ORDERING & PAYMENT
• Orders are subject to acceptance and availability
• We use Stripe for secure payment processing
• Payment must be received before order dispatch
• We reserve the right to refuse any order

4. INTELLECTUAL PROPERTY
All content on this website (designs, logos, text, images) is owned by Jambo Apparels and protected by copyright law. You may not reproduce, distribute, or use any content without written permission.

5. USER ACCOUNTS
• You are responsible for maintaining account security
• Provide accurate and current information
• Notify us immediately of unauthorized access
• We may suspend accounts that violate these terms

6. PROHIBITED USES
You may not:
• Use our site for illegal purposes
• Attempt to hack, disrupt, or harm our systems
• Upload malicious content or viruses
• Harass other users or our staff
• Resell our products without authorization

7. LIMITATION OF LIABILITY
Jambo Apparels is not liable for:
• Indirect, incidental, or consequential damages
• Loss of profits, data, or business opportunities
• Damages exceeding the amount paid for products

8. INDEMNIFICATION
You agree to indemnify Jambo Apparels against any claims arising from your violation of these terms or misuse of our services.

9. MODIFICATIONS
We reserve the right to modify these terms at any time. Continued use of our website constitutes acceptance of changes.

10. GOVERNING LAW
These terms are governed by the laws of England and Wales. Disputes will be resolved in UK courts.

11. CONTACT
For questions about these terms: legal@jamboapparels.com

BY PLACING AN ORDER, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO THESE TERMS & CONDITIONS.',

  '["HOPEHOODIES", "TESTAMENTSHIRTS", "HUMILITYHATS"]'::jsonb,
  
  '{
    "host": "smtp.sendgrid.net",
    "port": 587,
    "secure": false,
    "from_email": "noreply@jamboapparels.com",
    "from_name": "Jambo Apparels"
  }'::jsonb,
  
  FALSE,
  'We are currently performing scheduled maintenance to improve your experience. We''ll be back online shortly. Thank you for your patience! 🙏'
)
ON CONFLICT (id) DO UPDATE SET
  contact_phone = EXCLUDED.contact_phone,
  contact_address = EXCLUDED.contact_address,
  social_links = EXCLUDED.social_links,
  business_hours = EXCLUDED.business_hours,
  hero_banner_text = EXCLUDED.hero_banner_text,
  hero_banner_image = EXCLUDED.hero_banner_image,
  announcement_text = EXCLUDED.announcement_text,
  is_announcement_enabled = EXCLUDED.is_announcement_enabled,
  support_email = EXCLUDED.support_email,
  shipping_policy = EXCLUDED.shipping_policy,
  return_policy = EXCLUDED.return_policy,
  privacy_policy = EXCLUDED.privacy_policy,
  terms_conditions = EXCLUDED.terms_conditions,
  featured_categories = EXCLUDED.featured_categories,
  smtp_settings = EXCLUDED.smtp_settings,
  tax_rate = EXCLUDED.tax_rate;

-- 3. BLOG CATEGORIES
INSERT INTO public.blog_categories (name, slug, description) VALUES
('Faith & Living', 'faith-living', 'Living out your faith in everyday life'),
('Style Guide', 'style-guide', 'Fashion tips and styling inspiration'),
('Community Stories', 'community-stories', 'Real testimonies from our customers'),
('Behind the Scenes', 'behind-scenes', 'The story behind our brand and designs'),
('Scripture Deep Dive', 'scripture-deep-dive', 'Exploring the scriptures that inspire our designs')
ON CONFLICT (slug) DO NOTHING;

-- 4. BLOG TAGS
INSERT INTO public.blog_tags (name, slug) VALUES
('Hope', 'hope'),
('Faith', 'faith'),
('Style', 'style'),
('Testimony', 'testimony'),
('Boldness', 'boldness'),
('Humility', 'humility'),
('Patience', 'patience'),
('Community', 'community'),
('Design', 'design'),
('Scripture', 'scripture')
ON CONFLICT (slug) DO NOTHING;

-- 5. BLOG POSTS (Rich Content)
INSERT INTO public.blog_posts (
  title, 
  summary, 
  content, 
  slug, 
  status, 
  featured_image, 
  thumbnail, 
  author, 
  reading_time, 
  category_id,
  seo_title,
  seo_description
) VALUES
(
  'Walking in Boldness: How Faith-Based Fashion Makes a Statement',
  'Discover how wearing scripture-inspired clothing can be a powerful tool for evangelism and personal faith expression.',
  '# Walking in Boldness

In a world where blending in seems safer, boldness stands out. But what does it mean to be bold in your faith?

## The Power of Visual Testimony

Every day, we make countless decisions about what to wear. What if those decisions could become opportunities to share your faith? At Jambo Apparels, we believe your clothing can be a conversation starter, a testimony, and a daily reminder of God''s truth.

### Why Faith-Based Fashion Matters

1. **Silent Evangelism**: Your hoodie can speak before you do
2. **Personal Reminder**: Scripture on your chest keeps truth close to your heart
3. **Community Building**: Recognizing fellow believers in public spaces
4. **Confidence Boost**: Wearing your values gives you strength

## Boldness in Action

Take Sarah, one of our customers from Manchester. She wore her Hope Hoodie to university and had three separate conversations about faith—all initiated by classmates asking about the design. "I never thought a hoodie could open so many doors," she shared.

### Practical Ways to Be Bold

- Wear scripture apparel to everyday places (gym, coffee shops, campus)
- Don''t hide your faith when dressing for work or social events
- Use compliments about your clothing as conversation starters
- Share your testimony naturally when people ask about your apparel

## The H.E.B. Principle

Our core values—Honesty, Excellence, Boldness—guide everything we create:

- **Honesty**: Authentic faith, authentic materials
- **Excellence**: Quality that reflects God''s character
- **Boldness**: Courage to stand out for what matters

## Your Turn

Boldness isn''t about being loud or aggressive. It''s about confident authenticity. It''s wearing what you believe, living what you profess, and being unashamed of the gospel.

Ready to walk boldly? Explore our Hope Hoodies collection and find the piece that speaks your testimony.

*"For God has not given us a spirit of fear, but of power and of love and of a sound mind." - 2 Timothy 1:7*',
  'walking-in-boldness',
  'published',
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=300&fit=crop',
  'Admin',
  6,
  (SELECT id FROM public.blog_categories WHERE slug = 'faith-living' LIMIT 1),
  'Walking in Boldness: Faith-Based Fashion | Jambo Apparels',
  'Learn how scripture-inspired clothing can be a powerful evangelism tool. Discover the impact of wearing your faith boldly with Jambo Apparels.'
),
(
  'The Thread of Hope: Design Symbolism Explained',
  'Every color, every stitch, every word on our hoodies carries meaning. Discover the intentional design choices behind our Hope collection.',
  '# The Thread of Hope: Design Symbolism

At Jambo Apparels, nothing is accidental. Every design element tells a story.

## The Gold/Yellow Choice

Our Hope Hoodies feature bright yellow—but why?

### Biblical Symbolism of Gold:
- **Purity**: Refined like gold (1 Peter 1:7)
- **Divine Glory**: Streets of gold in heaven
- **Light**: "You are the light of the world" (Matthew 5:14)
- **Value**: Hope is precious, worth more than gold

## Design Elements Decoded

### 1. Typography Choices
We use bold, sans-serif fonts because:
- They''re readable from a distance (evangelism tool!)
- They convey strength and confidence
- They''re modern and timeless

### 2. Placement Matters
Scripture on the chest area because:
- It''s close to your heart (literally!)
- It''s the first thing people see
- It creates eye-level connection in conversation

### 3. Quality Fabric
We choose premium materials because:
- God deserves our excellence
- Durability = longer testimony impact
- Comfort = more frequent wear

## Customer Spotlight: The Hope Hoodie Effect

"I bought the Hope Hoodie thinking it was just a nice design. But wearing it changed how I walked through my day. I stood taller. I smiled more. I felt like I was carrying light with me." - James, Cardiff

## The Psychology of Color

Yellow/gold affects people psychologically:
- Increases optimism and energy
- Catches attention without being aggressive
- Associated with joy and positivity
- Creates warmth in social interactions

## More Than Merchandise

When you wear a Hope Hoodie, you''re wearing:
- A prayer (every glance is an opportunity)
- A testimony (your story woven into fabric)
- A reminder (hope anchors the soul)
- A community marker (fellow believers recognize you)

## Behind the Creation Process

Each design goes through:
1. **Prayer**: We ask God for inspiration
2. **Scripture Study**: Finding the right verses
3. **Design Iteration**: 10-15 versions per piece
4. **Quality Testing**: Wash tests, wear tests, feedback
5. **Community Input**: Our customers help refine designs

## What''s Next?

We''re working on new Hope designs featuring:
- Subtle patterns woven into the fabric
- Glow-in-the-dark elements (light in darkness!)
- Multilingual scripture options
- Custom personalization features

### Join the Design Journey

Follow us on Instagram (@jamboapparels) to:
- See behind-the-scenes design work
- Vote on new color options
- Share how you style your Hope Hoodie
- Suggest future designs

*"We have this hope as an anchor for the soul, firm and secure." - Hebrews 6:19*

Shop the Hope Hoodies Collection →',
  'thread-of-hope',
  'published',
  'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400&h=300&fit=crop',
  'Admin',
  5,
  (SELECT id FROM public.blog_categories WHERE slug = 'style-guide' LIMIT 1),
  'The Thread of Hope: Design Symbolism | Jambo Apparels',
  'Discover the meaning behind every design element in our Hope Hoodies collection. Learn about our intentional symbolism and creative process.'
),
(
  'How to Style Your Faith Apparel for Every Occasion',
  'Faith-based fashion isn''t just for church! Learn how to incorporate scripture apparel into your everyday wardrobe.',
  '# Styling Scripture: A Complete Guide

Faith apparel isn''t limited to Sunday services. Here''s how to rock your testimony 24/7.

## Casual Campus/Office (Business Casual)

**The Look**: Testament Tee + Blazer + Dark Jeans
- Keep the tee as your statement piece
- Layer with a neutral blazer (navy, gray, black)
- Add clean sneakers or loafers
- Minimal accessories to keep focus on the message

**Pro Tip**: Leave the blazer unbuttoned so the scripture is visible!

## Weekend Coffee Run (Laid Back Cool)

**The Look**: Hope Hoodie + Joggers + Fresh Trainers
- Let the hoodie be your color pop
- Neutral bottoms (black, gray, olive joggers)
- White or cream trainers for contrast
- Baseball cap for added style (try our Humility Cap!)

## Gym/Active Wear (Athletic Believer)

**The Look**: Triumph Track Jacket + Athletic Tee + Performance Shorts
- Moisture-wicking base layers
- Our track jacket as your outer layer
- Bold trainer choice (match or contrast with jacket)
- Wireless earbuds = worship music on the go

## Date Night (Faithfully Fashionable)

**The Look**: Patience Polo + Chinos + Desert Boots
- Classic polo styling never fails
- Well-fitted chinos (khaki, navy, or olive)
- Desert boots or clean leather shoes
- Watch and minimal jewelry

**Date Conversation Starter**: "This polo represents patience—one of my core values..."

## Church Service (Sunday Best Remix)

**The Look**: Saintly Sweatshirt + Dress Pants + Dress Shoes
- Elevate the sweatshirt with formal bottoms
- Crisp dress pants (not jeans!)
- Polished dress shoes
- Optional: tie or pocket square for extra flair

## Mix & Match Guide

### Color Coordination:

**Hope Hoodie (Yellow/Gold)**
- Pairs with: Black, white, navy, gray, denim
- Avoid: Bright orange, neon colors
- Best combo: Black jeans + white sneakers

**Testament Tee (Purple)**
- Pairs with: Black, white, gray, olive, cream
- Avoid: Red, orange
- Best combo: Dark denim + white trainers

**Triumph Track (Yellow/Gold)**
- Pairs with: Black, navy, gray activewear
- Layer over: White or black athletic tees
- Best combo: Black joggers + white runners

**Humility Cap (Green)**
- Universal neutral!
- Matches almost everything
- Perfect for bad hair days with a purpose

**Patience Polo (Red)**
- Pairs with: Navy, khaki, white, gray
- Avoid: Orange, pink
- Best combo: Navy chinos + brown shoes

**Saintly Sweatshirt (Red)**
- Pairs with: Black, gray, denim, khaki
- Layer with: Denim jacket for extra style
- Best combo: Black jeans + white sneakers

## Seasonal Styling

### Spring/Summer
- Roll hoodie sleeves for casual vibe
- Tees with shorts and sandals
- Caps are essential (sun protection + testimony!)
- Light layers for evening temperature drops

### Fall/Winter
- Layer hoodies under denim jackets
- Sweatshirts with scarves for warmth
- Polos under cardigans for smart-casual
- Track jackets over thermal base layers

## Care Tips for Longevity

1. **Wash inside out** (preserves print/embroidery)
2. **Cold water only** (maintains color)
3. **Air dry when possible** (prevents shrinking)
4. **Iron on low** if needed (never directly on prints)
5. **Fold, don''t hang** hoodies (prevents stretching)

## Accessories That Complement

- **Watches**: Simple, classic styles
- **Bags**: Canvas totes or leather backpacks
- **Jewelry**: Minimal—cross necklace, simple bracelet
- **Footwear**: Keep it clean (dirty shoes ruin any outfit!)

## Real Customer Styles

**Emma, 24, London**
"I wear my Hope Hoodie with high-waisted mom jeans and Doc Martens. So comfy but still put-together!"

**David, 31, Birmingham**
"Testament Tee under a leather jacket = instant edge. Gets compliments every time."

**Grace, 19, Manchester**
"Saintly Sweatshirt + pleated midi skirt + white trainers = my go-to church outfit."

## The Golden Rule

**Your clothing should enhance your testimony, not distract from it.**
- Keep the rest of your outfit relatively simple
- Let the scripture be the focal point
- Dress for the context while staying true to your style
- Confidence is your best accessory!

## Style Challenges

Try these this month:
1. **Week 1**: Wear faith apparel to work/school every day
2. **Week 2**: Style one piece three different ways
3. **Week 3**: Coordinate with a friend for "twin testimony" day
4. **Week 4**: Create your signature look and share it with #JamboStyle

*"So whether you eat or drink or whatever you do, do it all for the glory of God." - 1 Corinthians 10:31*

Ready to build your faith wardrobe? Shop the full collection →',
  'style-faith-apparel',
  'published',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=300&fit=crop',
  'Admin',
  8,
  (SELECT id FROM public.blog_categories WHERE slug = 'style-guide' LIMIT 1),
  'How to Style Faith Apparel for Every Occasion | Jambo Apparels',
  'Complete styling guide for scripture-inspired clothing. Learn how to wear your faith boldly in any setting with these expert fashion tips.'
),
(
  'Customer Story: From Skeptic to Ambassador',
  'Meet Marcus, who went from doubting the impact of "Christian merch" to becoming one of our most passionate community members.',
  '# From Skeptic to Ambassador: Marcus'' Story

*This is part of our Community Stories series, where we share real testimonies from real customers.*

## The Skeptic

"I''ll be honest—I thought Christian apparel was cheesy."

That''s how Marcus (28, from Leeds) started our conversation. He''d grown up in church but drifted away in his early twenties. When his sister gifted him a Hope Hoodie for Christmas, he was... less than thrilled.

"I thanked her, but internally I was like, ''Yeah, this is going straight to the back of my wardrobe.''"

## The Unexpected Turn

Three months later, Marcus was running late for work. He grabbed the first clean thing he could find—the Hope Hoodie.

"I threw it on without thinking. Rushed to catch my train. Grabbed coffee on the way."

At the coffee shop, something unexpected happened.

## The Conversation

"The barista—probably early 20s, covered in tattoos—looks at my hoodie and goes, ''Hope, man. I need some of that. Where''d you get it?''"

Marcus found himself in a 15-minute conversation about:
- Why hope matters
- What hope is anchored in
- His own journey away from and back to faith
- The barista''s questions about God

"I hadn''t talked about Jesus to a stranger in years. But there I was, at 7:45am in a coffee queue, having the most natural faith conversation I''d had in a decade."

## The Shift

That single conversation changed Marcus''s perspective entirely.

"I realized the hoodie wasn''t cheesy—it was a tool. It gave me permission to be openly Christian without being weird or pushy. People *came to me* with their questions."

### What happened next:

**Week 1**: Marcus wore the hoodie three times, had two more faith conversations

**Week 2**: He ordered the Testament Tee and Patience Polo

**Month 2**: Started an Instagram account documenting conversations sparked by his Jambo apparel

**Month 4**: Led his barista friend to Christ

**Month 6**: Started a faith-based fashion blog that now has 15K followers

## The Ambassador

Today, Marcus runs "Faith Threads"—a blog and YouTube channel dedicated to reviewing and styling Christian apparel. He''s worked with dozens of faith-based brands, but Jambo remains his favorite.

"The quality is just better. The designs are thoughtful. And honestly, the pieces actually fit into modern style. I can wear this stuff to a club night with my non-Christian friends and it doesn''t look preachy—it just looks good."

### His Favorite Pieces:

1. **Hope Hoodie** (still the original gift)
2. **Testament Tee** ("Perfect base layer")
3. **Patience Polo** ("Date night essential")

## The Impact

Through Marcus''s content, over 2,000 people have:
- Started wearing faith apparel
- Had their first evangelism conversation in years
- Reconnected with church
- Found confidence in public faith expression

"I never thought a hoodie could change my life. But it did. Not because it was magic—but because it gave me the courage to be publicly Christian again."

## Marcus''s Advice

We asked Marcus what he''d tell someone skeptical about faith apparel:

**"Just try it. Wear it once. See what happens.**

You don''t have to be an evangelist. You don''t have to memorize scripts. You don''t have to be perfect. Just wear something that represents what you believe and be open to conversations.

The Holy Spirit does the heavy lifting. The hoodie just breaks the ice.

And honestly? Even if nobody says anything, you''ll feel different. You''ll stand a little taller. You''ll remember who you are and whose you are. That alone is worth it."

## The Ripple Effect

Marcus''s barista friend (now a believer) works at a different coffee shop. He wears a Hope Hoodie to work. Last month, he led a customer to Christ.

That customer? She bought Testament Tees for her entire youth group.

One of those youth group kids wore their tee to school and started a Bible study that now has 20 students.

**It all started with one reluctant gift. One rushed morning. One coffee shop conversation.**

## Your Story?

We know there are hundreds of stories like Marcus''s that we haven''t heard yet. If Jambo Apparels has been part of your faith journey, we''d love to hear about it.

**Share your story**:
- Email: stories@jamboapparels.com
- Instagram: @jamboapparels #MyJamboStory
- Tag us in your posts!

Selected stories will be featured in future blog posts (with your permission), and you''ll receive a free item from our new collection!

## Shop Marcus''s Favorites

- Hope Hoodie (Gold Edition) →
- Testament Tee (Purple) →
- Patience Polo (Red) →

*"And who knows but that you have come to your royal position for such a time as this?" - Esther 4:14*

---

**Want to be featured in our Community Stories series?** We''re always looking for testimonies of how faith apparel has impacted your life. Reach out—your story matters!',
  'customer-story-marcus',
  'published',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  'Admin',
  7,
  (SELECT id FROM public.blog_categories WHERE slug = 'community-stories' LIMIT 1),
  'From Skeptic to Ambassador: Marcus'' Story | Jambo Apparels',
  'Read how one customer went from doubting Christian apparel to becoming a faith fashion influencer. Real testimony, real impact.'
)
ON CONFLICT (slug) DO NOTHING;

-- 6. PRODUCTS (Expanded Catalog)
INSERT INTO public.products (
  title, 
  price, 
  sale_price,
  is_on_sale,
  category_key, 
  image, 
  description, 
  sizes, 
  colors,
  tags,
  is_featured, 
  sku, 
  slug, 
  stock_quantity,
  low_stock_threshold,
  weight,
  seo_title,
  seo_description
) VALUES
-- Hope Hoodies Collection
(
  'Hope Hoodie - Gold Edition',
  40.00,
  NULL,
  FALSE,
  'HOPEHOODIES',
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
  'Our signature Hope Hoodie in brilliant gold. Features premium cotton-blend fabric, scripture-inspired design, and exceptional comfort. Perfect for making a bold faith statement while staying cozy. The vibrant yellow represents the light of Christ and hope that anchors the soul.',
  ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  ARRAY['Gold/Yellow', 'Black'],
  ARRAY['Hope', 'Bestseller', 'Scripture', 'Unisex'],
  TRUE,
  'HOPE-GOLD-001',
  'hope-hoodie-gold',
  50,
  10,
  0.5,
  'Hope Hoodie Gold Edition - Faith-Based Clothing | Jambo Apparels',
  'Shop the iconic Hope Hoodie in gold. Premium quality Christian apparel with scripture-inspired design. Free UK shipping over £50.'
),
(
  'Hope Hoodie - Midnight Black',
  40.00,
  36.00,
  TRUE,
  'HOPEHOODIES',
  'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=800&fit=crop',
  'The Hope Hoodie in sleek midnight black with gold embroidered text. For those who prefer subtle boldness. Same premium quality, different aesthetic. Perfect for evening wear or those who love minimalist style.',
  ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  ARRAY['Black', 'Navy'],
  ARRAY['Hope', 'Sale', 'Scripture', 'Unisex'],
  TRUE,
  'HOPE-BLACK-002',
  'hope-hoodie-black',
  35,
  8,
  0.5,
  'Hope Hoodie Black Edition - Christian Streetwear | Jambo Apparels',
  'Sleek black Hope Hoodie with gold embroidery. Modern faith-based fashion for everyday wear. On sale now!'
),
-- Testament T-Shirts Collection
(
  'Testament Tee - Purple',
  22.00,
  NULL,
  FALSE,
  'TESTAMENTSHIRTS',
  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=800&fit=crop',
  'Share your testimony with our comfortable 100% organic cotton tee. Features bold scripture text and breathable fabric. Perfect for layering or wearing solo. The purple represents royalty and spiritual authority.',
  ARRAY['XS', 'S', 'M', 'L', 'XL'],
  ARRAY['Purple', 'White', 'Heather Gray'],
  ARRAY['Testimony', 'Bestseller', 'Organic', 'Unisex'],
  TRUE,
  'TEST-PURP-001',
  'testament-tee-purple',
  100,
  15,
  0.2,
  'Testament Tee Purple - Organic Cotton Christian Shirt | Jambo Apparels',
  'Premium organic cotton testimony tee. Comfortable, breathable, and perfect for sharing your faith. Available in multiple colors.'
),
(
  'Testament Tee - Classic White',
  22.00,
  NULL,
  FALSE,
  'TESTAMENTSHIRTS',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
  'The essential white tee with bold black scripture text. Versatile, timeless, and perfect for any occasion. Premium organic cotton ensures comfort and durability. A wardrobe staple for every believer.',
  ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  ARRAY['White', 'Off-White'],
  ARRAY['Testimony', 'Essential', 'Organic'],
  FALSE,
  'TEST-WHITE-002',
  'testament-tee-white',
  120,
  15,
  0.2,
  'Classic White Testament Tee - Christian T-Shirt | Jambo Apparels',
  'Timeless white scripture tee in organic cotton. Perfect base layer for your faith wardrobe. Unisex sizing available.'
),
-- Triumph Track Collection
(
  'Triumph Track Jacket',
  48.00,
  NULL,
  FALSE,
  'TRIUMPHTRACKS',
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop',
  'Run the race with endurance in this premium track jacket. Water-resistant outer shell, mesh lining for breathability, and reflective details for safety. Perfect for athletes and active believers. Represents spiritual victory and perseverance.',
  ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  ARRAY['Gold/Black', 'Navy/White'],
  ARRAY['Triumph', 'Athletic', 'Performance', 'Unisex'],
  FALSE,
  'TRI-TRACK-001',
  'triumph-track-jacket',
  30,
  5,
  0.6,
  'Triumph Track Jacket - Christian Athletic Wear | Jambo Apparels',
  'Premium water-resistant track jacket for active believers. Run your race with purpose. Shop now!'
),
-- Humility Hats Collection
(
  'Humility Cap - Forest Green',
  18.00,
  NULL,
  FALSE,
  'HUMILITYHATS',
  'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&h=800&fit=crop',
  'A humble forest green cap with embroidered scripture. Adjustable strap, breathable cotton, curved brim. Perfect for sunny days and bad hair days with purpose. Green represents growth and life in Christ.',
  ARRAY['One Size'],
  ARRAY['Forest Green', 'Olive', 'Black'],
  ARRAY['Humility', 'Bestseller', 'Accessories'],
  TRUE,
  'HUM-CAP-001',
  'humility-cap-green',
  200,
  20,
  0.15,
  'Humility Cap Forest Green - Christian Baseball Cap | Jambo Apparels',
  'Comfortable embroidered scripture cap. One size fits all. Perfect everyday accessory for believers.'
),
(
  'Humility Cap - Classic Black',
  18.00,
  NULL,
  FALSE,
  'HUMILITYHATS',
  'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=800&h=800&fit=crop',
  'Timeless black cap with white embroidered text. Goes with everything. Represents humility in a bold, simple design. Adjustable fit ensures comfort for all-day wear.',
  ARRAY['One Size'],
  ARRAY['Black', 'Navy'],
  ARRAY['Humility', 'Essential', 'Accessories'],
  FALSE,
  'HUM-CAP-002',
  'humility-cap-black',
  180,
  20,
  0.15,
  'Classic Black Humility Cap - Faith-Based Hat | Jambo Apparels',
  'Sleek black scripture cap for everyday wear. Adjustable fit, premium embroidery. Shop the collection!'
),
-- Patience Polos Collection
(
  'Patience Polo - Cardinal Red',
  32.00,
  NULL,
  FALSE,
  'PATIENCEPOLOS',
  'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&h=800&fit=crop',
  'Classic cardinal red polo with subtle scripture detail on the chest. Perfect for Sunday service, dates, or smart-casual work environments. Breathable pique cotton ensures comfort. Red represents passion and the blood of Christ.',
  ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  ARRAY['Cardinal Red', 'Burgundy'],
  ARRAY['Patience', 'Smart-Casual', 'Premium'],
  FALSE,
  'PAT-POLO-001',
  'patience-polo-red',
  75,
  10,
  0.3,
  'Patience Polo Cardinal Red - Christian Polo Shirt | Jambo Apparels',
  'Premium pique cotton polo with scripture detail. Perfect for smart-casual occasions. Available in multiple sizes.'
),
(
  'Patience Polo - Navy Blue',
  32.00,
  NULL,
  FALSE,
  'PATIENCEPOLOS',
  'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&h=800&fit=crop',
  'Sophisticated navy polo with white scripture embroidery. Versatile enough for work, church, or weekend outings. Premium cotton blend stays crisp wash after wash.',
  ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  ARRAY['Navy', 'Dark Blue'],
  ARRAY['Patience', 'Smart-Casual', 'Work-Appropriate'],
  FALSE,
  'PAT-POLO-002',
  'patience-polo-navy',
  80,
  10,
  0.3,
  'Navy Patience Polo - Professional Christian Apparel | Jambo Apparels',
  'Sleek navy polo perfect for professional settings. Subtle faith statement with premium quality.'
),
-- Sainty Sweatshirts Collection
(
  'Saintly Sweatshirt - Classic Red',
  38.00,
  NULL,
  FALSE,
  'SAINTYSWEATSHIRTS',
  'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800&h=800&fit=crop',
  'Warm, cozy, and perfect for saints. This premium crewneck sweatshirt features soft fleece lining and bold scripture print. Perfect for cooler weather or layering. Red represents the community of believers.',
  ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  ARRAY['Red', 'Maroon'],
  ARRAY['Saintly', 'Cozy', 'Fall-Winter'],
  FALSE,
  'SAINT-SWEAT-001',
  'saintly-sweatshirt-red',
  45,
  8,
  0.55,
  'Saintly Sweatshirt Red - Cozy Christian Apparel | Jambo Apparels',
  'Premium fleece-lined sweatshirt for believers. Warm, comfortable, and boldly faithful. Shop now!'
),
(
  'Saintly Sweatshirt - Heather Gray',
  38.00,
  NULL,
  FALSE,
  'SAINTYSWEATSHIRTS',
  'https://images.unsplash.com/photo-1620799139834-6b8f844fef0c?w=800&h=800&fit=crop',
  'Versatile heather gray sweatshirt with black scripture text. Goes with everything in your wardrobe. Premium materials ensure this becomes your go-to cozy piece.',
  ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  ARRAY['Heather Gray', 'Light Gray'],
  ARRAY['Saintly', 'Versatile', 'Bestseller'],
  TRUE,
  'SAINT-SWEAT-002',
  'saintly-sweatshirt-gray',
  55,
  8,
  0.55,
  'Gray Saintly Sweatshirt - Comfortable Faith Apparel | Jambo Apparels',
  'Cozy heather gray sweatshirt for everyday faith expression. Premium quality meets comfort.'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  is_on_sale = EXCLUDED.is_on_sale,
  image = EXCLUDED.image,
  description = EXCLUDED.description,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  tags = EXCLUDED.tags,
  stock_quantity = EXCLUDED.stock_quantity,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;

-- 7. PRODUCT REVIEWS (Realistic & Detailed)
INSERT INTO public.product_reviews (product_id, rating, title, comment, verified_purchase, user_id) VALUES
-- Hope Hoodie Gold Reviews
(
  (SELECT id FROM public.products WHERE slug = 'hope-hoodie-gold' LIMIT 1),
  5,
  'Changed How I Approach My Day',
  'I bought this on a whim after seeing a friend wear it. Honestly didn''t expect much. But wearing this hoodie has genuinely changed how I carry myself. I feel bolder, more confident in my faith. Had three conversations about Christ in the first week of wearing it. Quality is amazing too—super soft, fits perfectly, hasn''t faded after multiple washes. Worth every penny.',
  TRUE,
  NULL
),
(
  (SELECT id FROM public.products WHERE slug = 'hope-hoodie-gold' LIMIT 1),
  5,
  'Best Purchase This Year',
  'The gold color is even better in person! Not too bright, not too subtle. The scripture is beautifully placed and the font is perfect—bold enough to read but not tacky. I''m 6''2" and the XL fits just right. My only regret is not buying two!',
  TRUE,
  NULL
),
(
  (SELECT id FROM public.products WHERE slug = 'hope-hoodie-gold' LIMIT 1),
  4,
  'Great Quality, Runs Slightly Large',
  'Love the message and the quality is definitely there. Material is thick and warm without being too heavy. Only giving 4 stars because it runs a bit large—I usually wear M but probably should have gone with S. Still keeping it though, just means I can layer underneath!',
  TRUE,
  NULL
),
-- Testament Tee Reviews
(
  (SELECT id FROM public.products WHERE slug = 'testament-tee-purple' LIMIT 1),
  5,
  'Perfect Everyday Tee',
  'This has become my go-to shirt. The purple is gorgeous—rich and vibrant. Material is breathable and soft. I''ve worn it to church, to the gym, even slept in it (it''s that comfortable). Washes well, hasn''t shrunk or faded. Can''t recommend enough!',
  TRUE,
  NULL
),
(
  (SELECT id FROM public.products WHERE slug = 'testament-tee-purple' LIMIT 1),
  5,
  'Finally, Christian Apparel That Doesn''t Look Cringe',
  'As a 19-year-old uni student, I''ve always struggled to find faith-based clothing that doesn''t look like it''s from a church gift shop. This tee? Absolutely nails it. Modern, stylish, and the message is clear without being preachy. Worn it to campus multiple times and gotten loads of compliments.',
  TRUE,
  NULL
),
(
  (SELECT id FROM public.products WHERE slug = 'testament-tee-purple' LIMIT 1),
  4,
  'Love It, Wish It Came In More Colors',
  'Great shirt! Fit is perfect (I''m 5''8", 150lbs, medium fits great). Material feels premium—definitely worth the price. Only wish you offered more color options. Would buy in black, white, and navy in a heartbeat!',
  TRUE,
  NULL
),
-- Humility Cap Reviews
(
  (SELECT id FROM public.products WHERE slug = 'humility-cap-green' LIMIT 1),
  5,
  'My New Favorite Cap',
  'I have probably 20 caps and this is now my favorite. The embroidery is top-notch, adjustable strap is sturdy, and the green is a beautiful forest shade. Wear it everywhere—gym, errands, church. Gets compliments constantly.',
  TRUE,
  NULL
),
(
  (SELECT id FROM public.products WHERE slug = 'humility-cap-green' LIMIT 1),
  5,
  'Perfect Conversation Starter',
  'Bought this for my husband and he wears it almost daily. He''s not usually one to talk about faith with strangers but this cap has opened so many doors. People ask about it all the time and it gives him a natural way to share. Quality is excellent—still looks brand new after months of wear.',
  TRUE,
  NULL
),
(
  (SELECT id FROM public.products WHERE slug = 'humility-cap-green' LIMIT 1),
  4,
  'Great Cap, Slight Color Difference',
  'Really nice quality cap! Only reason for 4 stars instead of 5 is the green looks slightly different in person than in the photos—more forest green than the olive tone I was expecting. Still love it though and the difference is minor.',
  TRUE,
  NULL
),
-- Patience Polo Reviews
(
  (SELECT id FROM public.products WHERE slug = 'patience-polo-red' LIMIT 1),
  5,
  'Elevated My Sunday Service Look',
  'This polo is incredibly well-made. The pique cotton is exactly what you''d expect from a premium polo. Fit is true to size, collar holds its shape perfectly. I''ve worn it to church four Sundays in a row with different pants each time. The scripture detail is subtle but meaningful.',
  TRUE,
  NULL
),
(
  (SELECT id FROM public.products WHERE slug = 'patience-polo-red' LIMIT 1),
  5,
  'Professional Enough for Work!',
  'I work in a business casual environment and was nervous about wearing faith apparel to the office. This polo is perfect—professional, high-quality, and the scripture is placed in a way that''s noticeable but not overwhelming. My coworkers have asked about it and it''s led to some great conversations.',
  TRUE,
  NULL
),
-- Saintly Sweatshirt Reviews
(
  (SELECT id FROM public.products WHERE slug = 'saintly-sweatshirt-gray' LIMIT 1),
  5,
  'Coziest Sweatshirt I Own',
  'This sweatshirt is THICK. Like, proper quality thick. Not the thin, see-through kind you get from fast fashion brands. The fleece lining is so soft and warm. I live in it during winter. The print hasn''t cracked or faded at all despite weekly washing. Absolutely worth the investment.',
  TRUE,
  NULL
),
(
  (SELECT id FROM public.products WHERE slug = 'saintly-sweatshirt-gray' LIMIT 1),
  5,
  'Bought One, Came Back for Three More',
  'Loved the first one so much I bought three more as gifts. Everyone I''ve given it to has raved about the quality. The heather gray goes with everything and the scripture is beautifully placed. This is now my standard go-to gift for Christian friends.',
  TRUE,
  NULL
)
ON CONFLICT DO NOTHING;

-- 8. SHIPPING ZONES (Comprehensive)
INSERT INTO public.shipping_zones (name, countries, base_rate, per_kg_rate, free_shipping_threshold, estimated_days, is_active) VALUES
('UK - Standard Delivery', 
 ARRAY['United Kingdom', 'England', 'Scotland', 'Wales', 'Northern Ireland'], 
 4.99, 
 NULL, 
 50.00, 
 '3-5 business days', 
 TRUE),
 
('UK - Express Delivery', 
 ARRAY['United Kingdom', 'England', 'Scotland', 'Wales', 'Northern Ireland'], 
 9.99, 
 NULL, 
 NULL, 
 '1-2 business days', 
 TRUE),

('Europe - Standard', 
 ARRAY['France', 'Germany', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Ireland', 'Portugal', 'Austria', 'Denmark', 'Sweden', 'Norway', 'Finland'], 
 12.99, 
 2.00, 
 100.00, 
 '7-10 business days', 
 TRUE),

('North America', 
 ARRAY['United States', 'Canada'], 
 19.99, 
 3.00, 
 150.00, 
 '10-14 business days', 
 TRUE),

('Australia & New Zealand', 
 ARRAY['Australia', 'New Zealand'], 
 19.99, 
 3.00, 
 150.00, 
 '12-16 business days', 
 TRUE),

('Rest of World', 
 ARRAY['Other'], 
 24.99, 
 4.00, 
 200.00, 
 '14-21 business days', 
 TRUE)
ON CONFLICT DO NOTHING;

-- 9. DISCOUNT CODES (Strategic Mix)
INSERT INTO public.discount_codes (
  code, 
  discount_type, 
  discount_value, 
  description, 
  minimum_purchase, 
  valid_from, 
  valid_until, 
  max_uses, 
  is_active,
  applicable_categories
) VALUES
('WELCOME10', 
 'percentage', 
 10.00, 
 '10% off your first order - new customers only', 
 NULL, 
 NOW(), 
 NOW() + INTERVAL '365 days', 
 NULL, 
 TRUE,
 NULL),

('FREESHIP', 
 'fixed', 
 4.99, 
 'Free standard UK shipping', 
 25.00, 
 NOW(), 
 NOW() + INTERVAL '90 days', 
 NULL, 
 TRUE,
 NULL),

('NEWYEAR2026', 
 'percentage', 
 15.00, 
 'New Year Sale - 15% off everything!', 
 NULL, 
 NOW(), 
 NOW() + INTERVAL '30 days', 
 500, 
 TRUE,
 NULL),

('HOPE25', 
 'percentage', 
 25.00, 
 '25% off all Hope Hoodies', 
 NULL, 
 NOW(), 
 NOW() + INTERVAL '60 days', 
 100, 
 TRUE,
 ARRAY['HOPEHOODIES']),

('STUDENT15', 
 'percentage', 
 15.00, 
 'Student discount - 15% off with valid student ID', 
 NULL, 
 NOW(), 
 NOW() + INTERVAL '365 days', 
 NULL, 
 TRUE,
 NULL),

('EASTER2026', 
 'percentage', 
 20.00, 
 'Easter celebration discount', 
 35.00, 
 '2026-04-01', 
 '2026-04-20', 
 NULL, 
 FALSE,
 NULL),

('BULK50', 
 'fixed', 
 50.00, 
 '£50 off orders over £200 (churches and youth groups)', 
 200.00, 
 NOW(), 
 NOW() + INTERVAL '365 days', 
 NULL, 
 TRUE,
 NULL)
ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  discount_value = EXCLUDED.discount_value,
  is_active = EXCLUDED.is_active,
  valid_until = EXCLUDED.valid_until;

-- 10. NEWSLETTER SUBSCRIBERS (Sample Data for Testing)
INSERT INTO public.newsletter_subscribers (email, name, source, subscribed_at) VALUES
('john.smith@example.com', 'John Smith', 'website', NOW() - INTERVAL '45 days'),
('sarah.jones@example.com', 'Sarah Jones', 'checkout', NOW() - INTERVAL '30 days'),
('mike.wilson@example.com', 'Mike Wilson', 'website', NOW() - INTERVAL '15 days'),
('emma.brown@example.com', 'Emma Brown', 'checkout', NOW() - INTERVAL '7 days'),
('david.taylor@example.com', 'David Taylor', 'website', NOW() - INTERVAL '2 days')
ON CONFLICT (email) DO NOTHING;

-- 11. SECURE ORDER RPC
CREATE OR REPLACE FUNCTION create_order_secure(
  p_user_id uuid,
  p_items jsonb,
  p_shipping_address jsonb,
  p_discount_code text DEFAULT NULL,
  p_notes text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_total numeric := 0;
  v_subtotal numeric := 0;
  v_item record;
  v_product_price numeric;
  v_product_weight numeric;
  v_total_weight numeric := 0;
  v_shipping_cost numeric := 0;
  v_tax_amount numeric := 0;
  v_discount_amount numeric := 0;
  v_shipping_country text;
  v_zone_base_rate numeric;
  v_zone_per_kg_rate numeric;
  v_zone_free_threshold numeric;
  v_discount_record record;
  v_tax_rate numeric := 0.20; -- Default 20%
  v_order_id uuid;
  v_order_number text;
  v_product_stock int;
BEGIN
  -- 1. Calculate Subtotal and Weight
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id uuid, quantity int, size text, selected_color text)
  LOOP
    SELECT price, weight, stock_quantity INTO v_product_price, v_product_weight, v_product_stock
    FROM products WHERE id = v_item.product_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found', v_item.product_id;
    END IF;

    IF v_product_stock < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product %', v_item.product_id;
    END IF;

    v_subtotal := v_subtotal + (v_product_price * v_item.quantity);
    v_total_weight := v_total_weight + (COALESCE(v_product_weight, 0) * v_item.quantity);
  END LOOP;

  -- 2. Calculate Shipping
  v_shipping_country := p_shipping_address->>'country';
  
  SELECT base_rate, per_kg_rate, free_shipping_threshold 
  INTO v_zone_base_rate, v_zone_per_kg_rate, v_zone_free_threshold
  FROM shipping_zones 
  WHERE v_shipping_country = ANY(countries)
  LIMIT 1;
  
  IF NOT FOUND THEN
    -- Fallback to 'Other' or Rest of World
    SELECT base_rate, per_kg_rate, free_shipping_threshold 
    INTO v_zone_base_rate, v_zone_per_kg_rate, v_zone_free_threshold
    FROM shipping_zones 
    WHERE 'Other' = ANY(countries)
    LIMIT 1;
  END IF;

  v_shipping_cost := COALESCE(v_zone_base_rate, 24.99);
  
  IF v_zone_free_threshold IS NOT NULL AND v_subtotal >= v_zone_free_threshold THEN
    v_shipping_cost := 0;
  ELSE
    v_shipping_cost := v_shipping_cost + (COALESCE(v_zone_per_kg_rate, 0) * v_total_weight);
  END IF;

  -- 3. Apply Discount
  IF p_discount_code IS NOT NULL AND p_discount_code != '' THEN
    SELECT * INTO v_discount_record FROM discount_codes 
    WHERE code = p_discount_code AND is_active = true 
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until >= NOW());
    
    IF FOUND THEN
      IF v_discount_record.minimum_purchase IS NULL OR v_subtotal >= v_discount_record.minimum_purchase THEN
        IF v_discount_record.discount_type = 'percentage' THEN
          v_discount_amount := v_subtotal * (v_discount_record.discount_value / 100);
        ELSE
          v_discount_amount := v_discount_record.discount_value;
        END IF;
      END IF;
    END IF;
  END IF;

  -- 4. Calculate Tax (Inclusive)
  v_tax_amount := (GREATEST(0, v_subtotal - v_discount_amount) * v_tax_rate) / (1 + v_tax_rate);

  -- 5. Final Total
  v_order_total := GREATEST(0, v_subtotal + v_shipping_cost - v_discount_amount);
  v_order_number := 'ORD-' || to_char(NOW(), 'YYMMDD') || '-' || upper(substring(md5(random()::text) from 1 for 4));

  -- 6. Insert Order
  INSERT INTO orders (
    user_id, order_number, date, status, 
    subtotal, shipping_cost, discount_amount, discount_code, tax_amount, total,
    products, shipping_address, notes, payment_status
  ) VALUES (
    p_user_id, v_order_number, NOW(), 'Pending',
    v_subtotal, v_shipping_cost, v_discount_amount, p_discount_code, v_tax_amount, v_order_total,
    p_items, p_shipping_address, p_notes, 'paid'
  ) RETURNING id INTO v_order_id;

  -- 7. Update Stock
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id uuid, quantity int)
  LOOP
    UPDATE products SET stock_quantity = stock_quantity - v_item.quantity WHERE id = v_item.product_id;
  END LOOP;

  -- Return the created order as json
  RETURN (SELECT row_to_json(o) FROM orders o WHERE id = v_order_id);
END;
$$;