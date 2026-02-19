const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  USERS: '/admin/users',
  EQUIPMENT: '/admin/equipment',
  BOOKINGS: '/admin/bookings',
  LABOUR: '/admin/labour',
  REVIEWS: '/admin/reviews',
  PAYMENTS: '/admin/payments',
  SETTINGS: '/admin/settings',
} as const;

export const BOOKING_STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
] as const;

const EQUIPMENT_CATEGORY_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Tractor', value: 'tractor' },
  { label: 'Harvester', value: 'harvester' },
  { label: 'Plough', value: 'plough' },
  { label: 'Cultivator', value: 'cultivator' },
  { label: 'Rotavator', value: 'rotavator' },
  { label: 'Thresher', value: 'thresher' },
  { label: 'Sprayer', value: 'sprayer' },
  { label: 'Seeder', value: 'seeder' },
  { label: 'Irrigation', value: 'irrigation' },
  { label: 'Drone', value: 'drone' },
  { label: 'Other', value: 'other' },
] as const;

export const AVAILABILITY_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Available', value: 'true' },
  { label: 'Not Available', value: 'false' },
] as const;

export const LABOUR_AVAILABILITY_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Available', value: 'available' },
  { label: 'Busy', value: 'busy' },
  { label: 'Unavailable', value: 'unavailable' },
] as const;

export const PAYMENT_STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' },
];

const USER_ROLE_OPTIONS = [
  { label: 'Renter', value: 'renter' },
  { label: 'Provider', value: 'provider' },
  { label: 'Labour', value: 'labour' },
  { label: 'Admin', value: 'admin' },
] as const;

export const ITEMS_PER_PAGE = 20;

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
  available: 'bg-green-100 text-green-800',
  busy: 'bg-yellow-100 text-yellow-800',
  unavailable: 'bg-gray-100 text-gray-800',
};
