'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Ban, CheckCircle, Save } from 'lucide-react';
import Link from 'next/link';

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  interface UserProfile {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    address: string | null;
    bio: string | null;
    is_verified: boolean;
    created_at: string;
  }

  interface UserRole {
    id: string;
    role: string;
    is_active: boolean;
  }

  const [user, setUser] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [equipmentCount, setEquipmentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedRoles, setEditedRoles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();
   
  const _router = useRouter();

  const allRoleOptions = ['renter', 'provider', 'labour', 'admin'];

  useEffect(() => {
    fetchUserDetails();
     
  }, [resolvedParams.id]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (profileError) throw profileError;
      setUser(profile);

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', resolvedParams.id);

      if (rolesError) throw rolesError;
      setRoles(userRoles || []);
      setEditedRoles(userRoles?.filter((r) => r.is_active).map((r) => r.role) || []);

      // Get bookings count
      const { count: bookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('renter_id', resolvedParams.id);
      setBookingsCount(bookings || 0);

      // Get equipment count
      const { count: equipment } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', resolvedParams.id);
      setEquipmentCount(equipment || 0);
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoles = async () => {
    setSaving(true);
    try {
      // First, deactivate all current roles
      await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', resolvedParams.id);

      // Then insert/update the selected roles
      for (const role of editedRoles) {
        await supabase.from('user_roles').upsert({
          user_id: resolvedParams.id,
          role,
          is_active: true,
        });
      }

      // Send notification
      await supabase.from('notifications').insert({
        user_id: resolvedParams.id,
        title: 'Roles Updated',
        message: `Your account roles have been updated by an administrator.`,
        type: 'admin',
      });

      alert('Roles updated successfully');
      fetchUserDetails();
      setEditing(false);
    } catch (error) {
      console.error('Error updating roles:', error);
      alert('Failed to update roles');
    } finally {
      setSaving(false);
    }
  };

  const handleSuspendUser = async () => {
    if (!confirm('Are you sure you want to suspend this user?')) return;

    try {
      await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', resolvedParams.id);

      await supabase.from('notifications').insert({
        user_id: resolvedParams.id,
        title: 'Account Suspended',
        message: 'Your account has been suspended by an administrator.',
        type: 'admin',
      });

      alert('User suspended successfully');
      fetchUserDetails();
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Failed to suspend user');
    }
  };

  const handleActivateUser = async () => {
    if (!confirm('Are you sure you want to activate this user?')) return;

    try {
      // Reactivate their roles
      await supabase
        .from('user_roles')
        .update({ is_active: true })
        .eq('user_id', resolvedParams.id)
        .in('role', editedRoles.length > 0 ? editedRoles : ['renter']); // Default to renter if no roles

      await supabase.from('notifications').insert({
        user_id: resolvedParams.id,
        title: 'Account Activated',
        message: 'Your account has been activated by an administrator.',
        type: 'admin',
      });

      alert('User activated successfully');
      fetchUserDetails();
    } catch (error) {
      console.error('Error activating user:', error);
      alert('Failed to activate user');
    }
  };

  const toggleRole = (role: string) => {
    setEditedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const isActive = roles.some((r) => r.is_active);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
      </div>
    );
  }

  if (!user) {
    return <div className="py-8 text-center">User not found</div>;
  }

  return (
    <div>
      <Link
        href="/admin/users"
        className="text-primary mb-6 inline-flex items-center gap-2 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{user.name || 'User Details'}</h1>
          <p className="text-text-secondary mt-1">User ID: {user.id}</p>
        </div>
        <div className="flex gap-2">
          {isActive ? (
            <button onClick={handleSuspendUser} className="admin-btn admin-btn-danger">
              <Ban className="h-4 w-4" />
              Suspend User
            </button>
          ) : (
            <button onClick={handleActivateUser} className="admin-btn admin-btn-primary">
              <CheckCircle className="h-4 w-4" />
              Activate User
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* User Profile */}
        <div className="space-y-6 lg:col-span-2">
          <div className="admin-card">
            <h2 className="mb-4 text-xl font-bold">Profile Information</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="admin-label">Name</label>
                <p className="text-lg font-medium">{user.name || 'N/A'}</p>
              </div>
              <div>
                <label className="admin-label">Email</label>
                <p className="text-lg font-medium">{user.email || 'N/A'}</p>
              </div>
              <div>
                <label className="admin-label">Phone</label>
                <p className="text-lg font-medium">{user.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="admin-label">City</label>
                <p className="text-lg font-medium">{user.city || 'N/A'}</p>
              </div>
              <div>
                <label className="admin-label">State</label>
                <p className="text-lg font-medium">{user.state || 'N/A'}</p>
              </div>
              <div>
                <label className="admin-label">Pincode</label>
                <p className="text-lg font-medium">{user.pincode || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="admin-label">Address</label>
                <p className="text-lg font-medium">{user.address || 'N/A'}</p>
              </div>
              {user.bio && (
                <div className="md:col-span-2">
                  <label className="admin-label">Bio</label>
                  <p className="text-lg font-medium">{user.bio}</p>
                </div>
              )}
            </div>
          </div>

          {/* User Roles */}
          <div className="admin-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">User Roles</h2>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="admin-btn admin-btn-secondary">
                  <Edit className="h-4 w-4" />
                  Edit Roles
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(false)}
                    className="admin-btn admin-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveRoles}
                    disabled={saving}
                    className="admin-btn admin-btn-primary"
                  >
                    {saving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Roles
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {editing ? (
              <div className="space-y-3">
                {allRoleOptions.map((role) => (
                  <label key={role} className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={editedRoles.includes(role)}
                      onChange={() => toggleRole(role)}
                      className="text-primary h-5 w-5"
                    />
                    <span className="font-medium capitalize">{role}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {roles
                  .filter((r) => r.is_active)
                  .map((role) => (
                    <span
                      key={role.id}
                      className="admin-badge bg-blue-100 capitalize text-blue-800"
                    >
                      {role.role}
                    </span>
                  ))}
                {roles.filter((r) => r.is_active).length === 0 && (
                  <p className="text-text-secondary">No active roles</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <div className="admin-card">
            <h3 className="mb-4 font-bold">Account Status</h3>
            <div className="space-y-3">
              <div>
                <label className="admin-label">Status</label>
                {isActive ? (
                  <span className="admin-badge bg-green-100 text-green-800">Active</span>
                ) : (
                  <span className="admin-badge bg-red-100 text-red-800">Suspended</span>
                )}
              </div>
              <div>
                <label className="admin-label">Verified</label>
                {user.is_verified ? (
                  <span className="admin-badge bg-green-100 text-green-800">Yes</span>
                ) : (
                  <span className="admin-badge bg-gray-100 text-gray-800">No</span>
                )}
              </div>
              <div>
                <label className="admin-label">Joined</label>
                <p>{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h3 className="mb-4 font-bold">Activity Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Total Bookings</span>
                <span className="text-lg font-bold">{bookingsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Equipment Listed</span>
                <span className="text-lg font-bold">{equipmentCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
