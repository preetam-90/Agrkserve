'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  TrendingUp,
  Users,
  CreditCard,
  Calendar,
  ArrowDown,
  ArrowUp,
  Download,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/lib/store';

// Mock Data
const metrics = [
  {
    title: 'Total Revenue',
    value: '₹12,45,000',
    change: '+18.2%',
    trend: 'up',
    icon: CreditCard,
    description: 'Compared to last month',
  },
  {
    title: 'Total Bookings',
    value: '1,482',
    change: '+12.5%',
    trend: 'up',
    icon: Calendar,
    description: 'Compared to last month',
  },
  {
    title: 'Active Users',
    value: '3,240',
    change: '+4.3%',
    trend: 'up',
    icon: Users,
    description: 'Compared to last month',
  },
  {
    title: 'Avg. Booking Value',
    value: '₹840',
    change: '-2.1%',
    trend: 'down',
    icon: Activity,
    description: 'Compared to last month',
  },
];

const revenueData = [
  { month: 'Jan', value: 45000, height: '40%' },
  { month: 'Feb', value: 52000, height: '45%' },
  { month: 'Mar', value: 48000, height: '42%' },
  { month: 'Apr', value: 61000, height: '55%' },
  { month: 'May', value: 55000, height: '50%' },
  { month: 'Jun', value: 67000, height: '60%' },
  { month: 'Jul', value: 72000, height: '65%' },
  { month: 'Aug', value: 84000, height: '75%' },
  { month: 'Sep', value: 79000, height: '70%' },
  { month: 'Oct', value: 89000, height: '80%' },
  { month: 'Nov', value: 94000, height: '85%' },
  { month: 'Dec', value: 102000, height: '90%' },
];

const topProviders = [
  { name: 'Rahul Sharma', bookings: 142, revenue: '₹1,24,000', rating: 4.8 },
  { name: 'Suresh Patil', bookings: 118, revenue: '₹98,500', rating: 4.7 },
  { name: 'Deepak Chopra', bookings: 94, revenue: '₹76,200', rating: 4.6 },
  { name: 'Anita Desai', bookings: 82, revenue: '₹64,800', rating: 4.9 },
  { name: 'Vikram Singh', bookings: 65, revenue: '₹45,000', rating: 4.5 },
];

export default function AnalyticsPage() {
  const router = useRouter();
  const { profile, isLoading } = useAuthStore();
  const [timeRange, setTimeRange] = useState('this-year');

  const handleExportReport = () => {
    const csvContent = [
      ['Metric', 'Value', 'Change'],
      ...metrics.map((m) => [m.title, m.value, m.change]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  useEffect(() => {
    if (!isLoading && (!profile || !profile.roles?.includes('admin'))) {
      router.push('/dashboard');
    }
  }, [profile, isLoading, router]);

  if (isLoading) {
    return <div className="p-8">Loading analytics...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analytics & Reports</h1>
          <p className="mt-1 text-gray-500">
            Detailed insights into platform performance and user activity.
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4 text-gray-400" />
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
              <SelectItem value="all-time">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={handleExportReport}>
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              <p className="mt-1 flex items-center text-xs">
                {metric.trend === 'up' ? (
                  <span className="flex items-center font-medium text-green-600">
                    <ArrowUp className="mr-1 h-3 w-3" />
                    {metric.change}
                  </span>
                ) : (
                  <span className="flex items-center font-medium text-red-600">
                    <ArrowDown className="mr-1 h-3 w-3" />
                    {metric.change}
                  </span>
                )}
                <span className="ml-2 text-gray-500">{metric.description}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue performance for the current year.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="flex h-[300px] w-full items-end justify-between gap-2 px-4 pt-8">
              {revenueData.map((data, i) => (
                <div key={i} className="group flex w-full flex-col items-center gap-2">
                  <div
                    className="relative w-full rounded-t-sm bg-green-100 transition-colors hover:bg-green-600 group-hover:shadow-lg"
                    style={{ height: data.height }}
                  >
                    <div className="absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                      ₹{data.value.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-500">{data.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Providers */}
        <Card className="col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Top Performing Providers</CardTitle>
            <CardDescription>Based on revenue and booking volume.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {topProviders.map((provider, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 font-medium text-gray-600">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{provider.name}</p>
                      <p className="mt-1 text-xs text-gray-500">{provider.bookings} bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{provider.revenue}</p>
                    <p className="mt-1 text-xs text-green-600">★ {provider.rating}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-6 w-full">
              View All Providers
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>User Demographics</CardTitle>
            <CardDescription>Distribution by user role.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium">Renters</span>
                </div>
                <span className="text-sm text-gray-500">65%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-blue-500" style={{ width: '65%' }} />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">Providers</span>
                </div>
                <span className="text-sm text-gray-500">25%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-green-500" style={{ width: '25%' }} />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-500" />
                  <span className="text-sm font-medium">Labour</span>
                </div>
                <span className="text-sm text-gray-500">10%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-orange-500" style={{ width: '10%' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Equipment Categories</CardTitle>
            <CardDescription>Most rented equipment types.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Tractors', 'Harvesters', 'Tillers', 'Planters', 'Sprayers'].map((cat, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{cat}</span>
                  <span className="font-medium text-gray-900">
                    {Math.floor(Math.random() * 50) + 10}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-green-600 text-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-white">System Health</CardTitle>
            <CardDescription className="text-green-100">
              Server and database status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>API Response Time</span>
                  <span className="font-bold">45ms</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-green-800/50">
                  <div className="h-1.5 w-[25%] rounded-full bg-white"></div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Error Rate</span>
                  <span className="font-bold">0.02%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-green-800/50">
                  <div className="h-1.5 w-[2%] rounded-full bg-white"></div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Database Load</span>
                  <span className="font-bold">12%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-green-800/50">
                  <div className="h-1.5 w-[12%] rounded-full bg-white"></div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 text-sm text-green-100">
                <Activity className="h-4 w-4" />
                All systems operational
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
