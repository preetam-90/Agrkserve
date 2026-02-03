// Re-export all types
export * from './database';
export * from './media';
export * from './klipy';

// Auth types
export interface AuthState {
  user: import('@supabase/supabase-js').User | null;
  profile: import('./database').UserProfile | null;
  roles: import('./database').UserRole[];
  activeRole: import('./database').UserRole | null;
  isLoading: boolean;
  isInitialized: boolean;
}

// Form types
export interface LoginFormData {
  phone: string;
}

export interface OTPVerifyFormData {
  phone: string;
  otp: string;
}

export interface ProfileFormData {
  name: string;
  email?: string;
  bio?: string;
  address?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  profile_image?: string;
  roles?: import('./database').UserRole[];
  is_profile_complete?: boolean;
}

export interface EquipmentFormData {
  name: string;
  description?: string;
  category: import('./database').EquipmentCategory;
  brand?: string;
  model?: string;
  year?: number;
  horsepower?: number;
  fuel_type?: string;
  price_per_hour?: number;
  price_per_day: number;
  location_name: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  video_url?: string;
  features?: string[];
  is_available?: boolean;
}

export interface BookingFormData {
  equipment_id: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  delivery_address?: string;
  notes?: string;
  total_amount: number;
  platform_fee?: number;
}

export interface ReviewFormData {
  booking_id: string;
  equipment_id: string;
  rating: number;
  comment?: string;
  images?: string[];
}

export interface LabourProfileFormData {
  skills: string[];
  experience_years: number;
  daily_rate: number;
  hourly_rate?: number;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  service_radius_km?: number;
  bio?: string;
  certifications?: string[];
}

// UI types
export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  roles?: import('./database').UserRole[];
}

export interface TabItem {
  id: string;
  label: string;
  labelHi?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  labelHi?: string;
  icon?: string;
}

// Location types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData extends Coordinates {
  address?: string;
  pincode?: string;
}

// Payment types
export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
}

export interface PaymentVerification {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
