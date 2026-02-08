'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, MapPin, Reply } from 'lucide-react';
import { Button } from '@/components/ui';

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
    <div className="relative mb-3 animate-in slide-in-from-bottom-2 duration-200">
      <div className="group relative overflow-hidden rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-500/15 via-blue-500/8 to-transparent p-3.5 shadow-lg shadow-blue-500/10 backdrop-blur-sm transition-all hover:border-blue-500/60 hover:shadow-blue-500/20">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
        
        {/* Reply icon badge with pulse animation */}
        <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50">
          <Reply className="h-3.5 w-3.5 text-white animate-pulse" />
        </div>
        
        <div className="relative flex items-start gap-3">
          {/* Left accent bar */}
          <div className="absolute -left-3.5 top-0 h-full w-1 rounded-r-full bg-gradient-to-b from-blue-500 via-blue-400 to-blue-500" />
          
          {/* Reply icon */}
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/20 shadow-inner">
            <Reply className="h-4.5 w-4.5 text-blue-400" />
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-500/25 to-blue-600/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-300 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                Replying to
              </span>
              <p className="text-xs font-bold text-blue-200">
                {message.sender?.name || 'Unknown'}
              </p>
            </div>
            <p className="line-clamp-2 text-sm leading-relaxed text-gray-200">
              {getMessagePreview()}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 flex-shrink-0 rounded-full p-0 text-gray-400 transition-all hover:bg-red-500/20 hover:text-red-400 hover:scale-110 hover:rotate-90"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
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

// eslint-disable-next-line react-hooks/set-state-in-effect
        setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="relative mb-3 inline-block">
      <div className="relative h-32 w-32 overflow-hidden rounded-xl border border-[#333333]">
        <Image src={previewUrl} alt="Preview" fill className="object-cover" sizes="128px" />
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
