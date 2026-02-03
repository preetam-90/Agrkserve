'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatsCard from '@/components/admin/StatsCard';
import { Users, Truck, Calendar, DollarSign, Briefcase, TrendingUp } from 'lucide-react';

interface AdminDashboardClientProps {
  stats: {
    totalUsers: number;
    totalEquipment: number;
    totalBookings: number;
    completedBookings: number;
    totalLabour: number;
    totalRevenue: number;
    activeEquipment: number;
    pendingBookings: number;
  };
  recentBookings: any[];
}

export default function AdminDashboardClient({ stats, recentBookings }: AdminDashboardClientProps) {
  const router = useRouter();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h1>
          <p className="mt-1 text-neutral-500">Welcome back, get up to date with your platform.</p>
        </div>
        <div className="flex gap-3">
          <select className="rounded-xl border border-[#262626] bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white outline-none transition-all focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          color="green"
          trend={{ value: 12.5, isUp: true }}
        />
        <StatsCard
          title="Active Users"
          value={stats.totalUsers}
          icon={Users}
          color="blue"
          trend={{ value: 8.2, isUp: true }}
        />
        <StatsCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={Calendar}
          color="purple"
          trend={{ value: 3.1, isUp: false }}
        />
        <StatsCard
          title="Equipment"
          value={stats.totalEquipment}
          icon={Truck}
          color="yellow"
          trend={{ value: 5.4, isUp: true }}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content Column (2/3) */}
        <div className="space-y-8 lg:col-span-2">
          {/* Recent Bookings */}
          <div className="glass-panel overflow-hidden rounded-2xl border border-[#262626]">
            <div className="animated-gradient-bg flex items-center justify-between border-b border-[#262626] p-6">
              <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
              <button
                onClick={() => router.push('/admin/bookings')}
                className="text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="admin-table w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="px-6 py-4">Equipment</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">
                        No recent activity
                      </td>
                    </tr>
                  ) : (
                    recentBookings.map((booking: any) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-[#262626] bg-[#1a1a1a]">
                              {booking.equipment?.images?.[0] ? (
                                <img
                                  src={booking.equipment.images[0]}
                                  className="h-full w-full object-cover"
                                  alt=""
                                />
                              ) : (
                                <Truck className="h-5 w-5 text-neutral-600" />
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
                            <span className="text-xs text-neutral-500">
                              {booking.renter?.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-medium text-neutral-300">
                          {formatCurrency(booking.total_amount)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`badge-${booking.status === 'completed' ? 'success' : booking.status === 'pending' ? 'warning' : 'info'} inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium`}
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
          <div className="glass-panel rounded-2xl border border-[#262626] p-6">
            <h3 className="mb-4 font-bold text-white">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/admin/bookings?status=pending"
                className="group flex w-full items-center justify-between rounded-xl border border-[#262626] bg-[#1a1a1a] p-3 transition-all hover:border-emerald-500/30 hover:bg-[#1f1f1f]"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-white">Review Pending Bookings</span>
                </div>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                  {stats.pendingBookings}
                </span>
              </Link>
              <Link
                href="/admin/users"
                className="flex w-full items-center gap-3 rounded-xl border border-[#262626] bg-[#1a1a1a] p-3 text-white transition-all hover:border-blue-500/30 hover:bg-[#1f1f1f]"
              >
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400">
                  <Users className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Verify New Users</span>
              </Link>
            </div>
          </div>

          {/* System Health */}
          <div className="glass-panel rounded-2xl border border-[#262626] p-6">
            <h3 className="mb-4 font-bold text-white">System Status</h3>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-xs font-medium">
                  <span className="text-neutral-500">Database Load</span>
                  <span className="text-emerald-400">Healthy</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full border border-[#262626] bg-[#1a1a1a]">
                  <div className="h-full w-[24%] rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/50" />
                </div>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-xs font-medium">
                  <span className="text-neutral-500">Storage Usage</span>
                  <span className="text-blue-400">45%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full border border-[#262626] bg-[#1a1a1a]">
                  <div className="h-full w-[45%] rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
