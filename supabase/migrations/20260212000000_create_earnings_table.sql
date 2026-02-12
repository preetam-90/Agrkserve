-- Create Earnings Table
CREATE TABLE IF NOT EXISTS public.earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('provider', 'labour')),
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Paid', 'Pending', 'Failed', 'Processing')),
    job_id UUID, -- Can be a booking_id or other job reference
    description TEXT,
    customer_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_earnings_user_role ON public.earnings(user_id, role);
CREATE INDEX IF NOT EXISTS idx_earnings_created_at ON public.earnings(created_at);

-- RLS Policies
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own earnings" ON public.earnings;
CREATE POLICY "Users can view own earnings"
    ON public.earnings FOR SELECT
    USING (auth.uid() = user_id);

-- Trigger for updatedAt
DROP TRIGGER IF EXISTS update_earnings_updated_at ON public.earnings;
CREATE TRIGGER update_earnings_updated_at
    BEFORE UPDATE ON public.earnings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
