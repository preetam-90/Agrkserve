'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Maximize2, X, ZoomIn, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

interface ProductImageGalleryProps {
  images?: string[] | null;
  videoUrl?: string | null;
  productName: string;
  className?: string;
}

export function ProductImageGallery({
  images,
  videoUrl,
  productName,
  className,
}: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  const mediaItems: MediaItem[] = [];
  if (images && images.length > 0) {
    mediaItems.push(...images.map((url) => ({ type: 'image' as const, url })));
  }
  if (videoUrl) {
    mediaItems.push({ type: 'video' as const, url: videoUrl });
  }

  const currentMedia = mediaItems[currentIndex];
  const hasMultipleMedia = mediaItems.length > 1;

  const handlePrev = useCallback(() => {
    if (mediaItems.length > 0) {
      setIsImageLoading(true);
      setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
    }
  }, [mediaItems.length]);

  const handleNext = useCallback(() => {
    if (mediaItems.length > 0) {
      setIsImageLoading(true);
      setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
    }
  }, [mediaItems.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') {
        setIsFullscreen(false);
        setIsZoomed(false);
      }
      if (e.key === 'f' || e.key === 'F') {
        setIsFullscreen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const toggleZoom = () => {
    if (currentMedia?.type === 'image') {
      setIsZoomed((prev) => !prev);
    }
  };

  const ImageSkeleton = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="text-sm text-slate-500">Loading image...</span>
      </div>
    </div>
  );

  if (mediaItems.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
          <div className="flex h-full w-full flex-col items-center justify-center gap-3">
            <div className="rounded-full bg-slate-800/50 p-6">
              <ZoomIn className="h-12 w-12 text-slate-600" />
            </div>
            <p className="text-slate-500">No images available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn('space-y-4', className)} ref={galleryRef}>
        <div
          className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="absolute -inset-4 z-0 bg-emerald-500/10 blur-3xl transition-opacity duration-500 group-hover:opacity-75" />

          <div
            className={cn(
              'relative z-10 h-full w-full',
              isZoomed && 'cursor-zoom-out',
              !isZoomed && currentMedia?.type === 'image' && 'cursor-zoom-in'
            )}
            onMouseMove={handleMouseMove}
            onClick={toggleZoom}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full w-full"
              >
                {isImageLoading && currentMedia?.type === 'image' && <ImageSkeleton />}

                {currentMedia?.type === 'image' ? (
                  <div className="relative h-full w-full overflow-hidden">
                    <Image
                      src={currentMedia.url}
                      alt={`${productName} - Image ${currentIndex + 1}`}
                      fill
                      className={cn(
                        'object-cover transition-transform duration-300',
                        isZoomed && 'scale-[2]',
                        isImageLoading && 'opacity-0'
                      )}
                      style={
                        isZoomed
                          ? {
                              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                            }
                          : undefined
                      }
                      priority={currentIndex === 0}
                      onLoad={() => setIsImageLoading(false)}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {!isZoomed && (
                      <div className="pointer-events-none absolute inset-0 hidden items-center justify-center bg-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:flex">
                        <div className="rounded-full bg-black/50 p-3 backdrop-blur-sm">
                          <ZoomIn className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative h-full w-full">
                    <video
                      src={currentMedia?.url}
                      controls
                      className="h-full w-full object-cover"
                      playsInline
                    />
                    <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                      <Play className="h-3 w-3 fill-white" />
                      Video
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {hasMultipleMedia && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white shadow-lg backdrop-blur-sm transition-all hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white shadow-lg backdrop-blur-sm transition-all hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              </>
            )}

            {hasMultipleMedia && (
              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-md">
                {currentIndex + 1} / {mediaItems.length}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreen(true);
              }}
              className="absolute right-4 top-4 z-20 rounded-full bg-black/60 p-2.5 text-white shadow-lg backdrop-blur-sm transition-all hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="View fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </motion.button>

            {hasMultipleMedia && (
              <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                {mediaItems.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsImageLoading(true);
                      setCurrentIndex(i);
                    }}
                    className={cn(
                      'h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500',
                      i === currentIndex
                        ? 'w-6 bg-emerald-500'
                        : 'w-2 bg-white/50 hover:bg-white/80'
                    )}
                    aria-label={`Go to image ${i + 1}`}
                    aria-current={i === currentIndex ? 'true' : 'false'}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {hasMultipleMedia && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="scrollbar-hide flex gap-3 overflow-x-auto pb-2"
            role="tablist"
            aria-label="Image thumbnails"
          >
            {mediaItems.map((media, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsImageLoading(true);
                  setCurrentIndex(i);
                }}
                className={cn(
                  'relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950',
                  i === currentIndex
                    ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] ring-2 ring-emerald-500/30'
                    : 'border-slate-700 opacity-60 hover:border-slate-500 hover:opacity-100'
                )}
                role="tab"
                aria-selected={i === currentIndex}
                aria-label={`View ${media.type === 'video' ? 'video' : `image ${i + 1}`}`}
              >
                {media.type === 'image' ? (
                  <Image
                    src={media.url}
                    alt={`Thumbnail ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="relative h-full w-full bg-slate-800">
                    <video src={media.url} className="h-full w-full object-cover" muted />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Play className="h-6 w-6 fill-white text-white" />
                    </div>
                  </div>
                )}
                {i === currentIndex && (
                  <div className="absolute inset-0 rounded-lg border-2 border-emerald-400" />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}

        <div className="hidden text-center text-xs text-slate-500 lg:block">
          Use <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono">←</kbd>{' '}
          <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono">→</kbd> to navigate{' '}
          <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono">F</kbd> for fullscreen
        </div>
      </div>

      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl"
            onClick={() => setIsFullscreen(false)}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute right-6 top-6 z-50 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Close fullscreen"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="absolute left-6 top-6 z-50 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white">
              {currentIndex + 1} / {mediaItems.length}
            </div>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-h-[90vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              {currentMedia?.type === 'image' ? (
                <Image
                  src={currentMedia.url}
                  alt={`${productName} - Fullscreen`}
                  width={1920}
                  height={1080}
                  className="max-h-[90vh] w-auto rounded-lg object-contain"
                  priority
                />
              ) : (
                <video
                  src={currentMedia?.url}
                  controls
                  autoPlay
                  className="max-h-[90vh] w-auto rounded-lg"
                />
              )}
            </motion.div>

            {hasMultipleMedia && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-6 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/10 p-4 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-6 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/10 p-4 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            {hasMultipleMedia && (
              <div className="absolute bottom-6 left-1/2 z-50 flex -translate-x-1/2 gap-2">
                {mediaItems.map((media, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(i);
                    }}
                    className={cn(
                      'h-16 w-16 overflow-hidden rounded-lg border-2 transition-all',
                      i === currentIndex
                        ? 'border-emerald-500 shadow-lg'
                        : 'border-white/20 opacity-60 hover:opacity-100'
                    )}
                  >
                    {media.type === 'image' ? (
                      <Image
                        src={media.url}
                        alt=""
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-800">
                        <Play className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
