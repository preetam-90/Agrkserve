import { motion } from 'framer-motion';
import {
  Shield,
  Users,
  CheckCircle,
  Clock,
  LogOut,
  Trash2,
  AlertCircle,
  Monitor,
  MapPin,
} from 'lucide-react';

interface SecurityTabProps {
  settings: any;
  setSettings: (settings: any) => void;
  sessions: any[];
  loadingSessions: boolean;
  handleRevokeSession: (sessionId: string) => void;
  handleForceLogoutAll: () => void;
  formatDate: (date: string) => string;
}

export default function SecurityTab({
  settings,
  setSettings,
  sessions,
  loadingSessions,
  handleRevokeSession,
  handleForceLogoutAll,
  formatDate,
}: SecurityTabProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Session Settings */}
      <div className="glass-panel rounded-2xl border border-[#262626] p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10">
            <Clock className="h-5 w-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Session Settings</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-400">
              Session Timeout (seconds)
            </label>
            <input
              type="number"
              value={settings.session_timeout}
              onChange={(e) =>
                setSettings({ ...settings, session_timeout: parseInt(e.target.value) })
              }
              min="300"
              max="86400"
              className="w-full rounded-xl border border-[#262626] bg-[#1a1a1a] px-4 py-3 text-white outline-none transition-all focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
            />
            <p className="mt-2 text-xs text-neutral-500">
              {Math.floor(settings.session_timeout / 60)} minutes
            </p>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
              <div>
                <p className="font-semibold text-amber-400">Session Timeout Info</p>
                <p className="mt-1 text-sm text-neutral-400">
                  Users will be automatically logged out after this period of inactivity
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Access Control */}
      <div className="glass-panel rounded-2xl border border-[#262626] p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
            <Shield className="h-5 w-5 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Access Control</h2>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-semibold text-white">Admin Permissions</span>
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="space-y-2 text-sm text-neutral-400">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Full database access
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                User management
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                System configuration
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Broadcast notifications
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Active Sessions
            </p>
            <p className="text-2xl font-bold text-white">{sessions.length}</p>
            <p className="mt-1 text-xs text-neutral-500">Currently logged in users</p>
          </div>
        </div>
      </div>

      {/* Active Sessions Management */}
      <div className="glass-panel rounded-2xl border border-[#262626] p-6 lg:col-span-2">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Active Sessions</h2>
              <p className="text-sm text-neutral-500">{sessions.length} active sessions</p>
            </div>
          </div>
          <button
            onClick={handleForceLogoutAll}
            disabled={sessions.length === 0}
            className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            Force Logout All
          </button>
        </div>

        {loadingSessions ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-12 text-center">
            <Users className="mx-auto mb-3 h-12 w-12 text-neutral-600" />
            <p className="text-neutral-500">No active sessions</p>
          </div>
        ) : (
          <div className="admin-scrollbar max-h-96 space-y-3 overflow-y-auto">
            {sessions.map((session) => (
              <motion.div
                key={session.session_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-4 transition-all hover:border-emerald-500/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                        <Users className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{session.user_name}</p>
                        <p className="text-sm text-neutral-400">{session.user_email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                      <div className="flex items-center gap-2 text-neutral-400">
                        <MapPin className="h-4 w-4" />
                        <span>IP: {session.ip_address || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-400">
                        <Clock className="h-4 w-4" />
                        <span>Last: {formatDate(session.last_activity)}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-xs text-neutral-500">
                      <Monitor className="mt-0.5 h-3 w-3 flex-shrink-0" />
                      <span className="line-clamp-1">{session.user_agent || 'Unknown device'}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <span>Created: {formatDate(session.created_at)}</span>
                      <span>Expires: {formatDate(session.expires_at)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevokeSession(session.session_id)}
                    className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10"
                    title="Revoke session"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
