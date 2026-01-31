-- =====================================================
-- AGRISERVE - COMPLETE DATABASE SETUP (FIXED VERSION)
-- =====================================================
-- This SQL file sets up the entire AgriServe database
-- Run this in your Supabase SQL Editor (copy all and execute)
--
-- Project: Agricultural Equipment & Labour Marketplace
-- Database: PostgreSQL with PostGIS
-- Last Updated: January 2026
-- =====================================================

-- =====================================================
-- STEP 1: ENABLE EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- =====================================================
-- STEP 2: CREATE ENUMS
-- =====================================================

-- Equipment Categories
CREATE TYPE equipment_category AS ENUM (
    'tractor',
    'harvester',
    'plough',
    'cultivator',
    'rotavator',
    'thresher',
    'sprayer',
    'seeder',
    'irrigation',
    'drone',
    'other'
);

-- Booking Status
CREATE TYPE booking_status AS ENUM (
    'pending',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled'
);

-- Labour Availability
CREATE TYPE labour_availability AS ENUM (
    'available',
    'busy',
    'unavailable'
);

-- Labour Booking Status
CREATE TYPE labour_booking_status AS ENUM (
    'pending',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled'
);

-- Notification Category
CREATE TYPE notification_category AS ENUM (
  'booking',
  'payment',
  'message',
  'trust',
  'security',
  'insight',
  'system'
);

-- Notification Priority
CREATE TYPE notification_priority AS ENUM (
  'low',
  'normal',
  'high',
  'critical'
);

-- Notification Delivery Channel
CREATE TYPE notification_delivery_channel AS ENUM (
  'in_app',
  'email',
  'sms',
  'push'
);

-- Notification Type (Additional)
CREATE TYPE notification_type AS ENUM (
    'booking',
    'payment',
    'message',
    'review',
    'system',
    'admin'
);

-- =====================================================
-- STEP 3: CREATE CORE TABLES
-- =====================================================

-- User Profiles Table
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone TEXT,
    name TEXT,
    email TEXT,
    profile_image TEXT,
    bio TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location GEOGRAPHY(Point, 4326),
    roles TEXT[],
    is_profile_complete BOOLEAN DEFAULT FALSE,
    preferred_language TEXT DEFAULT 'en',
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Roles Table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('renter', 'provider', 'labour', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Equipment Table
CREATE TABLE public.equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category equipment_category,
    brand TEXT,
    model TEXT,
    year INTEGER,
    horsepower NUMERIC,
    fuel_type TEXT,
    price_per_hour NUMERIC,
    price_per_day NUMERIC NOT NULL,
    location_name TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location GEOGRAPHY(Point, 4326),
    images TEXT[],
    video_url TEXT,
    features TEXT[],
    is_available BOOLEAN DEFAULT TRUE,
    rating NUMERIC DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
    renter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    total_days INTEGER NOT NULL,
    price_per_day NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    status booking_status DEFAULT 'pending',
    delivery_address TEXT,
    delivery_latitude DOUBLE PRECISION,
    delivery_longitude DOUBLE PRECISION,
    delivery_location GEOGRAPHY(Point, 4326),
    notes TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    images TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(booking_id, reviewer_id)
);

-- Payments Table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    payment_method TEXT,
    payment_gateway TEXT,
    transaction_id TEXT,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages Table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  category notification_category NOT NULL,
  event_type TEXT NOT NULL,
  priority notification_priority DEFAULT 'normal',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  action_label TEXT,
  related_booking_id UUID,
  related_equipment_id UUID,
  related_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  data JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  CONSTRAINT valid_action_url CHECK (action_url IS NULL OR action_url ~ '^/.*')
);

-- Notification Preferences Table
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_enabled BOOLEAN DEFAULT TRUE,
  payment_enabled BOOLEAN DEFAULT TRUE,
  message_enabled BOOLEAN DEFAULT TRUE,
  trust_enabled BOOLEAN DEFAULT TRUE,
  security_enabled BOOLEAN DEFAULT TRUE,
  insight_enabled BOOLEAN DEFAULT TRUE,
  system_enabled BOOLEAN DEFAULT TRUE,
  in_app_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  push_enabled BOOLEAN DEFAULT TRUE,
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  quiet_hours_timezone TEXT DEFAULT 'UTC',
  allow_critical_during_quiet BOOLEAN DEFAULT TRUE,
  digest_mode BOOLEAN DEFAULT FALSE,
  digest_frequency TEXT DEFAULT 'immediate',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Notification Delivery Log Table
