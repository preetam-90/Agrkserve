'use client';

import { memo } from 'react';
import { Bell, Settings, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface NotificationsHeaderProps {
  unreadCount: number;
  showFilters: boolean;
  onToggleFilters: () => void;
}

const NotificationsHeader = memo(function NotificationsHeader({
  unreadCount,
  showFilters,
  onToggleFilters,
}: NotificationsHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-700/50 bg-slate-900/40 shadow-2xl shadow-blue-500/10 backdrop-blur-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-slate-800/20 to-emerald-600/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700/20 via-transparent to-transparent" />
      <div className="relative p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="group relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 to-emerald-500 opacity-75 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-emerald-500 p-4 shadow-2xl ring-1 ring-white/20">
                  <Bell className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                {unreadCount > 0 && (
                  <div className="absolute -right-2 -top-2 flex h-7 w-7 animate-bounce items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-xs font-bold text-white shadow-lg ring-2 ring-slate-900">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-white via-blue-100 to-emerald-100 bg-clip-text text-5xl font-bold text-transparent drop-shadow-sm">
                  Notifications
                </h1>
                <p className="mt-2 text-lg font-medium text-slate-300">
                  Stay updated with all your activities and messages
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/notifications/preferences">
              <Button
                variant="outline"
                className="cursor-pointer border-slate-600/50 bg-slate-800/50 text-slate-200 ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/60 hover:bg-slate-700/60 hover:text-white hover:shadow-lg hover:shadow-blue-500/20"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={onToggleFilters}
              className={`cursor-pointer border-slate-600/50 bg-slate-800/50 text-slate-200 ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/60 hover:bg-slate-700/60 hover:text-white hover:shadow-lg ${
                showFilters
                  ? 'border-blue-500/50 bg-blue-900/50 text-blue-300 shadow-blue-500/20'
                  : ''
              }`}
              aria-pressed={showFilters}
              aria-label={`${showFilters ? 'Hide' : 'Show'} filters`}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
