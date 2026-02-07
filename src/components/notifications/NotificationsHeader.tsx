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

export const NotificationsHeader = memo(function NotificationsHeader({ unreadCount, showFilters, onToggleFilters }: NotificationsHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 shadow-2xl shadow-blue-500/10">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-slate-800/20 to-emerald-600/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700/20 via-transparent to-transparent" />
      <div className="relative p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-emerald-500 p-4 rounded-3xl shadow-2xl ring-1 ring-white/20">
                  <Bell className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                {unreadCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-7 w-7 flex items-center justify-center animate-bounce shadow-lg ring-2 ring-slate-900">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-emerald-100 bg-clip-text text-transparent drop-shadow-sm">
                  Notifications
                </h1>
                <p className="text-slate-300 text-lg mt-2 font-medium">
                  Stay updated with all your activities and messages
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/notifications/preferences">
              <Button
                variant="outline"
                className="bg-slate-800/50 hover:bg-slate-700/60 border-slate-600/50 hover:border-slate-500/60 text-slate-200 hover:text-white backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer ring-1 ring-white/10"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={onToggleFilters}
              className={`bg-slate-800/50 hover:bg-slate-700/60 border-slate-600/50 hover:border-slate-500/60 text-slate-200 hover:text-white backdrop-blur-sm transition-all duration-300 hover:shadow-lg cursor-pointer ring-1 ring-white/10 ${
                showFilters 
                  ? 'bg-blue-900/50 border-blue-500/50 text-blue-300 shadow-blue-500/20' 
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
