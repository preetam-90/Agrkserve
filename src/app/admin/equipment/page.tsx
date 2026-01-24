'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Download,
  Tractor,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle
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
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import Image from 'next/image';

// Mock data for equipment
const allEquipment = [
  {
    id: 'EQ-1001',
    name: 'John Deere 5310',
    category: 'Tractor',
    provider: 'Rahul Sharma',
    image: 'https://images.unsplash.com/photo-1594498653385-d5172c532c00?w=800&q=80',
    price: '₹800/hr',
    status: 'Active',
    location: 'Pune, Maharashtra',
    bookings: 12,
    rating: 4.8
  },
  {
    id: 'EQ-1002',
    name: 'Mahindra Rotavator',
    category: 'Tillage',
    provider: 'Suresh Patil',
    image: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=800&q=80',
    price: '₹400/hr',
    status: 'Active',
    location: 'Nashik, Maharashtra',
    bookings: 8,
    rating: 4.5
  },
  {
    id: 'EQ-1003',
    name: 'Potato Planter',
    category: 'Planting',
    provider: 'Rahul Sharma',
    image: '',
    price: '₹1200/acre',
    status: 'Maintenance',
    location: 'Pune, Maharashtra',
    bookings: 5,
    rating: 4.2
  },
  {
    id: 'EQ-1004',
    name: 'Harvester Combine',
    category: 'Harvesting',
    provider: 'Deepak Chopra',
    image: 'https://images.unsplash.com/photo-1563205764-9d57a4427b3e?w=800&q=80',
    price: '₹2500/hr',
    status: 'Suspended',
    location: 'Kolhapur, Maharashtra',
    bookings: 0,
    rating: 0
  },
  {
    id: 'EQ-1005',
    name: 'Kubota MU4501',
    category: 'Tractor',
    provider: 'Vikram Singh',
    image: '',
    price: '₹950/hr',
    status: 'Active',
    location: 'Satara, Maharashtra',
    bookings: 24,
    rating: 4.9
  }
];

export default function AdminEquipmentPage() {
  const router = useRouter();
  const { profile, isLoading } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!isLoading && (!profile || !profile.roles?.includes('admin'))) {
      router.push('/dashboard');
    }
  }, [profile, isLoading, router]);

  const filteredEquipment = allEquipment.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || item.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Active</Badge>;
      case 'Maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none">Maintenance</Badge>;
      case 'Suspended':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading equipment...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Equipment Management</h1>
          <p className="text-gray-500 mt-1">Review and manage equipment listings on the platform.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 gap-2">
            <Plus className="h-4 w-4" />
            Add Equipment
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by Name, Provider, or ID..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="tractor">Tractor</SelectItem>
                  <SelectItem value="tillage">Tillage</SelectItem>
                  <SelectItem value="planting">Planting</SelectItem>
                  <SelectItem value="harvesting">Harvesting</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Equipment</th>
                <th className="px-6 py-4 font-medium">Provider</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Stats</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredEquipment.length > 0 ? (
                filteredEquipment.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-gray-100 relative overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Tractor className="h-6 w-6 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar name={item.provider} size="sm" className="h-6 w-6" />
                        <span className="text-gray-700">{item.provider}</span>
                      </div>
                      <div className="text-xs text-gray-500 ml-8">{item.location}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="font-normal">
                        {item.category}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">{item.price}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div>{item.bookings} bookings</div>
                      <div className="text-xs text-gray-400">Rating: {item.rating > 0 ? item.rating : 'N/A'}</div>
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
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {item.status === 'Active' ? (
                            <DropdownMenuItem className="text-red-600">
                              <AlertTriangle className="mr-2 h-4 w-4" /> Suspend Listing
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-green-600">
                              <CheckCircle className="mr-2 h-4 w-4" /> Activate Listing
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Tractor className="h-10 w-10 text-gray-300 mb-2" />
                      <p className="text-lg font-medium">No equipment found</p>
                      <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between text-sm text-gray-500">
           <div>Showing {filteredEquipment.length} of {allEquipment.length} items</div>
           <div className="flex gap-2">
             <Button variant="outline" size="sm" disabled>Previous</Button>
             <Button variant="outline" size="sm" disabled>Next</Button>
           </div>
        </div>
      </Card>
    </div>
  );
}
