'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Download, Share2, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusIndicator, StatusType } from './StatusIndicator';
import { useState } from 'react';

export interface TransactionAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface TransactionDetails {
  referenceNumber: string;
  amount?: number;
  date: Date;
  additionalInfo?: Record<string, string>;
}

export type TransactionStatus = 'success' | 'failed' | 'pending' | 'cancelled';

export interface TransactionPageTemplateProps {
  status: TransactionStatus;
  title: string;
  description: string;
  transactionDetails: TransactionDetails;
  primaryAction: TransactionAction;
  secondaryAction?: TransactionAction;
  showDownloadOption?: boolean;
  showShareOption?: boolean;
  className?: string;
}

const statusMap: Record<TransactionStatus, StatusType> = {
  success: 'success',
  failed: 'error',
  pending: 'pending',
  cancelled: 'warning',
};

/**
 * TransactionPageTemplate Component
 * Template for payment and booking feedback pages
 * 
 * Features:
 * - Clear status indicator (icon + color)
 * - Transaction summary display
 * - Reference number for support
 * - Download/share options
 * - Next steps guidance
 */
export function TransactionPageTemplate({
  status,
  title,
  description,
  transactionDetails,
  primaryAction,
  secondaryAction,
  showDownloadOption = false,
  showShareOption = false,
  className,
}: TransactionPageTemplateProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handlePrimaryAction = () => {
    if (primaryAction.onClick) {
      primaryAction.onClick();
    } else if (primaryAction.href) {
      router.push(primaryAction.href);
    }
  };

  const handleSecondaryAction = () => {
    if (secondaryAction?.onClick) {
      secondaryAction.onClick();
    } else if (secondaryAction?.href) {
      router.push(secondaryAction.href);
    }
  };

  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(transactionDetails.referenceNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = () => {
    // TODO: Implement download receipt functionality
    console.log('Download receipt');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Transaction ${transactionDetails.referenceNumber}`,
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-4 py-8 md:py-12',
        className
      )}
    >
      {/* Status Indicator */}
      <div className="mb-6">
        <StatusIndicator
          status={statusMap[status]}
          size="lg"
          animated={status === 'pending'}
        />
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 max-w-2xl">
        {title}
      </h1>

      {/* Description */}
      <p className="text-base md:text-lg text-gray-600 mb-8 max-w-xl">
        {description}
      </p>

      {/* Transaction Details Card */}
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-6 mb-8 text-left">
        {/* Reference Number */}
        <div className="mb-4 pb-4 border-b border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-sm font-medium text-gray-900">
              {transactionDetails.referenceNumber}
            </p>
            <button
              onClick={handleCopyReference}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Copy transaction ID"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Amount */}
        {transactionDetails.amount !== undefined && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1">Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(transactionDetails.amount)}
            </p>
          </div>
        )}

        {/* Date */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Date & Time</p>
          <p className="text-sm font-medium text-gray-900">
            {formatDate(transactionDetails.date)}
          </p>
        </div>

        {/* Additional Info */}
        {transactionDetails.additionalInfo && (
          <div className="space-y-2">
            {Object.entries(transactionDetails.additionalInfo).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <p className="text-sm text-gray-500">{key}</p>
                <p className="text-sm font-medium text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Button
          onClick={handlePrimaryAction}
          size="lg"
          className="min-h-[44px] min-w-[140px] bg-green-600 hover:bg-green-700 text-white"
        >
          {primaryAction.label}
        </Button>

        {secondaryAction && (
          <Button
            onClick={handleSecondaryAction}
            variant="outline"
            size="lg"
            className="min-h-[44px] min-w-[140px]"
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>

      {/* Download/Share Options */}
      {(showDownloadOption || showShareOption) && (
        <div className="flex items-center gap-3">
          {showDownloadOption && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download Receipt</span>
            </button>
          )}

          {showShareOption && navigator.share && (
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
