'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, Home, Tractor, Wrench, CloudOff, Signal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// OfflinePage JSON-LD for SEO
const offlineJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Offline - AgriServe',
  description:
    'AgriServe requires an internet connection. Please check your network settings to access our agricultural equipment rental and labor hiring services.',
  url: 'https://agriserve.in/offline',
  inLanguage: 'en-IN',
  author: {
    '@type': 'Organization',
    name: 'AgriServe',
    url: 'https://agriserve.in',
  },
  message:
    'Internet connection required to access agricultural equipment rental and labor booking services',
};

/**
 * Offline Page - Modern animated dark theme for agriculture equipment booking
 * Displayed when the user has no internet connection
 */
export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Check initial online status

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsChecking(true);

    // Simulate checking connection
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (navigator.onLine) {
      window.location.reload();
    } else {
      setIsChecking(false);
      // Show brief feedback
      const message = 'Still offline. Please check your internet connection.';
      alert(message);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#020617] via-[#0F172A] to-[#1E293B]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offlineJsonLd) }}
      />
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Circles */}
        <div
          className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#22C55E]/10 blur-3xl"
          style={{
            animation: 'float 8s ease-in-out infinite',
            animationDelay: '0s',
          }}
        />
        <div
          className="absolute -right-20 top-1/4 h-80 w-80 rounded-full bg-[#15803D]/10 blur-3xl"
          style={{
            animation: 'float 10s ease-in-out infinite',
            animationDelay: '2s',
          }}
        />
        <div
          className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#CA8A04]/10 blur-3xl"
          style={{
            animation: 'float 12s ease-in-out infinite',
            animationDelay: '4s',
          }}
        />

        {/* Animated Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 10 0 L 0 0 0 10' fill='none' stroke='%2322C55E' stroke-opacity='0.1' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Status Indicator */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              {/* Pulsing Ring */}
              <div className="absolute inset-0 animate-ping rounded-full bg-[#EF4444]/20" />
              <div className="absolute inset-0 animate-pulse rounded-full bg-[#EF4444]/10" />

              {/* Icon Container */}
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#1E293B] shadow-2xl shadow-[#EF4444]/20 ring-4 ring-[#0F172A]">
                <WifiOff className="h-12 w-12 animate-pulse text-[#EF4444]" />
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="rounded-3xl border border-[#1E293B] bg-[#0F172A]/90 p-8 shadow-2xl backdrop-blur-sm sm:p-12">
            {/* Title */}
            <div className="mb-6 text-center">
              <h1 className="mb-3 text-4xl font-bold text-[#F8FAFC] sm:text-5xl">
                Connection Lost
              </h1>
              <div className="mx-auto mb-4 h-1 w-24 rounded-full bg-gradient-to-r from-[#15803D] via-[#22C55E] to-[#CA8A04]" />
              <p className="text-lg text-[#94A3B8]">Unable to reach our servers</p>
            </div>

            {/* Description */}
            <div className="mb-8 space-y-3 text-center">
              <p className="text-[#CBD5E1]">
                Your equipment and labour booking platform needs an active internet connection to
                function.
              </p>
              <p className="text-sm text-[#64748B]">Please check your connection and try again.</p>
            </div>

            {/* Connection Status */}
            <div className="mb-8 rounded-2xl border-2 border-[#1E293B] bg-gradient-to-br from-[#1E293B]/50 to-[#0F172A] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      isOnline ? 'bg-[#22C55E]/20' : 'bg-[#EF4444]/20'
                    }`}
                  >
                    <Signal
                      className={`h-6 w-6 ${isOnline ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-[#F8FAFC]">Connection Status</p>
                    <p
                      className={`text-sm font-medium ${
                        isOnline ? 'text-[#22C55E]' : 'text-[#EF4444]'
                      }`}
                    >
                      {isOnline ? 'Back Online!' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div
                  className={`h-3 w-3 rounded-full ${
                    isOnline ? 'animate-pulse bg-[#22C55E]' : 'bg-[#EF4444]'
                  }`}
                />
              </div>
            </div>

            {/* What You Can Do */}
            <div className="mb-8 space-y-4">
              <h3 className="text-center text-lg font-semibold text-[#F8FAFC]">
                What you can try:
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-xl border border-[#1E293B] bg-[#1E293B]/30 p-4 transition-colors hover:bg-[#1E293B]/50">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#22C55E]/20">
                    <CloudOff className="h-4 w-4 text-[#22C55E]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#F8FAFC]">Check WiFi</p>
                    <p className="text-sm text-[#94A3B8]">Ensure WiFi is enabled</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-[#1E293B] bg-[#1E293B]/30 p-4 transition-colors hover:bg-[#1E293B]/50">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#22C55E]/20">
                    <Signal className="h-4 w-4 text-[#22C55E]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#F8FAFC]">Mobile Data</p>
                    <p className="text-sm text-[#94A3B8]">Try switching networks</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={handleRetry}
                disabled={isChecking}
                className="group flex-1 rounded-xl bg-gradient-to-r from-[#15803D] to-[#22C55E] py-6 text-base font-semibold text-white shadow-lg shadow-[#15803D]/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#15803D]/40"
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 transition-transform group-hover:rotate-180" />
                    Try Again
                  </>
                )}
              </Button>
              <Link href="/" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-2 border-[#1E293B] bg-transparent py-6 text-base font-semibold text-[#F8FAFC] transition-all hover:border-[#22C55E]/40 hover:bg-[#1E293B]/50"
                >
                  <Home className="mr-2 h-5 w-5" />
                  Go Home
                </Button>
              </Link>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="mt-8 text-center">
            <div className="mb-4 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-[#64748B]">
                <Tractor className="h-5 w-5" />
                <span className="text-sm font-medium">Equipment Rentals</span>
              </div>
              <div className="h-4 w-px bg-[#1E293B]" />
              <div className="flex items-center gap-2 text-[#64748B]">
                <Wrench className="h-5 w-5" />
                <span className="text-sm font-medium">Labour Booking</span>
              </div>
            </div>
            <p className="text-sm text-[#475569]">
              Your trusted platform for agricultural equipment and skilled labour
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
