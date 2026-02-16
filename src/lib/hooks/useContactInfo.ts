import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { clearSettingsCache, getContactInfo } from '@/lib/services/settings';

const supabase = createClient();
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 2000;

function extractRealtimeErrorDetails(err: unknown): string {
  if (!err) return 'No error details provided';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;

  try {
    const serialized = JSON.stringify(err);
    return serialized && serialized !== '{}' ? serialized : 'No error details provided';
  } catch {
    return String(err);
  }
}

/**
 * Hook to get contact information with real-time updates
 * Automatically updates when settings change in the database
 */
export function useContactInfo() {
  const [contactInfo, setContactInfo] = useState({
    email: 'support@agriServe.com',
    emailSecondary: 'info@agriServe.com',
    phone: '+1-555-0123',
    phoneSecondary: '+1-555-0124',
    whatsapp: '+1-555-0123',
    address: 'Loading...',
    social: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: '',
      tiktok: '',
      pinterest: '',
    },
    messaging: {
      telegram: '',
      discord: '',
      slack: '',
    },
    hours: {
      weekday: 'Monday - Friday: 9:00 AM - 6:00 PM',
      saturday: 'Saturday: 10:00 AM - 4:00 PM',
      sunday: 'Sunday: Closed',
      timezone: 'America/New_York',
    },
    website: 'https://agriServe.com',
    supportPortal: 'https://support.agriServe.com',
    helpCenter: 'https://help.agriServe.com',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(false);

  const clearRetryTimer = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // Initial fetch
  const fetchContact = useCallback(async () => {
    try {
      const info = await getContactInfo();
      if (!isMountedRef.current) return;
      setContactInfo(info);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (!isMountedRef.current) return;
      console.error('❌ Error fetching contact info:', errorMessage);
      setError(errorMessage);
    } finally {
      if (!isMountedRef.current) return;
      setLoading(false);
    }
  }, []);

  // Subscribe to real-time changes with retry logic
  const subscribeToChanges = useCallback(() => {
    clearRetryTimer();

    // Clean up existing channel if any
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel(`system_settings_changes_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings',
          filter: 'category=eq.contact',
        },
        () => {
          clearSettingsCache();
          void fetchContact();
        }
      )
      .subscribe((status, err) => {
        if (!isMountedRef.current) return;

        if (status === 'SUBSCRIBED') {
          retryCountRef.current = 0;
          setError(null);
          return;
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          const errorDetails = extractRealtimeErrorDetails(err);
          const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
          const message = isOffline ? 'Browser is offline' : errorDetails;

          if (retryCountRef.current < MAX_RETRIES) {
            retryCountRef.current += 1;
            const delay = BASE_RETRY_DELAY_MS * Math.pow(2, retryCountRef.current - 1);

            console.warn('⚠️ Realtime subscription interrupted. Retrying...', {
              status,
              error: message,
              retryCount: retryCountRef.current,
              maxRetries: MAX_RETRIES,
              nextRetryInMs: delay,
            });

            clearRetryTimer();
            retryTimeoutRef.current = setTimeout(() => {
              if (isMountedRef.current) {
                subscribeToChanges();
              }
            }, delay);
          } else {
            console.error('❌ Realtime subscription unavailable after retries:', {
              status,
              error: message,
            });
            setError('Realtime updates are temporarily unavailable.');
          }

          return;
        }

        if (status === 'CLOSED') {
          if (retryCountRef.current < MAX_RETRIES) {
            retryCountRef.current += 1;
            const delay = BASE_RETRY_DELAY_MS * Math.pow(2, retryCountRef.current - 1);

            clearRetryTimer();
            retryTimeoutRef.current = setTimeout(() => {
              if (isMountedRef.current) {
                subscribeToChanges();
              }
            }, delay);
          } else {
            console.error('❌ Realtime channel closed repeatedly:', {
              status,
              retryCount: retryCountRef.current,
            });
            setError('Realtime updates are temporarily unavailable.');
          }
        } else {
          console.warn('⚠️ Unhandled realtime subscription status:', {
            status,
            error: extractRealtimeErrorDetails(err),
            retryCount: retryCountRef.current,
          });
        }
      });

    channelRef.current = channel;
  }, [clearRetryTimer, fetchContact]);

  useEffect(() => {
    isMountedRef.current = true;
    void fetchContact();
    subscribeToChanges();

    // Cleanup subscription on unmount
    return () => {
      isMountedRef.current = false;
      clearRetryTimer();
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [clearRetryTimer, fetchContact, subscribeToChanges]);

  return { contactInfo, loading, error };
}
