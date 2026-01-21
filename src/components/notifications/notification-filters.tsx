'use client';

import { useState } from 'react';
import type { NotificationFilters as FilterType, NotificationCategory, NotificationPriority } from '@/lib/types/notifications';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NotificationFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
}

const CATEGORIES: { value: NotificationCategory; label: string }[] = [
  { value: 'booking', label: 'Bookings' },
  { value: 'payment', label: 'Payments' },
  { value: 'message', label: 'Messages' },
  { value: 'trust', label: 'Reviews' },
  { value: 'security', label: 'Security' },
  { value: 'insight', label: 'Insights' },
  { value: 'system', label: 'System' },
];

const PRIORITIES: { value: NotificationPriority; label: string; color: string }[] = [
  { value: 'critical', label: 'Critical', color: 'bg-red-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-500' },
  { value: 'low', label: 'Low', color: 'bg-gray-500' },
];

export function NotificationFilters({ filters, onFiltersChange }: NotificationFiltersProps) {
  const [open, setOpen] = useState(false);

  const activeFilterCount =
    (filters.category?.length || 0) +
    (filters.priority?.length || 0) +
    (filters.is_read !== undefined ? 1 : 0);

  const toggleCategory = (category: NotificationCategory) => {
    const current = filters.category || [];
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];

    onFiltersChange({
      ...filters,
      category: updated.length > 0 ? updated : undefined,
    });
  };

  const togglePriority = (priority: NotificationPriority) => {
    const current = filters.priority || [];
    const updated = current.includes(priority)
      ? current.filter((p) => p !== priority)
      : [...current, priority];

    onFiltersChange({
      ...filters,
      priority: updated.length > 0 ? updated : undefined,
    });
  };

  const toggleReadStatus = (status: 'read' | 'unread' | 'all') => {
    onFiltersChange({
      ...filters,
      is_read: status === 'all' ? undefined : status === 'read',
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="h-3.5 w-3.5 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 h-5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-80">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Filter Notifications</h4>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-auto p-0 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>

            <Separator />

            {/* Read Status */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Status
              </Label>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'unread', label: 'Unread' },
                  { value: 'read', label: 'Read' },
                ].map((status) => (
                  <Button
                    key={status.value}
                    variant={
                      (status.value === 'all' && filters.is_read === undefined) ||
                      (status.value === 'read' && filters.is_read === true) ||
                      (status.value === 'unread' && filters.is_read === false)
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      toggleReadStatus(status.value as 'read' | 'unread' | 'all')
                    }
                    className="flex-1 h-8 text-xs"
                  >
                    {status.label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Categories */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Categories
              </Label>
              <div className="space-y-2">
                {CATEGORIES.map((category) => (
                  <div key={category.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`category-${category.value}`}
                      checked={filters.category?.includes(category.value)}
                      onCheckedChange={() => toggleCategory(category.value)}
                    />
                    <Label
                      htmlFor={`category-${category.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Priority
              </Label>
              <div className="space-y-2">
                {PRIORITIES.map((priority) => (
                  <div key={priority.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`priority-${priority.value}`}
                      checked={filters.priority?.includes(priority.value)}
                      onCheckedChange={() => togglePriority(priority.value)}
                    />
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${priority.color}`} />
                      <Label
                        htmlFor={`priority-${priority.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {priority.label}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Badges */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {filters.is_read !== undefined && (
            <Badge variant="secondary" className="gap-1">
              {filters.is_read ? 'Read' : 'Unread'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleReadStatus('all')}
              />
            </Badge>
          )}
          {filters.category?.map((category) => (
            <Badge key={category} variant="secondary" className="gap-1">
              {CATEGORIES.find((c) => c.value === category)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleCategory(category)}
              />
            </Badge>
          ))}
          {filters.priority?.map((priority) => (
            <Badge key={priority} variant="secondary" className="gap-1">
              {PRIORITIES.find((p) => p.value === priority)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => togglePriority(priority)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
