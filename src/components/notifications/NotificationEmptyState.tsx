'use client';

import { memo } from 'react';
import { Search, EyeOff, Archive, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationEmptyStateProps {
  searchQuery: string;
  activeTab: 'all' | 'unread' | 'read';
  onClearSearch: () => void;
}

export const NotificationEmptyState = memo(function NotificationEmptyState({ searchQuery, activeTab, onClearSearch }: NotificationEmptyStateProps) {
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
        <div className="absolute inset-0 bg-slate-600/20 rounded-full blur-3xl" />
        <div className="relative p-8 bg-slate-800/50 rounded-2xl ring-1 ring-white/10">
          <Icon className="h-16 w-16 text-slate-400" />
        </div>
      </div>
      <div className="text-center space-y-3">
        <p className="text-white font-bold text-xl">
          {getTitle()}
        </p>
        <p className="text-slate-400 max-w-md">
          {getDescription()}
        </p>
      </div>
      {searchQuery && (
        <Button
          variant="outline"
          onClick={onClearSearch}
          className="bg-slate-800/50 hover:bg-slate-700/60 border-slate-600/50 text-slate-200 hover:text-white cursor-pointer ring-1 ring-white/10"
        >
          Clear Search
        </Button>
      )}
    </div>
  );
});
