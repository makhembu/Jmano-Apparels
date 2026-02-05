
-- ============================================================================
-- FIX: PAYMENT STATUS CONSTRAINT
-- The existing check constraint on 'orders' likely doesn't include 'pending',
-- which causes the PayPal initialization to fail.
-- ============================================================================

DO $$ 
BEGIN 
    -- Drop the constraint if it exists
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_payment_status_check') THEN 
        ALTER TABLE public.orders DROP CONSTRAINT orders_payment_status_check; 
    END IF; 
END $$;

-- Add the constraint back with expanded allowed values
ALTER TABLE public.orders
ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN ('paid', 'unpaid', 'pending', 'failed', 'refunded'));
