'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import SearchFilterBar from '@/components/admin/SearchFilterBar';
import Pagination from '@/components/admin/Pagination';
import { ITEMS_PER_PAGE, PAYMENT_STATUS_OPTIONS, STATUS_COLORS } from '@/lib/utils/admin-constants';
import type { Payment } from '@/lib/types/database';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const supabase = createClient();

  const fetchPayments = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching payments...');

      let query = supabase.from('payments').select(
        `
          *,
          booking:bookings(
            *,
            equipment:equipment(name),
            renter:user_profiles!renter_id(name, email)
          )
        `,
        { count: 'exact' }
      );

      // Search only works on payments table fields
      if (search) {
        query = query.or(`transaction_id.ilike.%${search}%,id.ilike.%${search}%`);
      }

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      if (error) {
        console.error('❌ Error fetching payments:', error);
        throw error;
      }

      console.log('✅ Payments fetched:', data?.length || 0, 'records');
      console.log('📊 Total count:', count);

      if (data && data.length > 0) {
        console.log('📝 Sample payment:', data[0]);
      }

      setPayments(data || []);
      setTotalCount(count || 0);

      // Calculate total revenue (completed payments only)
      const { data: completedPayments, error: revenueError } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');

      if (revenueError) {
        console.error('❌ Error fetching revenue:', revenueError);
      } else {
        console.log('💰 Completed payments:', completedPayments?.length || 0);
      }

      const revenue = completedPayments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;
      setTotalRevenue(revenue);

      console.log('💵 Total revenue:', revenue);
    } catch (error) {
      console.error('❌ Error in fetchPayments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, currentPage]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payments Management</h1>
      </div>

      {/* Revenue Summary */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="admin-stats-card">
          <p className="text-text-secondary mb-1 text-sm font-medium">Total Revenue</p>
          <p className="text-primary text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="admin-stats-card" style={{ borderLeftColor: '#10b981' }}>
          <p className="text-text-secondary mb-1 text-sm font-medium">Total Payments</p>
          <p className="text-text text-3xl font-bold">{totalCount}</p>
        </div>
        <div className="admin-stats-card" style={{ borderLeftColor: '#f59e0b' }}>
          <p className="text-text-secondary mb-1 text-sm font-medium">Average Payment</p>
          <p className="text-text text-3xl font-bold">
            {totalCount > 0 ? formatCurrency(totalRevenue / totalCount) : formatCurrency(0)}
          </p>
        </div>
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search payments..."
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            options: PAYMENT_STATUS_OPTIONS,
            onChange: setStatusFilter,
          },
        ]}
      />

      <div className="admin-card">
        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner" />
          </div>
        ) : payments.length === 0 ? (
          <p className="text-text-secondary py-8 text-center">No payments found</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Payment ID</th>
                    <th>Equipment</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Transaction ID</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>
                        <span className="font-mono text-sm">{payment.id.slice(0, 8)}...</span>
                      </td>
                      <td>
                        <p className="font-medium">{payment.booking?.equipment?.name || 'N/A'}</p>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium">{payment.booking?.renter?.name || 'N/A'}</p>
                          <p className="text-text-secondary text-sm">
                            {payment.booking?.renter?.email}
                          </p>
                        </div>
                      </td>
                      <td className="text-lg font-semibold">
                        {formatCurrency(payment.amount)}
                        {payment.currency && payment.currency !== 'INR' && (
                          <span className="text-text-secondary ml-1 text-sm">
                            {payment.currency}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="capitalize">{payment.payment_method || 'N/A'}</span>
                      </td>
                      <td>
                        {payment.transaction_id ? (
                          <span className="font-mono text-sm">{payment.transaction_id}</span>
                        ) : (
                          <span className="text-text-secondary">-</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`admin-badge ${STATUS_COLORS[payment.status] || 'bg-gray-100 text-gray-800'}`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalCount / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={totalCount}
            />
          </>
        )}
      </div>
    </div>
  );
}
