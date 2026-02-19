import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface GeolocationCoords {
  latitude: number;
  longitude: number;
}

interface UseGeolocationReturn {
  isLocating: boolean;
  getLocation: () => void;
  getLocationWithCallback: (onLocation: (coords: GeolocationCoords) => void) => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [isLocating, setIsLocating] = useState(false);

  const reverseGeocode = useCallback(
    async (
      latitude: number,
      longitude: number
    ): Promise<{
      city: string;
      address: string;
    } | null> => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();
        if (data.address) {
          const city = data.address.city || data.address.town || data.address.village || '';
          return {
            city,
            address: data.display_name || '',
          };
        }
      } catch {
        // Silent fail - coordinates are still valid even if reverse geocoding fails
      }
      return null;
    },
    []
  );

  const handleLocationSuccess = useCallback(
    (position: GeolocationPosition, onLocation?: (coords: GeolocationCoords) => void) => {
      const { latitude, longitude } = position.coords;

      if (onLocation) {
        onLocation({ latitude, longitude });
      }

      // Try to get address from coordinates (for backward compatibility)
      reverseGeocode(latitude, longitude)
        .then((locationData) => {
          if (locationData) {
            toast.success('Location detected');
          }
        })
        .catch(() => {
          // Silent fail
        })
        .finally(() => {
          setIsLocating(false);
        });
    },
    [reverseGeocode]
  );

  const handleLocationError = useCallback((error: GeolocationPositionError) => {
    console.error('Geolocation error:', error);
    toast.error('Failed to get location');
    setIsLocating(false);
  }, []);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => handleLocationSuccess(position),
      handleLocationError
    );
  }, [handleLocationSuccess, handleLocationError]);

  const getLocationWithCallback = useCallback(
    (onLocation: (coords: GeolocationCoords) => void) => {
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported');
        return;
      }

      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => handleLocationSuccess(position, onLocation),
        handleLocationError
      );
    },
    [handleLocationSuccess, handleLocationError]
  );

  return {
    isLocating,
    getLocation,
    getLocationWithCallback,
  };
}