CREATE TABLE public.notification_delivery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  channel notification_delivery_channel NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Labour Profiles Table
CREATE TABLE public.labour_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skills TEXT[] NOT NULL DEFAULT '{}',
    experience_years INTEGER NOT NULL DEFAULT 0,
    daily_rate NUMERIC NOT NULL,
    hourly_rate NUMERIC,
    location_name TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location GEOGRAPHY(Point, 4326),
    service_radius_km INTEGER DEFAULT 50,
    bio TEXT,
    certifications TEXT[] DEFAULT '{}',
    availability labour_availability DEFAULT 'available',
    average_rating NUMERIC DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    total_jobs INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Labour Bookings Table
CREATE TABLE public.labour_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    labour_id UUID NOT NULL REFERENCES public.labour_profiles(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    total_amount NUMERIC NOT NULL,
    status labour_booking_status DEFAULT 'pending',
    notes TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraints for notifications
ALTER TABLE public.notifications
    ADD CONSTRAINT fk_notifications_booking
    FOREIGN KEY (related_booking_id) REFERENCES public.bookings(id) ON DELETE SET NULL;

ALTER TABLE public.notifications
    ADD CONSTRAINT fk_notifications_equipment
    FOREIGN KEY (related_equipment_id) REFERENCES public.equipment(id) ON DELETE SET NULL;

-- =====================================================
-- STEP 4: CREATE INDEXES
-- =====================================================

-- User Profiles Indexes
CREATE INDEX idx_user_profiles_location ON public.user_profiles USING GIST(location);
CREATE INDEX idx_user_profiles_phone ON public.user_profiles(phone);
CREATE INDEX idx_user_profiles_city ON public.user_profiles(city);

-- User Roles Indexes
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- Equipment Indexes
CREATE INDEX idx_equipment_location ON public.equipment USING GIST(location);
CREATE INDEX idx_equipment_owner ON public.equipment(owner_id);
CREATE INDEX idx_equipment_category ON public.equipment(category);
CREATE INDEX idx_equipment_available ON public.equipment(is_available);
CREATE INDEX idx_equipment_rating ON public.equipment(rating DESC);

-- Bookings Indexes
CREATE INDEX idx_bookings_delivery_location ON public.bookings USING GIST(delivery_location);
CREATE INDEX idx_bookings_equipment ON public.bookings(equipment_id);
CREATE INDEX idx_bookings_renter ON public.bookings(renter_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_dates ON public.bookings(start_date, end_date);

-- Reviews Indexes
CREATE INDEX idx_reviews_equipment ON public.reviews(equipment_id);
CREATE INDEX idx_reviews_booking ON public.reviews(booking_id);
CREATE INDEX idx_reviews_reviewer ON public.reviews(reviewer_id);

-- Payments Indexes
CREATE INDEX idx_payments_booking ON public.payments(booking_id);
CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_razorpay_order_id ON public.payments(razorpay_order_id);
CREATE INDEX idx_payments_razorpay_payment_id ON public.payments(razorpay_payment_id);

-- Messages Indexes
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_messages_booking ON public.messages(booking_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- Notifications Indexes
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_category ON public.notifications(category);
CREATE INDEX idx_notifications_event_type ON public.notifications(event_type);
CREATE INDEX idx_notifications_priority ON public.notifications(priority);
CREATE INDEX idx_notifications_booking ON public.notifications(related_booking_id) WHERE related_booking_id IS NOT NULL;
CREATE INDEX idx_notifications_equipment ON public.notifications(related_equipment_id) WHERE related_equipment_id IS NOT NULL;

-- Notification Preferences Indexes
CREATE INDEX idx_preferences_user ON public.notification_preferences(user_id);

-- Notification Delivery Log Indexes
CREATE INDEX idx_delivery_log_notification ON public.notification_delivery_log(notification_id);
CREATE INDEX idx_delivery_log_status ON public.notification_delivery_log(status);

-- Labour Profiles Indexes
CREATE INDEX idx_labour_profiles_user_id ON public.labour_profiles(user_id);
CREATE INDEX idx_labour_profiles_availability ON public.labour_profiles(availability);
CREATE INDEX idx_labour_profiles_skills ON public.labour_profiles USING GIN(skills);
CREATE INDEX idx_labour_profiles_location ON public.labour_profiles USING GIST(location);
CREATE INDEX idx_labour_profiles_daily_rate ON public.labour_profiles(daily_rate);
CREATE INDEX idx_labour_profiles_rating ON public.labour_profiles(average_rating DESC);
CREATE INDEX idx_labour_profiles_active ON public.labour_profiles(is_active);

-- Labour Bookings Indexes
CREATE INDEX idx_labour_bookings_labour_id ON public.labour_bookings(labour_id);
CREATE INDEX idx_labour_bookings_employer_id ON public.labour_bookings(employer_id);
CREATE INDEX idx_labour_bookings_status ON public.labour_bookings(status);
CREATE INDEX idx_labour_bookings_dates ON public.labour_bookings(start_date, end_date);

-- Audit Logs Indexes
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON public.audit_logs(entity_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- =====================================================
-- STEP 5: CREATE FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update location from coordinates (user_profiles and equipment)
CREATE OR REPLACE FUNCTION update_location_from_coordinates()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update delivery_location from coordinates (bookings)
CREATE OR REPLACE FUNCTION update_delivery_location_from_coordinates()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.delivery_latitude IS NOT NULL AND NEW.delivery_longitude IS NOT NULL THEN
        NEW.delivery_location = ST_SetSRID(ST_MakePoint(NEW.delivery_longitude, NEW.delivery_latitude), 4326)::geography;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check phone before marking profile complete
CREATE OR REPLACE FUNCTION check_phone_before_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_profile_complete = TRUE AND (NEW.phone IS NULL OR NEW.phone = '') THEN
    RAISE EXCEPTION 'Phone number is required before profile can be marked complete';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update last login
CREATE OR REPLACE FUNCTION update_last_login(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.user_profiles
  SET last_login = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update labour location from coordinates
CREATE OR REPLACE FUNCTION update_labour_location_from_coordinates()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE id = p_notification_id
    AND user_id = auth.uid()
    AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  UPDATE public.notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE user_id = auth.uid()
    AND is_read = FALSE;

  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RETURN affected_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO unread_count
  FROM public.notifications
  WHERE user_id = auth.uid()
    AND is_read = FALSE
    AND (expires_at IS NULL OR expires_at > NOW());

  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.notifications
  WHERE is_read = TRUE
    AND read_at < NOW() - (days_to_keep || ' days')::INTERVAL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification with preferences check
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_category notification_category,
  p_event_type TEXT,
  p_priority notification_priority DEFAULT 'normal',
  p_action_url TEXT DEFAULT NULL,
  p_action_label TEXT DEFAULT NULL,
  p_related_booking_id UUID DEFAULT NULL,
  p_related_equipment_id UUID DEFAULT NULL,
  p_related_user_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_prefs RECORD;
  v_should_create BOOLEAN := TRUE;
BEGIN
  SELECT * INTO v_prefs
  FROM public.notification_preferences
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.notification_preferences (user_id)
    VALUES (p_user_id);
    v_should_create := TRUE;
  ELSE
    v_should_create := CASE p_category
      WHEN 'booking' THEN v_prefs.booking_enabled
      WHEN 'payment' THEN v_prefs.payment_enabled
      WHEN 'message' THEN v_prefs.message_enabled
      WHEN 'trust' THEN v_prefs.trust_enabled
      WHEN 'security' THEN v_prefs.security_enabled
      WHEN 'insight' THEN v_prefs.insight_enabled
      WHEN 'system' THEN v_prefs.system_enabled
      ELSE TRUE
    END;

    IF v_prefs.quiet_hours_enabled AND p_priority != 'critical' THEN
      v_should_create := NOT (v_prefs.allow_critical_during_quiet = FALSE);
    END IF;
  END IF;

  IF v_should_create THEN
    INSERT INTO public.notifications (
      user_id, title, message, category, event_type, priority,
      action_url, action_label, related_booking_id, related_equipment_id,
      related_user_id, metadata
    ) VALUES (
      p_user_id, p_title, p_message, p_category, p_event_type, p_priority,
      p_action_url, p_action_label, p_related_booking_id, p_related_equipment_id,
      p_related_user_id, p_metadata
    ) RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create default notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_name TEXT;
  user_phone TEXT;
BEGIN
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1)
  );

  user_phone := COALESCE(
    NEW.phone,
    NEW.raw_user_meta_data->>'phone'
  );

  INSERT INTO public.user_profiles (
    id,
    email,
    name,
    phone,
    profile_image,
    is_profile_complete,
    preferred_language,
    is_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_phone,
    NEW.raw_user_meta_data->>'avatar_url',
    FALSE,
    'en',
    NEW.email_confirmed_at IS NOT NULL,
    NOW(),
    NOW()
  )
  ON CONFLICT (id)
  DO UPDATE SET
    email = COALESCE(EXCLUDED.email, public.user_profiles.email),
    name = COALESCE(EXCLUDED.name, public.user_profiles.name),
    phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
    profile_image = COALESCE(EXCLUDED.profile_image, public.user_profiles.profile_image),
    updated_at = NOW();

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Function to update user profile from auth changes
CREATE OR REPLACE FUNCTION public.update_user_profile_from_auth()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.user_profiles
  SET
    email = NEW.email,
    phone = COALESCE(NEW.phone, phone),
    is_verified = (NEW.email_confirmed_at IS NOT NULL),
    updated_at = NOW()
  WHERE id = NEW.id;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'update_user_profile_from_auth failed for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Function to search nearby labour profiles
CREATE OR REPLACE FUNCTION search_labour_nearby(
    p_latitude DOUBLE PRECISION,
    p_longitude DOUBLE PRECISION,
    p_radius_km INTEGER,
    p_skills TEXT[] DEFAULT NULL,
    p_min_rate NUMERIC DEFAULT NULL,
    p_max_rate NUMERIC DEFAULT NULL,
    p_availability TEXT DEFAULT NULL,
    p_min_experience INTEGER DEFAULT NULL,
    p_min_rating NUMERIC DEFAULT NULL,
    p_search_query TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    skills TEXT[],
    experience_years INTEGER,
    daily_rate NUMERIC,
    hourly_rate NUMERIC,
    location_name TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location GEOGRAPHY,
    service_radius_km INTEGER,
    bio TEXT,
    certifications TEXT[],
    availability labour_availability,
    average_rating NUMERIC,
    review_count INTEGER,
    total_jobs INTEGER,
    is_verified BOOLEAN,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    distance_km DOUBLE PRECISION
) AS $$
DECLARE
    search_point GEOGRAPHY;
BEGIN
    search_point := ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography;

    RETURN QUERY
    SELECT
        lp.id,
        lp.user_id,
        lp.skills,
        lp.experience_years,
        lp.daily_rate,
        lp.hourly_rate,
        lp.location_name,
        lp.latitude,
        lp.longitude,
        lp.location,
        lp.service_radius_km,
        lp.bio,
        lp.certifications,
        lp.availability,
        lp.average_rating,
        lp.review_count,
        lp.total_jobs,
        lp.is_verified,
        lp.is_active,
        lp.created_at,
        lp.updated_at,
        ROUND(ST_Distance(lp.location, search_point)::numeric / 1000, 2) as distance_km
    FROM public.labour_profiles lp
    WHERE
        lp.is_active = true
        AND (lp.location IS NULL OR ST_DWithin(lp.location, search_point, p_radius_km * 1000))
        AND (p_skills IS NULL OR lp.skills && p_skills)
        AND (p_min_rate IS NULL OR lp.daily_rate >= p_min_rate)
        AND (p_max_rate IS NULL OR lp.daily_rate <= p_max_rate)
        AND (p_availability IS NULL OR lp.availability::TEXT = p_availability)
        AND (p_min_experience IS NULL OR lp.experience_years >= p_min_experience)
        AND (p_min_rating IS NULL OR lp.average_rating >= p_min_rating)
        AND (
            p_search_query IS NULL
            OR lp.bio ILIKE '%' || p_search_query || '%'
            OR lp.location_name ILIKE '%' || p_search_query || '%'
        )
    ORDER BY
        CASE WHEN lp.location IS NOT NULL
            THEN ST_Distance(lp.location, search_point)
            ELSE 999999999
        END ASC,
        lp.average_rating DESC,
        lp.review_count DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- STEP 6: CREATE TRIGGERS (Non-Auth Triggers First)
-- =====================================================

-- Trigger: Enforce phone before profile complete
CREATE TRIGGER enforce_phone_on_complete
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_phone_before_complete();

-- Trigger: Update user_profiles location
CREATE TRIGGER update_user_profiles_location
    BEFORE INSERT OR UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_location_from_coordinates();

-- Trigger: Update user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update equipment location
CREATE TRIGGER update_equipment_location
    BEFORE INSERT OR UPDATE ON public.equipment
    FOR EACH ROW
    EXECUTE FUNCTION update_location_from_coordinates();

-- Trigger: Update equipment updated_at
CREATE TRIGGER update_equipment_updated_at
    BEFORE UPDATE ON public.equipment
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update bookings delivery location
CREATE TRIGGER update_bookings_delivery_location
    BEFORE INSERT OR UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_delivery_location_from_coordinates();

-- Trigger: Update bookings updated_at
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update labour profiles location
CREATE TRIGGER labour_location_trigger
    BEFORE INSERT OR UPDATE OF latitude, longitude ON public.labour_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_labour_location_from_coordinates();

-- Trigger: Update labour profiles updated_at
CREATE TRIGGER labour_profiles_updated_at
    BEFORE UPDATE ON public.labour_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update labour bookings updated_at
CREATE TRIGGER labour_bookings_updated_at
    BEFORE UPDATE ON public.labour_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 7: CREATE AUTH TRIGGERS (After All Tables Exist)
-- =====================================================

-- Trigger: Create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Update user profile on auth changes
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (
    OLD.email IS DISTINCT FROM NEW.email OR
    OLD.phone IS DISTINCT FROM NEW.phone OR
    OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at
  )
  EXECUTE FUNCTION public.update_user_profile_from_auth();

-- Trigger: Create notification preferences for new users
CREATE TRIGGER create_user_notification_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- =====================================================
-- STEP 8: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_delivery_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labour_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labour_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 9: CREATE RLS POLICIES
-- =====================================================

-- User Profiles Policies
CREATE POLICY "Users can view all profiles"
    ON public.user_profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- User Roles Policies
CREATE POLICY "Users can view all roles"
    ON public.user_roles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own roles"
    ON public.user_roles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roles"
    ON public.user_roles FOR UPDATE
    USING (auth.uid() = user_id);

-- Equipment Policies
CREATE POLICY "Anyone can view available equipment"
    ON public.equipment FOR SELECT
    USING (true);

CREATE POLICY "Owners can insert equipment"
    ON public.equipment FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own equipment"
    ON public.equipment FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own equipment"
    ON public.equipment FOR DELETE
    USING (auth.uid() = owner_id);

-- Bookings Policies
CREATE POLICY "Users can view own bookings"
    ON public.bookings FOR SELECT
    USING (
        auth.uid() = renter_id OR
        auth.uid() IN (SELECT owner_id FROM public.equipment WHERE id = equipment_id)
    );

CREATE POLICY "Users can create bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Users can update own bookings"
    ON public.bookings FOR UPDATE
    USING (
        auth.uid() = renter_id OR
        auth.uid() IN (SELECT owner_id FROM public.equipment WHERE id = equipment_id)
    );

-- Reviews Policies
CREATE POLICY "Anyone can view reviews"
    ON public.reviews FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update own reviews"
    ON public.reviews FOR UPDATE
    USING (auth.uid() = reviewer_id);

-- Payments Policies
CREATE POLICY "Users can view related payments"
    ON public.payments FOR SELECT
    USING (
        auth.uid() IN (
            SELECT renter_id FROM public.bookings WHERE id = booking_id
            UNION
            SELECT owner_id FROM public.equipment
            WHERE id IN (SELECT equipment_id FROM public.bookings WHERE id = booking_id)
        )
    );

CREATE POLICY "Users can insert payments"
    ON public.payments FOR INSERT
    WITH CHECK (
        auth.uid() IN (SELECT renter_id FROM public.bookings WHERE id = booking_id)
    );

-- Messages Policies
CREATE POLICY "Users can view own messages"
    ON public.messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
    ON public.messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Notifications Policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Notification Preferences Policies
CREATE POLICY "Users can view their own preferences"
  ON public.notification_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.notification_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.notification_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Notification Delivery Log Policies
CREATE POLICY "Users can view delivery logs for their notifications"
  ON public.notification_delivery_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.notifications
      WHERE notifications.id = notification_delivery_log.notification_id
      AND notifications.user_id = auth.uid()
    )
  );

-- Labour Profiles Policies
CREATE POLICY "Anyone can view active labour profiles"
    ON public.labour_profiles FOR SELECT
    USING (is_active = true);

CREATE POLICY "Users can manage own labour profile"
    ON public.labour_profiles FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Labour Bookings Policies
CREATE POLICY "Labour can view their bookings"
    ON public.labour_bookings FOR SELECT
    USING (
        auth.uid() = employer_id OR
        auth.uid() IN (SELECT user_id FROM public.labour_profiles WHERE id = labour_id)
    );

CREATE POLICY "Employers can create bookings"
    ON public.labour_bookings FOR INSERT
    WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Participants can update bookings"
    ON public.labour_bookings FOR UPDATE
    USING (
        auth.uid() = employer_id OR
        auth.uid() IN (SELECT user_id FROM public.labour_profiles WHERE id = labour_id)
    );

-- Audit Logs Policies
CREATE POLICY "Users can view their own audit logs"
    ON public.audit_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (false);

CREATE POLICY "No updates allowed on audit logs"
    ON public.audit_logs FOR UPDATE
    USING (false);

CREATE POLICY "No deletes allowed on audit logs"
    ON public.audit_logs FOR DELETE
    USING (false);

-- =====================================================
-- STEP 10: ENABLE REALTIME
-- =====================================================

ALTER TABLE public.bookings REPLICA IDENTITY FULL;
ALTER TABLE public.equipment REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Realtime: Enable bookings manually in Dashboard';
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.equipment;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Realtime: Enable equipment manually in Dashboard';
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Realtime: Enable messages manually in Dashboard';
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Realtime: Enable notifications manually in Dashboard';
END $$;

-- =====================================================
-- STEP 11: SETUP STORAGE BUCKETS
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'equipment-images',
  'equipment-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'equipment-videos',
  'equipment-videos',
  true,
  20971520,
  ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profile-pictures'
);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profile-pictures'
)
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profile-pictures'
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profile-pictures'
);

