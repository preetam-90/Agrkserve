'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  Gavel
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

// Mock data for disputes
const allDisputes = [
  {
    id: 'DSP-2024-001',
    bookingId: 'BK-2024-004',
    raisedBy: 'Priya Pawar',
    raisedByRole: 'Renter',
    against: 'Rahul Sharma',
    againstRole: 'Provider',
    reason: 'Equipment breakdown during usage',
    description: 'The tractor stopped working after 1 hour of use. Provider is refusing refund.',
    amount: '₹3,000',
    status: 'Open',
    date: '2024-05-10',
    priority: 'High'
  },
  {
    id: 'DSP-2024-002',
    bookingId: 'BK-2024-002',
    raisedBy: 'Suresh Patil',
    raisedByRole: 'Provider',
    against: 'Rajesh Kumar',
    againstRole: 'Renter',
    reason: 'Late return of equipment',
    description: 'Renter returned the potato planter 4 hours late. Additional charges not paid.',
    amount: '₹800',
    status: 'Investigating',
    date: '2024-05-14',
    priority: 'Medium'
  },
  {
    id: 'DSP-2024-003',
    bookingId: 'BK-2024-008',
    raisedBy: 'Vikram Singh',
    raisedByRole: 'Renter',
    against: 'Labour Group A',
    againstRole: 'Labour',
    reason: 'Work not completed',
    description: 'The team left without finishing the harvesting job.',
    amount: '₹5,000',
    status: 'Resolved',
    date: '2024-05-01',
    priority: 'High'
  },
  {
    id: 'DSP-2024-004',
    bookingId: 'BK-2024-012',
    raisedBy: 'Amit Verma',
    raisedByRole: 'Renter',
    against: 'Deepak Chopra',
    againstRole: 'Provider',
    reason: 'Condition mismatch',
    description: 'Equipment condition was very poor compared to photos.',
    amount: '₹1,500',
    status: 'Open',
    date: '2024-05-18',
    priority: 'Low'
  }
];

export default function AdminDisputesPage() {
  const router = useRouter();
  const { profile, isLoading } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    if (!isLoading && (!profile || !profile.roles?.includes('admin'))) {
      router.push('/dashboard');
    }
  }, [profile, isLoading, router]);

  const filteredDisputes = allDisputes.filter(dispute => {
    const matchesSearch =
      dispute.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.raisedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.against.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || dispute.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'all' || dispute.priority.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none">Open</Badge>;
      case 'Investigating':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none">Investigating</Badge>;
      case 'Resolved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">High</span>;
      case 'Medium':
        return <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Medium</span>;
      case 'Low':
        return <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Low</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading disputes...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dispute Resolution</h1>
          <p className="text-gray-500 mt-1">Manage and resolve conflicts between users.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Policy Guidelines
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by ID, User, or Booking ID..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredDisputes.length > 0 ? (
          filteredDisputes.map((dispute) => (
            <Card key={dispute.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Status & ID */}
                  <div className="md:w-48 flex-shrink-0">
                    <div className="flex items-center justify-between mb-2">
                       <span className="font-mono text-xs text-gray-500">{dispute.id}</span>
                       {getPriorityBadge(dispute.priority)}
                    </div>
                    <div className="mb-4">
                      {getStatusBadge(dispute.status)}
                    </div>
                    <div className="text-sm text-gray-500">
                      <p className="mb-1">Date: {dispute.date}</p>
                      <p>Booking: <span className="text-blue-600 font-medium">{dispute.bookingId}</span></p>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 border-l border-gray-100 md:pl-6 border-t md:border-t-0 pt-4 md:pt-0">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="text-lg font-semibold text-gray-900">{dispute.reason}</h3>
                       <span className="font-bold text-gray-900">{dispute.amount}</span>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {dispute.description}
                    </p>

                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Raised by:</span>
                        <div className="flex items-center gap-1">
                          <Avatar name={dispute.raisedBy} size="sm" className="h-5 w-5" />
                          <span className="font-medium text-gray-900">{dispute.raisedBy}</span>
                          <span className="text-xs text-gray-500">({dispute.raisedByRole})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Against:</span>
                        <div className="flex items-center gap-1">
                          <Avatar name={dispute.against} size="sm" className="h-5 w-5" />
                          <span className="font-medium text-gray-900">{dispute.against}</span>
                          <span className="text-xs text-gray-500">({dispute.againstRole})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col items-center justify-center gap-2 md:w-32 md:border-l border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                       Review
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full" size="sm">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Take Action</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <MessageSquare className="mr-2 h-4 w-4" /> Message Parties
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Gavel className="mr-2 h-4 w-4" /> Refund Renter
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                           <Gavel className="mr-2 h-4 w-4" /> Release to Provider
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-green-600">
                          <CheckCircle className="mr-2 h-4 w-4" /> Mark Resolved
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <div className="flex flex-col items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-gray-300 mb-2" />
              <p className="text-lg font-medium text-gray-900">No disputes found</p>
              <p className="text-sm text-gray-500">No conflicts match your current filters.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
