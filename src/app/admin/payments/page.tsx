'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import SearchFilterBar from '@/components/admin/SearchFilterBar';
import Pagination from '@/components/admin/Pagination';
import { ITEMS_PER_PAGE, PAYMENT_STATUS_OPTIONS, STATUS_COLORS } from '@/lib/utils/admin-constants';

export default function PaymentsPage() {
    const [payments, setPayments] = useState<any[]>([]);
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
            let query = supabase
                .from('payments')
                .select(`
          *,
          booking:bookings(
            *,
            equipment:equipment(name),
            renter:user_profiles!renter_id(name, email)
          )
        `, { count: 'exact' });

            if (statusFilter) {
                query = query.eq('status', statusFilter);
            }

            const offset = (currentPage - 1) * ITEMS_PER_PAGE;
            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range(offset, offset + ITEMS_PER_PAGE - 1);

            if (error) throw error;

            setPayments(data || []);
            setTotalCount(count || 0);

            // Calculate total revenue (completed payments only)
            const { data: completedPayments } = await supabase
                .from('payments')
                .select('amount')
                .eq('status', 'completed');

            const revenue = completedPayments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;
            setTotalRevenue(revenue);
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
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
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Payments Management</h1>
            </div>

            {/* Revenue Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="admin-stats-card">
                    <p className="text-text-secondary text-sm font-medium mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-primary">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="admin-stats-card" style={{ borderLeftColor: '#10b981' }}>
                    <p className="text-text-secondary text-sm font-medium mb-1">Total Payments</p>
                    <p className="text-3xl font-bold text-text">{totalCount}</p>
                </div>
                <div className="admin-stats-card" style={{ borderLeftColor: '#f59e0b' }}>
                    <p className="text-text-secondary text-sm font-medium mb-1">Average Payment</p>
                    <p className="text-3xl font-bold text-text">
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
                    <p className="text-center py-8 text-text-secondary">No payments found</p>
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
                                                    <p className="text-sm text-text-secondary">
                                                        {payment.booking?.renter?.email}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="font-semibold text-lg">
                                                {formatCurrency(payment.amount)}
                                                {payment.currency && payment.currency !== 'INR' && (
                                                    <span className="text-sm text-text-secondary ml-1">{payment.currency}</span>
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
                                                <span className={`admin-badge ${STATUS_COLORS[payment.status] || 'bg-gray-100 text-gray-800'}`}>
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
