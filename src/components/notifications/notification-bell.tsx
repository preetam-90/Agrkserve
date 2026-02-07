'use client';

import { Bell } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { useNotifications } from '@/lib/services/notifications/hooks';
import { NotificationPanel } from './notification-panel';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export function NotificationBell({
  className,
  variant = 'ghost',
  size = 'icon',
  showLabel = false,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { unreadCount, loading } = useNotifications();

  const hasUnread = unreadCount > 0;
  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when popup is open
  useEffect(() => {
    if (open) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        // Restore scroll position
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  // Calculate panel position
  const getPanelPosition = () => {
    if (!buttonRef.current) return {};

    const rect = buttonRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth < 640;

    if (isMobile) {
      // Mobile: center panel with padding
      return {
        top: `${rect.bottom + 12}px`,
        left: '1rem',
        right: '1rem',
        width: 'auto',
        maxHeight: 'calc(100vh - 120px)',
      };
    }

    // Desktop: align to right edge of button, taller height
    return {
      top: `${rect.bottom + 12}px`,
      right: `${window.innerWidth - rect.right}px`,
      width: '480px',
      maxHeight: 'calc(100vh - 120px)',
    };
  };

  return (
    <>
      <Button
        ref={buttonRef}
        variant={variant}
        size={size}
        onClick={() => setOpen(!open)}
        className={cn(
          'relative rounded-full transition-all duration-200',
          'hover:bg-primary/10 hover:text-primary',
          open && 'bg-primary/10 text-primary',
          className
        )}
        aria-label={`Notifications ${hasUnread ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={open}
      >
        <span className="relative flex items-center">
          <Bell className="h-5 w-5" />

          {/* Unread badge */}
          {hasUnread && !loading && (
            <span className="ring-background absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 px-1.5 text-[10px] font-bold text-white shadow-lg ring-2">
              {displayCount}
            </span>
          )}
        </span>

        {showLabel && <span className="ml-2 text-sm font-medium">Notifications</span>}
      </Button>

      {/* Portal for notification panel */}
      {mounted &&
        open &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className="animate-in fade-in-0 pointer-events-none fixed inset-0 z-40 bg-black/20 backdrop-blur-sm duration-200"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <div
              ref={panelRef}
              className="border-border/50 bg-background animate-in fade-in-0 zoom-in-95 pointer-events-auto fixed z-50 flex flex-col overflow-hidden rounded-2xl border shadow-2xl duration-200"
              style={getPanelPosition()}
            >
              <NotificationPanel onClose={() => setOpen(false)} />
            </div>
          </>,
          document.body
        )}
    </>
  );
}
