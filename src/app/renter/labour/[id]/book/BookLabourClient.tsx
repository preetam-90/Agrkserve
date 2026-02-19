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
  User,
  Star,
  Shield,
  Clock3,
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Input, Textarea } from '@/components/ui';
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
  const [isVisible, setIsVisible] = useState(false);

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
      router.push(`/login?redirect=/labour/${labourId}/book`);
      return;
    }
    loadLabourProfile();
     
  }, [labourId, user]);

  useEffect(() => {
    calculatePricing();
     
  }, [formData.startDate, formData.endDate, labour]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const loadLabourProfile = async () => {
    try {
      const data = await labourService.getById(labourId);
      if (!data) {
        toast.error('Labour profile not found');
        router.push('/labour');
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
      router.push(`/renter/labour/bookings/${booking.id}`);
    } catch (err) {
      console.error('Failed to create booking:', err);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col" style={{ background: 'var(--bg-base)' }}>
        <Header />
        <main className="container mx-auto flex flex-1 items-center justify-center px-4 pb-8 pt-28">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-[rgba(255,255,255,0.1)] border-t-[#34d399] shadow-[0_0_30px_rgba(16,185,129,0.4)]"></div>
          </div>
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
    <div
      className="flex min-h-screen flex-col"
      style={{
        background: 'var(--bg-base)',
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16, 185, 129, 0.15), transparent),
          radial-gradient(ellipse 60% 40% at 100% 50%, rgba(6, 182, 212, 0.08), transparent)
        `,
      }}
    >
      <Header />

      <main className="container mx-auto max-w-5xl flex-1 px-4 pb-12 pt-28">
        {/* Back Button */}
        <Link
          href={`/labour/${labourId}`}
          className="group mb-6 inline-flex items-center text-sm font-medium transition-all duration-300 hover:translate-x-[-4px]"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          <span style={{ color: 'var(--text-tertiary)' }}>Back to Labour Details</span>
        </Link>

        {/* Page Header */}
        <div
          className={`mb-8 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
          <h1
            className="mb-2 text-3xl font-bold"
            style={{
              color: 'var(--text-primary)',
              textShadow: '0 0 40px rgba(16, 185, 129, 0.3)',
            }}
          >
            Book Labour
          </h1>
          <p style={{ color: 'var(--text-tertiary)' }}>
            Fill in the details below to hire {labour.user?.name || 'this worker'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Booking Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Worker Info Card */}
              <div
                className={`card-glass p-6 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                style={{ transitionDelay: '100ms' }}
              >
                <div className="flex items-start gap-5">
                  {/* Avatar */}
                  <div
                    className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    <User className="h-10 w-10" style={{ color: '#34d399' }} />
                    <div
                      className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                        boxShadow: '0 0 12px rgba(16, 185, 129, 0.5)',
                      }}
                    >
                      <Star className="h-3 w-3 fill-white text-white" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {labour.user?.name || 'Farm Worker'}
                    </h3>
                    {labour.location_name && (
                      <div
                        className="mt-1 flex items-center text-sm"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        <MapPin className="mr-1 h-3 w-3" style={{ color: '#22d3ee' }} />
                        {labour.location_name}
                      </div>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {labour.skills.slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="rounded-full px-3 py-1 text-xs font-medium"
                          style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: '#34d399',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className="flex items-center text-3xl font-bold"
                      style={{ color: '#34d399' }}
                    >
                      <IndianRupee className="h-6 w-6" />
                      {labour.daily_rate}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      per day
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Dates Card */}
              <div
                className={`card-glass p-6 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                style={{ transitionDelay: '200ms' }}
              >
                <div className="mb-5 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1))',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    <Calendar className="h-5 w-5" style={{ color: '#fbbf24' }} />
                  </div>
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Booking Period
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="startDate"
                      className="mb-2 block text-sm font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Start Date *
                    </label>
                    <div className="relative">
                      <Calendar
                        className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform"
                        style={{ color: 'var(--text-tertiary)' }}
                      />
                      <Input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        min={today}
                        required
                        className="pl-10"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-default)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="endDate"
                      className="mb-2 block text-sm font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      End Date *
                    </label>
                    <div className="relative">
                      <Calendar
                        className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform"
                        style={{ color: 'var(--text-tertiary)' }}
                      />
                      <Input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        min={formData.startDate || today}
                        required
                        className="pl-10"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-default)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Working Hours Card */}
              <div
                className={`card-glass p-6 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                style={{ transitionDelay: '300ms' }}
              >
                <div className="mb-5 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1))',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    <Clock className="h-5 w-5" style={{ color: '#a78bfa' }} />
                  </div>
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Working Hours
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="startTime"
                      className="mb-2 block text-sm font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Start Time
                    </label>
                    <div className="relative">
                      <Clock
                        className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform"
                        style={{ color: 'var(--text-tertiary)' }}
                      />
                      <Input
                        type="time"
                        id="startTime"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        className="pl-10"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-default)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="endTime"
                      className="mb-2 block text-sm font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      End Time
                    </label>
                    <div className="relative">
                      <Clock
                        className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform"
                        style={{ color: 'var(--text-tertiary)' }}
                      />
                      <Input
                        type="time"
                        id="endTime"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        className="pl-10"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-default)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Location Card */}
              <div
                className={`card-glass p-6 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                style={{ transitionDelay: '400ms' }}
              >
                <div className="mb-5 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(34, 211, 238, 0.1))',
                      border: '1px solid rgba(34, 211, 238, 0.3)',
                    }}
                  >
                    <MapPin className="h-5 w-5" style={{ color: '#22d3ee' }} />
                  </div>
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Work Location
                  </h2>
                </div>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-3 h-5 w-5"
                    style={{ color: 'var(--text-tertiary)' }}
                  />
                  <Textarea
                    id="workLocation"
                    name="workLocation"
                    value={formData.workLocation}
                    onChange={handleInputChange}
                    required
                    rows={2}
                    placeholder="Enter the complete address where work will be performed"
                    className="pl-10"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Additional Notes Card */}
              <div
                className={`card-glass p-6 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                style={{ transitionDelay: '500ms' }}
              >
                <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Additional Notes (Optional)
                </h2>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Any specific requirements or instructions for the worker..."
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* Important Information */}
              <div
                className={`rounded-2xl p-5 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                style={{
                  background:
                    'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.05))',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  transitionDelay: '600ms',
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.2))',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    <AlertCircle className="h-5 w-5" style={{ color: '#60a5fa' }} />
                  </div>
                  <div>
                    <p className="mb-2 font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Important Information:
                    </p>
                    <ul className="space-y-1.5 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                      <li className="flex items-start gap-2">
                        <CheckCircle
                          className="mt-0.5 h-4 w-4 shrink-0"
                          style={{ color: '#34d399' }}
                        />
                        <span>Payment will be processed after worker confirmation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle
                          className="mt-0.5 h-4 w-4 shrink-0"
                          style={{ color: '#34d399' }}
                        />
                        <span>You can cancel up to 24 hours before the start date</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle
                          className="mt-0.5 h-4 w-4 shrink-0"
                          style={{ color: '#34d399' }}
                        />
                        <span>The worker will be notified of your booking request</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !pricing.total}
                className="group relative w-full overflow-hidden rounded-2xl py-4 text-lg font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:hover:scale-100"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: 'linear-gradient(135deg, #34d399, #10b981)',
                  }}
                ></div>
                <span className="relative flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="h-5-spin animate-2 w-5 rounded-full border border-white border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5" />
                      Confirm Booking
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>

          {/* Pricing Summary Sidebar */}
          <div className="lg:col-span-2">
            <div
              className={`sticky top-28 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              style={{ transitionDelay: '300ms' }}
            >
              <div
                className="card-glass overflow-hidden rounded-2xl"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.05))',
                }}
              >
                {/* Card Header */}
                <div
                  className="px-6 py-5"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.1))',
                    borderBottom: '1px solid var(--border-default)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                        boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                      }}
                    >
                      <Clock3 className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Booking Summary
                    </h2>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {pricing.days > 0 ? (
                    <div className="space-y-5">
                      {/* Pricing Details */}
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--text-secondary)' }}>
                            ₹{labour.daily_rate} × {pricing.days}{' '}
                            {pricing.days === 1 ? 'day' : 'days'}
                          </span>
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            ₹{pricing.baseAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--text-secondary)' }}>Platform fee (5%)</span>
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            ₹{pricing.platformFee.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div
                        className="h-px w-full"
                        style={{
                          background:
                            'linear-gradient(90deg, transparent, var(--border-default), transparent)',
                        }}
                      ></div>

                      {/* Total */}
                      <div className="flex items-center justify-between">
                        <span
                          className="text-lg font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Total
                        </span>
                        <div
                          className="flex items-center text-3xl font-bold"
                          style={{ color: '#34d399' }}
                        >
                          <IndianRupee className="h-7 w-7" />
                          {pricing.total.toLocaleString()}
                        </div>
                      </div>

                      {/* Features */}
                      <div
                        className="space-y-3 rounded-xl p-4"
                        style={{ background: 'rgba(0, 0, 0, 0.2)' }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-6 w-6 items-center justify-center rounded-full"
                            style={{ background: 'rgba(16, 185, 129, 0.2)' }}
                          >
                            <CheckCircle className="h-3.5 w-3.5" style={{ color: '#34d399' }} />
                          </div>
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Secure payment
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-6 w-6 items-center justify-center rounded-full"
                            style={{ background: 'rgba(16, 185, 129, 0.2)' }}
                          >
                            <CheckCircle className="h-3.5 w-3.5" style={{ color: '#34d399' }} />
                          </div>
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Free cancellation
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-6 w-6 items-center justify-center rounded-full"
                            style={{ background: 'rgba(16, 185, 129, 0.2)' }}
                          >
                            <CheckCircle className="h-3.5 w-3.5" style={{ color: '#34d399' }} />
                          </div>
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            24/7 support
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-6 w-6 items-center justify-center rounded-full"
                            style={{ background: 'rgba(16, 185, 129, 0.2)' }}
                          >
                            <Shield className="h-3.5 w-3.5" style={{ color: '#34d399' }} />
                          </div>
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Insurance included
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <div
                        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))',
                          border: '1px solid var(--border-default)',
                        }}
                      >
                        <Calendar className="h-8 w-8" style={{ color: 'var(--text-tertiary)' }} />
                      </div>
                      <p style={{ color: 'var(--text-tertiary)' }}>Select dates to see pricing</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Trust Badge */}
              <div
                className="mt-4 flex items-center justify-center gap-2 rounded-xl p-3"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <Shield className="h-4 w-4" style={{ color: '#34d399' }} />
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  100% Safe & Secure Booking
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
