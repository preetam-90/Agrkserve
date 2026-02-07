import React from 'react';

function Pulse({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-800/50 ${className}`} />;
}

// ── Renter Dashboard Skeleton ──
export function RenterDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-900/40 to-emerald-900/40 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <Pulse className="h-8 w-64" />
            <Pulse className="h-4 w-48" />
          </div>
          <Pulse className="h-10 w-40 rounded-full" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-3">
                <Pulse className="h-3 w-20" />
                <Pulse className="h-7 w-12" />
              </div>
              <Pulse className="h-10 w-10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Search bar */}
      <Pulse className="h-12 w-full rounded-xl" />

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/50 p-4"
          >
            <Pulse className="h-10 w-10 rounded-lg" />
            <Pulse className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Pulse className="h-6 w-40" />
          <Pulse className="h-4 w-16" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/50 p-4"
            >
              <Pulse className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Pulse className="h-4 w-48" />
                <Pulse className="h-3 w-32" />
              </div>
              <Pulse className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Equipment grid */}
      <div className="space-y-4">
        <Pulse className="h-6 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50"
            >
              <Pulse className="h-40 w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Pulse className="h-4 w-32" />
                <Pulse className="h-3 w-24" />
                <Pulse className="h-5 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Provider Dashboard Skeleton ──
export function ProviderDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <Pulse className="h-8 w-72" />
            <Pulse className="h-4 w-56" />
          </div>
          <div className="flex gap-3">
            <Pulse className="h-10 w-36 rounded-full" />
            <Pulse className="h-10 w-36 rounded-full" />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-3">
                <Pulse className="h-3 w-24" />
                <Pulse className="h-7 w-12" />
                <Pulse className="h-3 w-16" />
              </div>
              <Pulse className="h-10 w-10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Pending equipment requests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Pulse className="h-6 w-52" />
          <Pulse className="h-4 w-16" />
        </div>
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/50 p-4"
            >
              <Pulse className="h-14 w-14 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Pulse className="h-4 w-40" />
                <Pulse className="h-3 w-32" />
                <Pulse className="h-3 w-24" />
              </div>
              <div className="flex gap-2">
                <Pulse className="h-8 w-20 rounded-lg" />
                <Pulse className="h-8 w-20 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending labour requests */}
      <div className="space-y-4">
        <Pulse className="h-6 w-48" />
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/50 p-4"
            >
              <Pulse className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Pulse className="h-4 w-36" />
                <Pulse className="h-3 w-28" />
              </div>
              <div className="flex gap-2">
                <Pulse className="h-8 w-20 rounded-lg" />
                <Pulse className="h-8 w-20 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My equipment grid */}
      <div className="space-y-4">
        <Pulse className="h-6 w-36" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50"
            >
              <Pulse className="h-40 w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Pulse className="h-4 w-32" />
                <Pulse className="h-3 w-20" />
                <Pulse className="h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/50 p-6"
          >
            <Pulse className="h-12 w-12 rounded-xl" />
            <Pulse className="h-4 w-20" />
            <Pulse className="h-3 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Labour Dashboard Skeleton ──
export function LabourDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-900/40 to-amber-900/40 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <Pulse className="h-8 w-64" />
            <Pulse className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-3">
            <Pulse className="h-6 w-24 rounded-full" />
            <Pulse className="h-10 w-36 rounded-full" />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-3">
                <Pulse className="h-3 w-20" />
                <Pulse className="h-7 w-12" />
              </div>
              <Pulse className="h-10 w-10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Pending jobs */}
      <div className="space-y-4">
        <Pulse className="h-6 w-32" />
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/50 p-4"
            >
              <Pulse className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Pulse className="h-4 w-44" />
                <Pulse className="h-3 w-32" />
                <Pulse className="h-3 w-24" />
              </div>
              <div className="flex gap-2">
                <Pulse className="h-8 w-20 rounded-lg" />
                <Pulse className="h-8 w-20 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming jobs */}
      <div className="space-y-4">
        <Pulse className="h-6 w-36" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/50 p-4"
            >
              <Pulse className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Pulse className="h-4 w-40" />
                <Pulse className="h-3 w-28" />
              </div>
              <Pulse className="h-6 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/50 p-6"
          >
            <Pulse className="h-12 w-12 rounded-xl" />
            <Pulse className="h-4 w-20" />
            <Pulse className="h-3 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Generic fallback
export function DashboardSkeleton() {
  return <RenterDashboardSkeleton />;
}
