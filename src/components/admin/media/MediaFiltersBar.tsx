'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  Image as ImageIcon,
  Film,
  Calendar,
  User,
} from 'lucide-react';
import type { MediaFilters, MediaType } from '@/lib/types/cloudinary-admin';

interface MediaFiltersProps {
  filters: MediaFilters;
  onFiltersChange: (filters: MediaFilters) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  users: { userId: string; userName?: string }[];
}

export function MediaFiltersBar({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  users,
}: MediaFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value, page: 1 });
  };

  const handleResourceTypeChange = (value: MediaType | 'all') => {
    onFiltersChange({ ...filters, resourceType: value, page: 1 });
  };

  const handleUserChange = (value: string) => {
    onFiltersChange({ ...filters, userId: value || undefined, page: 1 });
  };

  const handleDateChange = (field: 'dateFrom' | 'dateTo', value: string) => {
    onFiltersChange({ ...filters, [field]: value || undefined, page: 1 });
  };

  const handleSortChange = (sortBy: MediaFilters['sortBy']) => {
    onFiltersChange({ ...filters, sortBy, page: 1 });
  };

  const handleSortOrderChange = () => {
    onFiltersChange({
      ...filters,
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1,
    });
  };

  return (
    <div className="space-y-4">
      {/* Main Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by public ID or tags..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-xl border border-[#262626] bg-[#1a1a1a] py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
        </div>

        {/* Resource Type Filter */}
        <div className="relative">
          <select
            value={filters.resourceType || 'all'}
            onChange={(e) => handleResourceTypeChange(e.target.value as MediaType | 'all')}
            className="appearance-none rounded-xl border border-[#262626] bg-[#1a1a1a] py-2.5 pl-10 pr-10 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
            {filters.resourceType === 'video' ? (
              <Film className="h-4 w-4" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
          </div>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        </div>

        {/* User Filter */}
        <div className="relative">
          <select
            value={filters.userId || ''}
            onChange={(e) => handleUserChange(e.target.value)}
            className="appearance-none rounded-xl border border-[#262626] bg-[#1a1a1a] py-2.5 pl-10 pr-10 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          >
            <option value="">All Users</option>
            {users.map((user) => (
              <option key={user.userId} value={user.userId}>
                {user.userName || user.userId.slice(0, 8)}...
              </option>
            ))}
          </select>
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <select
            value={filters.sortBy || 'created_at'}
            onChange={(e) => handleSortChange(e.target.value as MediaFilters['sortBy'])}
            className="appearance-none rounded-xl border border-[#262626] bg-[#1a1a1a] py-2.5 pl-4 pr-10 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          >
            <option value="created_at">Upload Date</option>
            <option value="bytes">File Size</option>
            <option value="public_id">Name</option>
          </select>
          <button
            onClick={handleSortOrderChange}
            className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-2.5 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
            title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            <svg
              className={`h-4 w-4 transition-transform ${filters.sortOrder === 'asc' ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center rounded-xl border border-[#262626] bg-[#1a1a1a] p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`rounded-lg p-2 transition-colors ${
              viewMode === 'grid'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            className={`rounded-lg p-2 transition-colors ${
              viewMode === 'table'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
            showAdvanced
              ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
              : 'border-[#262626] bg-[#1a1a1a] text-neutral-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Filter className="h-4 w-4" />
          Advanced
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-wrap items-center gap-3 rounded-xl border border-[#262626] bg-[#1a1a1a] p-4"
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-neutral-500" />
            <span className="text-sm text-neutral-400">Date Range:</span>
          </div>
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => handleDateChange('dateFrom', e.target.value)}
            className="rounded-lg border border-[#262626] bg-[#0f0f0f] px-3 py-2 text-sm text-white focus:border-emerald-500/50 focus:outline-none"
          />
          <span className="text-neutral-500">to</span>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => handleDateChange('dateTo', e.target.value)}
            className="rounded-lg border border-[#262626] bg-[#0f0f0f] px-3 py-2 text-sm text-white focus:border-emerald-500/50 focus:outline-none"
          />
        </motion.div>
      )}
    </div>
  );
}
