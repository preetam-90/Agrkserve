'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import SearchFilterBar from '@/components/admin/SearchFilterBar';
import Link from 'next/link';
import { Eye, Truck, User } from 'lucide-react';
import { ITEMS_PER_PAGE, BOOKING_STATUS_OPTIONS, STATUS_COLORS } from '@/lib/utils/admin-constants';
import DataTable from '@/components/admin/DataTable';

export default function BookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const supabase = createClient();

    const fetchBookings = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('bookings')
                .select(`
          *,
          equipment:equipment(name, images, category),
          renter:user_profiles!renter_id(name, email, phone)
        `, { count: 'exact' });

            if (statusFilter) {
                query = query.eq('status', statusFilter);
            }

            const offset = (currentPage - 1) * ITEMS_PER_PAGE;
            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range(offset, offset + ITEMS_PER_PAGE - 1);

            if (error) throw error;

            setBookings(data || []);
            setTotalCount(count || 0);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [search, statusFilter, currentPage]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const columns = [
        {
            key: 'id',
            label: 'Booking ID',
            render: (item: any) => (
                <span className="font-mono text-xs text-slate-500">{item.id.slice(0, 8)}...</span>
            )
        },
        {
            key: 'equipment',
            label: 'Equipment',
            render: (item: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                        {item.equipment?.images?.[0] ? (
                            <img src={item.equipment.images[0]} alt={item.equipment.name} className="w-full h-full object-cover" />
                        ) : (
                            <Truck className="w-5 h-5 text-slate-400" />
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-slate-900 dark:text-white line-clamp-1">{item.equipment?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500 capitalize">{item.equipment?.category}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'renter',
            label: 'Renter',
            render: (item: any) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <User className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{item.renter?.name || 'Unknown'}</span>
                        <span className="text-xs text-slate-500">{item.renter?.phone}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'dates',
            label: 'Schedule',
            render: (item: any) => (
                <div className="flex flex-col text-xs">
                    <span className="text-slate-700 dark:text-slate-300">From: {new Date(item.start_date).toLocaleDateString()}</span>
                    <span className="text-slate-500">To: {new Date(item.end_date).toLocaleDateString()}</span>
                </div>
            )
        },
        {
            key: 'amount',
            label: 'Amount',
            sortable: true,
            render: (item: any) => (
                <div className="flex flex-col">
                    <span className="font-mono font-medium text-slate-900 dark:text-white">
                        {formatCurrency(item.total_amount)}
                    </span>
                    <span className="text-xs text-slate-500">{item.total_days} days</span>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (item: any) => (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${item.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' :
                        item.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30' :
                            item.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30' :
                                'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}>
                    {item.status?.replace('_', ' ')}
                </span>
            )
        }
    ];

    const actions = [
        {
            label: 'View Booking',
            icon: Eye,
            onClick: (item: any) => window.location.href = `/admin/bookings/${item.id}`
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bookings</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor and manage equipment rentals.</p>
                </div>
            </div>

            <SearchFilterBar
                searchValue={search}
                onSearchChange={setSearch}
                placeholder="Search bookings..."
                filters={[
                    {
                        label: 'Status',
                        value: statusFilter,
                        options: BOOKING_STATUS_OPTIONS as any,
                        onChange: setStatusFilter,
                    },
                ]}
            />

            <DataTable
                columns={columns}
                data={bookings}
                actions={actions}
                isLoading={loading}
                onSearch={setSearch}
                searchPlaceholder="Search bookings..."
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
