'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

interface OptimizedHeroMediaProps {
  videoSrc: string;
  posterSrc: string;
  posterBlurSrc: string;
  fallbackImageSrc?: string;
  className?: string;
}

type ConnectionInfo = {
  effectiveType?: string;
  saveData?: boolean;
  addEventListener?: (type: 'change', listener: () => void) => void;
  removeEventListener?: (type: 'change', listener: () => void) => void;
};

function isSlowNetwork(connection?: ConnectionInfo): boolean {
  if (!connection) {
    return false;
  }

  return (
    connection.saveData === true ||
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g' ||
    connection.effectiveType === '3g'
  );
}

/**
 * Optimized Hero Media Component
 * 
 * Implements Apple/Netflix-style progressive loading:
 * 1. Instant blurred placeholder (20px blurred version)
 * 2. Sharp poster image
 * 3. Video when connection allows
 * 
 * Performance budget: < 50KB initial, video loads after interaction or delay
 */
export function OptimizedHeroMedia({
  videoSrc,
  posterSrc,
  posterBlurSrc,
  fallbackImageSrc,
  className = '',
}: OptimizedHeroMediaProps) {
  const [phase, setPhase] = useState<'blur' | 'poster' | 'video'>('blur');
  const [videoError, setVideoError] = useState(false);
  const [isSlowConnection, setIsSlowConnection] = useState(() => {
    if (typeof navigator === 'undefined') {
      return false;
    }

    const connection = (navigator as Navigator & { connection?: ConnectionInfo }).connection;
    return isSlowNetwork(connection);
  });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const videoRef = useRef<HTMLVideoElement>(null);

  // Detect connection quality
  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    motionQuery.addEventListener('change', handleMotionChange);

    const connection = (navigator as Navigator & { connection?: ConnectionInfo }).connection;
    const handleConnectionChange = () => {
      setIsSlowConnection(isSlowNetwork(connection));
    };
    connection?.addEventListener?.('change', handleConnectionChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      connection?.removeEventListener?.('change', handleConnectionChange);
    };
  }, []);

  // Progressive loading timeline
  useEffect(() => {
    // Immediately start loading the sharp poster
    const posterTimer = setTimeout(() => {
      setPhase('poster');
    }, 100);

    // Only attempt video on good connections and no reduced motion
    if (!prefersReducedMotion && !isSlowConnection) {
      // Wait for poster to be visible before loading video
      const videoTimer = setTimeout(() => {
        setPhase('video');
      }, 1500);

      return () => {
        clearTimeout(posterTimer);
        clearTimeout(videoTimer);
      };
    }

    return () => clearTimeout(posterTimer);
  }, [prefersReducedMotion, isSlowConnection]);

  const handleVideoError = useCallback(() => {
    setVideoError(true);
    setPhase('poster');
  }, []);

  const handleVideoCanPlay = useCallback(() => {
    // Only auto-play if we're in video phase
    if (videoRef.current && phase === 'video') {
      videoRef.current.play().catch(() => {
        // Autoplay was prevented, stay on poster
        setPhase('poster');
      });
    }
  }, [phase]);

  return (
    <div className={`absolute inset-0 overflow-hidden bg-[#030705] ${className}`}>
      {/* Phase 1: Blurred placeholder (instant, ~2KB) */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          phase === 'blur' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ zIndex: 1 }}
      >
        {posterBlurSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterBlurSrc}
            alt=""
            className="h-full w-full object-cover blur-xl scale-110"
            style={{ filter: 'blur(20px)' }}
          />
        )}
        {/* Fallback gradient if no blur image */}
        {!posterBlurSrc && (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-black to-cyan-950" />
        )}
      </div>

      {/* Phase 2: Sharp poster image (loads after ~100ms) */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          phase === 'poster' || (phase === 'video' && videoError) ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ zIndex: 2 }}
      >
        {posterSrc && (
          <Image
            src={posterSrc}
            alt="AgriServe - India's Farm Equipment Marketplace"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        )}
        {/* Fallback gradient if no poster */}
        {!posterSrc && (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/50 via-black to-cyan-950/50" />
        )}
      </div>

      {/* Phase 3: Video (loads after 1.5s on good connections) */}
      {!prefersReducedMotion && !isSlowConnection && (
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            phase === 'video' && !videoError ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ zIndex: 3 }}
        >
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            muted
            loop
            playsInline
            preload="metadata"
            poster={posterSrc}
            onError={handleVideoError}
            onCanPlay={handleVideoCanPlay}
          >
            {/* MP4 first for Safari compatibility */}
            {videoSrc.endsWith('.webm') && (
              <source src={videoSrc.replace('.webm', '.mp4')} type="video/mp4" />
            )}
            <source src={videoSrc} type={videoSrc.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
          </video>
        </div>
      )}

      {/* Fallback static image for very slow connections */}
      {fallbackImageSrc && isSlowConnection && (
        <div className="absolute inset-0" style={{ zIndex: 4 }}>
          <Image
            src={fallbackImageSrc}
            alt="AgriServe - India's Farm Equipment Marketplace"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
      )}

      {/* Gradient overlay for text readability */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(3,7,5,0.2) 0%, rgba(3,7,5,0.5) 50%, rgba(3,7,5,0.95) 100%)',
          zIndex: 10,
        }}
      />

      {/* Noise texture for premium feel */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          zIndex: 11,
        }}
      />
    </div>
  );
}
