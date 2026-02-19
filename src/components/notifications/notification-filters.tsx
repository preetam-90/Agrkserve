'use client';

import type {
  NotificationFilters as FilterType,
  NotificationCategory,
  NotificationPriority,
} from '@/lib/types/notifications';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Eye, CheckCircle, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="flex flex-col items-start gap-6 p-6 sm:flex-row sm:items-center">
      {/* Header */}
      <div className="flex flex-1 items-center justify-between">
        <h4 className="text-lg font-bold text-white">Filter Notifications</h4>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-auto cursor-pointer p-0 text-sm text-blue-400 transition-colors hover:text-blue-300"
          >
            Clear all
          </Button>
        )}
      </div>

      <Separator className="bg-slate-700/50" />

      {/* Read Status */}
      <div className="space-y-4">
        <Label className="text-sm font-bold uppercase tracking-wide text-slate-300">Status</Label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'all', label: 'All', icon: Inbox },
            { value: 'unread', label: 'Unread', icon: Eye },
            { value: 'read', label: 'Read', icon: CheckCircle },
          ].map((status) => {
            const Icon = status.icon;
            const isActive =
              (status.value === 'all' && filters.is_read === undefined) ||
              (status.value === 'read' && filters.is_read === true) ||
              (status.value === 'unread' && filters.is_read === false);

            return (
              <Button
                key={status.value}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleReadStatus(status.value as 'read' | 'unread' | 'all')}
                className={cn(
                  'h-12 flex-1 cursor-pointer text-sm font-semibold transition-all duration-300',
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/30 hover:from-blue-700 hover:to-blue-600'
                    : 'border-slate-600/50 bg-slate-800/60 text-slate-300 ring-1 ring-white/10 hover:border-slate-500/60 hover:bg-slate-700/70 hover:text-white'
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                {status.label}
              </Button>
            );
          })}
        </div>
      </div>

      <Separator className="bg-slate-700/50" />

      {/* Categories */}
      <div className="space-y-4">
        <Label className="text-sm font-bold uppercase tracking-wide text-slate-300">
          Categories
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((category) => (
            <div
              key={category.value}
              className="flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors hover:bg-slate-800/50"
              onClick={() => toggleCategory(category.value)}
            >
              <Checkbox
                id={`category-${category.value}`}
                checked={filters.category?.includes(category.value)}
                onCheckedChange={() => toggleCategory(category.value)}
                className="border-slate-600 ring-1 ring-white/10 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-600"
              />
              <Label
                htmlFor={`category-${category.value}`}
                className="flex-1 cursor-pointer text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                {category.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-slate-700/50" />

      {/* Priority */}
      <div className="space-y-4">
        <Label className="text-sm font-bold uppercase tracking-wide text-slate-300">Priority</Label>
        <div className="space-y-3">
          {PRIORITIES.map((priority) => (
            <div
              key={priority.value}
              className="flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors hover:bg-slate-800/50"
              onClick={() => togglePriority(priority.value)}
            >
              <Checkbox
                id={`priority-${priority.value}`}
                checked={filters.priority?.includes(priority.value)}
                onCheckedChange={() => togglePriority(priority.value)}
                className="border-slate-600 ring-1 ring-white/10 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-600"
              />
              <div className="flex flex-1 items-center gap-3">
                <div
                  className={`h-4 w-4 rounded-full ${priority.color} shadow-lg ring-2 ring-slate-900`}
                />
                <Label
                  htmlFor={`priority-${priority.value}`}
                  className="cursor-pointer text-sm font-medium text-slate-300 transition-colors hover:text-white"
                >
                  {priority.label}
                </Label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
