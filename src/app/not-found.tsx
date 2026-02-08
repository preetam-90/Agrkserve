/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lost404Illustration } from '@/components/system-pages/illustrations/Lost404Illustration';
import { Home, Search, Tractor, Wrench, MapPin, ArrowRight, Sprout, HardHat } from 'lucide-react';

/**
 * Agricultural-themed 404 Not Found Page
 * Custom designed for Agrkserve - Agricultural Equipment Rental Platform
 */

const popularEquipment = [
  {
    name: 'Tractors',
    nameHi: 'ट्रैक्टर',
    href: '/equipment?category=tractors',
    icon: Tractor,
  },
  {
    name: 'Harvesters',
    nameHi: 'हार्वेस्टर',
    href: '/equipment?category=harvesters',
    icon: Wrench,
  },
  {
    name: 'Ploughs',
    nameHi: 'हल',
    href: '/equipment?category=ploughs',
    icon: Sprout,
  },
  {
    name: 'Equipment',
    nameHi: 'उपकरण',
    href: '/equipment',
    icon: HardHat,
  },
];

export default function NotFoundPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
     
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/equipment?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-green-50 via-white to-green-50 px-4 py-8">
      {/* Animated background patterns */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float absolute left-10 top-20 h-32 w-32 rounded-full bg-green-100 opacity-20" />
        <div
          className="animate-float absolute bottom-32 right-20 h-40 w-40 rounded-full bg-amber-100 opacity-20"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="animate-float absolute right-40 top-40 h-24 w-24 rounded-full bg-green-200 opacity-20"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Error Code - Large and prominent */}
        <div className="mb-6 text-center">
          <h1 className="animate-gradient bg-gradient-to-r from-green-600 via-green-500 to-amber-500 bg-clip-text text-9xl font-black leading-none text-transparent md:text-[12rem]">
            404
          </h1>
        </div>

        {/* Illustration */}
        <div className="mb-8 flex justify-center">
          <div className="h-64 w-full max-w-lg md:h-80">
            <Lost404Illustration className="h-full w-full drop-shadow-xl" />
          </div>
        </div>

        {/* Main Message */}
        <div className="mb-8 space-y-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-amber-300 bg-amber-100 px-4 py-2">
            <MapPin className="h-5 w-5 text-amber-700" />
            <span className="text-sm font-semibold text-amber-900">खो गए? / Lost Your Way?</span>
          </div>

          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-5xl">
            <span className="mb-2 block text-2xl md:text-4xl">हम इस खेत को नहीं ढूंढ पाए</span>
            <span className="block">We Couldn't Find This Field</span>
          </h2>

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 md:text-xl">
            यह पृष्ठ या तो मौजूद नहीं है, या फसल के साथ काट दिया गया है।
            <br />
            <span className="font-medium text-gray-700">
              This page doesn't exist or has been harvested away.
            </span>
          </p>
        </div>

        {/* Search Bar */}
        <div className="mx-auto mb-10 max-w-2xl">
          <form onSubmit={handleSearch} className="group relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-green-600 to-amber-500 opacity-25 blur transition duration-200 group-hover:opacity-40" />
            <div className="relative flex gap-2 rounded-xl border-2 border-green-100 bg-white p-2 shadow-lg">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="खोजें कृषि उपकरण / Search agricultural equipment..."
                  className="h-14 border-0 bg-transparent pl-12 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-14 bg-gradient-to-r from-green-600 to-green-700 px-8 font-semibold text-white shadow-md transition-all duration-200 hover:from-green-700 hover:to-green-800 hover:shadow-lg"
              >
                खोजें <span className="hidden sm:inline">/ Search</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>

        {/* Popular Equipment Categories */}
        <div className="mb-10">
          <p className="mb-6 text-center text-sm font-semibold uppercase tracking-wide text-gray-500">
            लोकप्रिय श्रेणियां / Popular Categories
          </p>
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
            {popularEquipment.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative rounded-xl border-2 border-green-100 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-green-300 hover:bg-green-50 hover:shadow-lg"
                >
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-100 to-green-200 transition-colors duration-200 group-hover:from-green-200 group-hover:to-green-300">
                      <Icon className="h-6 w-6 text-green-700" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 transition-colors group-hover:text-green-700">
                        {item.nameHi}
                      </div>
                      <div className="text-xs text-gray-600 transition-colors group-hover:text-green-600">
                        {item.name}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/">
            <Button
              size="lg"
              className="h-14 min-w-[200px] bg-gradient-to-r from-green-600 to-green-700 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:from-green-700 hover:to-green-800 hover:shadow-xl"
            >
              <Home className="mr-2 h-5 w-5" />
              होम पर जाएं / Go Home
            </Button>
          </Link>

          <button
            onClick={() => router.back()}
            className="h-14 min-w-[200px] rounded-lg border-2 border-gray-300 bg-white px-6 text-base font-semibold text-gray-700 shadow-md transition-all duration-200 hover:border-green-500 hover:bg-gray-50 hover:text-green-700 hover:shadow-lg"
          >
            वापस जाएं / Go Back
          </button>
        </div>

        {/* Help Text */}
        <div className="space-y-2 text-center">
          <p className="text-sm text-gray-500">Need help finding the right equipment?</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1 text-sm font-semibold text-green-600 transition-colors hover:text-green-700"
          >
            संपर्क करें / Contact Support
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Decorative bottom wave */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="h-24 w-full">
          <path d="M0,60 C300,90 600,30 900,60 L900,120 L0,120 Z" fill="#F0FDF4" opacity="0.5" />
          <path d="M0,80 C400,100 800,60 1200,80 L1200,120 L0,120 Z" fill="#DCFCE7" opacity="0.3" />
        </svg>
      </div>
    </div>
  );
}
