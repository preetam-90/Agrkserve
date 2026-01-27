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
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search Input */}
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={placeholder}
                    className="admin-input pl-10"
                />
            </div>

            {/* Filters */}
            {filters.map((filter) => (
                <div key={filter.label} className="relative">
                    <select
                        value={filter.value}
                        onChange={(e) => filter.onChange(e.target.value)}
                        className="admin-select pr-8"
                    >
                        {filter.options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                </div>
            ))}

            {/* Actions */}
            {actions && <div className="flex gap-2">{actions}</div>}
        </div>
    );
}
