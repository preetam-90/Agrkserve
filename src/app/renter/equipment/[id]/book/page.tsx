'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft,
  Calendar, 
  Clock, 
  MapPin, 
  AlertCircle,
  CheckCircle,
  Tractor,
  CreditCard,
  IndianRupee
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { 
  Button, 
  Card, 
  CardContent, 
  Input,
  Textarea,
  Spinner
} from '@/components/ui';
import { equipmentService, bookingService, paymentService } from '@/lib/services';
import { useAuthStore } from '@/lib/store';
import { Equipment } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function BookEquipmentPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuthStore();
  
  const equipmentId = params.id as string;
  
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    startTime: '08:00',
    endTime: '18:00',
    deliveryAddress: profile?.address || '',
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
      router.push(`/login?redirect=/renter/equipment/${equipmentId}/book`);
      return;
    }
    loadEquipment();
  }, [equipmentId, user]);

  useEffect(() => {
    calculatePricing();
  }, [formData.startDate, formData.endDate, equipment]);

  const loadEquipment = async () => {
    try {
      const data = await equipmentService.getEquipmentById(equipmentId);
      setEquipment(data);
      
      // Set default delivery address from profile
      if (profile?.address) {
        setFormData(prev => ({ ...prev, deliveryAddress: profile.address! }));
      }
    } catch (err) {
      console.error('Failed to load equipment:', err);
      toast.error('Failed to load equipment details');
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePricing = () => {
    if (!formData.startDate || !formData.endDate || !equipment) {
      setPricing({ days: 0, baseAmount: 0, platformFee: 0, total: 0 });
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    
    const baseAmount = days * equipment.price_per_day;
    const platformFee = Math.round(baseAmount * 0.05); // 5% platform fee
    const total = baseAmount + platformFee;

    setPricing({ days, baseAmount, platformFee, total });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    if (!formData.deliveryAddress) {
      toast.error('Please enter delivery address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !equipment) return;
    
    setIsSubmitting(true);
    try {
      // Create booking
      const booking = await bookingService.createBooking({
        equipment_id: equipment.id,
        start_date: formData.startDate,
        end_date: formData.endDate,
        start_time: formData.startTime,
        end_time: formData.endTime,
        delivery_address: formData.deliveryAddress,
        notes: formData.notes || undefined,
        total_amount: pricing.total,
        platform_fee: pricing.platformFee,
      });

      // Create payment order
      const paymentOrder = await paymentService.createOrder(booking.id, pricing.total);

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'AgriServe',
        description: `Booking for ${equipment.name}`,
        order_id: paymentOrder.order_id,
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            // Verify payment
            await paymentService.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            
            toast.success('Booking confirmed!');
            router.push(`/renter/bookings/${booking.id}?success=true`);
          } catch (err) {
            console.error('Payment verification failed:', err);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          contact: profile?.phone,
          email: profile?.email,
        },
        theme: {
          color: '#16a34a',
        },
      };

      // Load Razorpay script if not loaded
      const windowWithRazorpay = window as unknown as { Razorpay?: new (options: object) => { open: () => void } };
      if (!windowWithRazorpay.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          const razorpay = new windowWithRazorpay.Razorpay!(options);
          razorpay.open();
        };
        document.body.appendChild(script);
      } else {
        const razorpay = new windowWithRazorpay.Razorpay(options);
        razorpay.open();
      }
    } catch (err) {
      console.error('Failed to create booking:', err);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Equipment Not Found</h1>
          <Button asChild>
            <Link href="/renter/equipment">Browse Equipment</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Link 
          href={`/renter/equipment/${equipmentId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to equipment
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Book Equipment</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    Select Dates
                  </h2>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        min={today}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        min={formData.startDate || today}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pickup Time
                      </label>
                      <Input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Return Time
                      </label>
                      <Input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    Delivery Details
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Address <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        name="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={handleInputChange}
                        placeholder="Enter your farm/field address"
                        rows={3}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes
                      </label>
                      <Textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Any special requirements or instructions..."
                        rows={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                loading={isSubmitting}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Proceed to Payment
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
                
                {/* Equipment Preview */}
                <div className="flex gap-3 pb-4 border-b">
                  <div className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 relative overflow-hidden">
                    {equipment.images?.[0] ? (
                      <Image
                        src={equipment.images[0]}
                        alt={equipment.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Tractor className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{equipment.name}</p>
                    <p className="text-sm text-gray-500">{equipment.location_name}</p>
                    <p className="text-sm font-medium text-green-600">
                      {formatCurrency(equipment.price_per_day)}/day
                    </p>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="py-4 space-y-2">
                  {pricing.days > 0 ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {formatCurrency(equipment.price_per_day)} × {pricing.days} {pricing.days === 1 ? 'day' : 'days'}
                        </span>
                        <span>{formatCurrency(pricing.baseAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Platform fee (5%)</span>
                        <span>{formatCurrency(pricing.platformFee)}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 text-center">
                      Select dates to see pricing
                    </p>
                  )}
                </div>

                {/* Total */}
                {pricing.days > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold text-green-600">
                        {formatCurrency(pricing.total)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex gap-2 text-sm text-blue-800">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <p>
                      Payment is held securely until the booking is confirmed by the provider.
                    </p>
                  </div>
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
