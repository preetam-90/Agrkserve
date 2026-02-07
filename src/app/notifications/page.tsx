'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNotifications, useNotificationStats } from '@/lib/services/notifications';
import type {
  NotificationFilters as FilterType,
  NotificationGroup,
  NotificationCategory,
  NotificationPriority,
} from '@/lib/types/notifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  Settings,
  Search,
  X,
  Filter,
  CheckCircle,
  XCircle,
  MessageSquare,
  Info,
  Star,
  TrendingUp,
  Shield,
  Inbox,
  Eye,
  CheckCheck,
  Trash2,
  ArrowRight,
  Loader2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Zap,
  AlertTriangle,
  Heart,
  Calendar,
  User,
  CreditCard,
  Megaphone,
  Gift,
  Award,
  Flame,
  Rocket,
  Target,
  Lightbulb,
  Globe,
  Lock,
  Unlock,
  RefreshCw,
  Archive,
  ArchiveX,
  BellRing,
  BellOff,
  Leaf,
  Tractor,
  Truck,
  Users,
  Wheat,
  Sunrise,
  Sunset,
  TreePine,
  LandPlot,
  Warehouse,
  Scissors,
  CircleDollarSign,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Agriculture-themed notification icons mapping
const NOTIFICATION_ICONS: Record<NotificationCategory, any> = {
  booking: Tractor,
  message: MessageSquare,
  payment: CircleDollarSign,
  system: Info,
  trust: Star,
  security: Shield,
  insight: TrendingUp,
  review: Star,

  promotion: Megaphone,
  reward: Gift,
  achievement: Award,
  alert: AlertTriangle,
  update: RefreshCw,
  profile: User,
  equipment: Truck,
  invoice: CreditCard,
  event: Calendar,
  social: Heart,
  trending: Flame,
  launch: Rocket,
  goal: Target,
  tip: Lightbulb,
  global: Globe,
  privacy: Lock,
  access: Unlock,
  labor: Users,
  harvest: Wheat,
  maintenance: Scissors,
  delivery: Truck,
  field: LandPlot,
  storage: Warehouse,
  weather: Sunrise,
};

// Agriculture-themed priority styles
const PRIORITY_STYLES: Record<
  NotificationPriority,
  {
    dot: string;
    bg: string;
    border: string;
    text: string;
    glow: string;
  }
> = {
  critical: {
    dot: 'bg-amber-400',
    bg: 'bg-amber-400/5 hover:bg-amber-400/10',
    border: 'border-amber-400/20 hover:border-amber-400/30',
    text: 'text-amber-300',
    glow: 'shadow-lg shadow-amber-500/20',
  },
  high: {
    dot: 'bg-orange-500',
    bg: 'bg-orange-500/5 hover:bg-orange-500/10',
    border: 'border-orange-500/20 hover:border-orange-500/30',
    text: 'text-orange-400',
    glow: 'shadow-lg shadow-orange-500/15',
  },
  normal: {
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-500/5 hover:bg-emerald-500/10',
    border: 'border-emerald-500/20 hover:border-emerald-500/30',
    text: 'text-emerald-400',
    glow: 'shadow-lg shadow-emerald-500/10',
  },
  low: {
    dot: 'bg-slate-400',
    bg: 'bg-slate-400/5 hover:bg-slate-400/10',
    border: 'border-slate-400/20 hover:border-slate-400/30',
    text: 'text-slate-300',
    glow: 'shadow-lg shadow-slate-500/5',
  },
};

// Agriculture-themed category colors
const CATEGORY_COLORS: Record<
  NotificationCategory,
  {
    bg: string;
    text: string;
    iconBg: string;
    border: string;
    gradient: string;
  }
