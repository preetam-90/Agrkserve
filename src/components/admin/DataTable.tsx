'use client';

import { useState } from 'react';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Filter,
    Search,
    Download,
    MoreHorizontal,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Column {
    key: string;
    label: string;
    render?: (item: any) => React.ReactNode;
    sortable?: boolean;
}

interface Action {
    label: string | ((item: any) => string);
    onClick: (item: any) => void;
    icon?: any | ((item: any) => any);
    danger?: boolean | ((item: any) => boolean);
}

interface DataTableProps {
    columns: Column[];
    data: any[];
    actions?: Action[];
    isLoading?: boolean;
    onSearch?: (query: string) => void;
    searchPlaceholder?: string;
    pagination?: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
        totalItems: number;
    };
}

export default function DataTable({
    columns,
    data,
    actions,
    isLoading,
    onSearch,
    searchPlaceholder = "Search...",
    pagination
}: DataTableProps) {
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [activeRowMenu, setActiveRowMenu] = useState<string | null>(null);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortedData = () => {
        if (!sortConfig) return data;
        return [...data].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const sortedData = getSortedData();

    return (
        <div className="space-y-4">
            {/* Toolkit Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        onChange={(e) => onSearch?.(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 outline-none transition-all"
                    />
                </div>

                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="glass-panel overflow-hidden rounded-2xl relative min-h-[400px]">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-20">
                        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        onClick={() => col.sortable && handleSort(col.key)}
                                        className={`px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors' : ''}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {col.label}
                                            {col.sortable && (
                                                <div className="flex flex-col">
                                                    {sortConfig?.key === col.key ? (
                                                        sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-green-500" /> : <ArrowDown className="w-3 h-3 text-green-500" />
                                                    ) : (
                                                        <ArrowUpDown className="w-3 h-3 text-slate-300" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                ))}
                                {actions && <th className="px-6 py-4 w-10"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {sortedData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center text-slate-500">
                                        No results found
                                    </td>
                                </tr>
                            ) : (
                                sortedData.map((item, idx) => (
                                    <motion.tr
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                                    >
                                        {columns.map((col) => (
                                            <td key={col.key} className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                {col.render ? col.render(item) : item[col.key]}
                                            </td>
                                        ))}
                                        {actions && (
                                            <td className="px-6 py-4 relative">
                                                <button
                                                    onClick={() => setActiveRowMenu(activeRowMenu === item.id ? null : item.id)}
                                                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>

                                                <AnimatePresence>
                                                    {activeRowMenu === item.id && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-10"
                                                                onClick={() => setActiveRowMenu(null)}
                                                            />
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95, x: 10 }}
                                                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                                                exit={{ opacity: 0, scale: 0.95 }}
                                                                className="absolute right-12 top-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-20 overflow-hidden py-1"
                                                            >
                                                                {actions.map((action, i) => {
                                                                    const label = typeof action.label === 'function' ? action.label(item) : action.label;
                                                                    const Icon = typeof action.icon === 'function' ? action.icon(item) : action.icon;
                                                                    const isDanger = typeof action.danger === 'function' ? action.danger(item) : action.danger;

                                                                    return (
                                                                        <button
                                                                            key={i}
                                                                            onClick={() => {
                                                                                action.onClick(item);
                                                                                setActiveRowMenu(null);
                                                                            }}
                                                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isDanger
                                                                                ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                                                }`}
                                                                        >
                                                                            {Icon && <Icon className="w-4 h-4" />}
                                                                            {label}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </motion.div>
                                                        </>
                                                    )}
                                                </AnimatePresence>
                                            </td>
                                        )}
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <span className="text-sm text-slate-500">
                            Showing {Math.min((pagination.currentPage - 1) * 10 + 1, pagination.totalItems)} to {Math.min(pagination.currentPage * 10, pagination.totalItems)} of {pagination.totalItems} entries
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                .filter(p => Math.abs(p - pagination.currentPage) <= 2)
                                .map(page => (
                                    <button
                                        key={page}
                                        onClick={() => pagination.onPageChange(page)}
                                        className={`min-w-[2rem] h-8 rounded-lg text-sm font-medium transition-colors ${page === pagination.currentPage
                                            ? 'bg-green-600 text-white shadow-md shadow-green-500/30'
                                            : 'hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            <button
                                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
