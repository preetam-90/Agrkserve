-- Audit Logs Table
-- This table tracks all important actions for compliance and debugging

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON public.audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can only view their own audit logs
CREATE POLICY "Users can view their own audit logs"
    ON public.audit_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Only authenticated users can insert audit logs (via service role)
CREATE POLICY "Service role can insert audit logs"
    ON public.audit_logs
    FOR INSERT
    WITH CHECK (false);

-- No one can update or delete audit logs
CREATE POLICY "No updates allowed on audit logs"
    ON public.audit_logs
    FOR UPDATE
    USING (false);

CREATE POLICY "No deletes allowed on audit logs"
    ON public.audit_logs
    FOR DELETE
    USING (false);

-- Add labour booking status type if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'labour_booking_status') THEN
        CREATE TYPE labour_booking_status AS ENUM (
            'pending',
            'confirmed',
            'in_progress',
            'completed',
            'cancelled'
        );
    END IF;
END
$$;

-- Add labour booking table if not exists
CREATE TABLE IF NOT EXISTS public.labour_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    labour_id UUID REFERENCES public.labour_profiles(id) ON DELETE CASCADE,
    employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status labour_booking_status DEFAULT 'pending',
    notes TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for labour bookings
CREATE INDEX IF NOT EXISTS idx_labour_bookings_labour_id ON public.labour_bookings(labour_id);
CREATE INDEX IF NOT EXISTS idx_labour_bookings_employer_id ON public.labour_bookings(employer_id);
CREATE INDEX IF NOT EXISTS idx_labour_bookings_status ON public.labour_bookings(status);
CREATE INDEX IF NOT EXISTS idx_labour_bookings_dates ON public.labour_bookings(start_date, end_date);

-- Enable Row Level Security for labour bookings
ALTER TABLE public.labour_bookings ENABLE ROW LEVEL SECURITY;

-- Policies for labour bookings
CREATE POLICY "Labour can view their own bookings"
    ON public.labour_bookings
    FOR SELECT
    USING (
        auth.uid() = labour_id OR 
        EXISTS (
            SELECT 1 FROM public.labour_profiles 
            WHERE id = labour_bookings.labour_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Employer can view their own bookings"
    ON public.labour_bookings
    FOR SELECT
    USING (auth.uid() = employer_id);

CREATE POLICY "Labour can insert their own bookings"
    ON public.labour_bookings
    FOR INSERT
    WITH CHECK (
        auth.uid() = labour_id OR 
        EXISTS (
            SELECT 1 FROM public.labour_profiles 
            WHERE id = labour_bookings.labour_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Employer can insert their own bookings"
    ON public.labour_bookings
    FOR INSERT
    WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Labour can update their own bookings"
    ON public.labour_bookings
    FOR UPDATE
    USING (
        auth.uid() = labour_id OR 
        EXISTS (
            SELECT 1 FROM public.labour_profiles 
            WHERE id = labour_bookings.labour_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Employer can update their own bookings"
    ON public.labour_bookings
    FOR UPDATE
    USING (auth.uid() = employer_id);

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_labour_bookings_updated_at
    BEFORE UPDATE ON public.labour_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add notification type for labour bookings
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM (
            'booking',
            'payment',
            'message',
            'review',
            'system',
            'admin'
        );
    END IF;
END
$$;