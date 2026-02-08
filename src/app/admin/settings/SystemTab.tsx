import { motion } from 'framer-motion';
import {
  Globe,
  Database,
  Activity,
  CheckCircle,
  Power,
  Wrench,
  AlertCircle,
  Plus,
  X,
  Save,
  RefreshCw,
} from 'lucide-react';

interface SystemTabProps {
  settings: {
    platform_name: string;
    platform_version: string;
    environment: string;
  };
  maintenance: {
    is_enabled: boolean;
    message: string;
    scheduled_start?: string;
    scheduled_end?: string;
    whitelisted_ips: string[];
  };
  setMaintenance: (maintenance: {
    is_enabled: boolean;
    message: string;
    scheduled_start?: string;
    scheduled_end?: string;
    whitelisted_ips: string[];
  }) => void;
  updatingMaintenance: boolean;
  handleToggleMaintenance: () => void;
  handleUpdateMaintenanceMessage: () => void;
  newIp: string;
  setNewIp: (ip: string) => void;
  handleAddWhitelistIp: () => void;
  handleRemoveWhitelistIp: (ip: string) => void;
  healthMetrics: {
    apiResponseTime: number;
    dbLoad: number;
    storageUsage: number;
    uptime: number;
    totalRecords: number;
  };
  loadingHealth: boolean;
  fetchHealthMetrics: () => void;
}

export default function SystemTab({
  settings,
  maintenance,
  setMaintenance,
  updatingMaintenance,
  handleToggleMaintenance,
  handleUpdateMaintenanceMessage,
  newIp,
  setNewIp,
  handleAddWhitelistIp,
  handleRemoveWhitelistIp,
  healthMetrics,
  loadingHealth,
  fetchHealthMetrics,
}: SystemTabProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Platform Info */}
      <div className="glass-panel rounded-2xl border border-[#262626] p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
            <Globe className="h-5 w-5 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Platform Information</h2>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Platform
            </p>
            <p className="text-lg font-semibold text-white">{settings.platform_name}</p>
          </div>
          <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Version
            </p>
            <p className="text-lg font-semibold text-white">{settings.platform_version}</p>
          </div>
          <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Environment
            </p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <p className="text-lg font-semibold capitalize text-emerald-400">
                {settings.environment}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Database
            </p>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-400" />
              <p className="text-lg font-semibold text-white">Supabase (Live)</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="glass-panel rounded-2xl border border-[#262626] p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
              <Activity className="h-5 w-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">System Health</h2>
          </div>
          <button
            onClick={fetchHealthMetrics}
            disabled={loadingHealth}
            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loadingHealth ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-400">API Response Time</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span className="font-mono text-sm font-semibold text-emerald-400">
                  {healthMetrics.apiResponseTime}ms
                </span>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full border border-[#262626] bg-[#1a1a1a]">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min((healthMetrics.apiResponseTime / 500) * 100, 100)}%`,
                }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-400">Database Load</span>
              <span className="font-mono text-sm font-semibold text-emerald-400">
                {healthMetrics.dbLoad}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full border border-[#262626] bg-[#1a1a1a]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${healthMetrics.dbLoad}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-400">Storage Usage</span>
              <span className="font-mono text-sm font-semibold text-blue-400">
                {healthMetrics.storageUsage}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full border border-[#262626] bg-[#1a1a1a]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${healthMetrics.storageUsage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-400">Uptime</span>
              <span className="font-mono text-sm font-semibold text-emerald-400">
                {healthMetrics.uptime}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full border border-[#262626] bg-[#1a1a1a]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${healthMetrics.uptime}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
              />
            </div>
          </div>

          <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-3">
            <p className="text-xs text-neutral-500">Total Records</p>
            <p className="font-mono text-xl font-bold text-white">{healthMetrics.totalRecords}</p>
          </div>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="glass-panel rounded-2xl border border-[#262626] p-6 lg:col-span-2">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
              <Wrench className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Maintenance Mode</h2>
              <p className="text-sm text-neutral-500">
                {maintenance.is_enabled ? 'Currently active' : 'Currently inactive'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleMaintenance}
            disabled={updatingMaintenance}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              maintenance.is_enabled
                ? 'border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                : 'btn-admin-primary'
            }`}
          >
            {updatingMaintenance ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Updating...
              </>
            ) : (
              <>
                <Power className="h-4 w-4" />
                {maintenance.is_enabled ? 'Disable' : 'Enable'}
              </>
            )}
          </button>
        </div>

        {maintenance.is_enabled && (
          <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
              <div>
                <p className="font-semibold text-amber-400">Maintenance Mode Active</p>
                <p className="mt-1 text-sm text-neutral-400">
                  Users will see the maintenance message when accessing the platform
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-400">
              Maintenance Message
            </label>
            <textarea
              value={maintenance.message}
              onChange={(e) => setMaintenance({ ...maintenance, message: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-[#262626] bg-[#1a1a1a] px-4 py-3 text-white outline-none transition-all focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-400">
                Scheduled Start (Optional)
              </label>
              <input
                type="datetime-local"
                value={maintenance.scheduled_start || ''}
                onChange={(e) =>
                  setMaintenance({ ...maintenance, scheduled_start: e.target.value })
                }
                className="w-full rounded-xl border border-[#262626] bg-[#1a1a1a] px-4 py-3 text-white outline-none transition-all focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-400">
                Scheduled End (Optional)
              </label>
              <input
                type="datetime-local"
                value={maintenance.scheduled_end || ''}
                onChange={(e) => setMaintenance({ ...maintenance, scheduled_end: e.target.value })}
                className="w-full rounded-xl border border-[#262626] bg-[#1a1a1a] px-4 py-3 text-white outline-none transition-all focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-400">
              Whitelisted IPs
            </label>
            <div className="mb-3 flex gap-2">
              <input
                type="text"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                placeholder="Enter IP address (e.g., 192.168.1.1)"
                className="flex-1 rounded-xl border border-[#262626] bg-[#1a1a1a] px-4 py-3 text-white outline-none transition-all focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                onClick={handleAddWhitelistIp}
                disabled={!newIp.trim() || updatingMaintenance}
                className="btn-admin-primary flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {maintenance.whitelisted_ips.length === 0 ? (
                <p className="text-center text-sm text-neutral-500">No whitelisted IPs</p>
              ) : (
                maintenance.whitelisted_ips.map((ip: string) => (
                  <div
                    key={ip}
                    className="flex items-center justify-between rounded-xl border border-[#262626] bg-[#1a1a1a] p-3"
                  >
                    <span className="font-mono text-sm text-white">{ip}</span>
                    <button
                      onClick={() => handleRemoveWhitelistIp(ip)}
                      className="rounded-lg p-1 text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={handleUpdateMaintenanceMessage}
            disabled={updatingMaintenance}
            className="btn-admin-primary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
          >
            {updatingMaintenance ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Maintenance Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
