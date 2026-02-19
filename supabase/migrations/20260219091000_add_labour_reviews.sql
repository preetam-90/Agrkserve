-- Labour reviews to support post-booking ratings

-- Create labour_reviews table
CREATE TABLE IF NOT EXISTS public.labour_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    labour_booking_id UUID NOT NULL REFERENCES public.labour_bookings(id) ON DELETE CASCADE,
    labour_id UUID NOT NULL REFERENCES public.labour_profiles(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (labour_booking_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_labour_reviews_labour_id ON public.labour_reviews(labour_id);
CREATE INDEX IF NOT EXISTS idx_labour_reviews_reviewer_id ON public.labour_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_labour_reviews_booking_id ON public.labour_reviews(labour_booking_id);

CREATE OR REPLACE FUNCTION public.update_labour_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS labour_reviews_updated_at ON public.labour_reviews;
CREATE TRIGGER labour_reviews_updated_at
    BEFORE UPDATE ON public.labour_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_labour_reviews_updated_at();

CREATE OR REPLACE FUNCTION public.update_labour_average_rating(p_labour_id UUID)
RETURNS VOID AS $$
DECLARE
    v_avg NUMERIC;
    v_count INTEGER;
BEGIN
    SELECT COALESCE(AVG(rating), 0), COUNT(*)
      INTO v_avg, v_count
     FROM public.labour_reviews
     WHERE labour_id = p_labour_id;

    UPDATE public.labour_profiles
       SET average_rating = v_avg,
           review_count = v_count,
           updated_at = NOW()
     WHERE id = p_labour_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.trg_update_labour_average_rating()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.update_labour_average_rating(COALESCE(NEW.labour_id, OLD.labour_id));
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_labour_reviews_rating ON public.labour_reviews;
CREATE TRIGGER trg_labour_reviews_rating
    AFTER INSERT OR UPDATE OR DELETE ON public.labour_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_update_labour_average_rating();

ALTER TABLE public.labour_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view labour reviews" ON public.labour_reviews;
CREATE POLICY "Anyone can view labour reviews"
  ON public.labour_reviews
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Employers can insert labour reviews" ON public.labour_reviews;
CREATE POLICY "Employers can insert labour reviews"
  ON public.labour_reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    AND labour_booking_id IN (
      SELECT id FROM public.labour_bookings WHERE employer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own labour reviews" ON public.labour_reviews;
CREATE POLICY "Users can update own labour reviews"
  ON public.labour_reviews
  FOR UPDATE
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);
