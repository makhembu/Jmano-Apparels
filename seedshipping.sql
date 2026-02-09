
-- ============================================================================
-- SHIPPING STANDARDS MIGRATION
-- Adds support for multiple shipping methods per zone (Standard, Express, etc.)
-- ============================================================================

-- 1. Create Shipping Options Table
CREATE TABLE IF NOT EXISTS public.shipping_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id UUID REFERENCES public.shipping_zones(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "Standard Delivery", "Express"
    rate NUMERIC NOT NULL DEFAULT 0,
    description TEXT, -- e.g., "3-5 Business Days"
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add Shipping Class to Products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS shipping_class TEXT; 

-- 3. Enable RLS
ALTER TABLE public.shipping_options ENABLE ROW LEVEL SECURITY;

-- 4. Policies (Public Read, Admin Write)
CREATE POLICY "Public read shipping options" ON public.shipping_options FOR SELECT USING (true);
CREATE POLICY "Admin write shipping options" ON public.shipping_options FOR ALL USING (check_is_admin(auth.uid()));

-- 5. Seed Data (Resetting Zones for consistency)
TRUNCATE public.shipping_options CASCADE;
TRUNCATE public.shipping_zones CASCADE;

-- Insert Zones
WITH uk_zone AS (
    INSERT INTO public.shipping_zones (name, countries, base_rate, free_shipping_threshold) 
    VALUES ('United Kingdom', ARRAY['United Kingdom'], 0, 75) 
    RETURNING id
),
us_zone AS (
    INSERT INTO public.shipping_zones (name, countries, base_rate, free_shipping_threshold) 
    VALUES ('North America', ARRAY['United States', 'Canada'], 0, 150) 
    RETURNING id
),
eu_zone AS (
    INSERT INTO public.shipping_zones (name, countries, base_rate, free_shipping_threshold) 
    VALUES ('Europe', ARRAY['France', 'Germany', 'Spain', 'Italy'], 0, 120) 
    RETURNING id
),
row_zone AS (
    INSERT INTO public.shipping_zones (name, countries, base_rate, free_shipping_threshold) 
    VALUES ('Rest of World', ARRAY['Other', 'Australia'], 0, 200) 
    RETURNING id
)
-- Insert Options linked to Zones
INSERT INTO public.shipping_options (zone_id, name, rate, description)
SELECT id, 'Royal Mail Tracked 48', 3.99, '2-3 Business Days' FROM uk_zone
UNION ALL
SELECT id, 'DPD Next Day', 6.99, 'Next working day (Order by 2pm)' FROM uk_zone
UNION ALL
SELECT id, 'International Standard', 14.99, '7-14 Business Days' FROM us_zone
UNION ALL
SELECT id, 'DHL Express', 29.99, '2-4 Business Days' FROM us_zone
UNION ALL
SELECT id, 'Euro Standard', 9.99, '5-7 Business Days' FROM eu_zone
UNION ALL
SELECT id, 'Global Economy', 19.99, '10-20 Business Days' FROM row_zone;
