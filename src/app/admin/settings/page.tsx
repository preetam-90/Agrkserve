'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Send,
  Settings as SettingsIcon,
  Shield,
  Zap,
  Users,
  Calendar,
  Truck,
  Briefcase,
  Star,
  CreditCard,
  Database,
  Server,
  Activity,
  CheckCircle,
  AlertCircle,
  Eye,
  X,
  Sparkles,
  Globe,
  Lock,
  Mail,
} from 'lucide-react';

type Tab = 'general' | 'notifications' | 'system' | 'security';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [recentBroadcasts, setRecentBroadcasts] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, equipment: 0, bookings: 0, labour: 0 });
  const [showSuccess, setShowSuccess] = useState(false);
  const { profile } = useAuthStore();

  const supabase = createClient();

  useEffect(() => {
    fetchStats();
    fetchRecentBroadcasts();
  }, []);

  const fetchStats = async () => {
    const [{ count: users }, { count: equipment }, { count: bookings }, { count: labour }] =
      await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('equipment').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('labour_profiles').select('*', { count: 'exact', head: true }),
      ]);

    setStats({
      users: users || 0,
      equipment: equipment || 0,
      bookings: bookings || 0,
      labour: labour || 0,
    });
  };

  const fetchRecentBroadcasts = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('type', 'system')
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      // Group by unique title+message to show broadcasts
      const broadcasts = data.reduce((acc: any[], notif) => {
        if (!acc.find((b) => b.title === notif.title && b.message === notif.message)) {
          acc.push(notif);
        }
        return acc;
      }, []);
      setRecentBroadcasts(broadcasts);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) return;

    setSending(true);
    try {
      const { data: users, error: usersError } = await supabase.from('user_profiles').select('id');

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        alert('No users found');
        return;
      }

      const notifications = users.map((user) => ({
        user_id: user.id,
        title,
        message,
        type: 'system',
        data: { is_announcement: true },
      }));

      const { error: notifError } = await supabase.from('notifications').insert(notifications);

      if (notifError) throw notifError;

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setTitle('');
      setMessage('');
      setShowPreview(false);
      fetchRecentBroadcasts();
    } catch (error) {
      console.error('Error sending broadcast:', error);
      alert('Failed to send broadcast notification');
    } finally {
      setSending(false);
    }
  };

  const getCharacterColor = () => {
    const len = message.length;
    if (len < 200) return 'text-emerald-400';
    if (len < 400) return 'text-amber-400';
    return 'text-red-400';
  };

  const tabs = [
    { id: 'general' as Tab, label: 'General', icon: SettingsIcon },
    { id: 'notifications' as Tab, label: 'Notifications', icon: Bell },
    { id: 'system' as Tab, label: 'System', icon: Server },
    { id: 'security' as Tab, label: 'Security', icon: Shield },
  ];

  const quickActions = [
    { label: 'Manage Users', href: '/admin/users', icon: Users, color: 'blue' },
    { label: 'Equipment', href: '/admin/equipment', icon: Truck, color: 'yellow' },
    { label: 'Bookings', href: '/admin/bookings', icon: Calendar, color: 'green' },
    { label: 'Labour', href: '/admin/labour', icon: Briefcase, color: 'purple' },
    { label: 'Reviews', href: '/admin/reviews', icon: Star, color: 'amber' },
    { label: 'Payments', href: '/admin/payments', icon: CreditCard, color: 'emerald' },
  ];

  const colorMap: any = {
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/20',
      gradient: 'from-blue-500 to-blue-600',
    },
    yellow: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      gradient: 'from-amber-400 to-amber-500',
    },
    green: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      gradient: 'from-emerald-500 to-emerald-600',
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/20',
      gradient: 'from-purple-500 to-purple-600',
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      gradient: 'from-amber-400 to-amber-500',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      gradient: 'from-emerald-500 to-emerald-600',
    },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
          <p className="mt-1 text-neutral-500">
            Manage your admin panel preferences and configurations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
            <SettingsIcon className="h-5 w-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-[#262626] pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="relative">
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  isActive ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </motion.div>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-600"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'general' && (
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
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                        Name
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {profile?.name || 'Admin User'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-4">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                        Email
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {profile?.email || 'admin@agriServe.com'}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-4">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Role
                    </p>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-400" />
                      <p className="text-lg font-semibold text-emerald-400">Super Administrator</p>
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
                  <div className="flex items-center justify-between rounded-xl border border-[#262626] bg-[#1a1a1a] p-3">
                    <span className="text-sm text-neutral-400">Total Users</span>
                    <span className="font-mono text-lg font-bold text-emerald-400">
                      {stats.users}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-[#262626] bg-[#1a1a1a] p-3">
                    <span className="text-sm text-neutral-400">Equipment</span>
                    <span className="font-mono text-lg font-bold text-blue-400">
                      {stats.equipment}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-[#262626] bg-[#1a1a1a] p-3">
                    <span className="text-sm text-neutral-400">Bookings</span>
                    <span className="font-mono text-lg font-bold text-purple-400">
                      {stats.bookings}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-[#262626] bg-[#1a1a1a] p-3">
                    <span className="text-sm text-neutral-400">Labour</span>
                    <span className="font-mono text-lg font-bold text-amber-400">
                      {stats.labour}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-panel rounded-2xl border border-[#262626] p-6 lg:col-span-3">
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
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 transition-opacity group-hover:opacity-5`}
                        />
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
          )}

          {activeTab === 'notifications' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Broadcast Form */}
              <div className="glass-panel rounded-2xl border border-[#262626] p-6 lg:col-span-2">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                      <Bell className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Broadcast Notification</h2>
                      <p className="text-sm text-neutral-500">Send to all {stats.users} users</p>
                    </div>
                  </div>
                  {showPreview && (
                    <button
                      onClick={() => setShowPreview(false)}
                      className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {!showPreview ? (
                  <form onSubmit={handleSendBroadcast} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-neutral-400">
                        Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., New Feature Announcement"
                        className="w-full rounded-xl border border-[#262626] bg-[#1a1a1a] px-4 py-3 text-white outline-none transition-all placeholder:text-neutral-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-neutral-400">
                        Message
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter your announcement message here..."
                        className="admin-scrollbar w-full rounded-xl border border-[#262626] bg-[#1a1a1a] px-4 py-3 text-white outline-none transition-all placeholder:text-neutral-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                        rows={6}
                        maxLength={500}
                      />
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className={`font-mono font-semibold ${getCharacterColor()}`}>
                          {message.length}/500
                        </span>
                        {message.length > 400 && (
                          <span className="text-amber-400">Approaching limit</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => title && message && setShowPreview(true)}
                        disabled={!title.trim() || !message.trim()}
                        className="flex items-center gap-2 rounded-xl border border-[#262626] bg-[#1a1a1a] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1f1f1f] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </button>
                      <button
                        type="submit"
                        disabled={sending || !title.trim() || !message.trim()}
                        className="btn-admin-primary flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {sending ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Send to All Users
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <Bell className="h-5 w-5 text-emerald-400" />
                        <h3 className="text-lg font-bold text-white">{title}</h3>
                      </div>
                      <p className="text-neutral-300">{message}</p>
                      <div className="mt-4 border-t border-emerald-500/20 pt-4">
                        <p className="text-xs text-emerald-400">
                          This notification will be sent to {stats.users} users
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleSendBroadcast}
                      disabled={sending}
                      className="btn-admin-primary flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
                    >
                      {sending ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Confirm & Send
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Recent Broadcasts */}
              <div className="glass-panel rounded-2xl border border-[#262626] p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                    <Activity className="h-5 w-5 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Recent</h2>
                </div>

                <div className="admin-scrollbar max-h-96 space-y-3 overflow-y-auto">
                  {recentBroadcasts.length === 0 ? (
                    <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-6 text-center">
                      <Bell className="mx-auto mb-2 h-8 w-8 text-neutral-600" />
                      <p className="text-sm text-neutral-500">No broadcasts yet</p>
                    </div>
                  ) : (
                    recentBroadcasts.map((broadcast) => (
                      <div
                        key={broadcast.id}
                        className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-4 transition-all hover:border-emerald-500/30"
                      >
                        <h4 className="mb-1 font-semibold text-white">{broadcast.title}</h4>
                        <p className="mb-2 line-clamp-2 text-sm text-neutral-400">
                          {broadcast.message}
                        </p>
                        <p className="text-xs text-neutral-600">
                          {new Date(broadcast.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
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
                    <p className="text-lg font-semibold text-white">AgriServe Admin Panel</p>
                  </div>
                  <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-4">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Version
                    </p>
                    <p className="text-lg font-semibold text-white">1.0.0</p>
                  </div>
                  <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-4">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Environment
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      <p className="text-lg font-semibold text-emerald-400">Production</p>
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
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                    <Activity className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">System Health</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-400">
                        API Response Time
                      </span>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                        <span className="font-mono text-sm font-semibold text-emerald-400">
                          98ms
                        </span>
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full border border-[#262626] bg-[#1a1a1a]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '15%' }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-400">Database Load</span>
                      <span className="font-mono text-sm font-semibold text-emerald-400">24%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full border border-[#262626] bg-[#1a1a1a]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '24%' }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-400">Storage Usage</span>
                      <span className="font-mono text-sm font-semibold text-blue-400">45%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full border border-[#262626] bg-[#1a1a1a]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '45%' }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-400">Uptime</span>
                      <span className="font-mono text-sm font-semibold text-emerald-400">
                        99.9%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full border border-[#262626] bg-[#1a1a1a]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '99.9%' }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Security Settings */}
              <div className="glass-panel rounded-2xl border border-[#262626] p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
                    <Shield className="h-5 w-5 text-red-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Security Settings</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl border border-[#262626] bg-[#1a1a1a] p-4">
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-emerald-400" />
                      <div>
                        <p className="font-semibold text-white">Two-Factor Auth</p>
                        <p className="text-xs text-neutral-500">Enhanced security</p>
                      </div>
                    </div>
                    <div className="flex h-6 w-11 items-center rounded-full border border-emerald-500/50 bg-emerald-500/20 px-0.5">
                      <motion.div
                        className="h-5 w-5 rounded-full bg-emerald-500"
                        layout
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-[#262626] bg-[#1a1a1a] p-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="font-semibold text-white">Email Notifications</p>
                        <p className="text-xs text-neutral-500">Security alerts</p>
                      </div>
                    </div>
                    <div className="flex h-6 w-11 items-center rounded-full border border-blue-500/50 bg-blue-500/20 px-0.5">
                      <motion.div
                        className="h-5 w-5 rounded-full bg-blue-500"
                        layout
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
                      <div>
                        <p className="font-semibold text-amber-400">Security Notice</p>
                        <p className="mt-1 text-sm text-neutral-400">
                          Last login: 2 hours ago from 103.x.x.x
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Access Control */}
              <div className="glass-panel rounded-2xl border border-[#262626] p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10">
                    <Users className="h-5 w-5 text-purple-400" />
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
                    <p className="text-2xl font-bold text-white">1</p>
                    <p className="mt-1 text-xs text-neutral-500">Current device only</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-4 backdrop-blur-xl"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white">Broadcast Sent!</p>
              <p className="text-sm text-emerald-400">Notification sent to all users</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
