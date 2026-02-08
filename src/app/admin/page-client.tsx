'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import StatsCard from '@/components/admin/StatsCard';
import {
  Users,
  Truck,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  Package,
  Clock,
} from 'lucide-react';

interface BookingItem {
  id?: string;
  equipment?: {
    name?: string;
    images?: string[];
  };
  renter?: {
    name?: string;
    email?: string;
  };
  total_amount?: number;
  status?: string;
}

interface AdminDashboardClientProps {
  stats: {
    totalUsers: number;
    totalEquipment: number;
    totalBookings: number;
    totalRevenue: number;
    pendingBookings: number;
    trends: {
      revenue: { value: number; isUp: boolean };
      users: { value: number; isUp: boolean };
      bookings: { value: number; isUp: boolean };
      equipment: { value: number; isUp: boolean };
    };
  };
  recentBookings: BookingItem[];
  systemHealth: {
    dbLoad: number;
    dbStatus: string;
    storageUsage: number;
    storageGB: string;
  };
  timeRange: string;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    avatar_url: string;
    role: string;
    created_at: string;
    phone_verified: boolean;
  }>;
  activityFeed: Array<{
    type: string;
    message: string;
    time: string;
    status?: string;
  }>;
}

export default function AdminDashboardClient({
  stats,
  recentBookings,
  systemHealth,
  timeRange,
  recentUsers,
  activityFeed,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleTimeRangeChange = (newRange: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('timeRange', newRange);
    router.push(`/admin?${params.toString()}`);
  };

  const getHealthTextColor = (percentage: number) => {
    if (percentage < 50) return 'text-[var(--admin-success)]';
    if (percentage < 80) return 'text-[var(--admin-warning)]';
    return 'text-[var(--admin-danger)]';
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-['Fira_Code'] text-3xl font-bold tracking-tight text-white">
            DASHBOARD <span className="text-[var(--admin-primary)]">OVERVIEW</span>
          </h1>
          <p className="mt-2 text-[var(--admin-text-secondary)]">
            Welcome back, monitor your platform in real-time.
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="admin-input cursor-pointer font-['Fira_Code'] text-sm font-medium"
          >
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="this_year">This Year</option>
          </select>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/payments" className="cursor-pointer">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
            color="green"
            trend={stats.trends.revenue}
          />
        </Link>
        <Link href="/admin/users" className="cursor-pointer">
          <StatsCard
            title="Active Users"
            value={stats.totalUsers}
            icon={Users}
            color="blue"
            trend={stats.trends.users}
          />
        </Link>
        <Link href="/admin/bookings" className="cursor-pointer">
          <StatsCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={Calendar}
            color="purple"
            trend={stats.trends.bookings}
          />
        </Link>
        <Link href="/admin/equipment" className="cursor-pointer">
          <StatsCard
            title="Equipment"
            value={stats.totalEquipment}
            icon={Truck}
            color="yellow"
            trend={stats.trends.equipment}
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="admin-glass-card overflow-hidden">
          <div className="from-[var(--admin-primary)]/10 border-b border-[var(--admin-border)] bg-gradient-to-br to-transparent p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-[var(--admin-secondary)]/10 border-[var(--admin-secondary)]/30 flex h-10 w-10 items-center justify-center rounded-lg border">
                  <Users className="h-5 w-5 text-[var(--admin-secondary)]" />
                </div>
                <div>
                  <h2 className="font-['Fira_Code'] text-lg font-bold text-white">RECENT USERS</h2>
                  <p className="text-sm text-[var(--admin-text-secondary)]">New registrations</p>
                </div>
              </div>
              <Link href="/admin/users" className="admin-btn-neon px-3 py-1.5 text-xs">
                VIEW ALL
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {recentUsers.length === 0 ? (
                <p className="py-8 text-center text-[var(--admin-text-secondary)]">
                  No recent users
                </p>
              ) : (
                recentUsers.map((user) => (
                  <Link
                    key={user.id}
                    href={`/admin/users?id=${user.id}`}
                    className="admin-glass-card flex cursor-pointer items-center gap-3 p-3 transition-all hover:scale-[1.02]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)]">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <Users className="h-5 w-5 text-[var(--admin-text-muted)]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">{user.name}</h3>
                        {user.phone_verified && (
                          <span className="admin-badge admin-badge-success px-2 py-0.5 text-[10px]">
                            VERIFIED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--admin-text-secondary)]">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <span className="admin-badge admin-badge-info px-2 py-1 text-[10px] capitalize">
                        {user.role}
                      </span>
                      <p className="mt-1 font-['Fira_Code'] text-xs text-[var(--admin-text-muted)]">
                        {getTimeAgo(user.created_at)}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="admin-glass-card overflow-hidden">
          <div className="from-[var(--admin-warning)]/10 border-b border-[var(--admin-border)] bg-gradient-to-br to-transparent p-6">
            <div className="flex items-center gap-3">
              <div className="bg-[var(--admin-warning)]/10 border-[var(--admin-warning)]/30 flex h-10 w-10 items-center justify-center rounded-lg border">
                <Activity className="h-5 w-5 text-[var(--admin-warning)]" />
              </div>
              <div>
                <h2 className="font-['Fira_Code'] text-lg font-bold text-white">LIVE ACTIVITY</h2>
                <p className="text-sm text-[var(--admin-text-secondary)]">Recent platform events</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {activityFeed.length === 0 ? (
                <p className="py-8 text-center text-[var(--admin-text-secondary)]">
                  No recent activity
                </p>
              ) : (
                activityFeed.map((activity, index) => (
                  <div key={index} className="admin-glass-card flex items-start gap-3 p-3">
                    <div
                      className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${
                        activity.type === 'booking'
                          ? 'border-[var(--admin-success)]/30 bg-[var(--admin-success)]/10 border'
                          : 'border-[var(--admin-secondary)]/30 bg-[var(--admin-secondary)]/10 border'
                      }`}
                    >
                      {activity.type === 'booking' ? (
                        <Calendar className="h-4 w-4 text-[var(--admin-success)]" />
                      ) : (
                        <Users className="h-4 w-4 text-[var(--admin-secondary)]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[var(--admin-text-primary)]">{activity.message}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Clock className="h-3 w-3 text-[var(--admin-text-muted)]" />
                        <span className="font-['Fira_Code'] text-xs text-[var(--admin-text-secondary)]">
                          {getTimeAgo(activity.time)}
                        </span>
                        {activity.status && (
                          <span
                            className={`admin-badge ml-auto px-2 py-0.5 text-[10px] capitalize ${
                              activity.status === 'completed'
                                ? 'admin-badge-success'
                                : activity.status === 'pending'
                                  ? 'admin-badge-warning'
                                  : 'admin-badge-info'
                            }`}
                          >
                            {activity.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content Column (2/3) */}
        <div className="space-y-8 lg:col-span-2">
          {/* Recent Bookings */}
          <div className="admin-table-container">
            <div className="from-[var(--admin-primary)]/10 flex items-center justify-between border-b border-[var(--admin-border)] bg-gradient-to-br to-transparent p-6">
              <h2 className="font-['Fira_Code'] text-lg font-bold text-white">
                RECENT TRANSACTIONS
              </h2>
              <button
                onClick={() => router.push('/admin/bookings')}
                className="admin-btn-neon px-3 py-1.5 text-xs"
              >
                VIEW ALL
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="admin-table w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="px-6 py-4">EQUIPMENT</th>
                    <th className="px-6 py-4">USER</th>
                    <th className="px-6 py-4">AMOUNT</th>
                    <th className="px-6 py-4">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-[var(--admin-text-secondary)]"
                      >
                        No recent activity
                      </td>
                    </tr>
                  ) : (
                    recentBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        onClick={() => router.push(`/admin/bookings?id=${booking.id}`)}
                        className="cursor-pointer hover:bg-white/5"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)]">
                              {booking.equipment?.images?.[0] ? (
                                <Image
                                  src={booking.equipment.images[0]}
                                  alt=""
                                  width={40}
                                  height={40}
                                  className="h-full w-full object-cover"
                                  unoptimized
                                />
                              ) : (
                                <Truck className="h-5 w-5 text-[var(--admin-text-muted)]" />
                              )}
                            </div>
                            <span className="font-medium text-white">
                              {booking.equipment?.name || 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-white">
                              {booking.renter?.name || 'Guest'}
                            </span>
                            <span className="font-['Fira_Code'] text-xs text-[var(--admin-text-secondary)]">
                              {booking.renter?.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-['Fira_Code'] font-medium text-[var(--admin-primary)]">
                          {formatCurrency(booking.total_amount || 0)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`admin-badge ${
                              booking.status === 'completed'
                                ? 'admin-badge-success'
                                : booking.status === 'pending'
                                  ? 'admin-badge-warning'
                                  : 'admin-badge-info'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Column (1/3) */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="admin-glass-card p-6">
            <h3 className="mb-4 font-['Fira_Code'] font-bold text-white">QUICK ACTIONS</h3>
            <div className="space-y-3">
              <Link
                href="/admin/bookings?status=pending"
                className="hover:border-[var(--admin-primary)]/30 group flex w-full cursor-pointer items-center justify-between rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-3 transition-all hover:scale-[1.02] hover:bg-[var(--admin-bg-hover)] active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="border-[var(--admin-success)]/30 bg-[var(--admin-success)]/10 group-hover:bg-[var(--admin-success)]/20 flex h-8 w-8 items-center justify-center rounded-lg border text-[var(--admin-success)] transition-colors">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-white">Pending Bookings</span>
                </div>
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--admin-success)] font-['Fira_Code'] text-xs font-bold text-[var(--admin-bg-base)] transition-transform group-hover:scale-110"
                  style={{
                    boxShadow: '0 0 10px var(--admin-primary-glow)',
                  }}
                >
                  {stats.pendingBookings}
                </span>
              </Link>
              <Link
                href="/admin/users"
                className="hover:border-[var(--admin-secondary)]/30 group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-3 text-white transition-all hover:scale-[1.02] hover:bg-[var(--admin-bg-hover)] active:scale-[0.98]"
              >
                <div className="border-[var(--admin-secondary)]/30 bg-[var(--admin-secondary)]/10 group-hover:bg-[var(--admin-secondary)]/20 flex h-8 w-8 items-center justify-center rounded-lg border text-[var(--admin-secondary)] transition-colors">
                  <Users className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Add New User</span>
              </Link>
              <Link
                href="/admin/equipment"
                className="hover:border-[var(--admin-primary)]/30 group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-3 text-white transition-all hover:scale-[1.02] hover:bg-[var(--admin-bg-hover)] active:scale-[0.98]"
              >
                <div className="border-[var(--admin-primary)]/30 bg-[var(--admin-primary)]/10 group-hover:bg-[var(--admin-primary)]/20 flex h-8 w-8 items-center justify-center rounded-lg border text-[var(--admin-primary)] transition-colors">
                  <Package className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Manage Equipment</span>
              </Link>
              <Link
                href="/admin/analytics"
                className="hover:border-[var(--admin-warning)]/30 group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-3 text-white transition-all hover:scale-[1.02] hover:bg-[var(--admin-bg-hover)] active:scale-[0.98]"
              >
                <div className="border-[var(--admin-warning)]/30 bg-[var(--admin-warning)]/10 flex h-8 w-8 items-center justify-center rounded-lg border text-[var(--admin-warning)]">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">View Analytics</span>
              </Link>
            </div>
          </div>

          {/* System Health */}
          <Link
            href="/admin/analytics"
            className="admin-glass-card block cursor-pointer p-6 transition-all hover:scale-[1.02]"
          >
            <h3 className="mb-4 font-['Fira_Code'] font-bold text-white">SYSTEM STATUS</h3>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex justify-between font-['Fira_Code'] text-xs font-medium">
                  <span className="text-[var(--admin-text-secondary)]">DATABASE LOAD</span>
                  <span className={getHealthTextColor(systemHealth.dbLoad)}>
                    {systemHealth.dbStatus}
                  </span>
                </div>
                <div className="admin-progress-bar">
                  <div
                    className="admin-progress-fill"
                    style={{ width: `${systemHealth.dbLoad}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 flex justify-between font-['Fira_Code'] text-xs font-medium">
                  <span className="text-[var(--admin-text-secondary)]">STORAGE USAGE</span>
                  <span className={getHealthTextColor(systemHealth.storageUsage)}>
                    {systemHealth.storageUsage}% ({systemHealth.storageGB} GB)
                  </span>
                </div>
                <div className="admin-progress-bar">
                  <div
                    className="admin-progress-fill"
                    style={{ width: `${systemHealth.storageUsage}%` }}
                  />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
