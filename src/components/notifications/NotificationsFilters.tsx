'use client';

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { NotificationFilters as FilterType } from '@/lib/types/notifications';
import { NotificationFilters } from './notification-filters';

interface NotificationsFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
}

const NotificationsFiltersPanel = memo(function NotificationsFiltersPanel({
  filters,
  onFiltersChange,
}: NotificationsFiltersProps) {
  return (
    <Card className="border-slate-700/50 bg-slate-900/60 shadow-xl ring-1 ring-white/5 backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="flex flex-col items-start gap-6 p-6 sm:flex-row sm:items-center">
          <NotificationFilters filters={filters} onFiltersChange={onFiltersChange} />
        </div>
      </CardContent>
    </Card>
  );
});
