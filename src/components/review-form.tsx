'use client';

import { useState } from 'react';
import { Star, Camera } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MediaUpload } from '@/components/ui/media-upload';
import type { MediaFile } from '@/lib/types/media';
import { reviewService } from '@/lib/services';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  equipmentId: string;
  bookingId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  isOpen: boolean;
  existingReview?: {
    id: string;
    rating: number;
    vehicle_condition_rating?: number | null;
    fuel_efficiency_rating?: number | null;
    owner_communication_rating?: number | null;
    comment: string | null;
    images: string[] | null;
  };
}

export function ReviewForm({
  equipmentId,
  bookingId,
  onSuccess,
  onCancel,
  isOpen,
  existingReview,
}: ReviewFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [vehicleConditionRating, setVehicleConditionRating] = useState(
    existingReview?.vehicle_condition_rating || 0
  );
  const [fuelEfficiencyRating, setFuelEfficiencyRating] = useState(
    existingReview?.fuel_efficiency_rating || 0
  );
  const [ownerCommunicationRating, setOwnerCommunicationRating] = useState(
    existingReview?.owner_communication_rating || 0
  );
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [images, setImages] = useState<MediaFile[]>(
    existingReview?.images?.map((url) => ({
      id: url,
      type: 'image' as const,
      url,
      metadata: { duration: 0, width: 0, height: 0, size: 0, format: 'image/jpeg' },
    })) || []
  );

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    setSubmitting(true);
    try {
      if (existingReview) {
        await reviewService.update(existingReview.id, {
          rating,
          comment: comment || undefined,
        });
        toast.success('Review updated successfully!');
      } else {
        await reviewService.createReview({
          booking_id: bookingId,
          equipment_id: equipmentId,
          rating,
          comment: comment || undefined,
        });
        toast.success('Review submitted successfully!');
      }
      onSuccess?.();
    } catch (err) {
      console.error('Failed to submit review:', err);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({
    value,
    onChange,
    label,
    icon,
  }: {
    value: number;
    onChange: (rating: number) => void;
    label: string;
    icon: React.ReactNode;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center text-emerald-500">{icon}</div>
        <label className="text-sm font-medium text-slate-700">{label}</label>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className="p-1 transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existingReview ? 'Edit Review' : 'Rate Your Experience'}</DialogTitle>
          <DialogDescription>
            {existingReview
              ? 'Update your review for this equipment'
              : 'Share your experience to help others make informed decisions'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <StarRating
            value={rating}
            onChange={setRating}
            label="Overall Rating"
            icon={<Star className="h-full w-full" />}
          />

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="mb-4 text-sm font-semibold text-slate-700">Rate Specific Aspects</p>

            <StarRating
              value={vehicleConditionRating}
              onChange={setVehicleConditionRating}
              label="Equipment Condition"
              icon={<Camera className="h-full w-full" />}
            />

            <StarRating
              value={fuelEfficiencyRating}
              onChange={setFuelEfficiencyRating}
              label="Fuel Efficiency"
              icon={<Camera className="h-full w-full" />}
            />

            <StarRating
              value={ownerCommunicationRating}
              onChange={setOwnerCommunicationRating}
              label="Owner Communication"
              icon={<Camera className="h-full w-full" />}
            />
          </div>

          {/* Written Comment */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Your Review (optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your detailed experience with the equipment..."
              rows={4}
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Add Photos (optional)
            </label>
            <p className="mb-3 text-xs text-slate-500">
              Upload photos of the equipment in use to add credibility to your review
            </p>
            <MediaUpload
              value={images}
              onUploadComplete={setImages}
              maxImages={5}
              allowVideos={false}
              bucket="agri-serve"
              folder="agri-serve/reviews"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={submitting}
              disabled={submitting}
              className="flex-1 bg-emerald-600 text-white hover:bg-emerald-500"
            >
              {submitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
