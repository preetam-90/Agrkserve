'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import {
  Eye,
  Edit,
  Trash2,
  Tractor,
  Plus,
  TrendingUp,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { ITEMS_PER_PAGE } from '@/lib/utils/admin-constants';
import DataTable from '@/components/admin/DataTable';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface EquipmentItem {
  id?: string;
  name?: string;
  category?: string;
  brand?: string;
  price_per_day?: number;
  is_available?: boolean;
  rating?: number;
  review_count?: number;
  images?: string[];
  owner?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    totalAssets: 0,
    availableCount: 0,
    rentedCount: 0,
    totalValue: 0,
  });

  const supabase = createClient();

  const fetchEquipment = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    try {
      // Build base query for paginated data
      let query = supabase.from('equipment').select(
        `
          *,
          owner:user_profiles!owner_id(name, email, phone)
        `,
        { count: 'exact' }
      );

      if (search) {
        query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%`);
      }

      if (categoryFilter) {
        query = query.eq('category', categoryFilter);
      }

      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      if (error) throw error;

      setEquipment(data || []);
      setTotalCount(count || 0);

      // Fetch ALL equipment for accurate stats (without pagination)
      let statsQuery = supabase.from('equipment').select('is_available, price_per_day');

      if (search) {
        statsQuery = statsQuery.or(
          `name.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%`
        );
      }

      if (categoryFilter) {
        statsQuery = statsQuery.eq('category', categoryFilter);
      }

      const { data: allEquipment, error: statsError } = await statsQuery;

      if (statsError) throw statsError;

      // Calculate stats from all equipment
      const available = allEquipment?.filter((e) => e.is_available).length || 0;
      const rented = allEquipment?.filter((e) => !e.is_available).length || 0;
      const totalValue = allEquipment?.reduce((sum, e) => sum + (e.price_per_day || 0), 0) || 0;

      setStats({
        totalAssets: count || 0,
        availableCount: available,
        rentedCount: rented,
        totalValue,
      });
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast.error('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, currentPage]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const columns = [
    {
      key: 'name',
      label: 'Equipment',
      render: (item: unknown) => {
        const eq = item as EquipmentItem;
        return (
          <div className="flex items-center gap-3">
            <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm transition-transform hover:scale-105 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
              {eq.images?.[0] ? (
                <Image
                  src={eq.images[0]}
                  alt={eq.name || 'Equipment'}
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Tractor className="h-7 w-7 text-slate-400 dark:text-slate-500" />
              )}
              <div
                className={`absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white dark:border-slate-800 ${eq.is_available ? 'bg-green-500' : 'bg-amber-500'}`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 font-semibold text-slate-900 dark:text-white">{eq.name}</p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {eq.category}
                </span>
                {eq.brand && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">{eq.brand}</span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (item: unknown) => {
        const eq = item as EquipmentItem;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-slate-900 dark:text-white">
              {eq.owner?.name || 'Unknown'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {eq.owner?.phone || 'No phone'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'price',
      label: 'Price / Day',
      sortable: true,
      render: (item: unknown) => {
        const eq = item as EquipmentItem;
        return (
          <div className="flex flex-col">
            <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
              {formatCurrency(eq.price_per_day || 0)}
            </span>
            <span className="text-xs text-slate-500">per day</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Availability',
      render: (item: unknown) => {
        const eq = item as EquipmentItem;
        return eq.is_available ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Available
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-400">
            <XCircle className="h-3.5 w-3.5" />
            Rented
          </span>
        );
      },
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (item: unknown) => {
        const eq = item as EquipmentItem;
        return (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-lg text-amber-400">★</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {eq.rating?.toFixed(1) || '0.0'}
              </span>
            </div>
            <span className="text-xs text-slate-400">({eq.review_count || 0} reviews)</span>
          </div>
        );
      },
    },
  ];

  const deleteEquipment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this equipment? This action cannot be undone.'))
      return;

    const loadingToast = toast.loading('Deleting equipment...');

    try {
      const { error } = await supabase.from('equipment').delete().eq('id', id);

      if (error) throw error;

      toast.success('Equipment deleted successfully', { id: loadingToast });
      fetchEquipment();
    } catch (err) {
      console.error('Error deleting equipment:', err);
      toast.error('Failed to delete equipment', { id: loadingToast });
    }
  };

  const actions = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (item: unknown) =>
        (window.location.href = `/admin/equipment/${(item as { id?: string }).id}`),
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (item: unknown) =>
        (window.location.href = `/admin/equipment/${(item as { id?: string }).id}/edit`),
    },
    {
      label: 'Delete',
      icon: Trash2,
      danger: true,
      onClick: (item: unknown) => deleteEquipment((item as { id?: string }).id || ''),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Equipment Management
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
            Manage tractors, drones, and other machinery across your platform
          </p>
        </div>
        <Link
          href="/provider/equipment/new"
          className="group flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:shadow-xl hover:shadow-green-500/30 active:scale-95"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          Add Equipment
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Assets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Assets</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {stats.totalAssets}
              </h3>
              <p className="mt-1 text-xs text-slate-500">All equipment items</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600 transition-transform group-hover:scale-110 dark:bg-blue-900/20 dark:text-blue-400">
              <Package className="h-6 w-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-blue-600" />
        </motion.div>

        {/* Available */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Available</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {stats.availableCount}
              </h3>
              <p className="mt-1 text-xs text-slate-500">Ready to rent</p>
            </div>
            <div className="rounded-xl bg-green-50 p-3 text-green-600 transition-transform group-hover:scale-110 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-green-500 to-green-600" />
        </motion.div>

        {/* Currently Rented */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Currently Rented
              </p>
              <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {stats.rentedCount}
              </h3>
              <p className="mt-1 text-xs text-slate-500">In active use</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600 transition-transform group-hover:scale-110 dark:bg-amber-900/20 dark:text-amber-400">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-amber-600" />
        </motion.div>

        {/* Total Value */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Daily Revenue Potential
              </p>
              <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(stats.totalValue)}
              </h3>
              <p className="mt-1 text-xs text-slate-500">If all rented</p>
            </div>
            <div className="rounded-xl bg-purple-50 p-3 text-purple-600 transition-transform group-hover:scale-110 dark:bg-purple-900/20 dark:text-purple-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500 to-purple-600" />
        </motion.div>
      </div>

      {/* Quick Actions Info Card */}
      {equipment.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-start gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900/30 dark:bg-blue-900/10"
        >
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">No equipment found</h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              Get started by adding your first equipment item. Click the &quot;Add Equipment&quot;
              button above to begin.
            </p>
          </div>
        </motion.div>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={equipment}
        actions={actions}
        isLoading={loading}
        onSearch={setSearch}
        searchPlaceholder="Search by name, brand, or model..."
        pagination={{
          currentPage,
          totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
          onPageChange: setCurrentPage,
          totalItems: totalCount,
        }}
      />
    </div>
  );
}
