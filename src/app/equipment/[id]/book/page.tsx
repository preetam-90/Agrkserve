'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  MapPin,
  AlertCircle,
  Tractor,
  CreditCard,
  Info,
  Clock,
  Loader2
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import {
  Button,
  Card,
  CardContent,
  Input,
  Textarea,
  Spinner,
} from '@/components/ui';
import { Calendar } from '@/components/ui/calendar';
import { equipmentService, bookingService } from '@/lib/services';
import { useAuthStore } from '@/lib/store';
import { Equipment, Booking } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { addDays, format, isSameDay, parseISO, startOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';

export default function BookEquipmentPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuthStore();

  const equipmentId = params.id as string;

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]); // Store existing bookings
  const [bookedDates, setBookedDates] = useState<Date[]>([]); // Array of all booked dates
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Date selection state
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const [formData, setFormData] = useState({
    startTime: '08:00',
    endTime: '18:00',
    deliveryAddress: profile?.address || '',
    notes: '',
  });

  const [pricing, setPricing] = useState({
    days: 0,
    rentalAmount: 0,        // Base rental amount (goes to owner)
    platformFee: 0,         // Platform fee charged to renter (5% of rental)
    gstOnPlatformFee: 0,    // 18% GST on platform fee only
    ownerCommission: 0,     // 3% commission deducted from owner payout
    totalPayable: 0,        // Total amount renter pays
    ownerPayout: 0,         // Amount owner receives after commission
  });

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=/equipment/${equipmentId}/book`);
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipmentId, user]);

  useEffect(() => {
    calculatePricing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, equipment]);

  const loadData = async () => {
    try {
      console.log('Fetching equipment data...');
      let equipmentData;
      try {
        equipmentData = await equipmentService.getEquipmentById(equipmentId);
        console.log('Equipment data fetched successfully');
      } catch (e) {
        console.error('Failed to fetch equipment:', e);
        throw new Error('Equipment fetch failed');
      }

      console.log('Fetching bookings data...');
      let bookingsData: Booking[];
      try {
        // Include 'pending' so that requested dates are blocked immediately
        // Only ignore 'cancelled' or 'completed' (if you want completed to be available again)
        bookingsData = await bookingService.getEquipmentBookings(equipmentId, ['pending', 'confirmed', 'in_progress']);
        console.log('Bookings data fetched:', bookingsData);
      } catch (e) {
        console.error('Failed to fetch bookings:', e);
        bookingsData = [];
      }

      setEquipment(equipmentData);
      setBookings(bookingsData);

      // Calculate all booked dates
      const allBookedDates: Date[] = [];
      if (bookingsData && bookingsData.length > 0) {
        bookingsData.forEach(booking => {
          if (!booking.start_date || !booking.end_date) return;

          // Use startOfDay to ensure we are comparing just the calendar dates
          const start = startOfDay(parseISO(booking.start_date));
          const end = startOfDay(parseISO(booking.end_date));

          let current = new Date(start);
          while (current <= end) {
            allBookedDates.push(new Date(current));
            current = addDays(current, 1);
          }
        });
      }
      console.log('Processed booked dates:', allBookedDates);
      setBookedDates(allBookedDates);

      // Set default delivery address from profile
      if (profile?.address) {
        setFormData(prev => ({ ...prev, deliveryAddress: profile.address! }));
      }
    } catch (err: any) {
      console.error('CRITICAL LOAD ERROR:', err);
      toast.error(`Failed to load: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePricing = () => {
    if (!dateRange?.from || !dateRange?.to || !equipment) {
      setPricing({
        days: 0,
        rentalAmount: 0,
        platformFee: 0,
        gstOnPlatformFee: 0,
        ownerCommission: 0,
        totalPayable: 0,
        ownerPayout: 0,
      });
      return;
    }

    const start = dateRange.from;
    const end = dateRange.to;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    // Base rental amount (what goes to owner before commission)
    const rentalAmount = days * equipment.price_per_day;

    // Platform fee charged to renter (5% of rental amount)
    const platformFee = Math.round(rentalAmount * 0.05);

    // GST on platform fee only (18% of platform fee as per Indian tax law)
    const gstOnPlatformFee = Math.round(platformFee * 0.18);

    // Total amount renter pays
    const totalPayable = rentalAmount + platformFee + gstOnPlatformFee;

    // Owner commission (3% of rental amount, deducted from owner's payout)
    const ownerCommission = Math.round(rentalAmount * 0.03);

    // Amount owner receives after commission
    const ownerPayout = rentalAmount - ownerCommission;

    setPricing({
      days,
      rentalAmount,
      platformFee,
      gstOnPlatformFee,
      ownerCommission,
      totalPayable,
      ownerPayout,
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Check if a range contains any booked dates
  const isRangeBlocked = (range: DateRange | undefined) => {
    if (!range?.from || !range?.to) return false;

    // Check if any date in the range is in bookedDates
    // Simple check: iterate through the range
    let current = range.from;
    while (current <= range.to) {
      if (bookedDates.some(bookedDate => isSameDay(bookedDate, current))) {
        return true;
      }
      current = addDays(current, 1);
    }
    return false;
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    if (isRangeBlocked(range)) {
      toast.error('Selected range includes dates that are already booked.');
      setDateRange(undefined);
      return;
    }
    setDateRange(range);
  };

  const validateForm = () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Please select start and end dates');
      return false;
    }
    if (isRangeBlocked(dateRange)) {
      toast.error('Selected dates are not available');
      return false;
    }
    if (!formData.deliveryAddress) {
      toast.error('Please enter delivery address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !equipment || !dateRange?.from || !dateRange?.to) return;

    setIsSubmitting(true);
    const processingToast = toast.loading('Processing payment...');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      await bookingService.createBooking({
        equipment_id: equipment.id,
        start_date: format(dateRange.from, 'yyyy-MM-dd'),
        end_date: format(dateRange.to, 'yyyy-MM-dd'),
        start_time: formData.startTime,
        end_time: formData.endTime,
        delivery_address: formData.deliveryAddress,
        notes: formData.notes || undefined,
        total_amount: pricing.totalPayable,
        platform_fee: pricing.platformFee,
      });

      toast.dismiss(processingToast);
      toast.success('Payment successful! Booking created.');
      router.push(`/renter/bookings?success=true`);

    } catch (err: any) {
      toast.dismiss(processingToast);
      console.error('Failed to create booking:', err);
      toast.error(`Failed to create booking: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Equipment Not Found</h1>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white">
            <Link href="/equipment">Browse Equipment</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const today = startOfDay(new Date());

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href={`/equipment/${equipmentId}`}
          className="inline-flex items-center text-slate-400 hover:text-emerald-400 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to equipment
        </Link>

        <h1 className="text-3xl font-bold text-white mb-8">Book Equipment</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h2 className="font-bold text-lg mb-6 flex items-center gap-2 text-white">
                    <CalendarIcon className="h-5 w-5 text-emerald-500" />
                    Select Dates
                  </h2>

                  <div className="flex flex-col gap-6">
                    <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative overflow-hidden group/calendar">
                      {/* Decorative background glow */}
                      <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/15 blur-[120px] pointer-events-none" />
                      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-emerald-600/10 blur-[120px] pointer-events-none" />

                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={handleDateSelect}
                        disabled={[
                          { before: today },
                          ...bookedDates
                        ]}
                        numberOfMonths={1}
                        fromMonth={today}
                        captionLayout="dropdown"
                        fromYear={2024}
                        toYear={2030}
                        modifiers={{
                          booked: bookedDates,
                        }}
                        className="rounded-md border-none text-slate-100 w-full"
                        modifiersClassNames={{
                          booked: "text-red-400 font-bold line-through bg-red-500/20 rounded-xl hover:bg-red-500/30",
                        }}
                        classNames={{
                          months: "flex flex-col items-center",
                          month: "space-y-6 w-full max-w-[340px]",
                          month_caption: "flex flex-row justify-between items-center mb-8 px-2 w-full",
                          caption_label: "hidden",
                          caption_dropdowns: "flex justify-center gap-2 text-emerald-400 font-bold text-lg",
                          dropdown: "bg-white/10 border border-white/20 rounded-xl px-2 py-1 outline-none appearance-none cursor-pointer text-white text-sm focus:ring-2 focus:ring-emerald-500/30",
                          nav: "flex items-center gap-2",
                          chevron: "h-9 w-9 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-white/10 hover:text-emerald-400 transition-all text-white/50 shadow-lg",
                          day_button: "h-9 w-9 font-semibold aria-selected:opacity-100 hover:bg-emerald-500/20 hover:text-emerald-300 rounded-lg transition-all text-base flex items-center justify-center",
                          selected: "bg-emerald-500 text-white hover:bg-emerald-400 hover:text-white !rounded-lg shadow-lg scale-105 z-10",
                          range_start: "bg-emerald-500 text-white !rounded-l-lg",
                          range_end: "bg-emerald-500 text-white !rounded-r-lg",
                          range_middle: "bg-emerald-500/20 text-emerald-300 !rounded-none",
                          today: "bg-white/10 text-white font-bold ring-2 ring-emerald-500/40",
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-3 text-sm text-slate-400 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                      <Info className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <p>Dates marked in <span className="text-red-400 font-bold">red</span> are already booked.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-slate-400 block mb-2">Start Date</span>
                        <div className="h-11 px-4 border border-slate-700 rounded-lg bg-slate-950 text-slate-200 text-sm flex items-center">
                          {dateRange?.from ? format(dateRange.from, 'PPP') : 'Select start date'}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-400 block mb-2">End Date</span>
                        <div className="h-11 px-4 border border-slate-700 rounded-lg bg-slate-950 text-slate-200 text-sm flex items-center">
                          {dateRange?.to ? format(dateRange.to, 'PPP') : 'Select end date'}
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                          Pickup Time
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <Input
                            type="time"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleInputChange}
                            className="pl-10 bg-slate-950 border-slate-700 text-white focus:border-emerald-500 h-11"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                          Return Time
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <Input
                            type="time"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleInputChange}
                            className="pl-10 bg-slate-950 border-slate-700 text-white focus:border-emerald-500 h-11"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h2 className="font-bold text-lg mb-6 flex items-center gap-2 text-white">
                    <MapPin className="h-5 w-5 text-emerald-500" />
                    Delivery Details
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Delivery Address <span className="text-red-400">*</span>
                      </label>
                      <Textarea
                        name="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={handleInputChange}
                        placeholder="Enter your farm/field address"
                        rows={3}
                        required
                        className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 focus:border-emerald-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Additional Notes
                      </label>
                      <Textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Any special requirements or instructions..."
                        rows={2}
                        className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 focus:border-emerald-500 resize-none"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 bg-slate-900/50 border-slate-800 backdrop-blur-sm shadow-xl">
              <CardContent className="p-6">
                <h2 className="font-bold text-lg mb-6 text-white">Order Summary</h2>

                {/* Equipment Preview */}
                <div className="flex gap-4 pb-6 border-b border-slate-800">
                  <div className="w-20 h-20 rounded-lg bg-slate-800 flex-shrink-0 relative overflow-hidden border border-slate-700">
                    {equipment.images?.[0] ? (
                      <Image
                        src={equipment.images[0]}
                        alt={equipment.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Tractor className="h-8 w-8 text-slate-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-white line-clamp-1">{equipment.name}</p>
                    <p className="text-sm text-slate-400 line-clamp-1 mb-1">{equipment.location_name}</p>
                    <p className="text-sm font-bold text-emerald-400">
                      {formatCurrency(equipment.price_per_day)}/day
                    </p>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="py-6 space-y-3">
                  {pricing.days > 0 ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">
                          {formatCurrency(equipment.price_per_day)} × {pricing.days} {pricing.days === 1 ? 'day' : 'days'}
                        </span>
                        <span className="font-medium text-white">{formatCurrency(pricing.rentalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Platform fee (5%)</span>
                        <span className="text-white">{formatCurrency(pricing.platformFee)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">GST (18% on platform fee)</span>
                        <span className="text-white">{formatCurrency(pricing.gstOnPlatformFee)}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-800 text-xs text-slate-500">
                        <p>💡 Owner receives {formatCurrency(pricing.ownerPayout)} after 3% commission</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500 text-center italic py-2">
                      Select dates to see pricing
                    </p>
                  )}
                </div>

                {/* Total */}
                {pricing.days > 0 && (
                  <div className="pt-4 border-t border-slate-800">
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-bold text-white">Total</span>
                      <span className="text-2xl font-bold text-emerald-400">
                        {formatCurrency(pricing.totalPayable)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="mb-6 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <div className="flex gap-3 text-sm text-emerald-200">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                    <p className="leading-relaxed">
                      Selected dates will be reserved for you upon payment.
                    </p>
                  </div>
                </div>

                {/* Proceed to Payment Button */}
                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20"
                  loading={isSubmitting}
                  disabled={!dateRange}
                  onClick={handleSubmit}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Proceed to Payment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
