'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Tractor,
  Calendar,
  IndianRupee,
  TrendingUp,
  Activity,
  AlertCircle,
  TrendingDown,
  ArrowUpRight,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';

// Mock data for dashboard
const stats = [
  {
    title: 'Total Users',
    value: '1,248',
    change: '+12%',
    trend: 'up',
    icon: Users,
    color: 'blue',
  },
  {
    title: 'Active Bookings',
    value: '86',
    change: '+4%',
    trend: 'up',
    icon: Calendar,
    color: 'green',
  },
  {
    title: 'Equipment Listed',
    value: '342',
    change: '+8%',
    trend: 'up',
    icon: Tractor,
    color: 'yellow',
  },
  {
    title: 'Total Revenue',
    value: '₹4.2L',
    change: '+15%',
    trend: 'up',
    icon: IndianRupee,
    color: 'purple',
  },
];

interface RecentUser {
  id: string;
  name: string;
  role: string;
  location: string;
  date: string;
  created_at: string;
}

const recentBookings = [
  { id: 101, user: 'Vikram Singh', item: 'John Deere 5310', status: 'Pending', amount: '₹4,500' },
  { id: 102, user: 'Rajesh Kumar', item: 'Potato Planter', status: 'Confirmed', amount: '₹2,100' },
  { id: 103, user: 'Amit Verma', item: 'Harvester', status: 'Completed', amount: '₹12,000' },
  { id: 104, user: 'Priya Pawar', item: 'Labour Team (5)', status: 'Cancelled', amount: '₹3,000' },
];

const colorMap = {
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
  },
  green: {
    gradient: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  yellow: {
    gradient: 'from-amber-400 to-amber-500',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  purple: {
    gradient: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
  },
};

export default function AdminDashboard() {
  const router = useRouter();
  const { profile, isLoading } = useAuthStore();
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!isLoading && (!profile || !profile.roles?.includes('admin'))) {
      router.push('/dashboard');
    }
  }, [profile, isLoading, router]);

  // Fetch recent users from database
  useEffect(() => {
    const fetchRecentUsers = async () => {
      try {
        setUsersLoading(true);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*, user_roles!inner(role, is_active)')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        const formattedUsers = (data || []).map((user: any) => {
          const activeRole = user.user_roles?.find((r: any) => r.is_active)?.role || 'User';
          return {
            id: user.id,
            name: user.name || 'Unknown',
            role: activeRole.charAt(0).toUpperCase() + activeRole.slice(1),
            location: user.city || 'Unknown',
            date: formatDistanceToNow(new Date(user.created_at), { addSuffix: true }),
            created_at: user.created_at,
          };
        });

        setRecentUsers(formattedUsers);
      } catch (error) {
        console.error('Error fetching recent users:', error);
      } finally {
        setUsersLoading(false);
      }
    };

    if (profile?.roles?.includes('admin')) {
      fetchRecentUsers();
    }
  }, [profile, supabase]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-neutral-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Admin Overview</h1>
          <p className="mt-1 text-neutral-500">
            Welcome back, {profile?.name || 'Admin PK'}. Here's what's happening today.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/admin/settings')}
            className="btn-admin-primary rounded-xl px-5 py-2 text-sm font-semibold"
          >
            Settings
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const colors = colorMap[stat.color as keyof typeof colorMap];
          const Icon = stat.icon;

          return (
            <motion.div
              key={index}
              whileHover={{ y: -4 }}
              className="glass-card group relative overflow-hidden rounded-2xl border border-[#262626] p-6 transition-all duration-300 hover:border-emerald-500/20"
            >
              {/* Animated gradient background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-5`}
              />

              <div className="relative z-10">
                {/* Header */}
                <div className="mb-5 flex items-start justify-between">
                  <div
                    className={`rounded-xl p-3 ${colors.bg} ${colors.text} transition-all duration-300 group-hover:scale-110`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold ${
                      stat.trend === 'up'
                        ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                        : 'border border-red-500/20 bg-red-500/10 text-red-400'
                    }`}
                  >
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {stat.change}
                  </motion.div>
                </div>

                {/* Content */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    {stat.title}
                  </p>
                  <h3 className="text-3xl font-bold tracking-tight text-white">{stat.value}</h3>
                </div>
              </div>

              {/* Decorative gradient blob */}
              <div
                className={`absolute -bottom-6 -right-6 h-32 w-32 bg-gradient-to-br ${colors.gradient} rounded-full opacity-10 blur-3xl transition-opacity duration-500 group-hover:opacity-20`}
              />
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Bookings */}
        <div className="space-y-6 lg:col-span-2">
          <div className="glass-panel overflow-hidden rounded-2xl border border-[#262626]">
            <div className="animated-gradient-bg flex items-center justify-between border-b border-[#262626] p-6">
              <div>
                <h2 className="text-lg font-bold text-white">Recent Bookings</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Latest transaction activities across the platform.
                </p>
              </div>
              <button
                onClick={() => router.push('/admin/bookings')}
                className="flex items-center gap-1 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
              >
                View All
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              {recentBookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between rounded-xl border border-[#262626] bg-[#1a1a1a] p-4 transition-all hover:border-emerald-500/30 hover:bg-[#1f1f1f]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 font-bold text-white shadow-lg shadow-blue-500/30">
                      {booking.user.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-white">{booking.item}</p>
                      <p className="text-sm text-neutral-500">by {booking.user}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-mono font-semibold text-neutral-300">
                      {booking.amount}
                    </span>
                    <span
                      className={`badge-${
                        booking.status === 'Completed'
                          ? 'success'
                          : booking.status === 'Confirmed'
                            ? 'info'
                            : booking.status === 'Pending'
                              ? 'warning'
                              : 'error'
                      } inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* New Users */}
          <div className="glass-panel rounded-2xl border border-[#262626] p-6">
            <div className="mb-5">
              <h3 className="font-bold text-white">New Users</h3>
              <p className="mt-1 text-sm text-neutral-500">Recently registered members.</p>
            </div>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <motion.div
                  key={user.id}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 font-bold text-white shadow-lg shadow-emerald-500/30">
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-neutral-500">{user.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        user.role === 'Provider'
                          ? 'border border-purple-500/20 bg-purple-500/10 text-purple-400'
                          : user.role === 'Renter'
                            ? 'border border-blue-500/20 bg-blue-500/10 text-blue-400'
                            : 'border border-orange-500/20 bg-orange-500/10 text-orange-400'
                      }`}
                    >
                      {user.role}
                    </span>
                    <p className="mt-1 text-xs text-neutral-600">{user.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-6">
              <button
                onClick={() => router.push('/admin/users')}
                className="w-full rounded-xl border border-[#262626] bg-[#1a1a1a] px-4 py-2.5 text-sm font-medium text-white transition-all hover:border-emerald-500/30 hover:bg-[#1f1f1f]"
              >
                Manage Users
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 shadow-xl">
            {/* Decorative background */}
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/5 blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-emerald-100">
                    System Status
                  </p>
                  <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                    <Activity className="h-5 w-5" />
                    All Systems Normal
                  </h3>
                </div>
                <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-sm">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-emerald-100">Server Load</span>
                    <span className="font-semibold text-white">12%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-900/30 backdrop-blur-sm">
                    <div className="h-2 w-[12%] rounded-full bg-white shadow-lg"></div>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-emerald-100">Database</span>
                    <span className="font-semibold text-white">Stable</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-900/30 backdrop-blur-sm">
                    <div className="h-2 w-[95%] rounded-full bg-white shadow-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
