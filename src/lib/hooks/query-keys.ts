// Centralized query key factory for TanStack React Query
// Following the query key factory pattern for consistent cache management

export const equipmentKeys = {
  all: ['equipment'] as const,
  lists: () => [...equipmentKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...equipmentKeys.lists(), filters] as const,
  featured: (limit?: number) => [...equipmentKeys.all, 'featured', limit] as const,
  details: () => [...equipmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...equipmentKeys.details(), id] as const,
  categories: () => [...equipmentKeys.all, 'categories'] as const,
  ownerStats: (ownerId: string) => [...equipmentKeys.all, 'ownerStats', ownerId] as const,
};

export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  renter: (renterId: string, status?: string) =>
    [...bookingKeys.lists(), 'renter', renterId, status] as const,
  owner: (ownerId: string, status?: string) =>
    [...bookingKeys.lists(), 'owner', ownerId, status] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
  stats: (userId: string, role: string) => [...bookingKeys.all, 'stats', userId, role] as const,
  myBookings: () => [...bookingKeys.lists(), 'my'] as const,
  upcoming: (userId: string, role: string, limit?: number) =>
    [...bookingKeys.all, 'upcoming', userId, role, limit] as const,
};

export const labourKeys = {
  all: ['labour'] as const,
  profile: (userId: string) => [...labourKeys.all, 'profile', userId] as const,
  lists: () => [...labourKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...labourKeys.lists(), filters] as const,
  featured: (limit?: number) => [...labourKeys.all, 'featured', limit] as const,
  bookings: (userId: string, role?: string) =>
    [...labourKeys.all, 'bookings', userId, role] as const,
};

export const statsKeys = {
  all: ['stats'] as const,
  home: () => [...statsKeys.all, 'home'] as const,
};