> = {
  booking: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    iconBg: 'bg-emerald-500/20',
    border: 'border-emerald-500/30',
    gradient: 'from-emerald-500/20 to-emerald-600/20',
  },
  message: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    iconBg: 'bg-cyan-500/20',
    border: 'border-cyan-500/30',
    gradient: 'from-cyan-500/20 to-cyan-600/20',
  },
  payment: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    iconBg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    gradient: 'from-amber-500/20 to-amber-600/20',
  },
  system: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    iconBg: 'bg-slate-500/20',
    border: 'border-slate-500/30',
    gradient: 'from-slate-500/20 to-slate-600/20',
  },
  trust: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    iconBg: 'bg-violet-500/20',
    border: 'border-violet-500/30',
    gradient: 'from-violet-500/20 to-violet-600/20',
  },
  security: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    iconBg: 'bg-rose-500/20',
    border: 'border-rose-500/30',
    gradient: 'from-rose-500/20 to-rose-600/20',
  },
  insight: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    gradient: 'from-blue-500/20 to-blue-600/20',
  },
  review: {
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    iconBg: 'bg-pink-500/20',
    border: 'border-pink-500/30',
    gradient: 'from-pink-500/20 to-pink-600/20',
  },
  promotion: {
    bg: 'bg-fuchsia-500/10',
    text: 'text-fuchsia-400',
    iconBg: 'bg-fuchsia-500/20',
    border: 'border-fuchsia-500/30',
    gradient: 'from-fuchsia-500/20 to-fuchsia-600/20',
  },
  reward: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    iconBg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
    gradient: 'from-yellow-500/20 to-yellow-600/20',
  },
  achievement: {
    bg: 'bg-lime-500/10',
    text: 'text-lime-400',
    iconBg: 'bg-lime-500/20',
    border: 'border-lime-500/30',
    gradient: 'from-lime-500/20 to-lime-600/20',
  },
  alert: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    iconBg: 'bg-orange-500/20',
    border: 'border-orange-500/30',
    gradient: 'from-orange-500/20 to-orange-600/20',
  },
  update: {
    bg: 'bg-teal-500/10',
    text: 'text-teal-400',
    iconBg: 'bg-teal-500/20',
    border: 'border-teal-500/30',
    gradient: 'from-teal-500/20 to-teal-600/20',
  },
  profile: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    iconBg: 'bg-indigo-500/20',
    border: 'border-indigo-500/30',
    gradient: 'from-indigo-500/20 to-indigo-600/20',
  },
  equipment: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    iconBg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    gradient: 'from-amber-500/20 to-amber-600/20',
  },
  invoice: {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    iconBg: 'bg-green-500/20',
    border: 'border-green-500/30',
    gradient: 'from-green-500/20 to-green-600/20',
  },
  event: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    iconBg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    gradient: 'from-purple-500/20 to-purple-600/20',
  },
  social: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    iconBg: 'bg-rose-500/20',
    border: 'border-rose-500/30',
    gradient: 'from-rose-500/20 to-rose-600/20',
  },
  trending: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    iconBg: 'bg-orange-500/20',
    border: 'border-orange-500/30',
    gradient: 'from-orange-500/20 to-orange-600/20',
  },
  launch: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    iconBg: 'bg-cyan-500/20',
    border: 'border-cyan-500/30',
    gradient: 'from-cyan-500/20 to-cyan-600/20',
  },
  goal: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    iconBg: 'bg-emerald-500/20',
    border: 'border-emerald-500/30',
    gradient: 'from-emerald-500/20 to-emerald-600/20',
  },
  tip: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    iconBg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
    gradient: 'from-yellow-500/20 to-yellow-600/20',
  },
  global: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    gradient: 'from-blue-500/20 to-blue-600/20',
  },
  privacy: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    iconBg: 'bg-red-500/20',
    border: 'border-red-500/30',
    gradient: 'from-red-500/20 to-red-600/20',
  },
  access: {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    iconBg: 'bg-green-500/20',
    border: 'border-green-500/30',
    gradient: 'from-green-500/20 to-green-600/20',
  },
  labor: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    iconBg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    gradient: 'from-amber-500/20 to-amber-600/20',
  },
  harvest: {
    bg: 'bg-amber-600/10',
    text: 'text-amber-300',
    iconBg: 'bg-amber-600/20',
    border: 'border-amber-600/30',
    gradient: 'from-amber-600/20 to-amber-700/20',
  },
  maintenance: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    iconBg: 'bg-slate-500/20',
    border: 'border-slate-500/30',
    gradient: 'from-slate-500/20 to-slate-600/20',
  },
  delivery: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    gradient: 'from-blue-500/20 to-blue-600/20',
  },
  field: {
    bg: 'bg-green-700/10',
    text: 'text-green-300',
    iconBg: 'bg-green-700/20',
    border: 'border-green-700/30',
    gradient: 'from-green-700/20 to-green-800/20',
  },
  storage: {
    bg: 'bg-amber-800/10',
    text: 'text-amber-200',
    iconBg: 'bg-amber-800/20',
    border: 'border-amber-800/30',
    gradient: 'from-amber-800/20 to-amber-900/20',
  },
  weather: {
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    iconBg: 'bg-sky-500/20',
    border: 'border-sky-500/30',
    gradient: 'from-sky-500/20 to-sky-600/20',
  },
};

