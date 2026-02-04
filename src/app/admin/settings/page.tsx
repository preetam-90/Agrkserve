'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { clearSettingsCache } from '@/lib/services/settings';
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
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Clock,
  Power,
  Wrench,
  LogOut,
  Trash2,
  Save,
} from 'lucide-react';

type Tab = 'general' | 'notifications' | 'system' | 'security';

interface SystemSettings {
  platform_name: string;
  platform_version: string;
  environment: string;
  support_email: string;
  support_phone: string;
  business_address: string;
  social_links: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
  };
  session_timeout: number;
}

interface MaintenanceMode {
  is_enabled: boolean;
  message: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  whitelisted_ips: string[];
}

interface Session {
  session_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  ip_address: string;
  user_agent: string;
  last_activity: string;
  created_at: string;
  expires_at: string;
}

interface HealthMetrics {
  apiResponseTime: number;
  dbLoad: number;
  storageUsage: number;
  uptime: number;
  totalRecords: number;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [recentBroadcasts, setRecentBroadcasts] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, equipment: 0, bookings: 0, labour: 0 });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { profile } = useAuthStore();

  // System settings state
  const [settings, setSettings] = useState<SystemSettings>({
    platform_name: 'AgriServe',
    platform_version: '1.0.0',
    environment: 'production',
    
    // Primary Contact
    support_email_primary: 'support@agriServe.com',
    support_email_secondary: 'info@agriServe.com',
    sales_email: 'sales@agriServe.com',
    support_phone_primary: '+1-555-0123',
    support_phone_secondary: '+1-555-0124',
    whatsapp_number: '+1-555-0123',
    toll_free_number: '1-800-AGRISERVE',
    fax_number: '',
    emergency_contact: '+1-555-HELP',
    
    // Business Address
    business_address_line1: '123 Farm Road',
    business_address_line2: 'Suite 100',
    business_city: 'Agriculture City',
    business_state: 'AC',
    business_country: 'United States',
    business_postal_code: '12345',
    
    // Social Media
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    linkedin_url: '',
    youtube_url: '',
    tiktok_url: '',
    pinterest_url: '',
    
    // Messaging Apps
    telegram_username: '',
    discord_server: '',
    slack_workspace: '',
    
    // Business Hours
    business_hours_weekday: 'Monday - Friday: 9:00 AM - 6:00 PM',
    business_hours_saturday: 'Saturday: 10:00 AM - 4:00 PM',
    business_hours_sunday: 'Sunday: Closed',
    timezone: 'America/New_York',
    
    // Additional Info
    company_registration: '',
    tax_id: '',
    website_url: 'https://agriServe.com',
    support_portal_url: 'https://support.agriServe.com',
    help_center_url: 'https://help.agriServe.com',
    
    // Map & Location
    google_maps_url: '',
    latitude: '',
    longitude: '',
    
    session_timeout: 3600,
  });
  const [editingSettings, setEditingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Maintenance mode state
  const [maintenance, setMaintenance] = useState<MaintenanceMode>({
    is_enabled: false,
    message: 'We are currently performing scheduled maintenance. Please check back soon.',
    scheduled_start: null,
    scheduled_end: null,
    whitelisted_ips: [],
  });
  const [newIp, setNewIp] = useState('');
  const [updatingMaintenance, setUpdatingMaintenance] = useState(false);

  // Session management state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Health metrics state
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>({
    apiResponseTime: 0,
    dbLoad: 0,
    storageUsage: 0,
    uptime: 99.9,
    totalRecords: 0,
  });
  const [loadingHealth, setLoadingHealth] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchStats();
    fetchRecentBroadcasts();
    fetchSystemSettings();
    fetchMaintenanceMode();
    fetchHealthMetrics();
    if (activeTab === 'security') {
      fetchActiveSessions();
    }
  }, [activeTab]);

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
      const broadcasts = data.reduce((acc: any[], notif) => {
        if (!acc.find((b) => b.title === notif.title && b.message === notif.message)) {
          acc.push(notif);
        }
        return acc;
      }, []);
      setRecentBroadcasts(broadcasts);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      if (data.settings) {
        setSettings({
          platform_name: data.settings.platform_name || 'AgriServe',
          platform_version: data.settings.platform_version || '1.0.0',
          environment: data.settings.environment || 'production',
          
          // Primary Contact
          support_email_primary: data.settings.support_email_primary || data.settings.support_email || 'support@agriServe.com',
          support_email_secondary: data.settings.support_email_secondary || 'info@agriServe.com',
          sales_email: data.settings.sales_email || 'sales@agriServe.com',
          support_phone_primary: data.settings.support_phone_primary || data.settings.support_phone || '+1-555-0123',
          support_phone_secondary: data.settings.support_phone_secondary || '+1-555-0124',
          whatsapp_number: data.settings.whatsapp_number || '+1-555-0123',
          toll_free_number: data.settings.toll_free_number || '1-800-AGRISERVE',
          fax_number: data.settings.fax_number || '',
          emergency_contact: data.settings.emergency_contact || '+1-555-HELP',
          
          // Business Address
          business_address_line1: data.settings.business_address_line1 || '123 Farm Road',
          business_address_line2: data.settings.business_address_line2 || 'Suite 100',
          business_city: data.settings.business_city || 'Agriculture City',
          business_state: data.settings.business_state || 'AC',
          business_country: data.settings.business_country || 'United States',
          business_postal_code: data.settings.business_postal_code || '12345',
          
          // Social Media
          facebook_url: data.settings.facebook_url || data.settings.social_links?.facebook || '',
          twitter_url: data.settings.twitter_url || data.settings.social_links?.twitter || '',
          instagram_url: data.settings.instagram_url || data.settings.social_links?.instagram || '',
          linkedin_url: data.settings.linkedin_url || data.settings.social_links?.linkedin || '',
          youtube_url: data.settings.youtube_url || '',
          tiktok_url: data.settings.tiktok_url || '',
          pinterest_url: data.settings.pinterest_url || '',
          
          // Messaging Apps
          telegram_username: data.settings.telegram_username || '',
          discord_server: data.settings.discord_server || '',
          slack_workspace: data.settings.slack_workspace || '',
          
          // Business Hours
          business_hours_weekday: data.settings.business_hours_weekday || 'Monday - Friday: 9:00 AM - 6:00 PM',
          business_hours_saturday: data.settings.business_hours_saturday || 'Saturday: 10:00 AM - 4:00 PM',
          business_hours_sunday: data.settings.business_hours_sunday || 'Sunday: Closed',
          timezone: data.settings.timezone || 'America/New_York',
          
          // Additional Info
          company_registration: data.settings.company_registration || '',
          tax_id: data.settings.tax_id || '',
          website_url: data.settings.website_url || 'https://agriServe.com',
          support_portal_url: data.settings.support_portal_url || 'https://support.agriServe.com',
          help_center_url: data.settings.help_center_url || 'https://help.agriServe.com',
          
          // Map & Location
          google_maps_url: data.settings.google_maps_url || '',
          latitude: data.settings.latitude || '',
          longitude: data.settings.longitude || '',
          
          session_timeout: data.settings.session_timeout || 3600,
        });
      }
    } catch (error) {
      console.error('Error fetching system settings:', error);
    }
  };

  const fetchMaintenanceMode = async () => {
    try {
      const response = await fetch('/api/admin/maintenance');
      const data = await response.json();
      if (data.maintenance) {
        setMaintenance(data.maintenance);
      }
    } catch (error) {
      console.error('Error fetching maintenance mode:', error);
    }
  };

  const fetchActiveSessions = async () => {
    setLoadingSessions(true);
    try {
      const response = await fetch('/api/admin/sessions');
      const data = await response.json();
      if (data.sessions) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchHealthMetrics = async () => {
    setLoadingHealth(true);
    try {
      const response = await fetch('/api/admin/health');
      const data = await response.json();
      if (data.metrics) {
        setHealthMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error fetching health metrics:', error);
    } finally {
      setLoadingHealth(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      // Get all contact field keys from the settings object
      const contactFields = [
        // Primary Contact
        'support_email_primary',
        'support_email_secondary',
        'sales_email',
        'support_phone_primary',
        'support_phone_secondary',
        'whatsapp_number',
        'toll_free_number',
        'fax_number',
        'emergency_contact',
        // Business Address
        'business_address_line1',
        'business_address_line2',
        'business_city',
        'business_state',
        'business_country',
        'business_postal_code',
        // Social Media
        'facebook_url',
        'twitter_url',
        'instagram_url',
        'linkedin_url',
        'youtube_url',
        'tiktok_url',
        'pinterest_url',
        // Messaging Apps
        'telegram_username',
        'discord_server',
        'slack_workspace',
        // Business Hours
        'business_hours_weekday',
        'business_hours_saturday',
        'business_hours_sunday',
        'timezone',
        // Additional Info
        'company_registration',
        'tax_id',
        'website_url',
        'support_portal_url',
        'help_center_url',
        // Map & Location
        'google_maps_url',
        'latitude',
        'longitude',
        // Other
        'session_timeout',
      ];

      // Save all fields that exist in settings
      for (const key of contactFields) {
        if (settings[key] !== undefined) {
          await fetch('/api/admin/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, value: settings[key] }),
          });
        }
      }

      // Clear the settings cache so changes are reflected immediately
      clearSettingsCache();

      showSuccessToast('Settings saved successfully!');
      setEditingSettings(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleMaintenance = async () => {
    setUpdatingMaintenance(true);
    try {
      const response = await fetch('/api/admin/maintenance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_enabled: !maintenance.is_enabled,
          message: maintenance.message,
          scheduled_start: maintenance.scheduled_start,
          scheduled_end: maintenance.scheduled_end,
          whitelisted_ips: maintenance.whitelisted_ips,
        }),
      });

      if (response.ok) {
        setMaintenance({ ...maintenance, is_enabled: !maintenance.is_enabled });
        showSuccessToast(
          `Maintenance mode ${!maintenance.is_enabled ? 'enabled' : 'disabled'}`
        );
      }
    } catch (error) {
      console.error('Error toggling maintenance:', error);
      alert('Failed to toggle maintenance mode');
    } finally {
      setUpdatingMaintenance(false);
    }
  };

  const handleUpdateMaintenanceMessage = async () => {
    setUpdatingMaintenance(true);
    try {
      const response = await fetch('/api/admin/maintenance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maintenance),
      });

      if (response.ok) {
        showSuccessToast('Maintenance settings updated!');
      }
    } catch (error) {
      console.error('Error updating maintenance:', error);
      alert('Failed to update maintenance settings');
    } finally {
      setUpdatingMaintenance(false);
    }
  };

  const handleAddWhitelistIp = async () => {
    if (!newIp.trim()) return;
    
    const updatedIps = [...maintenance.whitelisted_ips, newIp.trim()];
    setUpdatingMaintenance(true);
    try {
      const response = await fetch('/api/admin/maintenance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...maintenance,
          whitelisted_ips: updatedIps,
        }),
      });

      if (response.ok) {
        setMaintenance({ ...maintenance, whitelisted_ips: updatedIps });
        setNewIp('');
        showSuccessToast('IP added to whitelist');
      }
    } catch (error) {
      console.error('Error adding IP:', error);
    } finally {
      setUpdatingMaintenance(false);
    }
  };

  const handleRemoveWhitelistIp = async (ip: string) => {
    const updatedIps = maintenance.whitelisted_ips.filter((i) => i !== ip);
    setUpdatingMaintenance(true);
    try {
      const response = await fetch('/api/admin/maintenance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...maintenance,
          whitelisted_ips: updatedIps,
        }),
      });

      if (response.ok) {
        setMaintenance({ ...maintenance, whitelisted_ips: updatedIps });
        showSuccessToast('IP removed from whitelist');
      }
    } catch (error) {
      console.error('Error removing IP:', error);
    } finally {
      setUpdatingMaintenance(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to revoke this session?')) return;

    try {
      const response = await fetch(`/api/admin/sessions?session_id=${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showSuccessToast('Session revoked successfully');
        fetchActiveSessions();
      }
    } catch (error) {
      console.error('Error revoking session:', error);
      alert('Failed to revoke session');
    }
  };

  const handleForceLogoutAll = async () => {
    if (!confirm('Are you sure you want to force logout ALL users? This action cannot be undone.')) return;

    try {
      const response = await fetch('/api/admin/sessions?force_all=true', {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        showSuccessToast(`Logged out ${data.deleted_count} users`);
        fetchActiveSessions();
      }
    } catch (error) {
      console.error('Error forcing logout:', error);
      alert('Failed to force logout users');
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

      showSuccessToast('Broadcast sent to all users!');
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

  const showSuccessToast = (msg: string) => {
    setSuccessMessage(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getCharacterColor = () => {
    const len = message.length;
    if (len < 200) return 'text-emerald-400';
    if (len < 400) return 'text-amber-400';
    return 'text-red-400';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
            <GeneralTab
              profile={profile}
              stats={stats}
              settings={settings}
              setSettings={setSettings}
              editingSettings={editingSettings}
              setEditingSettings={setEditingSettings}
              savingSettings={savingSettings}
              handleSaveSettings={handleSaveSettings}
              quickActions={quickActions}
              colorMap={colorMap}
            />
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
            <SystemTab
              settings={settings}
              maintenance={maintenance}
              setMaintenance={setMaintenance}
              updatingMaintenance={updatingMaintenance}
              handleToggleMaintenance={handleToggleMaintenance}
              handleUpdateMaintenanceMessage={handleUpdateMaintenanceMessage}
              newIp={newIp}
              setNewIp={setNewIp}
              handleAddWhitelistIp={handleAddWhitelistIp}
              handleRemoveWhitelistIp={handleRemoveWhitelistIp}
              healthMetrics={healthMetrics}
              loadingHealth={loadingHealth}
              fetchHealthMetrics={fetchHealthMetrics}
            />
          )}

          {activeTab === 'security' && (
            <SecurityTab
              settings={settings}
              setSettings={setSettings}
              sessions={sessions}
              loadingSessions={loadingSessions}
              handleRevokeSession={handleRevokeSession}
              handleForceLogoutAll={handleForceLogoutAll}
              formatDate={formatDate}
            />
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
              <p className="font-semibold text-white">Success!</p>
              <p className="text-sm text-emerald-400">{successMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Import tab components
import GeneralTab from './GeneralTab';
import SystemTab from './SystemTab';
import SecurityTab from './SecurityTab';
