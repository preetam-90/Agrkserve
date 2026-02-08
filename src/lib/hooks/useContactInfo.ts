import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getContactInfo } from '@/lib/services/settings';

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
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000;

  const supabase = createClient();

  // Initial fetch
  const fetchContact = useCallback(async () => {
    try {
      console.log('🔄 Fetching contact info...');
      const info = await getContactInfo();
      console.log('✅ Contact info received:', {
        email: info.email,
        phone: info.phone,
        address: info.address,
        totalFields: Object.keys(info).length,
      });
      setContactInfo(info);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Error fetching contact info:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to real-time changes with retry logic
  const subscribeToChanges = useCallback(() => {
    // Clean up existing channel if any
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    console.log('📡 Setting up Realtime subscription for system_settings...');

    const channel = supabase
      .channel(`system_settings_changes_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings',
          filter: 'category=eq.contact',
        },
        (payload) => {
          console.log('🔔 Contact settings changed:', payload);
          console.log('🔄 Refetching contact info...');
          fetchContact();
        }
      )
      .subscribe((status, err) => {
        console.log('📡 Realtime subscription status:', status);

        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to contact settings changes');
          retryCountRef.current = 0;
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          const errorDetails = err instanceof Error ? err.message : 'Unknown channel error';
          console.error('❌ Realtime subscription error:', {
            status,
            error: errorDetails,
            retryCount: retryCountRef.current,
          });
          setError(`Realtime subscription failed: ${errorDetails}`);

          // Retry logic with exponential backoff
          if (retryCountRef.current < MAX_RETRIES) {
            retryCountRef.current += 1;
            const delay = RETRY_DELAY * Math.pow(2, retryCountRef.current - 1);
            console.log(
              `🔄 Retrying subscription in ${delay}ms (attempt ${retryCountRef.current}/${MAX_RETRIES})...`
            );

            retryTimeoutRef.current = setTimeout(() => {
              subscribeToChanges();
            }, delay);
          } else {
            console.error('❌ Max retry attempts reached. Realtime updates unavailable.');
            setError('Realtime updates unavailable after max retry attempts');
          }
        } else if (status === 'CLOSED') {
          console.log('🔌 Realtime subscription closed');
        }
      });

    channelRef.current = channel;
  }, [fetchContact, supabase]);

  useEffect(() => {
    fetchContact();
    subscribeToChanges();

    // Cleanup subscription on unmount
    return () => {
      console.log('🔌 Cleaning up Realtime subscription');
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [fetchContact, subscribeToChanges, supabase]);

  return { contactInfo, loading, error };
}