// Agriculture-themed categories for filters
const CATEGORIES: { value: NotificationCategory; label: string; icon: any }[] = [
  { value: 'booking', label: 'Bookings', icon: Tractor },
  { value: 'equipment', label: 'Equipment', icon: Truck },
  { value: 'labor', label: 'Labor', icon: Users },
  { value: 'payment', label: 'Payments', icon: CircleDollarSign },
  { value: 'harvest', label: 'Harvest', icon: Wheat },
  { value: 'maintenance', label: 'Maintenance', icon: Scissors },
  { value: 'delivery', label: 'Deliveries', icon: Truck },
  { value: 'field', label: 'Field Updates', icon: LandPlot },
  { value: 'weather', label: 'Weather Alerts', icon: Sunrise },
  { value: 'message', label: 'Messages', icon: MessageSquare },
  { value: 'trust', label: 'Reviews', icon: Star },
  { value: 'security', label: 'Security', icon: Shield },
];

// Priorities for filters
const PRIORITIES: { value: NotificationPriority; label: string; color: string }[] = [
  { value: 'critical', label: 'Urgent', color: 'bg-amber-400' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'normal', label: 'Normal', color: 'bg-emerald-500' },
  { value: 'low', label: 'Low', color: 'bg-slate-400' },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterType>({});
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['Today', 'Yesterday', 'Earlier'])
  );
  const isBackgroundLoaded = true;

  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    loadMore,
    hasMore,
  } = useNotifications(filters);

  const { stats } = useNotificationStats();

  // Filter based on active tab and search query
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Filter by tab
    if (activeTab === 'unread') {
      filtered = filtered.filter((n) => !n.is_read);
    } else if (activeTab === 'read') {
      filtered = filtered.filter((n) => n.is_read);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query) ||
          n.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [notifications, activeTab, searchQuery]);

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: NotificationGroup[] = [
      { label: 'Today', notifications: [] },
      { label: 'Yesterday', notifications: [] },
      { label: 'Earlier', notifications: [] },
    ];

    filteredNotifications.forEach((notification) => {
      const notificationDate = new Date(notification.created_at);

      if (notificationDate >= today) {
        groups[0].notifications.push(notification);
      } else if (notificationDate >= yesterday) {
        groups[1].notifications.push(notification);
      } else {
        groups[2].notifications.push(notification);
      }
    });

    return groups.filter((group) => group.notifications.length > 0);
  }, [filteredNotifications]);

  // Handlers
  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, [markAllAsRead]);

  const handleClearAll = useCallback(async () => {
    if (
      window.confirm('Are you sure you want to clear all notifications? This cannot be undone.')
    ) {
      try {
        await clearAll();
      } catch (err) {
        console.error('Failed to clear notifications:', err);
      }
    }
  }, [clearAll]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleToggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  const handleTabChange = useCallback((tab: 'all' | 'unread' | 'read') => {
    setActiveTab(tab);
    // Reset to top when changing tabs
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleFiltersChange = useCallback((newFilters: FilterType) => {
    setFilters(newFilters);
    // Reset to top when filters change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleCategory = (category: NotificationCategory) => {
    const current = filters.category || [];
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];

    handleFiltersChange({
      ...filters,
      category: updated.length > 0 ? updated : undefined,
    });
  };

  const togglePriority = (priority: NotificationPriority) => {
    const current = filters.priority || [];
    const updated = current.includes(priority)
      ? current.filter((p) => p !== priority)
      : [...current, priority];

    handleFiltersChange({
      ...filters,
      priority: updated.length > 0 ? updated : undefined,
    });
  };

  const clearFilters = () => {
    handleFiltersChange({});
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map((n) => n.id)));
    }
  };

  const toggleSelectNotification = (id: string) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedNotifications(newSelected);
  };

  const handleMarkSelectedRead = async () => {
    try {
      await Promise.all(Array.from(selectedNotifications).map((id) => markAsRead(id)));
      setSelectedNotifications(new Set());
    } catch (err) {
      console.error('Failed to mark selected as read:', err);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedNotifications.size === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedNotifications.size} notification${selectedNotifications.size > 1 ? 's' : ''}?`
      )
    ) {
      try {
        await Promise.all(Array.from(selectedNotifications).map((id) => deleteNotification(id)));
        setSelectedNotifications(new Set());
      } catch (err) {
        console.error('Failed to delete selected notifications:', err);
      }
    }
  };

  const toggleGroup = (label: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedGroups(newExpanded);
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      try {
        await markAsRead(notification.id);
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }

    if (notification.action_url) {
      router.push(notification.action_url);
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // Calculate stats
  const readCount = notifications.length - unreadCount;
  const readRate =
    notifications.length > 0 ? Math.round((readCount / notifications.length) * 100) : 0;
  const activeFilterCount =
    (filters.category?.length || 0) +
    (filters.priority?.length || 0) +
    (filters.is_read !== undefined ? 1 : 0);

  // Agriculture-themed background pattern
  const backgroundPattern = `
    radial-gradient(circle at 10% 20%, rgba(34, 197, 94, 0.05) 0%, transparent 20%),
    radial-gradient(circle at 90% 80%, rgba(245, 158, 11, 0.05) 0%, transparent 20%),
    radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.03) 0%, transparent 25%),
    radial-gradient(circle at 70% 30%, rgba(139, 92, 246, 0.03) 0%, transparent 25%),
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.02) 0px, rgba(255, 255, 255, 0.02) 1px, transparent 1px, transparent 20px),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.02) 0px, rgba(255, 255, 255, 0.02) 1px, transparent 1px, transparent 20px)
  `;

  return (
    <div
      className={cn(
        'relative min-h-screen overflow-hidden',
        'bg-gradient-to-br from-slate-900 via-emerald-900/10 to-slate-900',
        'text-slate-100'
      )}
      style={{
        backgroundImage: isBackgroundLoaded ? backgroundPattern : 'none',
        transition: 'background-image 0.5s ease',
      }}
    >
      {/* Animated Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Floating leaves - using stable positions based on index */}
        {[...Array(4)].map((_, i) => {
          // Generate stable pseudo-random values based on index
          const seed = i * 7919; // Prime number for better distribution
          const left = (seed * 13) % 100;
          const top = (seed * 17) % 100;
          const delay = ((seed * 11) % 50) / 10;
          const duration = 15 + ((seed * 19) % 100) / 10;
          const size = 20 + ((seed * 23) % 300) / 10;

          return (
            <div
              key={i}
              className="animate-float absolute opacity-20"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            >
              <Leaf size={size} className={i % 2 === 0 ? 'text-emerald-500' : 'text-amber-400'} />
            </div>
          );
        })}

        {/* Sun glow */}
        <div className="absolute right-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-amber-400/10 blur-3xl" />

        {/* Horizon line */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-900 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 opacity-25 blur"></div>
                <Bell className="relative h-8 w-8 text-emerald-400" />
              </div>
              <h1 className="bg-gradient-to-r from-emerald-400 to-amber-300 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 animate-pulse px-3 py-1 text-sm font-bold"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </div>
            <p className="max-w-2xl text-slate-300">
              Stay updated with your equipment bookings, labor schedules, field activities, and
              important alerts
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/settings/notifications')}
              className={cn(
                'border-slate-700/50 bg-white/5 backdrop-blur-sm hover:bg-white/10',
                'text-slate-200 transition-all duration-300 hover:text-white',
                'shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20'
              )}
            >
              <Settings className="mr-2 h-5 w-5" />
              Notification Settings
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleToggleFilters}
              className={cn(
                'border-slate-700/50 bg-white/5 backdrop-blur-sm hover:bg-white/10',
                'text-slate-200 transition-all duration-300 hover:text-white',
                'relative shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20'
              )}
            >
              <Filter className="mr-2 h-5 w-5" />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -right-2 -top-2 h-5 min-w-[1.2rem] bg-amber-400 px-1.5 text-xs font-bold text-slate-900"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-700/50 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-slate-300">
                <Inbox className="h-5 w-5 text-emerald-400" />
                Total Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-3xl font-bold text-transparent">
                {stats?.total || 0}
              </div>
              <p className="mt-1 text-sm text-slate-400">All time</p>
            </CardContent>
          </Card>

          <Card className="border-slate-700/50 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-amber-400/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-slate-300">
                <Eye className="h-5 w-5 text-amber-300" />
                Unread
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-3xl font-bold text-transparent">
                {unreadCount}
              </div>
              <p className="mt-1 text-sm text-slate-400">Need attention</p>
            </CardContent>
          </Card>

          <Card className="border-slate-700/50 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="h-5 w-5 text-cyan-400" />
                Read Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-3xl font-bold text-transparent">
                {readRate}%
              </div>
              <p className="mt-1 text-sm text-slate-400">Of all notifications</p>
            </CardContent>
          </Card>

          <Card className="border-slate-700/50 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-slate-300">
                <TrendingUp className="h-5 w-5 text-violet-400" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-violet-400 to-fuchsia-300 bg-clip-text text-3xl font-bold text-transparent">
                {Math.floor((stats?.total || 0) * 0.7)}
              </div>
              <p className="mt-1 text-sm text-slate-400">New activities</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="relative mx-auto mb-8 max-w-3xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <Input
            type="text"
            placeholder="Search notifications (booking ID, equipment, message...)"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={cn(
              'h-14 border-slate-700/50 bg-white/5 pl-12 backdrop-blur-sm',
              'focus:border-emerald-500/50 focus:ring-emerald-500/20',
              'text-white placeholder:text-slate-400',
              'ring-1 ring-white/10 focus:ring-white/20',
              'rounded-xl text-base transition-all duration-300',
              'hover:border-slate-600/70'
            )}
            aria-label="Search notifications"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 p-0 text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-8 overflow-hidden border-slate-700/50 bg-white/5 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-700/50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <SlidersHorizontal className="h-5 w-5 text-emerald-400" />
                  Filter Notifications
                </CardTitle>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="bg-amber-400/20 text-amber-200">
                    {activeFilterCount} active
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Categories */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-lg font-semibold text-emerald-300">
                      <Tractor className="h-5 w-5" />
                      Categories
                    </Label>
                    {filters.category && filters.category.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFiltersChange({ ...filters, category: undefined })}
                        className="h-7 text-xs text-amber-300 hover:bg-white/5 hover:text-amber-200"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {CATEGORIES.map((category) => {
                      const Icon = category.icon;
                      const isSelected = filters.category?.includes(category.value) ?? false;
                      const categoryColor =
                        CATEGORY_COLORS[category.value] || CATEGORY_COLORS.system;

                      return (
                        <div
                          key={category.value}
                          onClick={() => toggleCategory(category.value)}
                          className={cn(
                            'flex cursor-pointer flex-col items-center gap-2 rounded-lg p-3 transition-all duration-200',
                            'border border-slate-700/50 hover:border-emerald-500/30',
                            isSelected
                              ? `bg-gradient-to-br ${categoryColor.gradient} border ${categoryColor.border}`
                              : 'bg-white/3 hover:bg-white/5'
                          )}
                        >
                          <div
                            className={cn(
                              'rounded-lg p-2 transition-all duration-200',
                              isSelected ? categoryColor.iconBg : 'bg-slate-800/50'
                            )}
                          >
                            <Icon
                              className={cn(
                                'h-5 w-5',
                                isSelected ? categoryColor.text : 'text-slate-300'
                              )}
                            />
                          </div>
                          <span
                            className={cn(
                              'text-center text-sm font-medium',
                              isSelected ? categoryColor.text : 'text-slate-300'
                            )}
                          >
                            {category.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Priority */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-lg font-semibold text-amber-300">
                      <Zap className="h-5 w-5" />
                      Priority
                    </Label>
                    {filters.priority && filters.priority.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFiltersChange({ ...filters, priority: undefined })}
                        className="h-7 text-xs text-emerald-300 hover:bg-white/5 hover:text-emerald-200"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {PRIORITIES.map((priority) => {
                      const isSelected = filters.priority?.includes(priority.value) ?? false;
                      const priorityStyle =
                        PRIORITY_STYLES[priority.value] || PRIORITY_STYLES.normal;

                      return (
                        <div
                          key={priority.value}
                          onClick={() => togglePriority(priority.value)}
                          className={cn(
                            'flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-all duration-200',
                            'border border-slate-700/50 hover:border-amber-400/30',
                            isSelected
                              ? `bg-gradient-to-r ${priorityStyle.bg} border ${priorityStyle.border} ${priorityStyle.glow}`
                              : 'bg-white/3 hover:bg-white/5'
                          )}
                        >
                          <div
                            className={cn(
                              'h-3 w-3 rounded-full transition-all duration-200',
                              priorityStyle.dot
                            )}
                          />
                          <span
                            className={cn(
                              'text-sm font-medium',
                              isSelected ? priorityStyle.text : 'text-slate-300'
                            )}
                          >
                            {priority.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2 text-lg font-semibold text-cyan-300">
                    <CheckCheck className="h-5 w-5" />
                    Status
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'all', label: 'All', icon: Inbox, color: 'text-slate-300' },
                      { value: 'unread', label: 'Unread', icon: Eye, color: 'text-amber-300' },
                      {
                        value: 'read',
                        label: 'Read',
                        icon: CheckCircle,
                        color: 'text-emerald-400',
                      },
                    ].map((status) => {
                      const Icon = status.icon;
                      const isActive =
                        (status.value === 'all' && filters.is_read === undefined) ||
                        (status.value === 'read' && filters.is_read === true) ||
                        (status.value === 'unread' && filters.is_read === false);

                      return (
                        <div
                          key={status.value}
                          onClick={() =>
                            handleFiltersChange({
                              ...filters,
                              is_read: status.value === 'all' ? undefined : status.value === 'read',
                            })
                          }
                          className={cn(
                            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg p-3 transition-all duration-300',
                            'border border-slate-700/50 hover:border-cyan-400/30',
                            isActive
                              ? 'border-cyan-500/30 bg-gradient-to-br from-cyan-500/15 to-cyan-600/15 shadow-lg shadow-cyan-500/10'
                              : 'bg-white/3 hover:bg-white/5'
                          )}
                        >
                          <Icon
                            className={cn('h-5 w-5', isActive ? status.color : 'text-slate-400')}
                          />
                          <span
                            className={cn(
                              'text-sm font-medium',
                              isActive ? status.color : 'text-slate-300'
                            )}
                          >
                            {status.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className="mt-6 flex justify-end border-t border-slate-700/50 pt-4">
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="border-amber-400/30 text-amber-300 hover:bg-amber-400/10 hover:text-amber-200"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Clear All Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Card className="overflow-hidden border-slate-700/50 bg-white/5 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700/50 pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <BellRing className="h-6 w-6 text-emerald-400" />
                  All Notifications
                </CardTitle>
                <CardDescription className="mt-1 text-slate-300">
                  {unreadCount > 0 ? (
                    <span className="flex items-center gap-2 font-medium text-amber-300">
                      <AlertTriangle className="h-4 w-4" />
                      You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 font-medium text-emerald-400">
                      <CheckCircle className="h-4 w-4" />
                      You're all caught up! Great job staying on top of your farm operations 🌾
                    </span>
                  )}
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {selectedNotifications.size > 0 && (
                  <>
                    <Button
                      onClick={handleMarkSelectedRead}
                      size="sm"
                      className="border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark Selected Read ({selectedNotifications.size})
                    </Button>
                    <Button
                      onClick={handleDeleteSelected}
                      size="sm"
                      variant="outline"
                      className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Selected
                    </Button>
                  </>
                )}

                {unreadCount > 0 && (
                  <Button
                    onClick={handleMarkAllRead}
                    size="sm"
                    className="border border-amber-500/30 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"
                  >
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Mark All Read
                  </Button>
                )}

                {notifications.length > 0 && (
                  <Button
                    onClick={handleClearAll}
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-white/5"
                  >
                    <ArchiveX className="mr-2 h-4 w-4" />
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Tabs */}
            <div className="mb-6 flex flex-wrap border-b border-slate-700/50">
              {[
                { tab: 'all', label: 'All', count: notifications.length, icon: Inbox },
                { tab: 'unread', label: 'Unread', count: unreadCount, icon: Eye },
                { tab: 'read', label: 'Read', count: readCount, icon: CheckCircle },
              ].map(({ tab, label, count, icon: TabIcon }) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab as 'all' | 'unread' | 'read')}
                  role="tab"
                  aria-selected={activeTab === tab}
                  aria-controls={`${tab}-panel`}
                  id={`tab-${tab}`}
                  className={cn(
                    'flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900',
                    activeTab === tab
                      ? 'border-emerald-500 text-white shadow-sm'
                      : 'border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-200'
                  )}
                >
                  <TabIcon className="h-4 w-4" />
                  {label}
                  <span
                    className={cn(
                      'ml-1 rounded-full px-2 py-0.5 text-xs font-bold',
                      activeTab === tab ? 'bg-white/10' : 'bg-slate-800/50'
                    )}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* Loading, Error, and Empty States */}
            {loading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 opacity-25 blur-xl"></div>
                  <Loader2 className="relative h-12 w-12 animate-spin text-emerald-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-200">
                  Loading notifications...
                </h3>
                <p className="max-w-md text-center text-slate-400">
                  Please wait while we fetch your latest updates from the fields and equipment
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/5 py-16">
                <div className="mb-6 rounded-full bg-rose-500/10 p-4">
                  <XCircle className="h-12 w-12 text-rose-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-200">
                  Failed to load notifications
                </h3>
                <p className="mb-6 max-w-md text-center text-slate-400">
                  {error.message || 'Something went wrong while fetching your notifications'}
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="mb-6 rounded-full bg-slate-800/50 p-4">
                  {searchQuery ? (
                    <Search className="h-12 w-12 text-slate-400" />
                  ) : activeTab === 'unread' ? (
                    <CheckCircle className="h-12 w-12 text-emerald-400" />
                  ) : activeTab === 'read' ? (
                    <Archive className="h-12 w-12 text-slate-400" />
                  ) : (
                    <BellOff className="h-12 w-12 text-slate-400" />
                  )}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-200">
                  {searchQuery
                    ? 'No matching notifications'
                    : activeTab === 'unread'
                      ? "You've read everything! 🌾"
                      : activeTab === 'read'
                        ? 'No read notifications yet'
                        : 'No notifications yet'}
                </h3>
                <p className="mb-6 max-w-md text-center text-slate-400">
                  {searchQuery
                    ? 'Try adjusting your search terms or filters'
                    : activeTab === 'unread'
                      ? 'Great job staying on top of your farm operations!'
                      : activeTab === 'read'
                        ? 'Read notifications will appear here after you mark some as read'
                        : "We'll notify you when equipment is booked, labor is scheduled, or important field updates happen"}
                </p>
                {searchQuery && (
                  <Button
                    onClick={handleClearSearch}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-white/5"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Bulk Actions Header */}
                <div className="mb-6 flex items-center gap-3 border-b border-slate-700/50 pb-4">
                  <Checkbox
                    id="select-all"
                    checked={
                      selectedNotifications.size > 0 &&
                      selectedNotifications.size === filteredNotifications.length
                    }
                    onCheckedChange={toggleSelectAll}
                    className="border-slate-600 data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
                  />
                  <Label htmlFor="select-all" className="text-sm font-medium text-slate-300">
                    {selectedNotifications.size > 0
                      ? `${selectedNotifications.size} selected`
                      : 'Select all'}
                  </Label>
                </div>

                {/* Notification Groups */}
                {groupedNotifications.map((group) => {
                  const isExpanded = expandedGroups.has(group.label);
                  const GroupIcon =
                    group.label === 'Today'
                      ? Sunrise
                      : group.label === 'Yesterday'
                        ? Sunset
                        : TreePine;

                  return (
                    <div key={group.label} className="mb-6 last:mb-0">
                      {/* Group Header */}
                      <div
                        className="mb-3 flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors hover:bg-white/5"
                        onClick={() => toggleGroup(group.label)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="rounded-lg bg-slate-800/50 p-1.5">
                            <GroupIcon className="h-4 w-4 text-emerald-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-200">{group.label}</h3>
                          <span className="ml-2 rounded-full bg-slate-800/50 px-2 py-0.5 text-xs text-slate-400">
                            {group.notifications.length}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                      </div>

                      {/* Notifications */}
                      {isExpanded && (
                        <div className="space-y-3">
                          {group.notifications.map((notification) => {
                            const Icon = NOTIFICATION_ICONS[notification.category] || Info;
                            const priorityStyle =
                              PRIORITY_STYLES[notification.priority] || PRIORITY_STYLES.normal;
                            const categoryColor =
                              CATEGORY_COLORS[notification.category] || CATEGORY_COLORS.system;
                            const isSelected = selectedNotifications.has(notification.id);

                            return (
                              <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={cn(
                                  'group relative flex cursor-pointer gap-4 rounded-xl p-4 transition-all duration-200',
                                  'border border-slate-700/50 hover:border-emerald-500/30',
                                  'bg-white/3 hover:bg-white/5',
                                  notification.is_read
                                    ? 'opacity-80'
                                    : 'bg-gradient-to-r from-emerald-500/5 to-transparent',
                                  priorityStyle.bg,
                                  priorityStyle.border,
                                  priorityStyle.glow,
                                  isSelected && 'bg-emerald-500/5 ring-2 ring-emerald-500/50'
                                )}
                                role="listitem"
                              >
                                {/* Checkbox */}
                                <div
                                  className="absolute -left-3 top-1/2 z-10 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Checkbox
                                    id={`notification-${notification.id}`}
                                    checked={isSelected}
                                    onCheckedChange={() =>
                                      toggleSelectNotification(notification.id)
                                    }
                                    className="border-slate-600 data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
                                  />
                                </div>

                                {/* Icon */}
                                <div
                                  className={cn(
                                    'mt-1 flex-shrink-0 rounded-xl p-3',
                                    categoryColor.iconBg,
                                    categoryColor.gradient
                                  )}
                                >
                                  <Icon className={cn('h-5 w-5', categoryColor.text)} />
                                </div>

                                {/* Content */}
                                <div className="min-w-0 flex-1">
                                  <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={cn(
                                          'font-semibold text-white',
                                          notification.is_read ? 'text-slate-200' : 'text-slate-100'
                                        )}
                                      >
                                        {notification.title}
                                      </span>
                                      {!notification.is_read && (
                                        <span
                                          className={cn(
                                            'h-2 w-2 animate-pulse rounded-full',
                                            priorityStyle.dot
                                          )}
                                        />
                                      )}
                                    </div>
                                    <time className="whitespace-nowrap text-xs text-slate-400">
                                      {formatDistanceToNow(new Date(notification.created_at), {
                                        addSuffix: true,
                                        includeSeconds: false,
                                      })}
                                    </time>
                                  </div>

                                  <p
                                    className={cn(
                                      'mb-2 line-clamp-2 text-sm',
                                      notification.is_read ? 'text-slate-300' : 'text-slate-200'
                                    )}
                                  >
                                    {notification.message}
                                  </p>

                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                      variant="secondary"
                                      className={cn(
                                        'border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/50',
                                        categoryColor.text,
                                        categoryColor.border
                                      )}
                                    >
                                      <span className="flex items-center gap-1">
                                        <Icon className="h-3 w-3" />
                                        {notification.category}
                                      </span>
                                    </Badge>

                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        'border',
                                        priorityStyle.border,
                                        priorityStyle.text
                                      )}
                                    >
                                      {notification.priority}
                                    </Badge>

                                    {notification.action_url && notification.action_label && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (notification.action_url) {
                                            router.push(notification.action_url);
                                          }
                                        }}
                                        className={cn(
                                          'h-7 text-xs font-medium',
                                          'bg-white/5 hover:bg-white/10',
                                          'text-emerald-300 hover:text-emerald-200',
                                          'border border-emerald-500/20 hover:border-emerald-500/30'
                                        )}
                                      >
                                        {notification.action_label}
                                        <ArrowRight className="ml-1 h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>

                                {/* Delete button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => handleDeleteNotification(e, notification.id)}
                                  className={cn(
                                    'absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100',
                                    'text-slate-400 hover:bg-rose-500/10 hover:text-rose-400'
                                  )}
                                  title="Delete notification"
                                  aria-label="Delete notification"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {/* Load More Button */}
            {hasMore && filteredNotifications.length > 0 && (
              <div className="mt-8 flex justify-center border-t border-slate-700/50 pt-6">
                <Button
                  onClick={loadMore}
                  disabled={loading}
                  size="lg"
                  className="border border-slate-700/50 bg-gradient-to-r from-emerald-500/10 to-amber-400/10 text-white hover:from-emerald-500/20 hover:to-amber-400/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading more...
                    </>
                  ) : (
                    <>
                      <Archive className="mr-2 h-4 w-4" />
                      Load More Notifications
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-6 right-6 z-50 md:hidden">
          <Button
            size="lg"
            className="rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 text-white shadow-xl hover:from-emerald-600 hover:to-amber-500"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="mr-2 h-6 w-6" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative mt-12 border-t border-slate-700/50 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-slate-400 sm:px-6 lg:px-8">
          <p className="flex items-center justify-center gap-2 text-sm">
            <Leaf className="h-4 w-4 text-emerald-400" />
            Harvesting notifications for your agricultural operations
          </p>
        </div>
      </footer>
    </div>
  );
}
