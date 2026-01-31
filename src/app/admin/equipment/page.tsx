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
            let query = supabase
                .from('equipment')
                .select(`
          *,
          owner:user_profiles!owner_id(name, email, phone)
        `, { count: 'exact' });

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
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                        {item.images?.[0] ? (
                            <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <Tractor className="w-6 h-6 text-slate-400" />
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-slate-900 dark:text-white line-clamp-1">{item.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{item.category}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'owner',
            label: 'Owner',
            render: (item: any) => (
                <div className="flex flex-col">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{item.owner?.name || 'Unknown'}</span>
                    <span className="text-xs text-slate-500">{item.owner?.phone}</span>
                </div>
            )
        },
        {
            key: 'price',
            label: 'Price / Day',
            sortable: true,
            render: (item: any) => (
                <span className="font-mono font-medium text-slate-900 dark:text-white">
                    {formatCurrency(item.price_per_day)}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (item: any) => item.is_available ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30 text-xs font-medium">Available</span>
            ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30 text-xs font-medium">Rented</span>
            )
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
            )
        }
    ];

    const deleteEquipment = async (id: string) => {
        if (!confirm('Are you sure you want to delete this equipment? This action cannot be undone.')) return;

        try {
            const { error } = await supabase
                .from('equipment')
                .delete()
                .eq('id', id);

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
            onClick: (item: any) => window.location.href = `/admin/equipment/${item.id}`
        },
        {
            label: 'Edit',
            icon: Edit,
            onClick: (item: any) => window.location.href = `/admin/equipment/${item.id}/edit`
        },
        {
            label: 'Delete',
            icon: Trash2,
            danger: true,
            onClick: (item: any) => deleteEquipment(item.id)
        }
    ];

    // Handle equipment image upload completion
    const handleEquipmentImageUpload = async (equipmentId: string, files: Array<{ url: string; name: string; size: number }>) => {
        if (files.length === 0) return;
        
        const imageUrls = files.map(f => f.url);
        
        // Get current images from the equipment item
        const equipmentItem = equipment.find(e => e.id === equipmentId);
        const currentImages = equipmentItem?.images || [];
        const updatedImages = [...currentImages, ...imageUrls];
        
        setIsUploading(true);
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
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Equipment</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage tractors, drones, and other machinery.</p>
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-green-500/20">
                    <Plus className="w-4 h-4" />
                    Add Equipment
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Assets</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalCount}</h3>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400">
                        <Tractor className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Equipment Image Upload Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Upload Equipment Images</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Select equipment and upload multiple images (max 10)</p>
                
                {equipment.length > 0 && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Select Equipment
                        </label>
                        <select
                            value={selectedEquipmentId || ''}
                            onChange={(e) => setSelectedEquipmentId(e.target.value || null)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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
                    <div className="mt-4 max-w-2xl p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            Image upload is available in the equipment edit page.
                        </p>
                        <Link
                            href={`/admin/equipment/${selectedEquipmentId}`}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Equipment to Upload Images
                        </Link>
                    </div>
                )}
                
                {/* Display uploaded images preview */}
                {selectedEquipmentId && uploadedImages[selectedEquipmentId]?.length > 0 && (
                    <div className="mt-6">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Recently Uploaded Images:</p>
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
                    totalItems: totalCount
                }}
            />
        </div>
    );
}
