'use client';

import { useState } from 'react';
import { Phone } from 'lucide-react';
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui';

interface PhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (phoneNumber: string) => Promise<void>;
  isLoading?: boolean;
}

function PhoneModal({ isOpen, onClose, onSubmit, isLoading }: PhoneModalProps) {
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save phone number');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <Card className="relative mx-4 w-full max-w-md shadow-2xl">
        <CardHeader className="pb-4 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
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
              <label className="mb-1 block text-sm font-medium text-gray-700">Phone Number *</label>
              <div className="flex gap-2">
                <div className="flex items-center rounded-md border border-gray-300 bg-gray-50 px-3">
                  <span className="font-medium text-gray-700">+91</span>
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
              <p className="mt-1 text-xs text-gray-500">Enter your 10-digit mobile number</p>
            </div>

            <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Your phone number is required for booking notifications and
                communication with service providers.
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
              <Button type="submit" loading={isLoading} className="flex-1">
                Continue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
