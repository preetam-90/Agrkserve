'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Database,
    Table,
    Search,
    RefreshCw,
    Code,
    Database as DbIcon,
    Shield,
    Zap,
    Play
} from 'lucide-react';
import { motion } from 'framer-motion';
import DataTable from '@/components/admin/DataTable';

export default function DatabasePage() {
    const [tables, setTables] = useState<any[]>([]);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [tableData, setTableData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    const fetchTables = async () => {
        setLoading(true);
        // Supabase-specific way to list tables via RPC if available, 
        // otherwise we list our core application tables
        const appTables = [
            'user_profiles', 'user_roles', 'equipment',
            'bookings', 'labour_profiles', 'payments',
            'reviews', 'notifications', 'audit_logs'
        ];

        setTables(appTables.map(name => ({ name })));
        if (!selectedTable) setSelectedTable(appTables[0]);
        setLoading(false);
    };

    const fetchTableData = async () => {
        if (!selectedTable) return;
        setLoading(true);
        const { data, error } = await supabase
            .from(selectedTable)
            .select('*')
            .limit(50);

        if (error) console.error(`Error fetching ${selectedTable}:`, error);
        else setTableData(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchTables();
    }, []);

    useEffect(() => {
        fetchTableData();
    }, [selectedTable]);

    const columns = tableData.length > 0
        ? Object.keys(tableData[0]).slice(0, 5).map(key => ({
            key,
            label: key.replace(/_/g, ' ').toUpperCase(),
            render: (row: any) => {
                const val = row[key];
                if (typeof val === 'object') return <span className="text-[10px] font-mono opacity-50">JSON</span>;
                return <span className="truncate max-w-[150px] inline-block">{String(val)}</span>;
            }
        }))
        : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Database Manager</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Direct access to platform data and schema.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        SQL Editor
                    </button>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Execute
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Tables List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tables</h3>
                        <RefreshCw onClick={fetchTables} className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:rotate-180 transition-transform duration-500" />
                    </div>
                    <div className="space-y-1">
                        {tables.map((table) => (
                            <button
                                key={table.name}
                                onClick={() => setSelectedTable(table.name)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedTable === table.name
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <Table className="w-4 h-4" />
                                {table.name}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 mt-8">
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-2">
                            <Shield className="w-3.5 h-3.5" />
                            Security Warning
                        </p>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 leading-relaxed">
                            Careful with manual edits. Actions are logged and RLS is currently bypassed for admins.
                        </p>
                    </div>
                </div>

                {/* Data View */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="glass-panel p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                                    <DbIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-900 dark:text-white capitalize">{selectedTable}</h2>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-tight">Viewing last 50 records</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                                    <Zap className="w-3 h-3 text-amber-500" />
                                    REALTIME ON
                                </div>
                            </div>
                        </div>

                        <DataTable
                            columns={columns}
                            data={tableData}
                            isLoading={loading}
                            searchPlaceholder="Search table..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
