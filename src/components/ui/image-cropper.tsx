'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Slider } from './slider';

interface ImageCropperProps {
  open: boolean;
  imageFile: File;
  onCrop: (croppedFile: File) => void;
  onCancel: () => void;
}

interface CroppedAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function ImageCropper({ open, imageFile, onCrop, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);
   
  const [imageUrl, _setImageUrl] = useState<string>(() => URL.createObjectURL(imageFile));
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback(
    (_croppedArea: unknown, croppedAreaPixels: CroppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedFile = await getCroppedImg(imageUrl, croppedAreaPixels, imageFile.name);
      URL.revokeObjectURL(imageUrl);
      onCrop(croppedFile);
    } catch (err) {
      console.error('Failed to crop image:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    URL.revokeObjectURL(imageUrl);
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Crop Image to Square</DialogTitle>
          <p className="text-sm text-gray-500">Adjust the crop area to create a square image</p>
        </DialogHeader>

        <div className="flex h-[600px] flex-col">
          {/* Cropper */}
          <div className="relative flex-1 bg-gray-900">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          {/* Zoom Control */}
          <div className="border-b border-t bg-gray-50 px-6 py-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Zoom</span>
              <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                min={1}
                max={3}
                step={0.1}
                className="flex-1"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 px-6 py-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isProcessing}>
              Cancel
            </Button>
            <Button type="button" onClick={createCroppedImage} disabled={isProcessing}>
              {isProcessing ? 'Cropping...' : 'Crop & Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CroppedAreaPixels,
  fileName: string
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Set canvas size to the crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        resolve(file);
      },
      'image/jpeg',
      0.95
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
}
