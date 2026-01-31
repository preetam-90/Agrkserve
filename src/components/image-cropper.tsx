'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function ImageCropper({ image, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);

  const onCropCompleteCallback = useCallback((_: unknown, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = useCallback(async () => {
    if (!croppedAreaPixels) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageElement = new Image();
    imageElement.crossOrigin = 'anonymous';
    imageElement.src = image;

    await new Promise((resolve) => {
      imageElement.onload = resolve;
    });

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      imageElement,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
        }
      },
      'image/jpeg',
      0.9
    );
  }, [croppedAreaPixels, image, onCropComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4">
          <h3 className="text-lg font-semibold text-white">Crop Profile Picture</h3>
          <button
            onClick={onCancel}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cropper */}
        <div className="relative h-80 w-full bg-slate-950">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteCallback}
            style={{
              containerStyle: {
                background: '#020617',
              },
              cropAreaStyle: {
                border: '2px solid #10b981',
              },
            }}
          />
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center justify-center gap-4 border-b border-slate-800 p-4">
          <button
            onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <div className="w-32">
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-emerald-500"
            />
          </div>
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={createCroppedImage}
            className="bg-emerald-500 text-white hover:bg-emerald-600"
          >
            <Check className="mr-2 h-4 w-4" />
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
