import { Metadata } from 'next';
import GalleryClient from './GalleryClient';

export const metadata: Metadata = {
  title: 'Gallery - AgriServe | Farm Equipment & Agricultural Services Photos India',
  description:
    'View photos and videos of farm equipment, tractors, harvesters, cultivators, and agricultural labour services available on AgriServe across India. See our fleet of modern farming machinery.',
  keywords: [
    'farm equipment photos india',
    'tractor rental gallery',
    'agricultural machinery images',
    'harvester photos',
    'cultivator images',
    'farming equipment india',
    'krishi upkaran photos',
    'कृषि उपकरण फोटो',
    'agriserve gallery',
  ],
  openGraph: {
    title: 'Gallery - AgriServe | Farm Equipment Photos & Videos',
    description:
      'Browse photos and videos of farm equipment and agricultural services on AgriServe across India.',
    url: 'https://agriserve.in/gallery',
    type: 'website',
    locale: 'en_IN',
  },
  alternates: {
    canonical: 'https://agriserve.in/gallery',
  },
};

export default function GalleryPage() {
  return <GalleryClient />;
}
