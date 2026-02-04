'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  fallbackUrl?: string;
  label?: string;
  className?: string;
  variant?: 'default' | 'minimal' | 'floating';
}

export function BackButton({ 
  fallbackUrl = '/', 
  label = 'Back',
  className = '',
  variant = 'default'
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  const variants = {
    default: 'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer',
    minimal: 'inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-200 cursor-pointer',
    floating: 'fixed top-20 left-4 z-40 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-full shadow-lg hover:shadow-xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer'
  };

  return (
    <button
      onClick={handleBack}
      className={`${variants[variant]} ${className}`}
      aria-label={label}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
