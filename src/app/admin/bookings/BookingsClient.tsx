'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import SearchFilterBar from '@/components/admin/SearchFilterBar';
import { Eye, Truck, User } from 'lucide-react';
import NextImage from 'next/image';
// Rename to avoid potential conflicts
import { ITEMS_PER_PAGE, BOOKING_STATUS_OPTIONS } from '@/lib/utils/admin-constants';
import DataTable from '@/components/admin/DataTable';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      let query = supabase.from('bookings').select(
        `
          *,
          equipment:equipment(name, images, category),
          renter:user_profiles!renter_id(name, email, phone)
        `,
        { count: 'exact' }
      );

      // Only apply status filter in query
      // Search will be done client-side after fetching
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      if (error) throw error;

      // Client-side search filtering
      let filteredData = data || [];
      if (search && search.trim()) {
        const searchLower = search.toLowerCase();
        filteredData = filteredData.filter((booking) => {
          const equipmentName = booking.equipment?.name?.toLowerCase() || '';
          const renterName = booking.renter?.name?.toLowerCase() || '';
          const renterEmail = booking.renter?.email?.toLowerCase() || '';
          const bookingId = booking.id?.toLowerCase() || '';

          return (
            equipmentName.includes(searchLower) ||
            renterName.includes(searchLower) ||
            renterEmail.includes(searchLower) ||
            bookingId.includes(searchLower)
          );
        });
      }

      setBookings(filteredData);
      setTotalCount(search ? filteredData.length : count || 0);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, currentPage]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

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
      ),
    },
    {
      key: 'equipment',
      label: 'Equipment',

      render: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
            {item.equipment?.images?.[0] ? (
              <NextImage
                src={item.equipment.images[0]}
                alt={item.equipment.name}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <Truck className="h-5 w-5 text-slate-400" />
            )}
          </div>
          <div>
            <p className="line-clamp-1 font-medium text-slate-900 dark:text-white">
              {item.equipment?.name || 'Unknown'}
            </p>
            <p className="text-xs capitalize text-slate-500">{item.equipment?.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'renter',
      label: 'Renter',

      render: (item: any) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
            <User className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {item.renter?.name || 'Unknown'}
            </span>
            <span className="text-xs text-slate-500">{item.renter?.phone}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'dates',
      label: 'Schedule',

      render: (item: any) => (
        <div className="flex flex-col text-xs">
          <span className="text-slate-700 dark:text-slate-300">
            From: {new Date(item.start_date).toLocaleDateString()}
          </span>
          <span className="text-slate-500">To: {new Date(item.end_date).toLocaleDateString()}</span>
        </div>
      ),
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
      ),
    },
    {
      key: 'status',
      label: 'Status',

      render: (item: any) => (
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
            item.status === 'completed'
              ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-400'
              : item.status === 'pending'
                ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-400'
                : item.status === 'cancelled'
                  ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400'
                  : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          {item.status?.replace('_', ' ')}
        </span>
      ),
    },
  ];

  const actions = [
    {
      label: 'View Booking',
      icon: Eye,

      onClick: (item: any) => (window.location.href = `/admin/bookings/${item.id}`),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bookings</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Monitor and manage equipment rentals.
          </p>
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
