'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface NotificationsSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const NotificationsSearch = memo(function NotificationsSearch({
  value,
  onChange,
}: NotificationsSearchProps) {
  const [localValue, setLocalValue] = useState(value);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  // Sync with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange('');
  }, [onChange]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="group relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-slate-400 transition-colors duration-200 group-focus-within:text-blue-400" />
          <Input
            placeholder="Search notifications..."
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className="h-12 rounded-xl border-slate-700/50 bg-slate-900/60 pl-12 text-white ring-1 ring-white/5 backdrop-blur-sm placeholder:text-slate-400 focus:border-blue-500/50 focus:ring-blue-500/20 focus:ring-white/10"
            aria-label="Search notifications"
          />
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-emerald-500/5 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100" />
        </div>

        {localValue && (
          <Button
            variant="outline"
            onClick={handleClear}
            className="h-12 cursor-pointer border-slate-600/50 bg-slate-800/50 text-slate-200 ring-1 ring-white/10 backdrop-blur-sm hover:border-slate-500/60 hover:bg-slate-700/60 hover:text-white"
            aria-label="Clear search"
          >
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
});
