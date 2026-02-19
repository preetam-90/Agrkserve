// Equipment categories
export const EQUIPMENT_CATEGORIES = [
  { value: 'tractor', label: 'Tractor', labelHi: 'ट्रैक्टर', icon: '🚜' },
  { value: 'harvester', label: 'Harvester', labelHi: 'हार्वेस्टर', icon: '🌾' },
  { value: 'plough', label: 'Plough', labelHi: 'हल', icon: '⚒️' },
  { value: 'seeder', label: 'Seeder', labelHi: 'बीज बोने की मशीन', icon: '🌱' },
  { value: 'sprayer', label: 'Sprayer', labelHi: 'स्प्रेयर', icon: '💧' },
  { value: 'cultivator', label: 'Cultivator', labelHi: 'कल्टीवेटर', icon: '🔧' },
  { value: 'rotavator', label: 'Rotavator', labelHi: 'रोटावेटर', icon: '⚙️' },
  { value: 'thresher', label: 'Thresher', labelHi: 'थ्रेशर', icon: '🌿' },
  { value: 'irrigation', label: 'Irrigation Equipment', labelHi: 'सिंचाई उपकरण', icon: '💦' },
  { value: 'drone', label: 'Agricultural Drone', labelHi: 'कृषि ड्रोन', icon: '🛸' },
  { value: 'other', label: 'Other', labelHi: 'अन्य', icon: '📦' },
] as const;

// Labour skills
export const LABOUR_SKILLS = [
  { value: 'farming', label: 'General Farming', labelHi: 'सामान्य खेती' },
  { value: 'harvesting', label: 'Harvesting', labelHi: 'कटाई' },
  { value: 'planting', label: 'Planting', labelHi: 'रोपण' },
  { value: 'irrigation', label: 'Irrigation', labelHi: 'सिंचाई' },
  { value: 'pesticide', label: 'Pesticide Application', labelHi: 'कीटनाशक छिड़काव' },
  { value: 'fertilizer', label: 'Fertilizer Application', labelHi: 'उर्वरक अनुप्रयोग' },
  { value: 'equipment_operation', label: 'Equipment Operation', labelHi: 'उपकरण संचालन' },
  { value: 'livestock', label: 'Livestock Care', labelHi: 'पशुधन देखभाल' },
  { value: 'organic_farming', label: 'Organic Farming', labelHi: 'जैविक खेती' },
  { value: 'greenhouse', label: 'Greenhouse Work', labelHi: 'ग्रीनहाउस कार्य' },
] as const;

// Booking status options
const BOOKING_STATUSES = [
  { value: 'pending', label: 'Pending', labelHi: 'लंबित' },
  { value: 'approved', label: 'Approved', labelHi: 'स्वीकृत' },
  { value: 'rejected', label: 'Rejected', labelHi: 'अस्वीकृत' },
  { value: 'in_progress', label: 'In Progress', labelHi: 'प्रगति में' },
  { value: 'completed', label: 'Completed', labelHi: 'पूर्ण' },
  { value: 'cancelled', label: 'Cancelled', labelHi: 'रद्द' },
] as const;

// Equipment status options
const EQUIPMENT_STATUSES = [
  { value: 'available', label: 'Available', labelHi: 'उपलब्ध' },
  { value: 'rented', label: 'Rented', labelHi: 'किराए पर' },
  { value: 'inactive', label: 'Inactive', labelHi: 'निष्क्रिय' },
  { value: 'maintenance', label: 'Under Maintenance', labelHi: 'रखरखाव में' },
] as const;

// Service radius options
const SERVICE_RADIUS_OPTIONS = [
  { value: 5, label: '5 km', labelHi: '5 किमी' },
  { value: 10, label: '10 km', labelHi: '10 किमी' },
  { value: 25, label: '25 km', labelHi: '25 किमी' },
  { value: 50, label: '50 km', labelHi: '50 किमी' },
  { value: 100, label: '100 km', labelHi: '100 किमी' },
] as const;

// Distance filter options
const DISTANCE_FILTER_OPTIONS = [
  { value: 5, label: 'Within 5 km', labelHi: '5 किमी के भीतर' },
  { value: 10, label: 'Within 10 km', labelHi: '10 किमी के भीतर' },
  { value: 25, label: 'Within 25 km', labelHi: '25 किमी के भीतर' },
  { value: 50, label: 'Within 50 km', labelHi: '50 किमी के भीतर' },
  { value: 100, label: 'Within 100 km', labelHi: '100 किमी के भीतर' },
  { value: 0, label: 'Any Distance', labelHi: 'कोई भी दूरी' },
] as const;

// Price range options
export const PRICE_RANGE_OPTIONS = [
  { min: 0, max: 500, label: 'Under ₹500', labelHi: '₹500 से कम' },
  { min: 500, max: 1000, label: '₹500 - ₹1,000', labelHi: '₹500 - ₹1,000' },
  { min: 1000, max: 2500, label: '₹1,000 - ₹2,500', labelHi: '₹1,000 - ₹2,500' },
  { min: 2500, max: 5000, label: '₹2,500 - ₹5,000', labelHi: '₹2,500 - ₹5,000' },
  { min: 5000, max: 10000, label: '₹5,000 - ₹10,000', labelHi: '₹5,000 - ₹10,000' },
  { min: 10000, max: Infinity, label: 'Above ₹10,000', labelHi: '₹10,000 से अधिक' },
] as const;

// Rating options
export const RATING_OPTIONS = [
  { value: 4, label: '4+ Stars', labelHi: '4+ स्टार' },
  { value: 3, label: '3+ Stars', labelHi: '3+ स्टार' },
  { value: 2, label: '2+ Stars', labelHi: '2+ स्टार' },
  { value: 0, label: 'Any Rating', labelHi: 'कोई भी रेटिंग' },
] as const;

// Default pagination
export const DEFAULT_PAGE_SIZE = 12;

// Default location (India center)
const DEFAULT_LOCATION = {
  latitude: 20.5937,
  longitude: 78.9629,
};

// Service fee percentage

// Cancellation policy
const CANCELLATION_POLICY = {
  FREE_CANCELLATION_HOURS: 24,
  PARTIAL_REFUND_PERCENTAGE: 50,
  NO_REFUND_HOURS: 6,
};

// Image upload limits
export const IMAGE_UPLOAD = {
  MAX_FILES: 5,
  MAX_SIZE_MB: 5,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};

// OTP settings
const OTP_SETTINGS = {
  LENGTH: 6,
  EXPIRY_SECONDS: 300,
  RESEND_COOLDOWN_SECONDS: 60,
};

// Languages
const LANGUAGES = [
  { value: 'en', label: 'English', nativeLabel: 'English' },
  { value: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
] as const;

// User roles
const USER_ROLES = [
  { value: 'farmer', label: 'Farmer / Renter', labelHi: 'किसान / किराएदार' },
  { value: 'provider', label: 'Equipment Provider', labelHi: 'उपकरण प्रदाता' },
  { value: 'admin', label: 'Administrator', labelHi: 'प्रशासक' },
] as const;
