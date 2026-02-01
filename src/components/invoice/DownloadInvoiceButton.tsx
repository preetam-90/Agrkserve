'use client';

import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Download, Loader2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { InvoicePDF } from './InvoicePDF';
import type { Booking, Equipment, UserProfile } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DownloadInvoiceButtonProps {
  booking: Booking & {
    equipment?: Equipment;
    renter?: UserProfile;
    provider?: UserProfile;
  };
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  onError?: (error: Error) => void;
}

function generateInvoiceFilename(bookingId: string): string {
  const date = new Date().toISOString().split('T')[0];
  const shortId = bookingId.slice(0, 8).toUpperCase();
  return `AgriServe-Invoice-${shortId}-${date}.pdf`;
}

const variantStyles = {
  primary: {
    base: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30',
    icon: 'text-white',
    loadingSpinner: 'text-white',
  },
  secondary: {
    base: 'bg-[#262626] text-white hover:bg-[#333333] border border-[#262626]',
    icon: 'text-emerald-400',
    loadingSpinner: 'text-emerald-400',
  },
  outline: {
    base: 'border border-[#262626] bg-[#1a1a1a] hover:bg-[#262626] text-white',
    icon: 'text-emerald-400',
    loadingSpinner: 'text-emerald-400',
  },
  ghost: {
    base: 'hover:bg-white/10 text-white',
    icon: 'text-emerald-400',
    loadingSpinner: 'text-emerald-400',
  },
};

const sizeStyles = {
  sm: {
    button: 'h-8 px-3 text-xs gap-1.5',
    icon: 'h-3.5 w-3.5',
  },
  md: {
    button: 'h-10 px-4 text-sm gap-2',
    icon: 'h-4 w-4',
  },
  lg: {
    button: 'h-12 px-6 text-base gap-2.5',
    icon: 'h-5 w-5',
  },
};

export function DownloadInvoiceButton({
  booking,
  className,
  variant = 'primary',
  size = 'md',
  onDownloadStart,
  onDownloadComplete,
  onError,
}: DownloadInvoiceButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const filename = generateInvoiceFilename(booking.id);
  const styles = variantStyles[variant];
  const sizeConfig = sizeStyles[size];

  const handleDownload = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isLoading) return;

      setIsLoading(true);
      setHasError(false);

      try {
        onDownloadStart?.();

        const blob = await pdf(<InvoicePDF booking={booking} />).toBlob();
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        onDownloadComplete?.();
      } catch (error) {
        console.error('Failed to generate invoice:', error);
        setHasError(true);
        onError?.(error instanceof Error ? error : new Error('Failed to generate invoice'));
      } finally {
        setIsLoading(false);
      }
    },
    [booking, filename, isLoading, onDownloadComplete, onDownloadStart, onError]
  );

  const handleRetry = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHasError(false);
  }, []);

  if (hasError) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleRetry}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
          'border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20',
          sizeConfig.button,
          className
        )}
      >
        <FileText className={cn(sizeConfig.icon, 'text-red-400')} />
        <span>Try Again</span>
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleDownload}
      disabled={isLoading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        styles.base,
        sizeConfig.button,
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className={cn('animate-spin', sizeConfig.icon, styles.loadingSpinner)} />
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <Download className={cn(sizeConfig.icon, styles.icon)} />
          <span>Download Invoice</span>
        </>
      )}
    </motion.button>
  );
}

export default DownloadInvoiceButton;
export type { DownloadInvoiceButtonProps };
