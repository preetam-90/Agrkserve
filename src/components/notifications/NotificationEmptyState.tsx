/* eslint-disable */
'use client';

import { memo } from 'react';
import { Search, EyeOff, Archive, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationEmptyStateProps {
  searchQuery: string;
  activeTab: 'all' | 'unread' | 'read';
  onClearSearch: () => void;
}

export const NotificationEmptyState = memo(function NotificationEmptyState({
  searchQuery,
  activeTab,
  onClearSearch,
}: NotificationEmptyStateProps) {
  const getIcon = () => {
    if (searchQuery) return Search;
    if (activeTab === 'unread') return EyeOff;
    if (activeTab === 'read') return Archive;
    return Inbox;
  };

  const getTitle = () => {
    if (searchQuery) return 'No matching notifications';
    if (activeTab === 'unread') return "You've read everything! 🎉";
    if (activeTab === 'read') return 'No read notifications yet';
    return 'No notifications yet';
  };

  const getDescription = () => {
    if (searchQuery) return 'Try adjusting your search terms or filters';
    if (activeTab === 'unread') return 'Great job staying on top of your notifications!';
    if (activeTab === 'read') return 'Read notifications will appear here';
    return "We'll notify you when something important happens";
  };

  const Icon = getIcon();

  return (
    <div className="flex h-96 flex-col items-center justify-center gap-8 p-8">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-slate-600/20 blur-3xl" />
        <div className="relative rounded-2xl bg-slate-800/50 p-8 ring-1 ring-white/10">
          // eslint-disable-next-line render
          <Icon className="h-16 w-16 text-slate-400" />
        </div>
      </div>
      <div className="space-y-3 text-center">
        <p className="text-xl font-bold text-white">{getTitle()}</p>
        <p className="max-w-md text-slate-400">{getDescription()}</p>
      </div>
      {searchQuery && (
        <Button
          variant="outline"
          onClick={onClearSearch}
          className="cursor-pointer border-slate-600/50 bg-slate-800/50 text-slate-200 ring-1 ring-white/10 hover:bg-slate-700/60 hover:text-white"
        >
          Clear Search
        </Button>
      )}
    </div>
  );
});
