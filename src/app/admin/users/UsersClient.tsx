'use client';

/* eslint-disable */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import SearchFilterBar from '@/components/admin/SearchFilterBar';
import Link from 'next/link';
import { Eye, Ban, CheckCircle, Loader2, Users, UserPlus } from 'lucide-react';
import { ITEMS_PER_PAGE } from '@/lib/utils/admin-constants';
import DataTable from '@/components/admin/DataTable';
import CreateUserModal from '@/components/admin/CreateUserModal';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
            {user.profile_image ? (
              <img
                src={user.profile_image}
                alt={user.name}
                className="h-full w-full object-cover"
              />
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
      ),
    },
    { key: 'email', label: 'Email', sortable: true },
    {
      key: 'roles',
      label: 'Roles',

      render: (user: any) => (
        <div className="flex flex-wrap gap-1">
          // eslint-disable-next-line @typescript-eslint/no-explicit-any // eslint-disable-next-line
          @typescript-eslint/no-explicit-any
          {user.user_roles
            ?.filter((r: any) => r.is_active)
            .map((r: any, idx: number) => (
              <span
                key={idx}
                className="rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-medium capitalize text-blue-700 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-400"
              >
                {r.role}
              </span>
            ))}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',

      render: (user: any) =>
        isUserActive(user.user_roles) ? (
          <span className="rounded-md border border-green-100 bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-400">
            Active
          </span>
        ) : (
          <span className="rounded-md border border-red-100 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
            Inactive
          </span>
        ),
    },

    {
      key: 'created_at',
      label: 'Joined',
      sortable: true,
      render: (user: any) => new Date(user.created_at).toLocaleDateString(),
    },
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

      onClick: (user: any) => (window.location.href = `/admin/users/${user.id}`),
    },
    {
      label: (user: any) => (isUserActive(user.user_roles) ? 'Suspend User' : 'Activate User'),

      icon: (user: any) => (isUserActive(user.user_roles) ? Ban : CheckCircle),

      danger: (user: any) => isUserActive(user.user_roles),

      onClick: (user: any) => toggleUserStatus(user),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Management</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Manage platform access and user roles.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4" />
          Add New User
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="glass-card flex items-center justify-between rounded-2xl p-6">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Users</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalCount}</h3>
          </div>
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
            <Users className="h-6 w-6" />
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
          totalItems: totalCount,
        }}
      />

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchUsers();
        }}
      />
    </div>
  );
}
