'use client';

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { NotificationFilters as FilterType } from '@/lib/types/notifications';
import { NotificationFilters } from './notification-filters';

interface NotificationsFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
}

export const NotificationsFiltersPanel = memo(function NotificationsFiltersPanel({ filters, onFiltersChange }: NotificationsFiltersProps) {
  return (
    <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700/50 shadow-xl ring-1 ring-white/5">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6">
          <NotificationFilters filters={filters} onFiltersChange={onFiltersChange} />
        </div>
      </CardContent>
    </Card>
  );
});
