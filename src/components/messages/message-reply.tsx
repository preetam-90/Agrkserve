'use client';

import { useEffect, useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ReplyPreviewProps {
  message: {
    id: string;
    content: string | null;
    sender?: { name: string | null } | null;
    message_type: string;
  };
  onCancel: () => void;
}

export function ReplyPreview({ message, onCancel }: ReplyPreviewProps) {
  const getMessagePreview = () => {
    if (message.message_type === 'image') return '📷 Photo';
    if (message.message_type === 'video') return '🎥 Video';
    if (message.message_type === 'gif') return '🎬 GIF';
    if (message.message_type === 'sticker') return '🎭 Sticker';
    if (message.message_type === 'location') return '📍 Location';
    return message.content || '';
  };

  return (
    <div className="mb-2 flex items-start gap-2 rounded-xl border-l-4 border-blue-500 bg-[#1a1a1a] p-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-blue-400">
          Replying to {message.sender?.name || 'Unknown'}
        </p>
        <p className="mt-0.5 line-clamp-2 text-sm text-gray-400">{getMessagePreview()}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="h-6 w-6 flex-shrink-0 rounded-full p-0 text-gray-500 hover:bg-[#2a2a2a] hover:text-gray-300"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Location sharing component
interface LocationShareProps {
  lat: number;
  lng: number;
  address?: string | null;
  onClick?: () => void;
}

export function LocationShare({ lat, lng, address, onClick }: LocationShareProps) {
  const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <a
      href={mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      className="group flex items-center gap-3 rounded-xl border border-[#333333] bg-[#1a1a1a] p-3 transition-all hover:border-blue-500/50 hover:bg-[#1f1f1f]"
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/20">
        <MapPin className="h-6 w-6 text-blue-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white">📍 Shared Location</p>
        {address && <p className="line-clamp-1 text-xs text-gray-500">{address}</p>}
        <p className="text-xs text-gray-600">
          {lat.toFixed(6)}, {lng.toFixed(6)}
        </p>
      </div>
    </a>
  );
}

// Image preview before sending
interface ImagePreviewProps {
  file: File;
  onRemove: () => void;
}

export function ImagePreviewBeforeSend({ file, onRemove }: ImagePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="relative mb-3 inline-block">
      <div className="relative h-32 w-32 overflow-hidden rounded-xl border border-[#333333]">
        <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
      </div>
      <button
        onClick={onRemove}
        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-transform hover:scale-110"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="mt-1 truncate text-xs text-gray-500">{file.name}</p>
    </div>
  );
}
