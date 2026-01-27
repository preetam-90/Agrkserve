import { createClient } from '@/lib/supabase/server';
import StatsCard from '@/components/admin/StatsCard';
import { Users, Truck, Calendar, DollarSign, Briefcase, TrendingUp } from 'lucide-react';

async function getAdminStats() {
    const supabase = await createClient();

    // Get total users
    const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

    // Get total equipment
    const { count: totalEquipment } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true });

    // Get total bookings
    const { count: totalBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

    // Get completed bookings
    const { count: completedBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

    // Get total labour
    const { count: totalLabour } = await supabase
        .from('labour_profiles')
        .select('*', { count: 'exact', head: true });

    // Get total revenue
    const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');

    const totalRevenue = payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

    // Get active equipment
    const { count: activeEquipment } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true })
        .eq('is_available', true);

    // Get pending bookings
    const { count: pendingBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    return {
        totalUsers: totalUsers || 0,
        totalEquipment: totalEquipment || 0,
        totalBookings: totalBookings || 0,
        completedBookings: completedBookings || 0,
        totalLabour: totalLabour || 0,
        totalRevenue,
        activeEquipment: activeEquipment || 0,
        pendingBookings: pendingBookings || 0,
    };
}

async function getRecentBookings() {
    const supabase = await createClient();

    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
      *,
      equipment:equipment(name, images),
      renter:user_profiles!renter_id(name, email)
    `)
        .order('created_at', { ascending: false })
        .limit(5);

    return bookings || [];
}

export default async function AdminDashboard() {
    const stats = await getAdminStats();
    const recentBookings = await getRecentBookings();

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back, get up to date with your platform.</p>
                </div>
                <div className="flex gap-3">
                    <select className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-green-500/20 outline-none">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>This Year</option>
                    </select>
                    <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                        Download Report
                    </button>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column (2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Recent Bookings */}
                    <div className="glass-panel rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                            <h2 className="font-bold text-lg text-slate-900 dark:text-white">Recent Transactions</h2>
                            <button className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Equipment</th>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                                    {recentBookings.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No recent activity</td>
                                        </tr>
                                    ) : (
                                        recentBookings.map((booking: any) => (
                                            <tr key={booking.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                                            {booking.equipment?.images?.[0] ? (
                                                                <img src={booking.equipment.images[0]} className="w-full h-full object-cover" alt="" />
                                                            ) : (
                                                                <Truck className="w-5 h-5 text-slate-400" />
                                                            )}
                                                        </div>
                                                        <span className="font-medium text-slate-900 dark:text-slate-100">{booking.equipment?.name || 'Unknown'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-900 dark:text-slate-100">{booking.renter?.name || 'Guest'}</span>
                                                        <span className="text-xs text-slate-500">{booking.renter?.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                                                    {formatCurrency(booking.total_amount)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${booking.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' :
                                                            booking.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                                                                'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                                        }`}>
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
                    <div className="glass-panel p-6 rounded-2xl">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium text-sm">Review Pending Bookings</span>
                                </div>
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold">
                                    {stats.pendingBookings}
                                </span>
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                    <Users className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-sm">Verify New Users</span>
                            </button>
                        </div>
                    </div>

                    {/* System Health */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">System Status</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-medium mb-1">
                                    <span className="text-slate-500">Database Load</span>
                                    <span className="text-green-600">Healthy</span>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-[24%] bg-green-500 rounded-full" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-medium mb-1">
                                    <span className="text-slate-500">Storage Usage</span>
                                    <span className="text-blue-600">45%</span>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-[45%] bg-blue-500 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
