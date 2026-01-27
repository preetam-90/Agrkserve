'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import SearchFilterBar from '@/components/admin/SearchFilterBar';
import Link from 'next/link';
import { Eye, Ban, CheckCircle, Loader2, Users } from 'lucide-react';
import { ITEMS_PER_PAGE } from '@/lib/utils/admin-constants';
import DataTable from '@/components/admin/DataTable';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const supabase = createClient();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('user_profiles')
                .select('*, user_roles!inner(role, is_active)', { count: 'exact' });

            if (search) {
                query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
            }

            const offset = (currentPage - 1) * ITEMS_PER_PAGE;
            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range(offset, offset + ITEMS_PER_PAGE - 1);

            if (error) throw error;

            setUsers(data || []);
            setTotalCount(count || 0);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [search, roleFilter, currentPage]);

    const isUserActive = (userRoles: any[]) => {
        return userRoles?.some((r) => r.is_active);
    };

    const columns = [
        {
            key: 'user',
            label: 'User',
            sortable: true,
            render: (user: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0">
                        {user.profile_image ? (
                            <img src={user.profile_image} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-semibold text-slate-500 dark:text-slate-400">
                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-slate-900 dark:text-white">{user.name || 'No name'}</p>
                        {user.city && <p className="text-xs text-slate-500">{user.city}</p>}
                    </div>
                </div>
            )
        },
        { key: 'email', label: 'Email', sortable: true },
        {
            key: 'roles',
            label: 'Roles',
            render: (user: any) => (
                <div className="flex gap-1 flex-wrap">
                    {user.user_roles?.filter((r: any) => r.is_active).map((r: any, idx: number) => (
                        <span key={idx} className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30 text-xs font-medium capitalize">
                            {r.role}
                        </span>
                    ))}
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (user: any) => (
                isUserActive(user.user_roles) ? (
                    <span className="px-2 py-1 rounded-md bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30 text-xs font-medium">Active</span>
                ) : (
                    <span className="px-2 py-1 rounded-md bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30 text-xs font-medium">Inactive</span>
                )
            )
        },
        { key: 'created_at', label: 'Joined', sortable: true, render: (user: any) => new Date(user.created_at).toLocaleDateString() }
    ];

    const toggleUserStatus = async (user: any) => {
        const isActive = isUserActive(user.user_roles);
        const newStatus = !isActive;

        try {
            // Update all roles for the user
            const { error } = await supabase
                .from('user_roles')
                .update({ is_active: newStatus })
                .eq('user_id', user.id);

            if (error) throw error;

            // Refresh list
            fetchUsers();

            // Log action (optional)
            console.log(`User ${user.id} status updated to ${newStatus}`);
        } catch (err) {
            console.error('Error updating user status:', err);
            alert('Failed to update user status');
        }
    };

    const actions = [
        {
            label: 'View Profile',
            icon: Eye,
            onClick: (user: any) => window.location.href = `/admin/users/${user.id}`
        },
        {
            label: (user: any) => isUserActive(user.user_roles) ? 'Suspend User' : 'Activate User',
            icon: (user: any) => isUserActive(user.user_roles) ? Ban : CheckCircle,
            danger: (user: any) => isUserActive(user.user_roles),
            onClick: (user: any) => toggleUserStatus(user)
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage platform access and user roles.</p>
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-green-500/20">
                    <CheckCircle className="w-4 h-4" />
                    Verify New Users
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Users</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalCount}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                        <Users className="w-6 h-6" />
                    </div>
                </div>
                {/* Add more stats if needed */}
            </div>

            <DataTable
                columns={columns}
                data={users}
                actions={actions}
                isLoading={loading}
                onSearch={setSearch}
                searchPlaceholder="Search by name, email, or phone..."
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
