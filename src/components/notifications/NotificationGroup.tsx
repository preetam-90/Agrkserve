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

export const NotificationGroup = memo(function NotificationGroup({ group, onMarkRead, onDelete }: NotificationGroupProps) {
  return (
    <div key={group.label} className="relative">
      {/* Enhanced Dark Group Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/30 px-6 py-4">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            {group.label}
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-slate-600 via-slate-700 to-transparent" />
          <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700">
            {group.notifications.length}
          </Badge>
        </div>
      </div>

      {/* Enhanced Dark Notifications */}
      <div className="divide-y divide-slate-800/50" role="list" aria-label={`${group.label} notifications`}>
        {group.notifications.map((notification) => (
          <div key={notification.id} className="hover:bg-slate-800/30 transition-colors duration-300" role="listitem">
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
