'use client';

// This is a demo page showing how to use the invoice components
// File: /src/app/invoice-demo/page.tsx

import { DownloadInvoiceButton, InvoicePDF } from '@/components/invoice';
import { PDFViewer } from '@react-pdf/renderer';
import type { Booking, Equipment, UserProfile } from '@/lib/types';

// Sample booking data for demo
const sampleBooking: Booking & {
  equipment?: Equipment;
  renter?: UserProfile;
  provider?: UserProfile;
} = {
  id: '079f9cdb-1234-5678-9abc-def012345678',
  equipment_id: 'equip-001',
  renter_id: 'renter-001',
  provider_id: 'provider-001',
  start_date: '2026-02-04',
  end_date: '2026-02-28',
  start_time: '08:00',
  end_time: '18:00',
  delivery_address: 'Malhanwara, Chhindwara Tahsil, MP, 480001',
  notes: 'Please bring extra fuel',
  total_amount: 175000,
  platform_fee: 8750,
  status: 'completed',
  cancelled_reason: null,
  cancelled_by: null,
  created_at: '2026-02-01T10:30:00Z',
  updated_at: '2026-02-01T10:30:00Z',
  equipment: {
    id: 'equip-001',
    owner_id: 'provider-001',
    name: 'Mahindra 575 DI Tractor',
    description: 'Powerful 45HP tractor with rotavator attachment',
    category: 'tractor',
    brand: 'Mahindra',
    model: '575 DI',
    year: 2023,
    horsepower: 45,
    fuel_type: 'Diesel',
    price_per_hour: null,
    price_per_day: 7000,
    location_name: 'Chhindwara, MP',
    latitude: 22.0574,
    longitude: 78.9382,
    images: [],
    video_url: null,
    features: ['Power Steering', 'Oil Brakes', 'Rotavator Included'],
    is_available: true,
    rating: 4.8,
    review_count: 24,
    total_bookings: 156,
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-12-01T00:00:00Z',
  },
  renter: {
    id: 'renter-001',
    phone: '9876543210',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    profile_image: null,
    bio: 'Progressive farmer with 10 acres of land',
    address: 'Malhanwara, Chhindwara',
    pincode: '480001',
    latitude: 22.0574,
    longitude: 78.9382,
    roles: ['renter'],
    is_profile_complete: true,
    preferred_language: 'hi',
    is_verified: true,
    last_login: '2026-02-01T08:00:00Z',
    created_at: '2025-06-15T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z',
  },
  provider: {
    id: 'provider-001',
    phone: '9123456789',
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    profile_image: null,
    bio: 'Equipment rental business owner',
    address: 'Chhindwara, MP',
    pincode: '480001',
    latitude: 22.0574,
    longitude: 78.9382,
    roles: ['provider'],
    is_profile_complete: true,
    preferred_language: 'en',
    is_verified: true,
    last_login: '2026-02-01T09:00:00Z',
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z',
  },
};

export default function InvoiceDemoPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-white">Invoice Components Demo</h1>

        {/* Download Button Variants */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-semibold text-white">Download Button Variants</h2>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Primary</p>
              <DownloadInvoiceButton booking={sampleBooking} variant="primary" size="md" />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-400">Secondary</p>
              <DownloadInvoiceButton booking={sampleBooking} variant="secondary" size="md" />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-400">Outline</p>
              <DownloadInvoiceButton booking={sampleBooking} variant="outline" size="md" />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-400">Ghost</p>
              <DownloadInvoiceButton booking={sampleBooking} variant="ghost" size="md" />
            </div>
          </div>
        </section>

        {/* Size Variants */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-semibold text-white">Size Variants</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Small</p>
              <DownloadInvoiceButton booking={sampleBooking} variant="primary" size="sm" />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-400">Medium</p>
              <DownloadInvoiceButton booking={sampleBooking} variant="primary" size="md" />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-400">Large</p>
              <DownloadInvoiceButton booking={sampleBooking} variant="primary" size="lg" />
            </div>
          </div>
        </section>

        {/* PDF Preview */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-semibold text-white">PDF Preview</h2>
          <div className="h-[800px] w-full overflow-hidden rounded-lg border border-[#262626]">
            <PDFViewer width="100%" height="100%">
              <InvoicePDF booking={sampleBooking} />
            </PDFViewer>
          </div>
        </section>

        {/* Sample Data */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-semibold text-white">Sample Booking Data</h2>
          <pre className="overflow-auto rounded-lg bg-[#111111] p-4 text-sm text-gray-300">
            {JSON.stringify(sampleBooking, null, 2)}
          </pre>
        </section>
      </div>
    </div>
  );
}
