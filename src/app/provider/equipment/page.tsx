'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  motion,
  AnimatePresence,
  useMotionTemplate,
  useSpring,
  useMotionValue,
} from 'framer-motion';
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
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Upload,
  Sparkles,
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Checkbox } from '@/components/ui';
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
  DropdownMenuSeparator,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { equipmentService } from '@/lib/services';
import { Equipment } from '@/lib/types';
import {
  formatCurrency,
  EQUIPMENT_CATEGORIES,
  PRICE_RANGE_OPTIONS,
  RATING_OPTIONS,
  cn,
} from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 50,
      damping: 15,
    },
  },
};

const cardHoverVariants = {
  hover: {
    y: -8,
    scale: 1.02,
    transition: { type: 'spring', stiffness: 300 },
  },
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(
    (typeof window !== 'undefined' &&
      (localStorage.getItem('equipmentViewMode') as 'grid' | 'list')) ||
      'grid'
  );
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<Record<string, string[]>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>(
    'all'
  );
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const mouseX = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const showCheckbox = isHovered || selectedIds.length > 0;
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        mouseX.set(x);
        mouseY.set(y);
      }
    },
    [mouseX, mouseY]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs or textareas
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Ctrl/Cmd+N for new equipment
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        router.push('/provider/equipment/new');
      }

      // / for search focus
      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const spotlightGradient = useMotionTemplate`radial-gradient(600px circle at ${mouseX}% ${mouseY}%, rgba(34, 197, 94, 0.08), transparent 40%)`;

  useEffect(() => {
    loadEquipment();
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      searchInputRef.current?.focus();
    }
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

  const handleBulkToggleAvailability = async (makeAvailable: boolean) => {
    if (selectedIds.length === 0) return;

    try {
      await Promise.all(
        selectedIds.map((id) =>
          equipmentService.updateEquipment(id, { is_available: makeAvailable })
        )
      );
      setEquipment((prev) =>
        prev.map((e) => (selectedIds.includes(e.id) ? { ...e, is_available: makeAvailable } : e))
      );
      toast.success(
        `${selectedIds.length} equipment marked as ${makeAvailable ? 'available' : 'unavailable'}`
      );
      setSelectedIds([]);
    } catch (err) {
      toast.error('Failed to update equipment');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm('Are you sure you want to delete the selected equipment?')) return;
    if (selectedIds.length === 0) return;

    try {
      await Promise.all(selectedIds.map((id) => equipmentService.deleteEquipment(id)));
      setEquipment((prev) => prev.filter((e) => !selectedIds.includes(e.id)));
      toast.success(`${selectedIds.length} equipment deleted`);
      setSelectedIds([]);
    } catch (err) {
      toast.error('Failed to delete equipment');
    }
  };

  const filteredEquipment = equipment.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category?.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory = !selectedCategory || e.category === selectedCategory;

    let matchesPrice = true;
    if (selectedPriceRange) {
      const range = PRICE_RANGE_OPTIONS.find((r) => r.label === selectedPriceRange);
      if (range) {
        matchesPrice = e.price_per_day >= range.min && e.price_per_day <= range.max;
      }
    }

    let matchesAvailability = true;
    if (availabilityFilter === 'available') {
      matchesAvailability = e.is_available === true;
    } else if (availabilityFilter === 'unavailable') {
      matchesAvailability = e.is_available === false;
    }

    let matchesRating = true;
    if (selectedRating > 0) {
      matchesRating = (e.rating || 0) >= selectedRating;
    }

    return matchesSearch && matchesCategory && matchesPrice && matchesAvailability && matchesRating;
  });

  const stats = {
    total: equipment.length,
    available: equipment.filter((e) => e.is_available).length,
    totalBookings: equipment.reduce((sum, e) => sum + (e.total_bookings || 0), 0),
    avgRating:
      equipment.length > 0
        ? equipment.reduce((sum, e) => sum + (e.rating || 0), 0) / equipment.length
        : 0,
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-[#0A0F0C] text-white selection:bg-emerald-500/30"
    >
      <motion.div
        style={{ background: spotlightGradient }}
        className="pointer-events-none absolute inset-0 z-0"
      />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#22c55e08_1px,transparent_1px),linear-gradient(to_bottom,#22c55e08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#22c55e10,transparent)]" />
      </div>

      <Header />

      <div className="relative z-10 flex">
        {selectedIds.length > 0 && (
          <div className="fixed bottom-4 left-4 z-50 flex items-center gap-4 rounded-lg bg-gray-800 p-4 shadow-lg">
            <span className="text-white">{selectedIds.length} selected</span>
            <Button
              variant="default"
              onClick={() => handleBulkToggleAvailability(true)}
              className="bg-green-500 hover:bg-green-600"
            >
              Mark Available
            </Button>
            <Button
              variant="default"
              onClick={() => handleBulkToggleAvailability(false)}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              Mark Unavailable
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </Button>
          </div>
        )}
        <main className="flex-1 px-4 pb-12 pt-28 transition-all duration-500 ease-out lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="mx-auto max-w-7xl"
          >
            <motion.div
              variants={itemVariants}
              className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 100 }}
                  className="text-4xl font-bold tracking-tight"
                >
                  <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                    Equipment Fleet
                  </span>
                </motion.h1>
                <p className="mt-2 text-gray-400">
                  Manage your inventory and maximize your rental income
                </p>
              </div>
              <Button
                asChild
                className="group relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 hover:shadow-emerald-500/40 active:scale-95"
              >
                <Link href="/provider/equipment/new">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="relative z-10 flex items-center">
                    <Plus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" />
                    Add Equipment
                  </span>
                </Link>
              </Button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
            >
              {[
                {
                  label: 'Total Equipment',
                  value: stats.total,
                  icon: Tractor,
                  color: 'text-blue-400',
                  bg: 'bg-blue-500/10',
                  border: 'border-blue-500/20',
                },
                {
                  label: 'Available Now',
                  value: stats.available,
                  icon: CheckCircle2,
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-500/10',
                  border: 'border-emerald-500/20',
                },
                {
                  label: 'Total Bookings',
                  value: stats.totalBookings,
                  icon: TrendingUp,
                  color: 'text-purple-400',
                  bg: 'bg-purple-500/10',
                  border: 'border-purple-500/20',
                },
                {
                  label: 'Avg Rating',
                  value: stats.avgRating.toFixed(1),
                  icon: Star,
                  color: 'text-amber-400',
                  bg: 'bg-amber-500/10',
                  border: 'border-amber-500/20',
                },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1, type: 'spring', stiffness: 100 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`group relative overflow-hidden rounded-2xl border ${stat.border} bg-[#121212]/60 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-opacity-50`}
                >
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-2xl transition-all group-hover:scale-150" />

                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                      <motion.h3
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.1 + 0.2 }}
                        className="mt-2 text-3xl font-bold tracking-tight text-white"
                      >
                        {stat.value}
                      </motion.h3>
                    </div>
                    <div className={`rounded-xl p-3 ${stat.bg}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/5 bg-[#121212]/60 p-4 backdrop-blur-xl md:flex-row md:items-center"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or category..."
                  className="h-11 border-white/10 bg-black/40 pl-11 text-white placeholder:text-gray-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(true)}
                  className="h-11 border-white/10 bg-black/20 text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  {(selectedCategory ||
                    selectedPriceRange ||
                    availabilityFilter !== 'all' ||
                    selectedRating > 0) && (
                    <Badge className="ml-2 border-0 bg-emerald-600 text-white">
                      {[
                        selectedCategory ? 1 : 0,
                        selectedPriceRange ? 1 : 0,
                        availabilityFilter !== 'all' ? 1 : 0,
                        selectedRating > 0 ? 1 : 0,
                      ].reduce((a, b) => a + b, 0)}
                    </Badge>
                  )}
                </Button>
                <div className="flex rounded-lg border border-white/10 bg-black/20 p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    title="Switch to grid view"
                    className={cn(
                      'h-9 w-9 rounded-md transition-all',
                      viewMode === 'grid'
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'
                    )}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    title="Switch to list view"
                    className={cn(
                      'h-9 w-9 rounded-md transition-all',
                      viewMode === 'list'
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'
                    )}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-12">
              <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#121212]/60 p-6 shadow-lg backdrop-blur-xl">
                <div className="rounded-xl bg-[#0f0f10]/80 p-6 backdrop-blur-sm md:flex md:items-center md:justify-between md:gap-8">
                  <div className="mb-4 md:mb-0">
                    <div className="mb-2 flex items-center gap-3">
                      <div className="rounded-lg bg-emerald-500/20 p-2">
                        <ImageIcon className="h-5 w-5 text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Quick Gallery Update</h3>
                    </div>
                    <p className="max-w-lg text-sm text-gray-400">
                      Upload new images to increase visibility and bookings
                    </p>
                  </div>

                  <div className="flex flex-1 flex-col justify-end gap-3 sm:flex-row sm:items-center">
                    {equipment.length > 0 && (
                      <select
                        value={selectedEquipmentId || ''}
                        onChange={(e) => setSelectedEquipmentId(e.target.value || null)}
                        className="h-10 rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-64"
                      >
                        <option value="" className="bg-gray-900">
                          Select equipment...
                        </option>
                        {equipment.map((item) => (
                          <option key={item.id} value={item.id} className="bg-gray-900">
                            {item.name}
                          </option>
                        ))}
                      </select>
                    )}

                    {selectedEquipmentId && (
                      <Button
                        onClick={() => router.push(`/provider/equipment/${selectedEquipmentId}`)}
                        className="rounded-lg bg-white text-black hover:bg-gray-200"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Equipment
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {isLoading ? (
              <div
                className={cn(
                  'grid gap-6',
                  viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
                )}
              >
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-white/10 bg-[#121212]/60 p-4 backdrop-blur-xl"
                  >
                    <div className="mb-4 aspect-[16/10] animate-pulse rounded-xl bg-white/5" />
                    <div className="mb-2 h-6 w-3/4 animate-pulse rounded-md bg-white/5" />
                    <div className="mb-4 h-4 w-1/2 animate-pulse rounded-md bg-white/5" />
                    <div className="h-8 w-1/3 animate-pulse rounded-md bg-white/5" />
                  </div>
                ))}
              </div>
            ) : filteredEquipment.length === 0 && !searchQuery ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 100 }}
              >
                <EmptyState
                  icon={<Sparkles className="animate-float h-16 w-16 text-emerald-500/50" />}
                  title="Start Building Your Fleet"
                  description="Add your first piece of equipment to begin earning"
                  action={
                    <Button
                      asChild
                      className="rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3 text-white shadow-lg shadow-emerald-900/20 hover:from-emerald-500 hover:to-emerald-400"
                    >
                      <Link href="/provider/equipment/new" className="flex items-center">
                        <Plus className="mr-2 h-5 w-5" />
                        List Your First Equipment
                      </Link>
                    </Button>
                  }
                  className="border-white/5 bg-[#121212]/60 text-white backdrop-blur-xl"
                />
              </motion.div>
            ) : filteredEquipment.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 100 }}
              >
                <EmptyState
                  icon={<Tractor className="h-16 w-16 text-emerald-500/50" />}
                  title="No matches found"
                  description="Try adjusting your filters or search terms"
                  action={
                    <Button
                      asChild
                      className="rounded-2xl border border-white/10 bg-transparent text-white hover:bg-white/5"
                    >
                      <Link href="/provider/equipment/new" className="flex items-center">
                        <Plus className="mr-2 h-5 w-5" />
                        Add Equipment
                      </Link>
                    </Button>
                  }
                  className="border-white/5 bg-[#121212]/60 text-white backdrop-blur-xl"
                />
              </motion.div>
            ) : (
              <div
                className={cn(
                  'grid gap-6',
                  viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
                )}
              >
                <AnimatePresence mode="popLayout">
                  {filteredEquipment.map((item, idx) => {
                    const isSelected = selectedIds.includes(item.id);
                    const category = EQUIPMENT_CATEGORIES.find((c) => c.value === item.category);

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: idx * 0.05 }}
                        variants={cardHoverVariants}
                        whileHover="hover"
                        className="h-full"
                      >
                        {viewMode === 'grid' ? (
                          <motion.div
                            whileHover={{ y: -4 }}
                            className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-[#121212]/60 shadow-2xl backdrop-blur-xl transition-all hover:border-emerald-500/30"
                          >
                            <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                              {showCheckbox && (
                                <Checkbox
                                  checked={isSelected}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const checked = e.target.checked;
                                    setSelectedIds((prev) =>
                                      checked
                                        ? [...prev, item.id]
                                        : prev.filter((id) => id !== item.id)
                                    );
                                  }}
                                  className="absolute left-2 top-2 z-10"
                                />
                              )}
                              {item.images?.[0] ? (
                                <Image
                                  src={item.images[0]}
                                  alt={item.name}
                                  fill
                                  className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Tractor className="h-16 w-16 text-white/10" />
                                </div>
                              )}

                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70 transition-opacity group-hover:opacity-50" />

                              <div className="absolute left-3 top-3 flex items-center gap-2">
                                <Badge
                                  className={cn(
                                    'border-0 px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-md',
                                    item.is_available
                                      ? 'bg-emerald-500/90 text-white'
                                      : 'bg-gray-500/90 text-white'
                                  )}
                                >
                                  {item.is_available ? 'Available' : 'Unavailable'}
                                </Badge>
                              </div>

                              <div className="absolute right-3 top-3">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="icon"
                                      className="h-8 w-8 rounded-full border-0 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-emerald-600"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="border-white/10 bg-[#1a1a1a] text-white backdrop-blur-xl"
                                  >
                                    <DropdownMenuItem
                                      asChild
                                      className="focus:bg-white/10 focus:text-white"
                                    >
                                      <Link href={`/equipment/${item.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Listing
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      asChild
                                      className="focus:bg-white/10 focus:text-white"
                                    >
                                      <Link href={`/provider/equipment/${item.id}`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Details
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleToggleAvailability(item.id, item.is_available)
                                      }
                                      className="focus:bg-white/10 focus:text-white"
                                    >
                                      {item.is_available ? (
                                        <>
                                          <XCircle className="mr-2 h-4 w-4 text-orange-400" />
                                          Mark Unavailable
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400" />
                                          Mark Available
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem
                                      onClick={() => setDeleteId(item.id)}
                                      className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              <div className="absolute bottom-3 right-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-center backdrop-blur-md">
                                <span className="block text-xs uppercase tracking-wider text-emerald-300">
                                  Daily Rate
                                </span>
                                <span className="block text-2xl font-bold text-emerald-400">
                                  {formatCurrency(item.price_per_day)}
                                </span>
                              </div>
                            </div>

                            <CardContent className="p-5">
                              <div className="mb-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="line-clamp-1 text-lg font-bold text-white transition-colors group-hover:text-emerald-400">
                                      {item.name}
                                    </h3>
                                    <p className="mt-1 flex items-center text-xs font-medium uppercase tracking-wider text-gray-500">
                                      {category?.icon && (
                                        <span className="mr-1.5 text-base">{category.icon}</span>
                                      )}
                                      {category?.label || 'Uncategorized'}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                <div className="flex gap-4">
                                  <div className="flex items-center gap-1.5 text-sm text-gray-400">
                                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                                    <span className="font-semibold text-white">
                                      {item.rating?.toFixed(1) || 'New'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-sm text-gray-400">
                                    <TrendingUp className="h-4 w-4" />
                                    <span>{item.total_bookings || 0} bookings</span>
                                  </div>
                                </div>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  className="h-8 rounded-lg p-0 px-0 font-medium text-emerald-400 hover:bg-transparent hover:text-emerald-300"
                                >
                                  <Link
                                    href={`/provider/equipment/${item.id}`}
                                    className="flex items-center gap-1"
                                  >
                                    Manage
                                    <span className="text-xs">&rarr;</span>
                                  </Link>
                                </Button>
                              </div>
                            </CardContent>
                          </motion.div>
                        ) : (
                          <motion.div
                            whileHover={{ y: -4 }}
                            className="group flex overflow-hidden rounded-2xl border border-white/10 bg-[#121212]/60 shadow-2xl backdrop-blur-xl transition-all hover:border-emerald-500/30"
                          >
                            <div className="relative w-48 shrink-0 bg-gradient-to-br from-gray-900 to-gray-800">
                              {item.images?.[0] ? (
                                <Image
                                  src={item.images[0]}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Tractor className="h-10 w-10 text-white/20" />
                                </div>
                              )}
                              <Badge
                                className={cn(
                                  'absolute left-2 top-2 border-0 shadow-lg',
                                  item.is_available
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-gray-500 text-white'
                                )}
                              >
                                {item.is_available ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="flex flex-1 flex-col justify-between p-5">
                              <div className="flex justify-between">
                                <div>
                                  <h3 className="text-lg font-bold text-white">{item.name}</h3>
                                  <p className="text-sm text-gray-400">{category?.label}</p>
                                </div>
                                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-right">
                                  <span className="block text-xs uppercase tracking-wider text-emerald-300">
                                    Daily Rate
                                  </span>
                                  <p className="text-xl font-bold text-emerald-400">
                                    {formatCurrency(item.price_per_day)}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-4 flex items-center justify-between">
                                <div className="flex gap-6 text-sm text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                                    {item.rating?.toFixed(1) || 'N/A'}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <TrendingUp className="h-4 w-4" />
                                    {item.total_bookings || 0} bookings
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-lg border-white/10 bg-white/5 text-white hover:bg-white/10"
                                    asChild
                                  >
                                    <Link href={`/provider/equipment/${item.id}`}>Edit</Link>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                    onClick={() => setDeleteId(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="border-white/10 bg-[#1a1a1a] text-white backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Equipment</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this equipment? This action cannot be undone and will
              also cancel any pending bookings.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              className="flex-1 border-white/10 bg-transparent text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Delete Equipment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="max-h-[80vh] max-w-md overflow-y-auto border-white/10 bg-[#1a1a1a] text-white backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-white">Filter Equipment</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-400">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="border-white/10 bg-black/40 text-white focus:border-emerald-500">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#1a1a1a] text-white">
                  <SelectItem value="" className="focus:bg-white/10">
                    All Categories
                  </SelectItem>
                  {EQUIPMENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="focus:bg-white/10">
                      {cat.icon && <span className="mr-2">{cat.icon}</span>}
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-400">Price Range</label>
              <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                <SelectTrigger className="border-white/10 bg-black/40 text-white focus:border-emerald-500">
                  <SelectValue placeholder="Any Price" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#1a1a1a] text-white">
                  <SelectItem value="" className="focus:bg-white/10">
                    Any Price
                  </SelectItem>
                  {PRICE_RANGE_OPTIONS.map((range) => (
                    <SelectItem key={range.label} value={range.label} className="focus:bg-white/10">
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-400">Availability</label>
              <Select
                value={availabilityFilter}
                onValueChange={(v) =>
                  setAvailabilityFilter(v as 'all' | 'available' | 'unavailable')
                }
              >
                <SelectTrigger className="border-white/10 bg-black/40 text-white focus:border-emerald-500">
                  <SelectValue placeholder="Any Availability" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#1a1a1a] text-white">
                  <SelectItem value="all" className="focus:bg-white/10">
                    Any Availability
                  </SelectItem>
                  <SelectItem value="available" className="focus:bg-white/10">
                    Available Only
                  </SelectItem>
                  <SelectItem value="unavailable" className="focus:bg-white/10">
                    Unavailable Only
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-400">Minimum Rating</label>
              <Select
                value={selectedRating.toString()}
                onValueChange={(v) => setSelectedRating(Number(v))}
              >
                <SelectTrigger className="border-white/10 bg-black/40 text-white focus:border-emerald-500">
                  <SelectValue placeholder="Any Rating" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#1a1a1a] text-white">
                  {RATING_OPTIONS.map((rating) => (
                    <SelectItem
                      key={rating.value}
                      value={rating.value.toString()}
                      className="focus:bg-white/10"
                    >
                      {rating.value === 0 ? 'Any Rating' : `${rating.value}+ Stars`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {}
            <div className="flex gap-3 border-t border-white/10 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedPriceRange('');
                  setAvailabilityFilter('all');
                  setSelectedRating(0);
                }}
                className="flex-1 border-white/10 bg-transparent text-gray-300 hover:bg-white/5"
              >
                Clear Filters
              </Button>
              <Button
                onClick={() => setShowFilters(false)}
                className="flex-1 bg-emerald-600 text-white hover:bg-emerald-500"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