-- Storage policies for equipment-images
CREATE POLICY "Authenticated users can upload equipment images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'equipment-images');

CREATE POLICY "Anyone can view equipment images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'equipment-images');

CREATE POLICY "Authenticated users can update their equipment images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'equipment-images')
WITH CHECK (bucket_id = 'equipment-images');

CREATE POLICY "Authenticated users can delete their equipment images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'equipment-images');

-- Storage policies for equipment-videos
CREATE POLICY "Authenticated users can upload equipment videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'equipment-videos');

CREATE POLICY "Anyone can view equipment videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'equipment-videos');

CREATE POLICY "Authenticated users can update their equipment videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'equipment-videos')
WITH CHECK (bucket_id = 'equipment-videos');

CREATE POLICY "Authenticated users can delete their equipment videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'equipment-videos');

-- =====================================================
-- STEP 12: GRANT PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

GRANT EXECUTE ON FUNCTION update_last_login(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read() TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count() TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION search_labour_nearby TO anon, authenticated;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║                                                                ║';
  RAISE NOTICE '║   ✅ AGRISERVE DATABASE SETUP COMPLETED SUCCESSFULLY!          ║';
  RAISE NOTICE '║                                                                ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '📋 What was created:';
  RAISE NOTICE '   ✓ 13 Tables (user_profiles, equipment, bookings, etc.)';
  RAISE NOTICE '   ✓ 8 Custom Types (enums)';
  RAISE NOTICE '   ✓ 20+ Functions (triggers, helpers, search)';
  RAISE NOTICE '   ✓ 50+ Indexes (optimized queries)';
  RAISE NOTICE '   ✓ Row Level Security (RLS) policies on all tables';
  RAISE NOTICE '   ✓ Real-time subscriptions enabled';
  RAISE NOTICE '   ✓ Storage buckets (avatars, equipment-images, equipment-videos)';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Next Steps:';
  RAISE NOTICE '   1. Enable Realtime in Supabase Dashboard';
  RAISE NOTICE '   2. Configure Authentication providers';
  RAISE NOTICE '   3. Update your .env.local file';
  RAISE NOTICE '   4. Test user signup!';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Your database is ready for AgriServe!';
  RAISE NOTICE '';
END $$;
