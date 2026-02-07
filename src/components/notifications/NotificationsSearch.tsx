'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface NotificationsSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const NotificationsSearch = memo(function NotificationsSearch({ value, onChange }: NotificationsSearchProps) {
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
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors duration-200" />
          <Input
            placeholder="Search notifications..."
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className="pl-12 h-12 bg-slate-900/60 backdrop-blur-sm border-slate-700/50 focus:border-blue-500/50 focus:ring-blue-500/20 text-white placeholder:text-slate-400 ring-1 ring-white/5 focus:ring-white/10 rounded-xl"
            aria-label="Search notifications"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-emerald-500/5 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        {localValue && (
          <Button
            variant="outline"
            onClick={handleClear}
            className="bg-slate-800/50 hover:bg-slate-700/60 border-slate-600/50 hover:border-slate-500/60 text-slate-200 hover:text-white backdrop-blur-sm cursor-pointer ring-1 ring-white/10 h-12"
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
