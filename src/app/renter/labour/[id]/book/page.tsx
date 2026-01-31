'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  IndianRupee,
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Button, Card, CardContent, Input, Textarea, Spinner } from '@/components/ui';
import { labourService } from '@/lib/services';
import { useAuthStore } from '@/lib/store';
import { LabourProfile } from '@/lib/types';
import toast from 'react-hot-toast';

export default function BookLabourPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuthStore();

  const labourId = params.id as string;

  const [labour, setLabour] = useState<LabourProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    startTime: '08:00',
    endTime: '18:00',
    workLocation: profile?.address || '',
    notes: '',
  });

  const [pricing, setPricing] = useState({
    days: 0,
    baseAmount: 0,
    platformFee: 0,
    total: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=/renter/labour/${labourId}/book`);
      return;
    }
    loadLabourProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labourId, user]);

  useEffect(() => {
    calculatePricing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.startDate, formData.endDate, labour]);

  const loadLabourProfile = async () => {
    try {
      const data = await labourService.getById(labourId);
      if (!data) {
        toast.error('Labour profile not found');
        router.push('/renter/labour');
        return;
      }
      setLabour(data);

      // Set default work location from profile
      if (profile?.address) {
        setFormData((prev) => ({ ...prev, workLocation: profile.address! }));
      }
    } catch (err) {
      console.error('Failed to load labour profile:', err);
      toast.error('Failed to load labour details');
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePricing = () => {
    if (!formData.startDate || !formData.endDate || !labour) {
      setPricing({ days: 0, baseAmount: 0, platformFee: 0, total: 0 });
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    const baseAmount = days * labour.daily_rate;
    const platformFee = Math.round(baseAmount * 0.05); // 5% platform fee
    const total = baseAmount + platformFee;

    setPricing({ days, baseAmount, platformFee, total });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.startDate) {
      toast.error('Please select a start date');
      return false;
    }
    if (!formData.endDate) {
      toast.error('Please select an end date');
      return false;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error('End date must be after start date');
      return false;
    }
    if (new Date(formData.startDate) < new Date()) {
      toast.error('Start date cannot be in the past');
      return false;
    }
    if (!formData.workLocation) {
      toast.error('Please enter work location');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !labour || !user) return;

    setIsSubmitting(true);
    try {
      // Create booking
      const booking = await labourService.createBooking({
        labour_id: labour.id,
        employer_id: user.id,
        start_date: formData.startDate,
        end_date: formData.endDate,
        daily_rate: labour.daily_rate,
        notes: formData.notes || undefined,
      });

      toast.success('Booking request submitted successfully!');
      router.push(`/renter/bookings/${booking.id}`);
    } catch (err) {
      console.error('Failed to create booking:', err);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="container mx-auto flex flex-1 items-center justify-center px-4 pb-8 pt-28">
          <Spinner size="lg" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!labour) {
    return null;
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="container mx-auto max-w-4xl flex-1 px-4 pb-8 pt-28">
        {/* Back Button */}
        <Link
          href={`/renter/labour/${labourId}`}
          className="mb-6 inline-flex items-center text-teal-600 hover:text-teal-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Labour Details
        </Link>

        <h1 className="mb-8 text-3xl font-bold text-gray-900">Book Labour</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Worker Info */}
                  <div className="border-b pb-6">
                    <h2 className="mb-4 text-lg font-semibold">Worker Details</h2>
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {labour.user?.name || 'Farm Worker'}
                        </h3>
                        {labour.location_name && (
                          <div className="mt-1 flex items-center text-sm text-gray-600">
                            <MapPin className="mr-1 h-3 w-3" />
                            {labour.location_name}
                          </div>
                        )}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {labour.skills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="rounded bg-gray-100 px-2 py-1 text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-2xl font-bold text-teal-600">
                          <IndianRupee className="h-5 w-5" />
                          {labour.daily_rate}
                        </div>
                        <div className="text-xs text-gray-500">per day</div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Dates */}
                  <div>
                    <h2 className="mb-4 text-lg font-semibold">Booking Period</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor="startDate"
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Start Date *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                          <Input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            min={today}
                            required
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="endDate"
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          End Date *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                          <Input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            min={formData.startDate || today}
                            required
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div>
                    <h2 className="mb-4 text-lg font-semibold">Working Hours</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor="startTime"
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Start Time
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                          <Input
                            type="time"
                            id="startTime"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleInputChange}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="endTime"
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          End Time
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                          <Input
                            type="time"
                            id="endTime"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleInputChange}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Work Location */}
                  <div>
                    <label
                      htmlFor="workLocation"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Work Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Textarea
                        id="workLocation"
                        name="workLocation"
                        value={formData.workLocation}
                        onChange={handleInputChange}
                        required
                        rows={2}
                        placeholder="Enter the complete address where work will be performed"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label htmlFor="notes" className="mb-2 block text-sm font-medium text-gray-700">
                      Additional Notes (Optional)
                    </label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Any specific requirements or instructions for the worker..."
                    />
                  </div>

                  {/* Important Information */}
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
                      <div className="text-sm text-blue-900">
                        <p className="mb-1 font-medium">Important Information:</p>
                        <ul className="space-y-1 text-blue-800">
                          <li>• Payment will be processed after worker confirmation</li>
                          <li>• You can cancel up to 24 hours before the start date</li>
                          <li>• The worker will be notified of your booking request</li>
                          <li>• Platform fee includes payment processing and insurance</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || !pricing.total}
                    size="lg"
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner className="mr-2" size="sm" />
                        Processing...
                      </>
                    ) : (
                      'Confirm Booking'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Summary */}
          <div>
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="mb-4 text-lg font-semibold">Booking Summary</h2>

                {pricing.days > 0 ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          ₹{labour.daily_rate} × {pricing.days}{' '}
                          {pricing.days === 1 ? 'day' : 'days'}
                        </span>
                        <span className="font-medium">₹{pricing.baseAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Platform fee (5%)</span>
                        <span className="font-medium">₹{pricing.platformFee.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Total</span>
                        <div className="text-right">
                          <div className="flex items-center text-2xl font-bold text-teal-600">
                            <IndianRupee className="h-6 w-6" />
                            {pricing.total.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 border-t pt-4 text-xs text-gray-600">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-3 w-3 text-green-600" />
                        <span>Secure payment</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-3 w-3 text-green-600" />
                        <span>Free cancellation</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-3 w-3 text-green-600" />
                        <span>24/7 support</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <Calendar className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                    <p className="text-sm">Select dates to see pricing</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
