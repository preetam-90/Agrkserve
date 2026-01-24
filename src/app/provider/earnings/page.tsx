'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IndianRupee, TrendingUp, Calendar, ArrowUpRight, Download, CreditCard, Wallet } from 'lucide-react';

// Mock data
const transactions = [
  {
    id: 'TXN-7823',
    date: '2024-05-20',
    description: 'Payment for John Deere 5310 Rental',
    amount: 4500,
    status: 'Completed',
    customer: 'Vikram Singh',
  },
  {
    id: 'TXN-7822',
    date: '2024-05-18',
    description: 'Payment for Harvesting Labour',
    amount: 2100,
    status: 'Processing',
    customer: 'Rajesh Kumar',
  },
  {
    id: 'TXN-7821',
    date: '2024-05-15',
    description: 'Payment for Rotavator Rental',
    amount: 1200,
    status: 'Completed',
    customer: 'Amit Verma',
  },
  {
    id: 'TXN-7820',
    date: '2024-05-12',
    description: 'Payment for Tractor Trolley',
    amount: 800,
    status: 'Completed',
    customer: 'Priya Pawar',
  },
  {
    id: 'TXN-7819',
    date: '2024-05-10',
    description: 'Withdrawal to Bank Account (****4521)',
    amount: -5000,
    status: 'Completed',
    customer: 'Self',
  },
];

const earningsStats = [
  {
    label: 'Total Earnings',
    amount: '₹45,200',
    change: '+12%',
    trend: 'up',
    icon: Wallet,
    color: 'text-green-600',
    bg: 'bg-green-100',
  },
  {
    label: 'This Month',
    amount: '₹12,500',
    change: '+8%',
    trend: 'up',
    icon: Calendar,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  {
    label: 'Pending Clearance',
    amount: '₹2,100',
    change: '2 txns',
    trend: 'neutral',
    icon: CreditCard,
    color: 'text-orange-600',
    bg: 'bg-orange-100',
  },
];

export default function ProviderEarningsPage() {
  const [timeRange, setTimeRange] = useState('this-month');

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings & Payments</h1>
          <p className="text-gray-500 mt-1">Track your revenue and manage payouts.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 gap-2">
            <ArrowUpRight className="h-4 w-4" />
            Withdraw Funds
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {earningsStats.map((stat, index) => (
          <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stat.amount}</h3>
                  </div>
                </div>
                {stat.trend === 'up' && (
                  <div className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change}
                  </div>
                )}
                {stat.trend === 'neutral' && (
                  <div className="flex items-center text-gray-600 text-sm font-medium bg-gray-100 px-2 py-1 rounded-full">
                    {stat.change}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transaction History */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Recent earnings and withdrawals</CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full mt-1 ${
                      txn.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      <IndianRupee className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{txn.description}</p>
                      <p className="text-sm text-gray-500">{txn.date} • {txn.customer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold ${
                      txn.amount > 0 ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {txn.amount > 0 ? '+' : ''}{txn.amount}
                    </span>
                    <div className="mt-1">
                      <Badge variant={
                        txn.status === 'Completed' ? 'default' :
                        txn.status === 'Processing' ? 'secondary' : 'destructive'
                      } className={
                        txn.status === 'Completed' ? 'bg-green-100 text-green-800 hover:bg-green-100 border-none' :
                        txn.status === 'Processing' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none' : ''
                      }>
                        {txn.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-green-600 hover:text-green-700 hover:bg-green-50">
              View All Transactions
            </Button>
          </CardContent>
        </Card>

        {/* Payout Details */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-none shadow-md">
            <CardContent className="p-6">
              <div className="mb-4">
                <p className="text-green-100 text-sm font-medium mb-1">Available Balance</p>
                <h3 className="text-3xl font-bold">₹8,400.00</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-xs text-green-100 mb-1">Bank Account</p>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">HDFC Bank ****4521</span>
                    <span className="text-xs bg-green-500/20 px-2 py-0.5 rounded text-green-100">Primary</span>
                  </div>
                </div>
                <Button className="w-full bg-white text-green-700 hover:bg-green-50">
                  Withdraw Now
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-12 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-500">BANK</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">HDFC Bank</p>
                    <p className="text-xs text-gray-500">****4521</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-12 bg-blue-50 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">UPI</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">UPI ID</p>
                    <p className="text-xs text-gray-500">rahul@okhdfcbank</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
              <Button variant="outline" className="w-full border-dashed">
                + Add Payment Method
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
