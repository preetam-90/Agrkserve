'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Search,
  Tractor,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Star,
  Filter
} from 'lucide-react';
import { Header, Footer, Sidebar } from '@/components/layout';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Spinner,
  EmptyState,
  Input,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui';
import { equipmentService } from '@/lib/services';
import { Equipment } from '@/lib/types';
import { formatCurrency, EQUIPMENT_CATEGORIES, cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function ProviderEquipmentPage() {
  const { sidebarOpen } = useAppStore();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    setIsLoading(true);
    try {
      const data = await equipmentService.getMyEquipment();
      setEquipment(data);
    } catch (err) {
      console.error('Failed to load equipment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      await equipmentService.updateEquipment(id, { is_available: !currentStatus });
      setEquipment(prev => 
        prev.map(e => e.id === id ? { ...e, is_available: !currentStatus } : e)
      );
      toast.success(`Equipment ${!currentStatus ? 'available' : 'unavailable'}`);
    } catch (err) {
      console.error('Failed to update availability:', err);
      toast.error('Failed to update availability');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    setIsDeleting(true);
    try {
      await equipmentService.deleteEquipment(deleteId);
      setEquipment(prev => prev.filter(e => e.id !== deleteId));
      toast.success('Equipment deleted');
      setDeleteId(null);
    } catch (err) {
      console.error('Failed to delete equipment:', err);
      toast.error('Failed to delete equipment');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEquipment = equipment.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar role="provider" />
        
        <main className={cn("flex-1 p-4 lg:p-6 transition-all duration-300", sidebarOpen ? "ml-64" : "ml-0")}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Equipment</h1>
                <p className="text-gray-600">Manage your listed equipment</p>
              </div>
              <Button asChild>
                <Link href="/provider/equipment/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Equipment
                </Link>
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search equipment..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : filteredEquipment.length === 0 ? (
              <EmptyState
                icon={<Tractor className="h-12 w-12" />}
                title={searchQuery ? 'No equipment found' : 'No equipment listed'}
                description={
                  searchQuery 
                    ? 'Try adjusting your search query'
                    : 'Start earning by listing your agricultural equipment'
                }
                action={
                  !searchQuery && (
                    <Button asChild>
                      <Link href="/provider/equipment/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Equipment
                      </Link>
                    </Button>
                  )
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEquipment.map((item) => {
                  const category = EQUIPMENT_CATEGORIES.find(c => c.value === item.category);
                  
                  return (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="aspect-[4/3] bg-gray-100 relative">
                        {item.images?.[0] ? (
                          <Image
                            src={item.images[0]}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Tractor className="h-12 w-12 text-gray-300" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Badge variant={item.is_available ? 'success' : 'secondary'}>
                            {item.is_available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                        <div className="absolute top-2 left-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon" className="h-8 w-8 bg-white">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem asChild>
                                <Link href={`/renter/equipment/${item.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Listing
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/provider/equipment/${item.id}`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleToggleAvailability(item.id, item.is_available)}
                              >
                                {item.is_available ? 'Mark Unavailable' : 'Mark Available'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setDeleteId(item.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            {category && (
                              <p className="text-sm text-gray-500">{category.icon} {category.label}</p>
                            )}
                          </div>
                          <p className="font-bold text-green-600">
                            {formatCurrency(item.price_per_day)}/day
                          </p>
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              {item.rating?.toFixed(1) || 'New'}
                            </span>
                            <span>{item.total_bookings || 0} bookings</span>
                          </div>
                          
                          <Link href={`/provider/equipment/${item.id}`}>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Equipment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this equipment? This action cannot be undone and will also cancel any pending bookings.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteId(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              loading={isDeleting}
              className="flex-1"
            >
              Delete Equipment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
