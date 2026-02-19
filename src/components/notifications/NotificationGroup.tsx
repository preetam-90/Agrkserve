'use client';

import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import type { NotificationGroup as NotificationGroupType } from '@/lib/types/notifications';
import { NotificationItem } from './notification-item';

interface NotificationGroupProps {
  group: NotificationGroupType;
  onMarkRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const NotificationGroup = memo(function NotificationGroup({
  group,
  onMarkRead,
  onDelete,
}: NotificationGroupProps) {
  return (
    <div key={group.label} className="relative">
      {/* Enhanced Dark Group Header */}
      <div className="sticky top-0 z-10 border-b border-slate-700/30 bg-slate-900/95 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            {group.label}
          </h3>
          <div className="h-px flex-1 bg-gradient-to-r from-slate-600 via-slate-700 to-transparent" />
          <Badge variant="secondary" className="border-slate-700 bg-slate-800 text-slate-300">
            {group.notifications.length}
          </Badge>
        </div>
      </div>

      {/* Enhanced Dark Notifications */}
      <div
        className="divide-y divide-slate-800/50"
        role="list"
        aria-label={`${group.label} notifications`}
      >
        {group.notifications.map((notification) => (
          <div
            key={notification.id}
            className="transition-colors duration-300 hover:bg-slate-800/30"
            role="listitem"
          >
            <NotificationItem
              notification={notification}
              onMarkRead={onMarkRead}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
});
