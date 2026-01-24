'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  MoreHorizontal,
  UserPlus,
  Download,
  Shield,
  Ban,
  CheckCircle,
  Mail,
  Smartphone
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

// Mock data for users
const allUsers = [
  {
    id: 'USR-001',
    name: 'Rahul Sharma',
    email: 'rahul.s@example.com',
    phone: '+91 98765 43210',
    role: 'Provider',
    status: 'Active',
    joinDate: '2024-01-15',
    lastActive: '2 mins ago',
    location: 'Pune, Maharashtra'
  },
  {
    id: 'USR-002',
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    phone: '+91 98765 43211',
    role: 'Renter',
    status: 'Active',
    joinDate: '2024-02-10',
    lastActive: '15 mins ago',
    location: 'Nashik, Maharashtra'
  },
  {
    id: 'USR-003',
    name: 'Suresh Patil',
    email: 'suresh.p@example.com',
    phone: '+91 98765 43212',
    role: 'Labour',
    status: 'Active',
    joinDate: '2024-01-20',
    lastActive: '3 hours ago',
    location: 'Kolhapur, Maharashtra'
  },
  {
    id: 'USR-004',
    name: 'Amit Verma',
    email: 'amit.v@example.com',
    phone: '+91 98765 43213',
    role: 'Renter',
    status: 'Inactive',
    joinDate: '2024-03-05',
    lastActive: '5 days ago',
    location: 'Satara, Maharashtra'
  },
  {
    id: 'USR-005',
    name: 'Priya Pawar',
    email: 'priya.p@example.com',
    phone: '+91 98765 43214',
    role: 'Admin',
    status: 'Active',
    joinDate: '2023-12-01',
    lastActive: 'Just now',
    location: 'Mumbai, Maharashtra'
  },
  {
    id: 'USR-006',
    name: 'Deepak Chopra',
    email: 'deepak.c@example.com',
    phone: '+91 98765 43215',
    role: 'Provider',
    status: 'Suspended',
    joinDate: '2024-02-28',
    lastActive: '2 weeks ago',
    location: 'Pune, Maharashtra'
  },
  {
    id: 'USR-007',
    name: 'Anita Desai',
    email: 'anita.d@example.com',
    phone: '+91 98765 43216',
    role: 'Labour',
    status: 'Active',
    joinDate: '2024-04-12',
    lastActive: '1 day ago',
    location: 'Nagpur, Maharashtra'
  }
];

export default function AdminUsersPage() {
  const router = useRouter();
  const { profile, isLoading } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!isLoading && (!profile || !profile.roles?.includes('admin'))) {
      router.push('/dashboard');
    }
  }, [profile, isLoading, router]);

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);

    const matchesRole = roleFilter === 'all' || user.role.toLowerCase() === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || user.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Active</Badge>;
      case 'Inactive':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-none">Inactive</Badge>;
      case 'Suspended':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">Admin</Badge>;
      case 'Provider':
        return <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">Provider</Badge>;
      case 'Labour':
        return <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">Labour</Badge>;
      default:
        return <Badge variant="outline" className="border-gray-200 text-gray-700 bg-gray-50">Renter</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading users...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage user accounts, roles, and permissions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 gap-2">
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by Name, Email, or Phone..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="provider">Provider</SelectItem>
                  <SelectItem value="renter">Renter</SelectItem>
                  <SelectItem value="labour">Labour</SelectItem>
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
                  <SelectItem value="inactive">Inactive</SelectItem>
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
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} size="sm" />
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-600 text-xs">
                          <Mail className="h-3 w-3" /> {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-xs">
                          <Smartphone className="h-3 w-3" /> {user.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div>{user.joinDate}</div>
                      <div className="text-xs text-gray-400">Last active: {user.lastActive}</div>
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
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Edit Details</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status !== 'Suspended' ? (
                            <DropdownMenuItem className="text-red-600">
                              <Ban className="mr-2 h-4 w-4" /> Suspend User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-green-600">
                              <CheckCircle className="mr-2 h-4 w-4" /> Activate User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="h-10 w-10 text-gray-300 mb-2" />
                      <p className="text-lg font-medium">No users found</p>
                      <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between text-sm text-gray-500">
           <div>Showing {filteredUsers.length} of {allUsers.length} users</div>
           <div className="flex gap-2">
             <Button variant="outline" size="sm" disabled>Previous</Button>
             <Button variant="outline" size="sm" disabled>Next</Button>
           </div>
        </div>
      </Card>
    </div>
  );
}
