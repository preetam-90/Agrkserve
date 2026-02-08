import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AgriServe - Farm Equipment Rental',
    short_name: 'AgriServe',
    description: 'Rent tractors, harvesters, and farm equipment across India.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0F0C',
    theme_color: '#0A0F0C',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
