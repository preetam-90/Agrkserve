'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Tractor,
  Calendar,
  IndianRupee,
  TrendingUp,
  Activity,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Mock data for dashboard
const stats = [
  {
    title: 'Total Users',
    value: '1,248',
    change: '+12%',
    trend: 'up',
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  {
    title: 'Active Bookings',
    value: '86',
    change: '+4%',
    trend: 'up',
    icon: Calendar,
    color: 'text-green-600',
    bg: 'bg-green-100',
  },
  {
    title: 'Equipment Listed',
    value: '342',
    change: '+8%',
    trend: 'up',
    icon: Tractor,
    color: 'text-orange-600',
    bg: 'bg-orange-100',
  },
  {
    title: 'Total Revenue',
    value: '₹4.2L',
    change: '+15%',
    trend: 'up',
    icon: IndianRupee,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
  },
];

const recentUsers = [
  { id: 1, name: 'Rahul Sharma', role: 'Provider', location: 'Pune', date: '2 mins ago' },
  { id: 2, name: 'Vikram Singh', role: 'Renter', location: 'Nashik', date: '15 mins ago' },
  { id: 3, name: 'Anita Desai', role: 'Labour', location: 'Satara', date: '1 hour ago' },
  { id: 4, name: 'Suresh Patil', role: 'Provider', location: 'Kolhapur', date: '3 hours ago' },
];

const recentBookings = [
  { id: 101, user: 'Vikram Singh', item: 'John Deere 5310', status: 'Pending', amount: '₹4,500' },
  { id: 102, user: 'Rajesh Kumar', item: 'Potato Planter', status: 'Confirmed', amount: '₹2,100' },
  { id: 103, user: 'Amit Verma', item: 'Harvester', status: 'Completed', amount: '₹12,000' },
  { id: 104, user: 'Priya Pawar', item: 'Labour Team (5)', status: 'Cancelled', amount: '₹3,000' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { profile, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && (!profile || !profile.roles?.includes('admin'))) {
      router.push('/dashboard');
    }
  }, [profile, isLoading, router]);

  if (isLoading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back, {profile?.name || 'Admin'}. Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline">Download Report</Button>
           <Button className="bg-green-600 hover:bg-green-700">Settings</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                  </div>
                </div>
                <div className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest transaction activities across the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {booking.user.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{booking.item}</p>
                        <p className="text-sm text-gray-500">by {booking.user}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="font-semibold text-gray-900">{booking.amount}</span>
                      <Badge variant={
                        booking.status === 'Completed' ? 'default' :
                        booking.status === 'Confirmed' ? 'outline' :
                        booking.status === 'Pending' ? 'secondary' : 'destructive'
                      } className={
                        booking.status === 'Completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                        booking.status === 'Confirmed' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-none' :
                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                        'bg-red-100 text-red-800 hover:bg-red-100'
                      }>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50">View All Transactions</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Users */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>New Users</CardTitle>
              <CardDescription>Recently registered members.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="sm" />
                      <div>
                        <p className="font-medium text-sm text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className={`text-xs px-2 py-1 rounded-full ${
                         user.role === 'Provider' ? 'bg-purple-100 text-purple-700' :
                         user.role === 'Renter' ? 'bg-blue-100 text-blue-700' :
                         'bg-orange-100 text-orange-700'
                       }`}>
                         {user.role}
                       </span>
                       <p className="text-xs text-gray-400 mt-1">{user.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button className="w-full" variant="outline">Manage Users</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-none shadow-md">
            <CardContent className="p-6">
               <div className="flex items-start justify-between">
                 <div>
                   <p className="text-green-100 text-sm font-medium mb-1">System Status</p>
                   <h3 className="text-xl font-bold flex items-center gap-2">
                     <Activity className="h-5 w-5" /> All Systems Normal
                   </h3>
                 </div>
                 <div className="p-2 bg-white/10 rounded-lg">
                   <AlertCircle className="h-6 w-6 text-white" />
                 </div>
               </div>
               <div className="mt-6 space-y-2">
                 <div className="flex justify-between text-sm">
                   <span className="text-green-100">Server Load</span>
                   <span className="font-medium">12%</span>
                 </div>
                 <div className="w-full bg-green-800/50 rounded-full h-1.5">
                   <div className="bg-white h-1.5 rounded-full w-[12%]"></div>
                 </div>

                 <div className="flex justify-between text-sm mt-2">
                   <span className="text-green-100">Database</span>
                   <span className="font-medium">Stable</span>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
