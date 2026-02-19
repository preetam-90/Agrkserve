'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Activity, ShieldAlert, Terminal, Plus, Trash2, Edit } from 'lucide-react';
import { ITEMS_PER_PAGE } from '@/lib/utils/admin-constants';
import DataTable from '@/components/admin/DataTable';

interface AuditLog {
  id?: string;
  action?: string;
  entity_type?: string;
  user_id?: string;
  ip_address?: string;
  user?: {
    name?: string;
  };
  created_at?: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const supabase = createClient();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase.from('audit_logs').select('*');

      if (search) {
        query = query.or(`action.ilike.%${search}%,entity_type.ilike.%${search}%`);
      }

      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      if (error) throw error;

      setLogs(data || []);
      setTotalCount(count || 0);
    } catch (err: unknown) {
      const error = err as { message?: string; details?: unknown; hint?: string };
      console.error('Error fetching logs:', error.message || err);
      if (error.details) console.error('Details:', error.details);
      if (error.hint) console.error('Hint:', error.hint);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
     
  }, [search, currentPage]);

   
  const _getActionIcon = (action: string) => {
    if (action.includes('CREATE')) return <Plus className="h-3.5 w-3.5 text-green-500" />;
    if (action.includes('DELETE')) return <Trash2 className="h-3.5 w-3.5 text-red-500" />;
    if (action.includes('UPDATE')) return <Edit className="h-3.5 w-3.5 text-blue-500" />;
    return <Activity className="h-3.5 w-3.5 text-slate-400" />;
  };

  const columns = [
    {
      key: 'action',
      label: 'Action',
      render: (item: unknown) => {
        const log = item as AuditLog;
        return (
          <div className="flex items-center gap-3">
            <div
              className={`rounded-lg p-2 ${
                log.action?.includes('SYSTEM')
                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'
                  : log.action?.includes('DELETE')
                    ? 'bg-red-50 text-red-600 dark:bg-red-900/20'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-tight text-slate-900 dark:text-white">
                {log.action}
              </p>
              <p className="text-[10px] font-medium uppercase text-slate-500">{log.entity_type}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'user',
      label: 'Initiator',
      render: (item: unknown) => {
        const log = item as AuditLog;
        return (
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 dark:bg-slate-800">
              {log.user?.name?.charAt(0) || log.user_id?.charAt(0) || 'S'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {log.user?.name || log.user_id || 'System'}
              </span>
              <span className="text-[10px] text-slate-400">{log.ip_address || '0.0.0.0'}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'timestamp',
      label: 'Time',
      render: (item: unknown) => {
        const log = item as AuditLog;
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {log.created_at ? new Date(log.created_at).toLocaleDateString() : 'Unknown'}
            </span>
            <span className="text-[10px] text-slate-400">
              {log.created_at ? new Date(log.created_at).toLocaleTimeString() : ''}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Audit Logs
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Track every action across the platform.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 dark:border-amber-900/30 dark:bg-amber-900/10">
          <ShieldAlert className="h-4 w-4 text-amber-600" />
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-500">
            Immutable Record
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="glass-card rounded-2xl p-6">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">
            Total Logs
          </p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{totalCount}</h3>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">
            Security Events
          </p>
          <h3 className="text-3xl font-bold text-red-500">0</h3>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        isLoading={loading}
        onSearch={setSearch}
        searchPlaceholder="Search by action or entity..."
        pagination={{
          currentPage,
          totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
          onPageChange: setCurrentPage,
          totalItems: totalCount,
        }}
      />
    </div>
  );
}
