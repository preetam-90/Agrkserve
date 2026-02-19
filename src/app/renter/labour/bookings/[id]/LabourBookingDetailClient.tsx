'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  IndianRupee,
  MapPin,
  AlertCircle,
  User,
  Briefcase,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Avatar, Badge, Button, Card, CardContent, Spinner } from '@/components/ui';
import { labourService } from '@/lib/services';
import { LabourBooking, LabourProfile } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

type LabourBookingWithLabour = LabourBooking & { labour?: LabourProfile };

const getStatusConfig = (status: string) => {
  const map: Record<string, { label: string; badge: string; description: string }> = {
    pending: {
      label: 'Pending',
      badge: 'warning',
      description: 'Waiting for labour confirmation.',
    },
    confirmed: {
      label: 'Confirmed',
      badge: 'success',
      description: 'Your booking has been accepted.',
    },
    in_progress: {
      label: 'In Progress',
      badge: 'default',
      description: 'Work is currently ongoing.',
    },
    completed: {
      label: 'Completed',
      badge: 'success',
      description: 'This booking has been completed.',
    },
    cancelled: {
      label: 'Cancelled',
      badge: 'destructive',
      description: 'This booking was cancelled.',
    },
  };

  return map[status] || map.pending;
};

export default function LabourBookingDetailClient() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<LabourBookingWithLabour | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadBooking = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const bookings = await labourService.getMyEmployerBookings();
        const matched = bookings.find((item) => item.id === bookingId) as LabourBookingWithLabour;

        if (!matched) {
          setLoadError('not_found');
          return;
        }

        setBooking(matched);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load labour booking';

        if (message.toLowerCase().includes('not authenticated')) {
          router.push(`/login?redirect=/labour/bookings/${bookingId}`);
          return;
        }

        console.error('Failed to load labour booking details:', err);
        setLoadError('failed');
      } finally {
        setIsLoading(false);
      }
    };

    if (bookingId) {
      loadBooking();
    }
  }, [bookingId, router]);

  const statusConfig = useMemo(
    () => getStatusConfig(booking?.status || 'pending'),
    [booking?.status]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <main className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4 pb-12 pt-28">
          <div className="text-center">
            <Spinner size="lg" className="text-emerald-500" />
            <p className="mt-4 text-slate-400">Loading labour booking details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!booking || loadError) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <main className="mx-auto max-w-4xl px-4 pb-12 pt-28">
          <Card className="border-slate-800 bg-slate-900/70">
            <CardContent className="p-10 text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-rose-400" />
              <h1 className="mb-2 text-2xl font-bold text-white">Labour Booking Not Found</h1>
              <p className="mx-auto max-w-lg text-slate-400">
                This booking does not exist or you do not have access to view it.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button asChild variant="outline" className="border-slate-700 text-slate-300">
                  <Link href="/renter/labour/bookings">Back to Labour Bookings</Link>
                </Button>
                <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-500">
                  <Link href="/labour">Hire Labour</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const labour = booking.labour;
  const perDayAmount = booking.total_days > 0 ? booking.total_amount / booking.total_days : 0;

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <main className="mx-auto max-w-5xl px-4 pb-12 pt-28">
        <Link
          href="/renter/labour/bookings"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-emerald-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Labour Bookings
        </Link>

        <div className="mb-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Booking ID</p>
              <p className="font-mono text-lg font-semibold text-white">
                {booking.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="mt-1 text-sm text-slate-400">{statusConfig.description}</p>
            </div>
            <Badge variant={statusConfig.badge as 'default'}>{statusConfig.label}</Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-slate-800 bg-slate-900/60">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-400" />
                  <h2 className="text-lg font-semibold text-white">Labour Details</h2>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar src={labour?.user?.profile_image} name={labour?.user?.name} size="lg" />
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {labour?.user?.name || 'Labour Worker'}
                      </p>
                      {labour?.location_name && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-slate-400">
                          <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                          {labour.location_name}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-slate-500">
                        {labour?.experience_years || 0} years experience
                      </p>
                    </div>
                  </div>

                  <Button asChild variant="outline" className="border-slate-700 text-slate-300">
                    <Link href={`/labour/${booking.labour_id}`}>View Worker Profile</Link>
                  </Button>
                </div>

                {labour?.skills?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {labour.skills.slice(0, 6).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/60">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-400" />
                  <h2 className="text-lg font-semibold text-white">Schedule</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                    <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">
                      Start Date
                    </p>
                    <p className="font-semibold text-white">{formatDate(booking.start_date)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                    <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">End Date</p>
                    <p className="font-semibold text-white">{formatDate(booking.end_date)}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                    <p className="mb-1 flex items-center gap-1 text-xs uppercase tracking-wider text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      Total Days
                    </p>
                    <p className="font-semibold text-white">{booking.total_days} days</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                    <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">
                      Requested On
                    </p>
                    <p className="font-semibold text-white">{formatDate(booking.created_at)}</p>
                  </div>
                </div>

                {booking.notes && (
                  <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
                    <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">Notes</p>
                    <p className="text-sm text-slate-300">{booking.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-1">
            <Card className="border-slate-800 bg-slate-900/60">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-emerald-400" />
                  <h2 className="text-lg font-semibold text-white">Payment Summary</h2>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Rate / day</span>
                    <span className="text-slate-200">{formatCurrency(perDayAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Days</span>
                    <span className="text-slate-200">{booking.total_days}</span>
                  </div>
                </div>

                <div className="my-4 border-t border-slate-800" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-300">Total Amount</span>
                  <span className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(booking.total_amount)}
                  </span>
                </div>

                <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                  {booking.status === 'confirmed' || booking.status === 'completed' ? (
                    <span className="inline-flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Booking accepted by labour
                    </span>
                  ) : booking.status === 'cancelled' ? (
                    <span className="inline-flex items-center gap-2 text-rose-300">
                      <XCircle className="h-4 w-4" />
                      Booking cancelled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Waiting for confirmation
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
