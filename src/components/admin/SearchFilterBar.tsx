'use client';

import { Search, Filter } from 'lucide-react';

interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filters?: {
    label: string;
    value: string;
    options: { label: string; value: string }[];
    onChange: (value: string) => void;
  }[];
  actions?: React.ReactNode;
}

export default function SearchFilterBar({
  searchValue,
  onSearchChange,
  placeholder = 'Search...',
  filters = [],
  actions,
}: SearchFilterBarProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-[#262626] bg-[#1a1a1a] px-4 py-3 pl-10 text-white outline-none transition-all placeholder:text-neutral-600 hover:bg-[#1f1f1f] focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      {/* Filters */}
      {filters.map((filter) => (
        <div key={filter.label} className="relative">
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-[#262626] bg-[#1a1a1a] px-4 py-3 pr-10 text-white outline-none transition-all hover:bg-[#1f1f1f] focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#1a1a1a] text-white">
                {option.label}
              </option>
            ))}
          </select>
          <Filter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        </div>
      ))}

      {/* Actions */}
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
