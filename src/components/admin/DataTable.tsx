'use client';

import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DataItem = Record<string, any>;

interface Column {
  key: string;
  label: string;
  render?: (item: DataItem) => React.ReactNode;
  sortable?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconComponent = React.ComponentType<any>;

interface Action {
  label: string | ((item: DataItem) => string);
  onClick: (item: DataItem) => void;
  icon?: IconComponent | ((item: DataItem) => IconComponent);
  danger?: boolean | ((item: DataItem) => boolean);
}

interface DataTableProps {
  columns: Column[];
  data: DataItem[];
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
  searchPlaceholder = 'Search...',
  pagination,
}: DataTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    null
  );
  const [activeRowMenu, setActiveRowMenu] = useState<string | null>(null);

  const handleExport = () => {
    const headers = columns.map((col) => col.label).join(',');
    const rows = data
      .map((item) =>
        columns
          .map((col) => {
            const value = col.render
              ? String(col.render(item)).replace(/,/g, ';')
              : String(item[col.key] ?? '');
            return `"${value}"`;
          })
          .join(',')
      )
      .join('\n');

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

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
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedData = getSortedData();

  return (
    <div className="space-y-4">
      {/* Toolkit Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        {onSearch && (
          <div className="group relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-green-500" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        )}

        <div className={`flex gap-2 ${!onSearch ? 'ml-auto' : ''}`}>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="glass-panel relative min-h-[400px] overflow-hidden rounded-2xl">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ${col.sortable ? 'cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-800' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      {col.sortable && (
                        <div className="flex flex-col">
                          {sortConfig?.key === col.key ? (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUp className="h-3 w-3 text-green-500" />
                            ) : (
                              <ArrowDown className="h-3 w-3 text-green-500" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 text-slate-300" />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                {actions && <th className="w-10 px-6 py-4"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="px-6 py-12 text-center text-slate-500"
                  >
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
                    className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300"
                      >
                        {col.render ? col.render(item) : item[col.key]}
                      </td>
                    ))}
                    {actions && (
                      <td className="relative px-6 py-4">
                        <button
                          onClick={() =>
                            setActiveRowMenu(activeRowMenu === item.id ? null : item.id)
                          }
                          className="rounded-lg p-1.5 text-slate-400 opacity-0 transition-colors hover:bg-slate-200 hover:text-slate-600 focus:opacity-100 group-hover:opacity-100 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                        >
                          <MoreHorizontal className="h-4 w-4" />
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
                                className="absolute right-12 top-2 z-20 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-800 dark:bg-slate-900"
                              >
                                {actions.map((action, i) => {
                                  const label =
                                    typeof action.label === 'function'
                                      ? action.label(item)
                                      : action.label;
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  const iconProp = action.icon as any;
                                  const Icon: IconComponent | undefined =
                                    typeof iconProp === 'function' &&
                                    !(iconProp.$$typeof || iconProp.prototype?.isReactComponent)
                                      ? iconProp(item)
                                      : iconProp;
                                  const isDanger =
                                    typeof action.danger === 'function'
                                      ? action.danger(item)
                                      : action.danger;

                                  return (
                                    <button
                                      key={i}
                                      onClick={() => {
                                        action.onClick(item);
                                        setActiveRowMenu(null);
                                      }}
                                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                        isDanger
                                          ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                                      }`}
                                    >
                                      {Icon && <Icon className="h-4 w-4" />}
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
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
            <span className="text-sm text-slate-500">
              Showing {Math.min((pagination.currentPage - 1) * 10 + 1, pagination.totalItems)} to{' '}
              {Math.min(pagination.currentPage * 10, pagination.totalItems)} of{' '}
              {pagination.totalItems} entries
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="rounded-lg border border-slate-200 p-2 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - pagination.currentPage) <= 2)
                .map((page) => (
                  <button
                    key={page}
                    onClick={() => pagination.onPageChange(page)}
                    className={`h-8 min-w-[2rem] rounded-lg text-sm font-medium transition-colors ${
                      page === pagination.currentPage
                        ? 'bg-green-600 text-white shadow-md shadow-green-500/30'
                        : 'text-slate-600 hover:bg-white dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="rounded-lg border border-slate-200 p-2 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
