'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Table, RefreshCw, Shield, Zap, Database } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';

export default function DatabasePage() {
  const [tables, setTables] = useState<{ name: string }[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchTables = async () => {
    setLoading(true);
    // Supabase-specific way to list tables via RPC if available,
    // otherwise we list our core application tables
    const appTables = [
      'user_profiles',
      'user_roles',
      'equipment',
      'bookings',
      'labour_profiles',
      'payments',
      'reviews',
      'notifications',
      'audit_logs',
    ];

    setTables(appTables.map((name) => ({ name })));
    if (!selectedTable) setSelectedTable(appTables[0]);
    setLoading(false);
  };

  const fetchTableData = async () => {
    if (!selectedTable) return;
    setLoading(true);
    const { data, error } = await supabase.from(selectedTable).select('*').limit(50);

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

  const columns =
    tableData.length > 0
      ? Object.keys(tableData[0])
          .slice(0, 5)
          .map((key) => ({
            key,
            label: key.replace(/_/g, ' ').toUpperCase(),
            render: (item: unknown) => {
              const row = item as Record<string, unknown>;
              const val = row[key];
              if (typeof val === 'object' && val !== null)
                return <span className="font-mono text-[10px] opacity-50">JSON</span>;
              return <span className="inline-block max-w-[150px] truncate">{String(val)}</span>;
            },
          }))
      : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Database Manager
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Direct access to platform data and schema.
          </p>
        </div>
        {/* Removed SQL Editor/Execute - requires proper query builder implementation */}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Tables List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Tables</h3>
            <RefreshCw
              onClick={fetchTables}
              className="h-3.5 w-3.5 cursor-pointer text-slate-400 transition-transform duration-500 hover:rotate-180"
            />
          </div>
          <div className="space-y-1">
            {tables.map((table) => (
              <button
                key={table.name}
                onClick={() => setSelectedTable(table.name)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  selectedTable === table.name
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <Table className="h-4 w-4" />
                {table.name}
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
              <Shield className="h-3.5 w-3.5" />
              Security Warning
            </p>
            <p className="text-[10px] leading-relaxed text-amber-600 dark:text-amber-400">
              Careful with manual edits. Actions are logged and RLS is currently bypassed for
              admins.
            </p>
          </div>
        </div>

        {/* Data View */}
        <div className="space-y-4 lg:col-span-3">
          <div className="glass-panel rounded-2xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold capitalize text-slate-900 dark:text-white">
                    {selectedTable}
                  </h2>
                  <p className="text-[10px] uppercase tracking-tight text-slate-500">
                    Viewing last 50 records
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800">
                  <Zap className="h-3 w-3 text-amber-500" />
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
