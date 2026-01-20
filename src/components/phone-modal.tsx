'use client';

import { useState } from 'react';
import { X, Phone } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';

interface PhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (phoneNumber: string) => Promise<void>;
  isLoading?: boolean;
}

export function PhoneModal({ isOpen, onClose, onSubmit, isLoading }: PhoneModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const validatePhoneNumber = (phone: string): boolean => {
    // Indian phone number validation (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber) {
      setError('Phone number is required');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      await onSubmit(phoneNumber);
    } catch (err: any) {
      setError(err.message || 'Failed to save phone number');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-md mx-4 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Phone className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Phone Number Required</CardTitle>
          <CardDescription>
            Please provide your phone number to complete your profile
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 border border-gray-300 rounded-md bg-gray-50">
                  <span className="text-gray-700 font-medium">+91</span>
                </div>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhoneNumber(value);
                    setError('');
                  }}
                  placeholder="9876543210"
                  disabled={isLoading}
                  maxLength={10}
                  className="flex-1"
                />
              </div>
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              <p className="mt-1 text-xs text-gray-500">
                Enter your 10-digit mobile number
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Your phone number is required for booking notifications and communication with service providers.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isLoading}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
