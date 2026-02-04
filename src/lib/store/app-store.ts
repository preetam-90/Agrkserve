import { create } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true, // Default to true for desktop visibility
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  sidebarCollapsed: false, // Default to expanded
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  userLocation: null,
  setUserLocation: (location) => set({ userLocation: location }),
}));
