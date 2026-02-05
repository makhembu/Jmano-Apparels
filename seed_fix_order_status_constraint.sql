
-- ============================================================================
-- FIX: ORDER STATUS CONSTRAINT
-- The existing check constraint on 'orders' likely doesn't include 'Pending Payment',
-- which causes the PayPal initialization to fail during record creation.
-- ============================================================================

DO $$ 
BEGIN 
    -- Drop the constraint if it exists to allow modification
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_status_check') THEN 
        ALTER TABLE public.orders DROP CONSTRAINT orders_status_check; 
    END IF; 
END $$;

-- Add the constraint back with expanded allowed values including 'Pending Payment'
ALTER TABLE public.orders
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded', 'Pending Payment'));
