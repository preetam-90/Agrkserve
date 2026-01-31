'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
  TrendingUp,
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
  DialogDescription,
} from '@/components/ui';
import { equipmentService } from '@/lib/services';
import { Equipment } from '@/lib/types';
import { formatCurrency, EQUIPMENT_CATEGORIES, cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ProviderEquipmentPage() {
  const router = useRouter();
  const { sidebarOpen } = useAppStore();
  const supabase = createClient();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<Record<string, string[]>>({});

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
      setEquipment((prev) =>
        prev.map((e) => (e.id === id ? { ...e, is_available: !currentStatus } : e))
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
      setEquipment((prev) => prev.filter((e) => e.id !== deleteId));
      toast.success('Equipment deleted');
      setDeleteId(null);
    } catch (err) {
      console.error('Failed to delete equipment:', err);
      toast.error('Failed to delete equipment');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEquipment = equipment.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: equipment.length,
    available: equipment.filter((e) => e.is_available).length,
    totalBookings: equipment.reduce((sum, e) => sum + (e.total_bookings || 0), 0),
    avgRating:
      equipment.length > 0
        ? equipment.reduce((sum, e) => sum + (e.rating || 0), 0) / equipment.length
        : 0,
  };

  // Handle equipment image upload completion
  const handleEquipmentImageUpload = async (equipmentId: string, files: Array<{ url: string; name: string; size: number }>) => {
    if (files.length === 0) return;
    
    const imageUrls = files.map(f => f.url);
    
    // Get current images from the equipment item
    const equipmentItem = equipment.find(e => e.id === equipmentId);
    const currentImages = equipmentItem?.images || [];
    const updatedImages = [...currentImages, ...imageUrls];
    
    setIsLoading(true);
    try {
      // Update equipment with new images
      const { error } = await supabase
        .from('equipment')
        .update({
          images: updatedImages,
          updated_at: new Date().toISOString()
        })
        .eq('id', equipmentId);
      
      if (error) throw error;
      
      // Update local state
      setEquipment(prev =>
        prev.map(e => e.id === equipmentId ? { ...e, images: updatedImages } : e)
      );
      
      setUploadedImages(prev => ({
        ...prev,
        [equipmentId]: imageUrls
      }));
      
      toast.success('Equipment images uploaded successfully!');
    } catch (err: any) {
      console.error('Failed to save equipment images:', err);
      toast.error('Failed to save equipment images');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <Header />

      <div className="flex">
        <Sidebar role="provider" />

        <main
          className={cn(
            'flex-1 px-4 pb-4 pt-28 transition-all duration-300 lg:px-8 lg:pb-8',
            sidebarOpen ? 'ml-64' : 'ml-0'
          )}
        >
          <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <div className="mx-auto max-w-7xl">
              {/* Header */}
              <motion.div
                variants={itemVariants}
                className="mb-8 flex items-center justify-between"
              >
                <div>
                  <h1 className="bg-gradient-to-r from-gray-900 to-blue-700 bg-clip-text text-3xl font-bold text-transparent">
                    My Equipment
                  </h1>
                  <p className="mt-1 text-gray-600">Manage your listed equipment inventory</p>
                </div>
                <Button
                  asChild
                  className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg shadow-green-600/30 hover:from-green-700 hover:to-green-800"
                >
                  <Link href="/provider/equipment/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Equipment
                  </Link>
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={itemVariants}
                className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4"
              >
                {[
                  {
                    label: 'Total Equipment',
                    value: stats.total,
                    icon: Tractor,
                    gradient: 'from-blue-500 to-blue-600',
                  },
                  {
                    label: 'Available',
                    value: stats.available,
                    icon: Grid3x3,
                    gradient: 'from-green-500 to-green-600',
                  },
                  {
                    label: 'Total Bookings',
                    value: stats.totalBookings,
                    icon: TrendingUp,
                    gradient: 'from-purple-500 to-purple-600',
                  },
                  {
                    label: 'Avg Rating',
                    value: stats.avgRating.toFixed(1),
                    icon: Star,
                    gradient: 'from-yellow-500 to-yellow-600',
                  },
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card className="border-none shadow-lg">
                      <CardContent className="p-6">
                        <div
                          className={`rounded-xl bg-gradient-to-br p-3 ${stat.gradient} mb-3 w-fit shadow-lg`}
                        >
                          <stat.icon className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="mt-1 text-sm text-gray-600">{stat.label}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Search and Filter */}
              <motion.div variants={itemVariants} className="mb-6 flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search equipment..."
                    className="border-none pl-10 shadow-lg"
                  />
                </div>
                <Button variant="outline" className="border-none shadow-lg">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
                <div className="flex gap-2 rounded-lg border-none bg-white p-1 shadow-lg">
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

              {/* Equipment Image Upload Section */}
              <motion.div variants={itemVariants} className="mb-8">
                <Card className="border-none shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Upload Equipment Images</h3>
                        <p className="text-sm text-gray-600">Select equipment and upload images</p>
                      </div>
                    </div>
                    
                    {equipment.length > 0 && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Equipment
                        </label>
                        <select
                          value={selectedEquipmentId || ''}
                          onChange={(e) => setSelectedEquipmentId(e.target.value || null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">-- Select equipment --</option>
                          {equipment.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    {selectedEquipmentId && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">
                          Image upload is available in the equipment edit page.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/provider/equipment/${selectedEquipmentId}`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Equipment to Upload Images
                        </Button>
                      </div>
                    )}
                    
                    {/* Display uploaded images preview */}
                    {selectedEquipmentId && uploadedImages[selectedEquipmentId]?.length > 0 && (
                      <div className="mt-6">
                        <p className="text-sm font-medium text-gray-700 mb-2">Recently Uploaded Images:</p>
                        <div className="flex flex-wrap gap-2">
                          {uploadedImages[selectedEquipmentId].map((url, idx) => (
                            <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border-2 border-green-200">
                              <img
                                src={url}
                                alt={`Uploaded ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
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
                      <Button
                        asChild
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      >
                        <Link href="/provider/equipment/new">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Your First Equipment
                        </Link>
                      </Button>
                    )
                  }
                />
              ) : (
                <div
                  className={cn(
                    'grid gap-6',
                    viewMode === 'grid'
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                      : 'grid-cols-1'
                  )}
                >
                  {filteredEquipment.map((item, idx) => {
                    const category = EQUIPMENT_CATEGORIES.find((c) => c.value === item.category);

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -8 }}
                      >
                        <Card className="group overflow-hidden border-none shadow-lg transition-all duration-300 hover:shadow-2xl">
                          <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                            {item.images?.[0] ? (
                              <Image
                                src={item.images[0]}
                                alt={item.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Tractor className="h-16 w-16 text-gray-300" />
                              </div>
                            )}
                            <div className="absolute right-3 top-3 flex gap-2">
                              <Badge
                                className={cn(
                                  'shadow-lg',
                                  item.is_available
                                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                                    : 'bg-gradient-to-r from-gray-500 to-gray-600'
                                )}
                              >
                                {item.is_available ? 'Available' : 'Unavailable'}
                              </Badge>
                            </div>
                            <div className="absolute left-3 top-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 border-none bg-white/90 shadow-lg backdrop-blur-sm"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/equipment/${item.id}`}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Listing
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/provider/equipment/${item.id}`}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleToggleAvailability(item.id, item.is_available)
                                    }
                                  >
                                    {item.is_available ? 'Mark Unavailable' : 'Mark Available'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setDeleteId(item.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          <CardContent className="p-5">
                            <div className="mb-3 flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="truncate text-lg font-semibold text-gray-900">
                                  {item.name}
                                </h3>
                                {category && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    {category.icon} {category.label}
                                  </p>
                                )}
                              </div>
                              <p className="ml-2 text-xl font-bold text-green-600">
                                {formatCurrency(item.price_per_day)}
                                <span className="text-sm text-gray-500">/day</span>
                              </p>
                            </div>

                            <div className="flex items-center justify-between border-t pt-3">
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium text-gray-900">
                                    {item.rating?.toFixed(1) || 'New'}
                                  </span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {item.total_bookings || 0}
                                </span>
                              </div>

                              <Link href={`/provider/equipment/${item.id}`}>
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                                >
                                  <Edit className="mr-1 h-3 w-3" />
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
              Are you sure you want to delete this equipment? This action cannot be undone and will
              also cancel any pending bookings.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex gap-3">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">
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
