import { create } from 'zustand';
import type { Coordinates, EquipmentFilters } from '@/lib/types';
import { DEFAULT_LOCATION } from '@/lib/utils/constants';

interface AppState {
  // Location
  userLocation: Coordinates | null;
  isLocating: boolean;
  locationError: string | null;
  
  // Search filters
  searchFilters: EquipmentFilters;
  
  // UI
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  
  // Language
  language: 'en' | 'hi';
}

interface AppActions {
  setUserLocation: (location: Coordinates | null) => void;
  setIsLocating: (locating: boolean) => void;
  setLocationError: (error: string | null) => void;
  requestLocation: () => Promise<Coordinates | null>;
  
  setFilters: (filters: Partial<EquipmentFilters>) => void;
  clearFilters: () => void;
  
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  
  setLanguage: (lang: 'en' | 'hi') => void;
}

export const useAppStore = create<AppState & AppActions>()((set) => ({
  // Initial state
  userLocation: null,
  isLocating: false,
  locationError: null,
  searchFilters: {},
  sidebarOpen: true,
  mobileMenuOpen: false,
  language: 'en',

  // Location actions
  setUserLocation: (location) => set({ userLocation: location, locationError: null }),
  setIsLocating: (isLocating) => set({ isLocating }),
  setLocationError: (locationError) => set({ locationError }),

  // Filter actions
  setFilters: (filters) => set((state) => ({ 
    searchFilters: { ...state.searchFilters, ...filters } 
  })),
  clearFilters: () => set({ searchFilters: {} }),

  requestLocation: async () => {
    if (!navigator.geolocation) {
      set({ locationError: 'Geolocation is not supported by your browser' });
      return null;
    }

    set({ isLocating: true, locationError: null });

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          set({ userLocation: location, isLocating: false });
          resolve(location);
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          set({ 
            locationError: errorMessage, 
            isLocating: false,
            userLocation: DEFAULT_LOCATION 
          });
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  },

  // UI actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

  // Language actions
  setLanguage: (language) => set({ language }),
}));
