-- Add Razorpay-specific fields to payments table
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON public.payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON public.payments(razorpay_payment_id);

-- Update the user_id column to be nullable (for cases where payment is created before user is authenticated)
ALTER TABLE public.payments
ALTER COLUMN user_id DROP NOT NULL;

-- Add user_id foreign key constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'payments_user_id_fkey'
    ) THEN
        ALTER TABLE public.payments
        ADD CONSTRAINT payments_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END
$$;