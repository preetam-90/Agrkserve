'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Tractor,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Star,
  Filter,
  Grid3x3,
  List,
  TrendingUp
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function ProviderEquipmentPage() {
  const { sidebarOpen } = useAppStore();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const stats = {
    total: equipment.length,
    available: equipment.filter(e => e.is_available).length,
    totalBookings: equipment.reduce((sum, e) => sum + (e.total_bookings || 0), 0),
    avgRating: equipment.length > 0 
      ? equipment.reduce((sum, e) => sum + (e.rating || 0), 0) / equipment.length 
      : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar role="provider" />
        
        <main className={cn("flex-1 p-4 lg:p-8 transition-all duration-300", sidebarOpen ? "ml-64" : "ml-0")}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-700 bg-clip-text text-transparent">
                    My Equipment
                  </h1>
                  <p className="text-gray-600 mt-1">Manage your listed equipment inventory</p>
                </div>
                <Button asChild className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-600/30">
                  <Link href="/provider/equipment/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Equipment
                  </Link>
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Equipment', value: stats.total, icon: Tractor, gradient: 'from-blue-500 to-blue-600' },
                  { label: 'Available', value: stats.available, icon: Grid3x3, gradient: 'from-green-500 to-green-600' },
                  { label: 'Total Bookings', value: stats.totalBookings, icon: TrendingUp, gradient: 'from-purple-500 to-purple-600' },
                  { label: 'Avg Rating', value: stats.avgRating.toFixed(1), icon: Star, gradient: 'from-yellow-500 to-yellow-600' }
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="border-none shadow-lg">
                      <CardContent className="p-6">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} w-fit mb-3 shadow-lg`}>
                          <stat.icon className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Search and Filter */}
              <motion.div variants={itemVariants} className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search equipment..."
                    className="pl-10 border-none shadow-lg"
                  />
                </div>
                <Button variant="outline" className="border-none shadow-lg">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <div className="flex gap-2 border-none shadow-lg rounded-lg p-1 bg-white">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : filteredEquipment.length === 0 ? (
                <EmptyState
                  icon={<Tractor className="h-16 w-16" />}
                  title={searchQuery ? 'No equipment found' : 'No equipment listed'}
                  description={
                    searchQuery 
                      ? 'Try adjusting your search query'
                      : 'Start earning by listing your agricultural equipment'
                  }
                  action={
                    !searchQuery && (
                      <Button asChild className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                        <Link href="/provider/equipment/new">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Equipment
                        </Link>
                      </Button>
                    )
                  }
                />
              ) : (
                <div className={cn(
                  "grid gap-6",
                  viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                )}>
                  {filteredEquipment.map((item, idx) => {
                    const category = EQUIPMENT_CATEGORIES.find(c => c.value === item.category);
                    
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -8 }}
                      >
                        <Card className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300 group">
                          <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                            {item.images?.[0] ? (
                              <Image
                                src={item.images[0]}
                                alt={item.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Tractor className="h-16 w-16 text-gray-300" />
                              </div>
                            )}
                            <div className="absolute top-3 right-3 flex gap-2">
                              <Badge 
                                className={cn(
                                  "shadow-lg",
                                  item.is_available 
                                    ? "bg-gradient-to-r from-green-500 to-green-600" 
                                    : "bg-gradient-to-r from-gray-500 to-gray-600"
                                )}
                              >
                                {item.is_available ? 'Available' : 'Unavailable'}
                              </Badge>
                            </div>
                            <div className="absolute top-3 left-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="icon" className="h-9 w-9 bg-white/90 backdrop-blur-sm border-none shadow-lg">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/equipment/${item.id}`}>
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
                          
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 text-lg truncate">{item.name}</h3>
                                {category && (
                                  <p className="text-sm text-gray-500 mt-1">{category.icon} {category.label}</p>
                                )}
                              </div>
                              <p className="font-bold text-green-600 text-xl ml-2">
                                {formatCurrency(item.price_per_day)}<span className="text-sm text-gray-500">/day</span>
                              </p>
                            </div>
                            
                            <div className="flex items-center justify-between pt-3 border-t">
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium text-gray-900">{item.rating?.toFixed(1) || 'New'}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {item.total_bookings || 0}
                                </span>
                              </div>
                              
                              <Link href={`/provider/equipment/${item.id}`}>
                                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
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
