'use client';

import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { Header } from '@/components/layout';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Spinner,
  EmptyState,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { labourService } from '@/lib/services';
import { LabourProfile, LabourAvailability, LabourBooking } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAppStore, useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function ProviderLabourPage() {
  const { sidebarOpen } = useAppStore();
  const { user } = useAuthStore();
  const [labourProfile, setLabourProfile] = useState<LabourProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<LabourBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<LabourBooking | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadLabourProfile();
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadLabourProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const data = await labourService.getByUserId(user.id);
      setLabourProfile(data);
    } catch (err) {
      console.error('Failed to load labour profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBookings = async () => {
    if (!user) return;

    try {
      const result = await labourService.getBookings(user.id, 'labour');
      setBookings(result.data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    }
  };

  const handleToggleAvailability = async () => {
    if (!labourProfile) return;

    try {
      const newAvailability: LabourAvailability =
        labourProfile.availability === 'available' ? 'unavailable' : 'available';

      await labourService.updateAvailability(labourProfile.id, newAvailability);
      setLabourProfile({ ...labourProfile, availability: newAvailability });
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
      loadBookings();
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
      loadBookings();
    } catch (err) {
      console.error('Failed to reject booking:', err);
      toast.error('Failed to reject booking');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500', label: 'Pending' },
      confirmed: { color: 'bg-green-500', label: 'Confirmed' },
      in_progress: { color: 'bg-blue-500', label: 'In Progress' },
      completed: { color: 'bg-gray-500', label: 'Completed' },
      cancelled: { color: 'bg-red-500', label: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant="default" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <main className="flex-1 p-4 transition-all duration-300 lg:p-6">
            <div className="mx-auto max-w-4xl">
              <EmptyState
                icon={<Users className="h-12 w-12" />}
                title="No Labour Profile"
                description="Create your labour profile to start receiving booking requests"
                action={
                  <Button asChild>
                    <Link href="/provider/labour/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Profile
                    </Link>
                  </Button>
                }
              />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        <main className="flex-1 px-4 pb-4 pt-28 transition-all duration-300 lg:px-6 lg:pb-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Labour Profile</h1>
                <p className="text-gray-600">Manage your profile and bookings</p>
              </div>
              <Button asChild variant="outline">
                <Link href={`/provider/labour/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
            </div>

            {/* Profile Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {labourProfile.user?.name || 'Your Profile'}
                      </h2>
                      {labourProfile.user?.is_verified && (
                        <Badge variant="default" className="bg-green-500">
                          Verified
                        </Badge>
                      )}
                    </div>

                    {labourProfile.location_name && (
                      <div className="mb-2 flex items-center text-gray-600">
                        <MapPin className="mr-2 h-4 w-4" />
                        {labourProfile.location_name}
                      </div>
                    )}

                    <div className="mb-4 flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">
                          {labourProfile.rating?.toFixed(1) || '0.0'}
                        </span>
                        <span className="text-sm text-gray-600">
                          ({labourProfile.review_count || 0} reviews)
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Briefcase className="mr-1 h-4 w-4" />
                        <span className="text-sm">
                          {labourProfile.experience_years} years experience
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      {labourProfile.skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {labourProfile.bio && (
                      <p className="text-sm text-gray-700">{labourProfile.bio}</p>
                    )}
                  </div>

                  <div className="md:text-right">
                    <div className="mb-1 flex items-center text-3xl font-bold text-teal-600">
                      <IndianRupee className="h-7 w-7" />
                      {labourProfile.daily_rate}
                    </div>
                    <div className="mb-3 text-sm text-gray-500">per day</div>

                    <Button
                      onClick={handleToggleAvailability}
                      variant={labourProfile.availability === 'available' ? 'default' : 'outline'}
                      className="w-full md:w-auto"
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

                {/* Stats */}
                <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-6 md:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">
                      {labourProfile.total_jobs || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Jobs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">
                      {bookings.filter((b) => b.status === 'pending').length}
                    </div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">
                      {bookings.filter((b) => b.status === 'confirmed').length}
                    </div>
                    <div className="text-sm text-gray-600">Confirmed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">
                      {labourProfile.service_radius_km} km
                    </div>
                    <div className="text-sm text-gray-600">Service Radius</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bookings Section */}
            <div className="mb-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
                <Button asChild variant="outline" size="sm">
                  <Link href="/provider/bookings">View All</Link>
                </Button>
              </div>

              {bookings.length === 0 ? (
                <Card>
                  <CardContent className="p-12">
                    <EmptyState
                      icon={<Users className="h-12 w-12" />}
                      title="No bookings yet"
                      description="Your booking requests will appear here"
                    />
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {bookings.slice(0, 5).map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                              <h3 className="font-semibold text-gray-900">
                                {booking.employer?.name || 'Employer'}
                              </h3>
                              {getStatusBadge(booking.status)}
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Duration:</span>{' '}
                                {new Date(booking.start_date).toLocaleDateString()} -{' '}
                                {new Date(booking.end_date).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">Total Days:</span>{' '}
                                {booking.total_days}
                              </div>
                              {booking.notes && (
                                <div>
                                  <span className="font-medium">Notes:</span> {booking.notes}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-teal-600">
                              ₹{booking.total_amount?.toLocaleString()}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
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
                                      className="text-red-600"
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
                      </CardContent>
                    </Card>
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
