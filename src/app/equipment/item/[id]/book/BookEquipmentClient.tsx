'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  AlertCircle,
  Tractor,
  CreditCard,
  Clock,
  Loader2,
  MapPin,
  ShieldCheck,
  CalendarDays,
  CheckCircle2,
  Info,
  ChevronRight,
  Phone,
  FileText,
  LocateFixed,
} from 'lucide-react';
import { Button, Card, CardContent, Input, Textarea, Badge, Avatar } from '@/components/ui';
import { Calendar } from '@/components/ui/calendar';
import { equipmentService, bookingService } from '@/lib/services';
import { useAuthStore } from '@/lib/store';
import { Equipment, Booking } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  addDays,
  format,
  isSameDay,
  parseISO,
  startOfDay,
  differenceInCalendarDays,
} from 'date-fns';
import { DateRange } from 'react-day-picker';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

// --- Main Component ---
export default function BookEquipmentPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const equipmentId = params.id as string;

  // --- State ---
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [formData, setFormData] = useState({
    startTime: '08:00',
    endTime: '18:00',
    deliveryAddress: profile?.address || '',
    notes: '',
  });

  // --- Derived State / Memo ---
  const pricing = useMemo(() => {
    if (!dateRange?.from || !equipment) {
      return { days: 0, rentalAmount: 0, platformFee: 0, gstOnPlatformFee: 0, totalPayable: 0 };
    }
    const start = dateRange.from;
    const end = dateRange.to || dateRange.from;
    // Calculate days inclusive
    const days = differenceInCalendarDays(end, start) + 1;

    const rentalAmount = days * equipment.price_per_day;
    const platformFee = Math.round(rentalAmount * 0.05);
    const gstOnPlatformFee = Math.round(platformFee * 0.18);
    const totalPayable = rentalAmount + platformFee + gstOnPlatformFee;

    return { days, rentalAmount, platformFee, gstOnPlatformFee, totalPayable };
  }, [dateRange, equipment]);

  // --- Effects ---
  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=/equipment/item/${equipmentId}/book`);
      return;
    }
    loadData();
  }, [equipmentId, user, router]);

  // --- Data Fetching ---
  const loadData = async () => {
    try {
      const [equipmentData, bookingsData] = await Promise.all([
        equipmentService.getEquipmentById(equipmentId),
        bookingService.getEquipmentBookings(equipmentId, ['pending', 'confirmed', 'in_progress']),
      ]);

      setEquipment(equipmentData);

      // Process booked dates
      const allBookedDates: Date[] = [];
      bookingsData.forEach((booking) => {
        if (!booking.start_date || !booking.end_date) return;
        const start = startOfDay(parseISO(booking.start_date));
        const end = startOfDay(parseISO(booking.end_date));
        let current = new Date(start);
        while (current <= end) {
          allBookedDates.push(new Date(current));
          current = addDays(current, 1);
        }
      });
      setBookedDates(allBookedDates);

      if (profile?.address) {
        setFormData((prev) => ({ ...prev, deliveryAddress: profile.address || '' }));
      }
    } catch (err) {
      toast.error('Failed to load equipment data');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsDetectingLocation(true);
    const loadingToast = toast.loading('Detecting your location...');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }

      const data = await response.json();
      const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      setFormData((prev) => ({ ...prev, deliveryAddress: address }));
      toast.dismiss(loadingToast);
      toast.success('Location detected successfully');
    } catch (error) {
      toast.dismiss(loadingToast);
      if (error instanceof GeolocationPositionError) {
        if (error.code === 1) {
          toast.error('Location permission denied. Please enable location access.');
        } else if (error.code === 2) {
          toast.error('Unable to determine your location. Please try again.');
        } else if (error.code === 3) {
          toast.error('Location request timed out. Please try again.');
        }
      } else {
        toast.error('Failed to detect location. Please enter address manually.');
      }
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const isRangeBlocked = (range: DateRange | undefined) => {
    if (!range?.from) return false;
    const end = range.to || range.from;
    let current = range.from;
    while (current <= end) {
      if (bookedDates.some((booked) => isSameDay(booked, current))) return true;
      current = addDays(current, 1);
    }
    return false;
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to && range.to < range.from) {
      toast.error('End date cannot be before start date');
      return;
    }
    if (isRangeBlocked(range)) {
      toast.error('Selected dates are unavailable');
      return;
    }
    setDateRange(range);
  };

  const validateForm = () => {
    if (!dateRange?.from) {
      toast.error('Please select dates');
      return false;
    }
    if (isRangeBlocked(dateRange)) {
      toast.error('Dates unavailable');
      return false;
    }
    if (!formData.deliveryAddress.trim()) {
      toast.error('Please enter address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !equipment || !dateRange?.from) return;

    const endDate = dateRange.to || dateRange.from;
    setIsSubmitting(true);
    const loadingToast = toast.loading('Processing secure payment...');

    try {
      await new Promise((r) => setTimeout(r, 1500)); // Simulate API

      await bookingService.createBooking({
        equipment_id: equipment.id,
        start_date: format(dateRange.from, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        start_time: formData.startTime,
        end_time: formData.endTime,
        delivery_address: formData.deliveryAddress,
        notes: formData.notes || undefined,
        total_amount: pricing.totalPayable,
        platform_fee: pricing.platformFee,
      });

      toast.dismiss(loadingToast);
      toast.success('Booking Confirmed Successfully!');
      router.push('/renter/bookings?success=true');
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render States ---
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-emerald-500" />
            <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full bg-emerald-500/20 blur-xl" />
          </div>
          <p className="animate-pulse text-sm font-medium text-slate-400">Loading Experience...</p>
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 px-4 text-white">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/20">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Equipment Not Found</h1>
          <p className="text-slate-400">
            The item you are looking for may have been removed or is unavailable.
          </p>
        </div>
        <Button asChild className="rounded-full bg-white px-6 text-slate-950 hover:bg-slate-200">
          <Link href="/equipment">Browse Marketplace</Link>
        </Button>
      </div>
    );
  }

  const today = startOfDay(new Date());
  const isValid =
    !!dateRange?.from && !isRangeBlocked(dateRange) && formData.deliveryAddress.length > 5;

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-50 selection:bg-emerald-500/30">
      {/* --- Background Ambience --- */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* --- Navigation --- */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link
            href="/equipment"
            className="group flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 transition-all group-hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="hidden md:inline">Back to Browse</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <Tractor className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="font-bold tracking-tight">
              Equip<span className="text-emerald-400">Rent</span>
            </span>
          </div>

          <div className="flex w-8 justify-end md:w-auto">
            <Avatar
              src={profile?.profile_image}
              name={profile?.name}
              size="sm"
              className="ring-1 ring-white/10"
            />
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-12"
        >
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                >
                  <ShieldCheck className="mr-1 h-3 w-3" /> Verified Listing
                </Badge>
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Booking ID: #{equipmentId.slice(0, 6)}
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
                Book {equipment.name}
              </h1>
              <p className="mt-2 max-w-xl text-slate-400">
                Secure this equipment for your project. Review the details below and confirm your
                rental period.
              </p>
            </div>

            {/* Desktop Price Tag */}
            <div className="hidden flex-col items-end md:flex">
              <span className="text-sm text-slate-400">Rental Rate</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">
                  {formatCurrency(equipment.price_per_day)}
                </span>
                <span className="text-slate-500">/day</span>
              </div>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
            {/* --- Left Column: Forms (Bento Grid) --- */}
            <div className="space-y-6 lg:col-span-8">
              {/* 1. Date Selection */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm transition-all hover:border-white/20 md:p-8"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Rental Duration</h2>
                    <p className="text-sm text-slate-400">Select your pickup and return dates</p>
                  </div>
                  {pricing.days > 0 && (
                    <Badge className="ml-auto border-0 bg-emerald-500 font-bold text-slate-950">
                      {pricing.days} Days Selected
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col gap-8 md:flex-row">
                  <div className="flex flex-1 justify-center rounded-2xl bg-slate-950/50 p-4 ring-1 ring-white/5">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={handleDateSelect}
                      bookedDates={bookedDates}
                      disabled={(date) => date < today}
                      numberOfMonths={1}
                      fromMonth={today}
                    />
                  </div>

                  <div className="space-y-4 md:w-64">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Pickup Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <Input
                          type="time"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleInputChange}
                          className="h-12 rounded-xl border-white/10 bg-slate-900/50 pl-10 text-white focus:ring-2 focus:ring-emerald-500/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Return Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <Input
                          type="time"
                          name="endTime"
                          value={formData.endTime}
                          onChange={handleInputChange}
                          className="h-12 rounded-xl border-white/10 bg-slate-900/50 pl-10 text-white focus:ring-2 focus:ring-emerald-500/50"
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
                      <div className="flex gap-2">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                        <p className="text-xs leading-relaxed text-blue-200">
                          Flexible cancellation available up to 24 hours before pickup.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 2. Logistics */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm transition-all hover:border-white/20 md:p-8"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Delivery & Logistics</h2>
                    <p className="text-sm text-slate-400">Where should we deliver the equipment?</p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Site Address
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleDetectLocation}
                        disabled={isDetectingLocation}
                        className="h-8 gap-1.5 text-xs text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                      >
                        {isDetectingLocation ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Detecting...
                          </>
                        ) : (
                          <>
                            <LocateFixed className="h-3.5 w-3.5" />
                            Auto Detect
                          </>
                        )}
                      </Button>
                    </div>
                    <Textarea
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleInputChange}
                      placeholder="Click 'Auto Detect' or enter your address manually..."
                      rows={3}
                      required
                      className="resize-none rounded-xl border-white/10 bg-slate-900/50 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Special Instructions (Optional)
                    </label>
                    <Input
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Gate codes, specific contact person, etc."
                      className="h-12 rounded-xl border-white/10 bg-slate-900/50 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Mobile Summary Card (Visible only on small screens) */}
              <div className="lg:hidden">
                <PricingSummaryCard
                  equipment={equipment}
                  pricing={pricing}
                  isValid={isValid}
                  isSubmitting={isSubmitting}
                />
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { icon: ShieldCheck, label: 'Insured Rentals' },
                  { icon: CheckCircle2, label: 'Verified Owner' },
                  { icon: Phone, label: '24/7 Support' },
                  { icon: FileText, label: 'Digital Contract' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4"
                  >
                    <item.icon className="h-5 w-5 text-slate-400" />
                    <span className="text-xs font-medium text-slate-300">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* --- Right Column: Sticky Sidebar --- */}
            <div className="hidden lg:col-span-4 lg:block">
              <div className="sticky top-24 space-y-6">
                <PricingSummaryCard
                  equipment={equipment}
                  pricing={pricing}
                  isValid={isValid}
                  isSubmitting={isSubmitting}
                />

                {/* Contact Support Card */}
                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-6">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Need Help?</h3>
                      <p className="text-xs text-slate-400">Call us to modify booking</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-white/10 text-slate-300 hover:bg-white/5"
                    asChild
                  >
                    <a href="tel:+9118005550123">+91 1800-555-0123</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* --- Mobile Bottom Bar --- */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950/90 p-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400">Total Payable</p>
            <p className="text-xl font-bold text-white">{formatCurrency(pricing.totalPayable)}</p>
          </div>
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            onClick={handleSubmit}
            className="h-12 rounded-xl bg-emerald-500 px-8 font-bold text-slate-950 transition-all hover:bg-emerald-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm Booking'}
          </Button>
        </div>
      </div>

      {/* Spacer for mobile bottom bar */}
      <div className="h-24 lg:hidden" />
    </div>
  );
}

// --- Sub-Components ---

function PricingSummaryCard({
  equipment,
  pricing,
  isValid,
  isSubmitting,
}: {
  equipment: Equipment;
  pricing: any;
  isValid: boolean;
  isSubmitting: boolean;
}) {
  return (
    <Card className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 shadow-2xl backdrop-blur-xl">
      <div className="relative h-48 w-full overflow-hidden">
        {equipment.images?.[0] ? (
          <Image src={equipment.images[0]} alt={equipment.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-800">
            <Tractor className="h-16 w-16 text-slate-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute bottom-4 left-6 right-6">
          <h3 className="line-clamp-1 text-xl font-bold text-white">{equipment.name}</h3>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <MapPin className="h-4 w-4 text-emerald-400" />
            {equipment.location_name || 'On-site Delivery'}
          </div>
        </div>
      </div>

      <CardContent className="space-y-6 p-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Rental Fee ({pricing.days} days)</span>
            <span className="font-medium text-white">{formatCurrency(pricing.rentalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Platform Fee (5%)</span>
            <span className="font-medium text-white">{formatCurrency(pricing.platformFee)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Taxes (GST 18%)</span>
            <span className="font-medium text-white">
              {formatCurrency(pricing.gstOnPlatformFee)}
            </span>
          </div>

          <div className="my-4 h-px bg-white/10" />

          <div className="flex items-end justify-between">
            <span className="text-sm font-semibold text-white">Total Payable</span>
            <span className="text-3xl font-bold text-emerald-400">
              {formatCurrency(pricing.totalPayable)}
            </span>
          </div>
        </div>

        <div className="hidden lg:block">
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="group h-14 w-full rounded-xl bg-white font-bold text-slate-950 transition-all hover:bg-slate-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Proceed to Pay
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1 text-center text-[10px] uppercase tracking-widest text-slate-500">
            <ShieldCheck className="h-3 w-3" /> Secure SSL Encrypted
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
