'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('mb-6', className)}>
      <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 transition-colors hover:text-emerald-400 focus:underline focus:outline-none"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </li>

        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            {item.href ? (
              <Link
                href={item.href}
                className="flex items-center gap-1 transition-colors hover:text-emerald-400 focus:underline focus:outline-none"
              >
                {item.icon && <span className="text-xs">{item.icon}</span>}
                <span
                  className={cn(
                    index === items.length - 1 && 'max-w-[200px] truncate text-slate-300'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            ) : (
              <span
                className={cn(
                  'flex items-center gap-1',
                  index === items.length - 1
                    ? 'max-w-[200px] truncate text-slate-300'
                    : 'text-slate-500'
                )}
                aria-current={index === items.length - 1 ? 'page' : undefined}
              >
                {item.icon && <span className="text-xs">{item.icon}</span>}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function createEquipmentBreadcrumb(
  category: { label: string; icon?: React.ReactNode } | null,
  equipmentName: string,
  equipmentId?: string
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: 'Equipment', href: '/equipment' }];

  if (category) {
    items.push({
      label: category.label,
      href: `/equipment?category=${category.label.toLowerCase()}`,
    });
  }

  items.push({ label: equipmentName });

  return items;
}

export function createBookingBreadcrumb(
  equipmentName: string,
  equipmentId: string
): BreadcrumbItem[] {
  return [
    { label: 'Equipment', href: '/equipment' },
    { label: equipmentName, href: `/equipment/${equipmentId}` },
    { label: 'Book' },
  ];
}

export function createDashboardBreadcrumb(
  role: 'renter' | 'provider' | 'admin',
  section?: string
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];

  if (role === 'renter') {
    items.push({ label: 'Dashboard', href: '/renter/dashboard' });
  } else if (role === 'provider') {
    items.push({ label: 'Dashboard', href: '/provider/dashboard' });
  } else if (role === 'admin') {
    items.push({ label: 'Admin', href: '/admin' });
  }

  if (section) {
    items.push({ label: section });
  }

  return items;
}

export function createUserBreadcrumb(userName: string): BreadcrumbItem[] {
  return [{ label: 'Profile', href: '/profile' }, { label: userName }];
}
