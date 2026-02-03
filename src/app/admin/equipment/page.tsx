'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import SearchFilterBar from '@/components/admin/SearchFilterBar';
import Link from 'next/link';
import { Eye, Edit, Trash2, Tractor, Plus } from 'lucide-react';
import { ITEMS_PER_PAGE, EQUIPMENT_CATEGORY_OPTIONS } from '@/lib/utils/admin-constants';
import DataTable from '@/components/admin/DataTable';
import toast from 'react-hot-toast';

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<Record<string, string[]>>({});
  const [isUploading, setIsUploading] = useState(false);

  const supabase = createClient();

  const fetchEquipment = async () => {
    setLoading(true);
    try {
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
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [search, categoryFilter, currentPage]);

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
      render: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
            {item.images?.[0] ? (
              <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <Tractor className="h-6 w-6 text-slate-400" />
            )}
          </div>
          <div>
            <p className="line-clamp-1 font-medium text-slate-900 dark:text-white">{item.name}</p>
            <p className="text-xs capitalize text-slate-500">{item.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (item: any) => (
        <div className="flex flex-col">
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {item.owner?.name || 'Unknown'}
          </span>
          <span className="text-xs text-slate-500">{item.owner?.phone}</span>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Price / Day',
      sortable: true,
      render: (item: any) => (
        <span className="font-mono font-medium text-slate-900 dark:text-white">
          {formatCurrency(item.price_per_day)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: any) =>
        item.is_available ? (
          <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-400">
            Available
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-400">
            Rented
          </span>
        ),
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (item: any) => (
        <div className="flex items-center gap-1">
          <span className="text-amber-400">★</span>
          <span className="text-sm font-medium">{item.rating || 0}</span>
          <span className="text-xs text-slate-400">({item.review_count || 0})</span>
        </div>
      ),
    },
  ];

  const deleteEquipment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this equipment? This action cannot be undone.'))
      return;

    try {
      const { error } = await supabase.from('equipment').delete().eq('id', id);

      if (error) throw error;

      // Refresh list
      fetchEquipment();
      console.log(`Equipment ${id} deleted`);
    } catch (err) {
      console.error('Error deleting equipment:', err);
      alert('Failed to delete equipment');
    }
  };

  const actions = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (item: any) => (window.location.href = `/admin/equipment/${item.id}`),
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (item: any) => (window.location.href = `/admin/equipment/${item.id}/edit`),
    },
    {
      label: 'Delete',
      icon: Trash2,
      danger: true,
      onClick: (item: any) => deleteEquipment(item.id),
    },
  ];

  // Handle equipment image upload completion
  const handleEquipmentImageUpload = async (
    equipmentId: string,
    files: Array<{ url: string; name: string; size: number }>
  ) => {
    if (files.length === 0) return;

    const imageUrls = files.map((f) => f.url);

    // Get current images from the equipment item
    const equipmentItem = equipment.find((e) => e.id === equipmentId);
    const currentImages = equipmentItem?.images || [];
    const updatedImages = [...currentImages, ...imageUrls];

    setIsUploading(true);
    try {
      // Update equipment with new images
      const { error } = await supabase
        .from('equipment')
        .update({
          images: updatedImages,
          updated_at: new Date().toISOString(),
        })
        .eq('id', equipmentId);

      if (error) throw error;

      // Update local state
      setEquipment((prev) =>
        prev.map((e) => (e.id === equipmentId ? { ...e, images: updatedImages } : e))
      );

      setUploadedImages((prev) => ({
        ...prev,
        [equipmentId]: imageUrls,
      }));

      toast.success('Equipment images uploaded successfully!');
    } catch (err: any) {
      console.error('Failed to save equipment images:', err);
      toast.error('Failed to save equipment images');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Equipment</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Manage tractors, drones, and other machinery.
          </p>
        </div>
        <Link
          href="/provider/equipment/new"
          className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-colors hover:bg-green-700"
        >
          <Plus className="h-4 w-4" />
          Add Equipment
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="glass-card flex items-center justify-between rounded-2xl p-6">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Assets</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalCount}</h3>
          </div>
          <div className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
            <Tractor className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Equipment Image Upload Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
          Upload Equipment Images
        </h3>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Select equipment and upload multiple images (max 10)
        </p>

        {equipment.length > 0 && (
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Select Equipment
            </label>
            <select
              value={selectedEquipmentId || ''}
              onChange={(e) => setSelectedEquipmentId(e.target.value || null)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
              <option value="">-- Select equipment --</option>
              {equipment.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.category})
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedEquipmentId && (
          <div className="mt-4 max-w-2xl rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
              Image upload is available in the equipment edit page.
            </p>
            <Link
              href={`/admin/equipment/${selectedEquipmentId}`}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Equipment to Upload Images
            </Link>
          </div>
        )}

        {/* Display uploaded images preview */}
        {selectedEquipmentId && uploadedImages[selectedEquipmentId]?.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Recently Uploaded Images:
            </p>
            <div className="flex flex-wrap gap-2">
              {uploadedImages[selectedEquipmentId].map((url, idx) => (
                <div
                  key={idx}
                  className="h-20 w-20 overflow-hidden rounded-lg border-2 border-green-200"
                >
                  <img
                    src={url}
                    alt={`Uploaded ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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
