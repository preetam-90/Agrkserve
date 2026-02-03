'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import SearchFilterBar from '@/components/admin/SearchFilterBar';
import Link from 'next/link';
import { Eye, CheckCircle, Briefcase, BadgeCheck, XCircle } from 'lucide-react';
import {
  ITEMS_PER_PAGE,
  LABOUR_AVAILABILITY_OPTIONS,
  STATUS_COLORS,
} from '@/lib/utils/admin-constants';
import DataTable from '@/components/admin/DataTable';

export default function LabourPage() {
  const [labourProfiles, setLabourProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const supabase = createClient();

  const fetchLabourProfiles = async () => {
    setLoading(true);
    try {
      let query = supabase.from('labour_profiles').select(
        `
          *,
          user:user_profiles!user_id(name, email, phone, profile_image)
        `,
        { count: 'exact' }
      );

      // Only apply availability filter in query
      // Search will be done client-side after fetching
      if (availabilityFilter) {
        query = query.eq('availability', availabilityFilter);
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
        filteredData = filteredData.filter((profile) => {
          const userName = profile.user?.name?.toLowerCase() || '';
          const userEmail = profile.user?.email?.toLowerCase() || '';
          const userPhone = profile.user?.phone?.toLowerCase() || '';
          const skills = profile.skills?.join(' ').toLowerCase() || '';
          const experienceYears = profile.experience_years?.toString() || '';

          return (
            userName.includes(searchLower) ||
            userEmail.includes(searchLower) ||
            userPhone.includes(searchLower) ||
            skills.includes(searchLower) ||
            experienceYears.includes(searchLower)
          );
        });
      }

      setLabourProfiles(filteredData);
      setTotalCount(search ? filteredData.length : count || 0);
    } catch (error) {
      console.error('Error fetching labour profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabourProfiles();
  }, [search, availabilityFilter, currentPage]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const columns = [
    {
      key: 'labour',
      label: 'Labour',
      render: (profile: any) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
            {profile.user?.profile_image ? (
              <img
                src={profile.user.profile_image}
                alt={profile.user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400">
                <span className="font-semibold">
                  {profile.user?.name?.charAt(0)?.toUpperCase() || 'L'}
                </span>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-slate-900 dark:text-white">
                {profile.user?.name || 'Unknown'}
              </p>
              {profile.is_verified && <BadgeCheck className="h-4 w-4 text-blue-500" />}
            </div>
            <p className="text-xs text-slate-500">{profile.user?.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'skills',
      label: 'Skills',
      render: (profile: any) => (
        <div className="flex max-w-[200px] flex-wrap gap-1">
          {profile.skills?.slice(0, 3).map((skill: string, idx: number) => (
            <span
              key={idx}
              className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {skill}
            </span>
          ))}
          {profile.skills?.length > 3 && (
            <span className="text-[10px] text-slate-400">+{profile.skills.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: 'rate',
      label: 'Daily Rate',
      sortable: true,
      render: (profile: any) => (
        <span className="font-mono font-medium text-slate-900 dark:text-white">
          {formatCurrency(profile.daily_rate)}
        </span>
      ),
    },
    {
      key: 'availability',
      label: 'Availability',
      render: (profile: any) => (
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
            profile.availability === 'available'
              ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-400'
              : profile.availability === 'busy'
                ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-400'
                : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          {profile.availability}
        </span>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (profile: any) => (
        <div className="flex items-center gap-1">
          <span className="text-amber-400">★</span>
          <span className="text-sm font-medium">{profile.average_rating || 0}</span>
          <span className="text-xs text-slate-400">({profile.review_count || 0} jobs)</span>
        </div>
      ),
    },
  ];

  const toggleVerification = async (profile: any) => {
    const newStatus = !profile.is_verified;

    try {
      const { error } = await supabase
        .from('labour_profiles')
        .update({ is_verified: newStatus })
        .eq('id', profile.id);

      if (error) throw error;

      // Refresh list
      fetchLabourProfiles();
      console.log(`Labour ${profile.id} verification set to ${newStatus}`);
    } catch (err) {
      console.error('Error updating verification:', err);
      alert('Failed to update verification status');
    }
  };

  const actions = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (profile: any) => (window.location.href = `/admin/labour/${profile.id}`),
    },
    {
      label: (profile: any) => (profile.is_verified ? 'Revoke Verification' : 'Verify Worker'),
      icon: (profile: any) => (profile.is_verified ? XCircle : CheckCircle),
      danger: (profile: any) => profile.is_verified,
      onClick: (profile: any) => toggleVerification(profile),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Labour Management</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Manage network of agricultural workers.
          </p>
        </div>
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search labour profiles..."
        filters={[
          {
            label: 'Availability',
            value: availabilityFilter,
            options: LABOUR_AVAILABILITY_OPTIONS as any,
            onChange: setAvailabilityFilter,
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="glass-card flex items-center justify-between rounded-2xl p-6">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Workers</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalCount}</h3>
          </div>
          <div className="rounded-xl bg-cyan-50 p-3 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400">
            <Briefcase className="h-6 w-6" />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={labourProfiles}
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
