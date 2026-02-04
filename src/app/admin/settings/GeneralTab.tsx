import { motion } from 'framer-motion';
import { Users, Activity, Zap, Save, Edit, Calendar, Truck, Briefcase, Star, CreditCard } from 'lucide-react';
import { groupedContactFields } from './ContactFieldsConfig';

interface GeneralTabProps {
  profile: any;
  stats: { users: number; equipment: number; bookings: number; labour: number };
  settings: any;
  setSettings: (settings: any) => void;
  editingSettings: boolean;
  setEditingSettings: (editing: boolean) => void;
  savingSettings: boolean;
  handleSaveSettings: () => void;
  quickActions: any[];
  colorMap: any;
}

export default function GeneralTab({
  profile,
  stats,
  settings,
  setSettings,
  editingSettings,
  setEditingSettings,
  savingSettings,
  handleSaveSettings,
  quickActions,
  colorMap,
}: GeneralTabProps) {
  const handleFieldChange = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Admin Profile & Stats Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Admin Profile */}
        <div className="glass-panel rounded-2xl border border-[#262626] p-6 lg:col-span-2">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
              <Users className="h-5 w-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Admin Profile</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">Name</p>
                <p className="text-lg font-semibold text-white">{profile?.name || 'Admin User'}</p>
              </div>
              <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">Email</p>
                <p className="text-lg font-semibold text-white">{profile?.email || 'admin@agriServe.com'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="glass-panel rounded-2xl border border-[#262626] p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
              <Activity className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Platform Stats</h2>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Total Users', value: stats.users, color: 'emerald' },
              { label: 'Equipment', value: stats.equipment, color: 'blue' },
              { label: 'Bookings', value: stats.bookings, color: 'purple' },
              { label: 'Labour', value: stats.labour, color: 'amber' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between rounded-xl border border-[#262626] bg-[#1a1a1a] p-3">
                <span className="text-sm text-neutral-400">{stat.label}</span>
                <span className={`font-mono text-lg font-bold text-${stat.color}-400`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Information - Comprehensive */}
      <div className="glass-panel rounded-2xl border border-[#262626] p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10">
              <Users className="h-5 w-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Contact Information</h2>
          </div>
          {!editingSettings ? (
            <button
              onClick={() => setEditingSettings(true)}
              className="flex items-center gap-2 rounded-xl border border-[#262626] bg-[#1a1a1a] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#1f1f1f]"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setEditingSettings(false)}
                className="rounded-xl border border-[#262626] bg-[#1a1a1a] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#1f1f1f]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="btn-admin-primary flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
              >
                {savingSettings ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save All
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Render all contact fields grouped by category */}
        <div className="space-y-8">
          {Object.entries(groupedContactFields).map(([category, fields]) => (
            <div key={category}>
              <h3 className="mb-4 text-lg font-semibold text-white">{category}</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {fields.map((field) => {
                  const Icon = field.icon;
                  return (
                    <div key={field.key}>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-400">
                        <Icon className="h-4 w-4" />
                        {field.label}
                        {field.required && <span className="text-red-400">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={settings[field.key] || ''}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          disabled={!editingSettings}
                          placeholder={field.placeholder}
                          rows={3}
                          className="w-full rounded-xl border border-[#262626] bg-[#1a1a1a] px-4 py-3 text-white outline-none transition-all disabled:opacity-50 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                        />
                      ) : (
                        <input
                          type={field.type}
                          value={settings[field.key] || ''}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          disabled={!editingSettings}
                          placeholder={field.placeholder}
                          className="w-full rounded-xl border border-[#262626] bg-[#1a1a1a] px-4 py-3 text-white outline-none transition-all disabled:opacity-50 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-panel rounded-2xl border border-[#262626] p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10">
            <Zap className="h-5 w-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Quick Actions</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const colors = colorMap[action.color];
            return (
              <motion.a
                key={action.href}
                href={action.href}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden rounded-xl border border-[#262626] bg-[#1a1a1a] p-4 transition-all hover:border-emerald-500/30"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 transition-opacity group-hover:opacity-5`} />
                <div className="relative flex items-center gap-3">
                  <div className={`rounded-lg ${colors.bg} p-2.5 ${colors.text}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-white">{action.label}</span>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
