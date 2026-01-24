'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';

// Mock data for bookings
const allBookings = [
  {
    id: 'BK-2024-001',
    renter: 'Vikram Singh',
    renterAvatar: '',
    provider: 'Rahul Sharma',
    service: 'John Deere 5310',
    type: 'Equipment',
    date: '2024-05-15',
    status: 'Pending',
    amount: '₹4,500'
  },
  {
    id: 'BK-2024-002',
    renter: 'Rajesh Kumar',
    renterAvatar: '',
    provider: 'Suresh Patil',
    service: 'Potato Planter',
    type: 'Equipment',
    date: '2024-05-14',
    status: 'Confirmed',
    amount: '₹2,100'
  },
  {
    id: 'BK-2024-003',
    renter: 'Amit Verma',
    renterAvatar: '',
    provider: 'Labour Group A',
    service: 'Harvesting Team (5)',
    type: 'Labour',
    date: '2024-05-12',
    status: 'Completed',
    amount: '₹12,000'
  },
  {
    id: 'BK-2024-004',
    renter: 'Priya Pawar',
    renterAvatar: '',
    provider: 'Rahul Sharma',
    service: 'Rotavator',
    type: 'Equipment',
    date: '2024-05-10',
    status: 'Cancelled',
    amount: '₹3,000'
  },
  {
    id: 'BK-2024-005',
    renter: 'Deepak Chopra',
    renterAvatar: '',
    provider: 'Anita Desai',
    service: 'Pesticide Spraying',
    type: 'Labour',
    date: '2024-05-18',
    status: 'Confirmed',
    amount: '₹1,500'
  },
  {
    id: 'BK-2024-006',
    renter: 'Sneha Gupta',
    renterAvatar: '',
    provider: 'Suresh Patil',
    service: 'Tractor Trolley',
    type: 'Equipment',
    date: '2024-05-20',
    status: 'Pending',
    amount: '₹800'
  },
];

export default function AdminBookingsPage() {
  const router = useRouter();
  const { profile, isLoading } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!isLoading && (!profile || !profile.roles?.includes('admin'))) {
      router.push('/dashboard');
    }
  }, [profile, isLoading, router]);

  const filteredBookings = allBookings.filter(booking => {
    const matchesSearch =
      booking.renter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || booking.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Completed</Badge>;
      case 'Confirmed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none">Confirmed</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none">Pending</Badge>;
      case 'Cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Confirmed': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'Pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'Cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading bookings...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Bookings Management</h1>
          <p className="text-gray-500 mt-1">Monitor and manage all service and equipment transactions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by Booking ID, Renter, Provider, or Service..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                Date Range
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Booking ID</th>
                <th className="px-6 py-4 font-medium">Service Info</th>
                <th className="px-6 py-4 font-medium">Renter</th>
                <th className="px-6 py-4 font-medium">Provider</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {booking.id}
                      <div className="text-xs text-gray-500 font-normal mt-1">{booking.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{booking.service}</div>
                      <Badge variant="outline" className="mt-1 text-xs font-normal border-gray-200 text-gray-500">
                        {booking.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar name={booking.renter} size="sm" className="h-6 w-6" />
                        <span className="text-gray-700">{booking.renter}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <span className="text-gray-700">{booking.provider}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {booking.amount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Contact Renter</DropdownMenuItem>
                          <DropdownMenuItem>Contact Provider</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Cancel Booking</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="h-10 w-10 text-gray-300 mb-2" />
                      <p className="text-lg font-medium">No bookings found</p>
                      <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between text-sm text-gray-500">
           <div>Showing {filteredBookings.length} of {allBookings.length} bookings</div>
           <div className="flex gap-2">
             <Button variant="outline" size="sm" disabled>Previous</Button>
             <Button variant="outline" size="sm" disabled>Next</Button>
           </div>
        </div>
      </Card>
    </div>
  );
}
