'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/utils/media-compression';
import type { DirectMessage } from '@/lib/types';

interface MediaViewerProps {
  messages: DirectMessage[];
  currentMessageId: string;
  onClose: () => void;
  onNavigate: (messageId: string) => void;
}

export function MediaViewer({ messages, currentMessageId, onClose, onNavigate }: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [rotation, setRotation] = useState(0);

  // Filter only media messages
  const mediaMessages = messages.filter((m) => m.message_type !== 'text' && m.media_url);

  // Find current index
  useEffect(() => {
    const index = mediaMessages.findIndex((m) => m.id === currentMessageId);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [currentMessageId, mediaMessages]);

  const currentMessage = mediaMessages[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < mediaMessages.length - 1;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (hasPrev) navigatePrev();
          break;
        case 'ArrowRight':
          if (hasNext) navigateNext();
          break;
        case ' ':
          e.preventDefault();
          setIsZoomed(!isZoomed);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasPrev, hasNext, isZoomed, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const navigatePrev = () => {
    if (hasPrev) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setIsZoomed(false);
      setRotation(0);
      setIsLoading(true);
      onNavigate(mediaMessages[newIndex].id);
    }
  };

  const navigateNext = () => {
    if (hasNext) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setIsZoomed(false);
      setRotation(0);
      setIsLoading(true);
      onNavigate(mediaMessages[newIndex].id);
    }
  };

  const handleDownload = async () => {
    if (!currentMessage?.media_url) return;

    try {
      const response = await fetch(currentMessage.media_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `media-${currentMessage.id}.${currentMessage.message_type === 'image' ? 'jpg' : 'mp4'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download:', error);
      // Fallback: open in new tab
      window.open(currentMessage.media_url, '_blank');
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  if (!currentMessage) return null;

  const isImage = currentMessage.message_type === 'image';
  const isVideo = currentMessage.message_type === 'video';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute right-4 top-4 z-50 text-white hover:bg-white/20"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Navigation - Previous */}
      {hasPrev && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigatePrev();
          }}
          className="absolute left-4 top-1/2 z-50 -translate-y-1/2 text-white hover:bg-white/20"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      )}

      {/* Navigation - Next */}
      {hasNext && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigateNext();
          }}
          className="absolute right-4 top-1/2 z-50 -translate-y-1/2 text-white hover:bg-white/20"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      )}

      {/* Media container */}
      <div
        className="relative flex max-h-[90vh] max-w-[90vw] items-center justify-center"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        )}

        {/* Image */}
        {isImage && currentMessage.media_url && (
          <div
            className={cn(
              'relative cursor-zoom-in transition-transform duration-300',
              isZoomed && 'scale-150 cursor-zoom-out'
            )}
            style={{ transform: `rotate(${rotation}deg)` }}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <Image
              src={currentMessage.media_url}
              alt="Full size media"
              width={1200}
              height={800}
              className="max-h-[85vh] max-w-[85vw] object-contain"
              unoptimized
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          </div>
        )}

        {/* Video */}
        {isVideo && currentMessage.media_url && (
          <div className="relative">
            <video
              src={currentMessage.media_url}
              className="max-h-[85vh] max-w-[85vw] rounded-lg"
              controls
              autoPlay
              onLoadedData={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
            {currentMessage.media_duration_seconds && (
              <div className="absolute bottom-4 right-4 rounded bg-black/70 px-3 py-1.5 text-sm text-white">
                {formatDuration(currentMessage.media_duration_seconds)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div
        className={cn(
          'absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/50 px-4 py-2 backdrop-blur-sm transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Counter */}
        <span className="mr-2 text-sm text-white/80">
          {currentIndex + 1} / {mediaMessages.length}
        </span>

        {/* Image controls */}
        {isImage && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsZoomed(!isZoomed)}
              className="text-white hover:bg-white/20"
              title={isZoomed ? 'Zoom out' : 'Zoom in'}
            >
              {isZoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRotate}
              className="text-white hover:bg-white/20"
              title="Rotate"
            >
              <RotateCw className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Download */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          className="text-white hover:bg-white/20"
          title="Download"
        >
          <Download className="h-5 w-5" />
        </Button>
      </div>

      {/* Caption (if any) */}
      {currentMessage.content && (
        <div className="absolute bottom-20 left-1/2 z-50 max-w-lg -translate-x-1/2 rounded-lg bg-black/50 px-4 py-2 text-center text-sm text-white backdrop-blur-sm">
          {currentMessage.content}
        </div>
      )}
    </div>
  );
}
