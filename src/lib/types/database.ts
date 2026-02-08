// Database types matching the existing Supabase PostgreSQL/PostGIS schema
// These types are designed to match what the API returns

export type UserRole = 'renter' | 'provider' | 'labour' | 'admin';

export type BookingStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type EquipmentCategory =
  | 'tractor'
  | 'harvester'
  | 'plough'
  | 'seeder'
  | 'sprayer'
  | 'cultivator'
  | 'rotavator'
  | 'thresher'
  | 'irrigation'
  | 'drone'
  | 'other';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type LabourAvailability = 'available' | 'busy' | 'unavailable';

export type DisputeStatus = 'open' | 'in_review' | 'resolved' | 'closed';

// User Profile
export interface UserProfile {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  profile_image: string | null;
  bio: string | null;
  address: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  roles: UserRole[] | null;
  is_profile_complete: boolean;
  preferred_language: 'en' | 'hi';
  is_verified: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

// Equipment
export interface Equipment {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  category: EquipmentCategory | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  horsepower: number | null;
  fuel_type: string | null;
  price_per_hour: number | null;
  price_per_day: number;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  images: string[] | null;
  video_url: string | null;
  features: string[] | null;
  is_available: boolean;
  rating: number | null;
  review_count: number | null;
  total_bookings: number | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  owner?: UserProfile;
  distance_km?: number;
}

// Booking
export interface Booking {
  id: string;
  equipment_id: string;
  renter_id: string;
  provider_id: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  delivery_address: string | null;
  notes: string | null;
  total_amount: number;
  platform_fee: number | null;
  status: BookingStatus;
  cancelled_reason: string | null;
  cancelled_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  equipment?: Equipment;
  renter?: UserProfile;
  provider?: UserProfile;
  payment?: Payment;
}

// Payment
export interface Payment {
  id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  currency: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  status: PaymentStatus;
  transaction_id: string | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  booking?: Booking;
}

// Review
export interface Review {
  id: string;
  booking_id: string;
  equipment_id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  images: string[] | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  reviewer?: UserProfile;
  equipment?: Equipment;
}

// Labour Profile
export interface LabourProfile {
  id: string;
  user_id: string;
  skills: string[];
  experience_years: number;
  daily_rate: number;
  hourly_rate: number | null;
  city: string;
  address: string | null;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  service_radius_km: number;
  bio: string | null;
  certifications: string[] | null;
  availability: LabourAvailability;
  rating: number | null;
  review_count: number | null;
  total_jobs: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  user?: UserProfile;
}

// Labour Booking
export interface LabourBooking {
  id: string;
  labour_id: string;
  employer_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  total_amount: number;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  labour?: LabourProfile;
  employer?: UserProfile;
}

// User Profile (minimal for joins)
export interface UserProfileMinimal {
  id: string;
  name: string | null;
  profile_image: string | null;
}

// Direct Message
export type MessageType = 'text' | 'image' | 'video' | 'gif' | 'sticker' | 'location' | 'link';

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  message_type: MessageType;
  media_url: string | null;
  media_thumbnail_url: string | null;
  media_size_bytes: number | null;
  media_duration_seconds: number | null;
  media_width: number | null;
  media_height: number | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  // Delivery status for WhatsApp-like read receipts (optional - may not exist in DB)
  delivery_status?: 'sent' | 'delivered' | 'read';
  delivered_at?: string | null;
  // KLIPY media metadata
  klipy_slug?: string | null;
  klipy_blur_preview?: string | null;
  // Reactions
  reactions?: { emoji: string; count: number; users: string[] }[] | null;
  // Reply/Quote
  reply_to_id?: string | null;
  reply_to_message?: DirectMessage | null;
  // Location
  location_lat?: number | null;
  location_lng?: number | null;
  location_address?: string | null;
  // Link preview
  link_preview?: { title: string; description: string; image: string; url: string } | null;
  // Soft delete
  is_deleted?: boolean;
  deleted_at?: string | null;
  deleted_for?: string[] | null;
  // Joined fields
  sender?: UserProfileMinimal | null;
}

// DM Conversation
export interface DMConversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  last_message: string | null;
  last_message_at: string | null;
  last_message_sender_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined/computed fields
  other_user_id?: string;
  other_user_name?: string;
  other_user_avatar?: string | null;
  unread_count?: number;
  other_participant?: UserProfileMinimal | null;
}

// Legacy Message type (for booking-related messages - keep for backwards compatibility)
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  booking_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
  // Joined fields
  sender?: UserProfile;
  receiver?: UserProfile;
}

// Legacy Conversation type (keep for backwards compatibility)
export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  created_at: string;
  // Joined fields
  participant_1?: UserProfile;
  participant_2?: UserProfile;
  other_participant?: UserProfile;
}

// Notification
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'booking' | 'payment' | 'review' | 'message' | 'system';
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

// Dispute
export interface Dispute {
  id: string;
  booking_id: string;
  raised_by: string;
  against_user: string;
  reason: string;
  description: string | null;
  evidence_images: string[] | null;
  status: DisputeStatus;
  resolution: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  booking?: Booking;
  raised_by_user?: UserProfile;
  against_user_profile?: UserProfile;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
  hasMore?: boolean;
}

// Search filters
export interface EquipmentFilters {
  search?: string;
  category?: EquipmentCategory;
  minPrice?: number;
  maxPrice?: number;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  minRating?: number;
  isAvailable?: boolean;
  page?: number;
  limit?: number;
}

export interface LabourFilters {
  search?: string;
  skills?: string[];
  minRate?: number;
  maxRate?: number;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  minRating?: number;
  availability?: LabourAvailability;
  page?: number;
  limit?: number;
}

// Admin types
export interface AdminStats {
  totalUsers: number;
  totalEquipment: number;
  totalBookings: number;
  totalRevenue: number;
  activeBookings: number;
  newUsersThisMonth: number;
  bookingsThisMonth: number;
  revenueThisMonth: number;
}

export interface PlatformAnalytics {
  total_users: number;
  total_farmers: number;
  total_providers: number;
  total_equipment: number;
  total_bookings: number;
  completed_bookings: number;
  total_revenue: number;
  total_labour: number;
  active_disputes: number;
  date: string;
}

export interface DashboardChartData {
  label: string;
  value: number;
}
