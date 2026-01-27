'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Activity,
    Search,
    Filter,
    Clock,
    User as UserIcon,
    ShieldAlert,
    Settings,
    Database,
    Terminal,
    Plus,
    Trash2,
    Edit
} from 'lucide-react';
import { ITEMS_PER_PAGE } from '@/lib/utils/admin-constants';
import DataTable from '@/components/admin/DataTable';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const supabase = createClient();

    const fetchLogs = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('audit_logs')
                .select('*');

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
        } catch (error: any) {
            console.error('Error fetching logs:', error.message || error);
            if (error.details) console.error('Details:', error.details);
            if (error.hint) console.error('Hint:', error.hint);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [search, currentPage]);

    const getActionIcon = (action: string) => {
        if (action.includes('CREATE')) return <Plus className="w-3.5 h-3.5 text-green-500" />;
        if (action.includes('DELETE')) return <Trash2 className="w-3.5 h-3.5 text-red-500" />;
        if (action.includes('UPDATE')) return <Edit className="w-3.5 h-3.5 text-blue-500" />;
        return <Activity className="w-3.5 h-3.5 text-slate-400" />;
    };

    const columns = [
        {
            key: 'action',
            label: 'Action',
            render: (log: any) => (
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${log.action.includes('SYSTEM') ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' :
                        log.action.includes('DELETE') ? 'bg-red-50 dark:bg-red-900/20 text-red-600' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                        <Terminal className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="font-mono text-xs font-bold uppercase tracking-tight text-slate-900 dark:text-white">{log.action}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-medium">{log.entity_type}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'user',
            label: 'Initiator',
            render: (log: any) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {log.user?.name?.charAt(0) || log.user_id?.charAt(0) || 'S'}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{log.user?.name || log.user_id || 'System'}</span>
                        <span className="text-[10px] text-slate-400">{log.ip_address || '0.0.0.0'}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'details',
            label: 'Details',
            render: (log: any) => (
                <div className="max-w-xs overflow-hidden">
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate font-mono bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded border border-slate-200/50 dark:border-slate-700/50">
                        {JSON.stringify(log.details)}
                    </p>
                </div>
            )
        },
        {
            key: 'created_at',
            label: 'Timestamp',
            sortable: true,
            render: (log: any) => (
                <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">{new Date(log.created_at).toLocaleString()}</span>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Audit Logs</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track every action across the platform.</p>
                </div>
                <div className="flex items-center gap-2 border border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10 px-4 py-2 rounded-xl">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-500 uppercase tracking-wider">Immutable Record</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 rounded-2xl">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Logs</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{totalCount}</h3>
                </div>
                <div className="glass-card p-6 rounded-2xl">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Security Events</p>
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
                    totalItems: totalCount
                }}
            />
        </div>
    );
}
