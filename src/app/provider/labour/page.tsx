'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Users,
  Eye,
  Edit,
  MoreVertical,
  Star,
  MapPin,
  Briefcase,
  ToggleLeft,
  ToggleRight,
  IndianRupee,
  Calendar,
  TrendingUp,
  Award,
  Clock,
} from 'lucide-react';
import { Header } from '@/components/layout';
import {
  Button,
  Badge,
  Spinner,
  EmptyState,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { labourService } from '@/lib/services';
import { LabourAvailability, LabourBooking } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAppStore, useAuthStore } from '@/lib/store';
import { useLabourProfile, useLabourBookings } from '@/lib/hooks/use-labour-queries';
import { useQueryClient } from '@tanstack/react-query';
import { labourKeys } from '@/lib/hooks/query-keys';
import toast from 'react-hot-toast';

export default function ProviderLabourPage() {
  const { sidebarOpen } = useAppStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const userId = user?.id;
  const { data: labourProfile, isLoading: profileLoading } = useLabourProfile(userId);
  const { data: bookingsResult, isLoading: bookingsLoading } = useLabourBookings(userId, 'labour');
  const bookings = bookingsResult?.data ?? [];
  const isLoading = profileLoading || bookingsLoading;

  const handleToggleAvailability = async () => {
    if (!labourProfile || !userId) return;

    try {
      const newAvailability: LabourAvailability =
        labourProfile.availability === 'available' ? 'unavailable' : 'available';

      await labourService.updateAvailability(labourProfile.id, newAvailability);
      queryClient.invalidateQueries({ queryKey: labourKeys.profile(userId) });
      toast.success(`Status updated to ${newAvailability}`);
    } catch (err) {
      console.error('Failed to update availability:', err);
      toast.error('Failed to update availability');
    }
  };

  const handleAcceptBooking = async (booking: LabourBooking) => {
    if (!booking || !user) return;

    setIsProcessing(true);
    try {
      await labourService.updateBookingStatus(booking.id, 'confirmed', user.id);
      toast.success('Booking accepted!');
      queryClient.invalidateQueries({ queryKey: labourKeys.bookings(user.id, 'labour') });
    } catch (err) {
      console.error('Failed to accept booking:', err);
      toast.error('Failed to accept booking');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectBooking = async (booking: LabourBooking) => {
    if (!booking || !user) return;

    setIsProcessing(true);
    try {
      await labourService.cancelBooking(booking.id, 'Rejected by labour', user.id);
      toast.success('Booking rejected');
      queryClient.invalidateQueries({ queryKey: labourKeys.bookings(user.id, 'labour') });
    } catch (err) {
      console.error('Failed to reject booking:', err);
      toast.error('Failed to reject booking');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', label: 'Pending' },
      confirmed: {
        color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        label: 'Confirmed',
      },
      in_progress: {
        color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        label: 'In Progress',
      },
      completed: {
        color: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
        label: 'Completed',
      },
      cancelled: { color: 'bg-red-500/20 text-red-300 border-red-500/30', label: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant="outline" className={cn('border', config.color)}>
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0E27]">
        <Header />
        <div className="flex">
          <main className="flex-1 p-4 transition-all duration-300 lg:p-6">
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!labourProfile) {
    return (
      <div className="min-h-screen bg-[#0A0E27]">
        <Header />
        <div className="flex">
          <main className="flex-1 p-4 transition-all duration-300 lg:p-6">
            <div className="mx-auto max-w-4xl pt-20">
              <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/50 to-slate-800/30 p-12 backdrop-blur-sm">
                <EmptyState
                  icon={<Users className="h-12 w-12 text-slate-400" />}
                  title="No Labour Profile"
                  description="Create your labour profile to start receiving booking requests"
                  action={
                    <Button
                      asChild
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white transition-all duration-200 hover:from-teal-600 hover:to-cyan-600"
                    >
                      <Link href="/provider/labour/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Profile
                      </Link>
                    </Button>
                  }
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E27]">
      <Header />

      <div className="flex">
        <main className="flex-1 px-4 pb-4 pt-28 transition-all duration-300 lg:px-6 lg:pb-6">
          <div className="mx-auto max-w-7xl">
            {/* Header Section */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-white">My Labour Profile</h1>
                <p className="text-slate-400">Manage your profile and bookings</p>
              </div>
              <Button
                asChild
                variant="outline"
                className="border-slate-700 bg-slate-800/50 text-white transition-colors duration-200 hover:bg-slate-700/50"
              >
                <Link href={`/provider/labour/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
            </div>

            {/* Profile Hero Card */}
            <div className="mb-6 overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm">
              <div className="p-6 md:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  {/* Left Section - Profile Info */}
                  <div className="flex-1">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <h2 className="text-3xl font-bold text-white">
                        {labourProfile.user?.name || 'Your Profile'}
                      </h2>
                      {labourProfile.user?.is_verified && (
                        <Badge className="border-emerald-500/30 bg-emerald-500/20 text-emerald-300">
                          <Award className="mr-1 h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    {labourProfile.location_name && (
                      <div className="mb-3 flex items-center text-slate-300">
                        <MapPin className="mr-2 h-4 w-4 text-teal-400" />
                        {labourProfile.location_name}
                      </div>
                    )}

                    <div className="mb-4 flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                        <span className="text-xl font-semibold text-white">
                          {labourProfile.rating?.toFixed(1) || '0.0'}
                        </span>
                        <span className="text-sm text-slate-400">
                          ({labourProfile.review_count || 0} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Briefcase className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm">
                          {labourProfile.experience_years} years experience
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      {labourProfile.skills.map((skill, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="border-slate-600/50 bg-slate-700/50 text-slate-200 transition-colors duration-200 hover:bg-slate-600/50"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {labourProfile.bio && (
                      <p className="text-sm leading-relaxed text-slate-300">{labourProfile.bio}</p>
                    )}
                  </div>

                  {/* Right Section - Pricing & Availability */}
                  <div className="lg:text-right">
                    <div className="mb-2 inline-flex items-center rounded-xl bg-gradient-to-r from-teal-500/20 to-cyan-500/20 px-4 py-3 text-3xl font-bold text-teal-300">
                      <IndianRupee className="h-7 w-7" />
                      {labourProfile.daily_rate}
                    </div>
                    <div className="mb-4 text-sm text-slate-400">per day</div>

                    <Button
                      onClick={handleToggleAvailability}
                      className={cn(
                        'w-full transition-all duration-200 lg:w-auto',
                        labourProfile.availability === 'available'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
                          : 'border border-slate-600 bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                      )}
                    >
                      {labourProfile.availability === 'available' ? (
                        <>
                          <ToggleRight className="mr-2 h-4 w-4" />
                          Available
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="mr-2 h-4 w-4" />
                          Unavailable
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-700/50 pt-6 md:grid-cols-4">
                  <div className="cursor-pointer rounded-xl bg-slate-800/50 p-4 text-center transition-all duration-200 hover:bg-slate-700/50">
                    <div className="mb-1 text-3xl font-bold text-teal-400">
                      {labourProfile.total_jobs || 0}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
                      <TrendingUp className="h-3 w-3" />
                      Total Jobs
                    </div>
                  </div>
                  <div className="cursor-pointer rounded-xl bg-slate-800/50 p-4 text-center transition-all duration-200 hover:bg-slate-700/50">
                    <div className="mb-1 text-3xl font-bold text-amber-400">
                      {bookings.filter((b) => b.status === 'pending').length}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      Pending
                    </div>
                  </div>
                  <div className="cursor-pointer rounded-xl bg-slate-800/50 p-4 text-center transition-all duration-200 hover:bg-slate-700/50">
                    <div className="mb-1 text-3xl font-bold text-emerald-400">
                      {bookings.filter((b) => b.status === 'confirmed').length}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
                      <Calendar className="h-3 w-3" />
                      Confirmed
                    </div>
                  </div>
                  <div className="cursor-pointer rounded-xl bg-slate-800/50 p-4 text-center transition-all duration-200 hover:bg-slate-700/50">
                    <div className="mb-1 text-3xl font-bold text-cyan-400">
                      {labourProfile.service_radius_km} km
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
                      <MapPin className="h-3 w-3" />
                      Service Radius
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bookings Section */}
            <div className="mb-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Recent Bookings</h2>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-slate-700 bg-slate-800/50 text-slate-300 transition-colors duration-200 hover:bg-slate-700/50"
                >
                  <Link href="/provider/bookings">View All</Link>
                </Button>
              </div>

              {bookings.length === 0 ? (
                <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/50 to-slate-800/30 p-12 backdrop-blur-sm">
                  <EmptyState
                    icon={<Users className="h-12 w-12 text-slate-400" />}
                    title="No bookings yet"
                    description="Your booking requests will appear here"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="group cursor-pointer overflow-hidden rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm transition-all duration-200 hover:border-slate-600/50 hover:shadow-lg hover:shadow-teal-500/10"
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                              <h3 className="text-lg font-semibold text-white">
                                {booking.employer?.name || 'Employer'}
                              </h3>
                              {getStatusBadge(booking.status)}
                            </div>
                            <div className="space-y-2 text-sm text-slate-300">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-teal-400" />
                                <span className="font-medium text-slate-400">Duration:</span>
                                <span>
                                  {new Date(booking.start_date).toLocaleDateString()} -{' '}
                                  {new Date(booking.end_date).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-cyan-400" />
                                <span className="font-medium text-slate-400">Total Days:</span>
                                <span>{booking.total_days}</span>
                              </div>
                              {booking.notes && (
                                <div className="mt-2 rounded-lg bg-slate-800/50 p-3">
                                  <span className="font-medium text-slate-400">Notes:</span>{' '}
                                  <span className="text-slate-300">{booking.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="mb-2 text-2xl font-bold text-teal-400">
                              ₹{booking.total_amount?.toLocaleString()}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-slate-400 hover:bg-slate-700/50 hover:text-white"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="border-slate-700 bg-slate-800 text-slate-200"
                              >
                                <DropdownMenuItem asChild>
                                  <Link href={`/provider/bookings/${booking.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                {booking.status === 'pending' && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        if (
                                          confirm('Are you sure you want to accept this booking?')
                                        ) {
                                          handleAcceptBooking(booking);
                                        }
                                      }}
                                      disabled={isProcessing}
                                      className="text-emerald-400 hover:text-emerald-300"
                                    >
                                      Accept
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        if (
                                          confirm('Are you sure you want to decline this booking?')
                                        ) {
                                          handleRejectBooking(booking);
                                        }
                                      }}
                                      className="text-red-400 hover:text-red-300"
                                      disabled={isProcessing}
                                    >
                                      Decline
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
