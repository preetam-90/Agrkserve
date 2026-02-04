import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    const fetchContact = async () => {
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
      } catch (error) {
        console.error('❌ Error fetching contact info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContact();

    // Subscribe to real-time changes
    console.log('📡 Setting up Realtime subscription for system_settings...');
    const channel = supabase
      .channel('system_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'system_settings',
          filter: 'category=eq.contact',
        },
        (payload) => {
          console.log('🔔 Contact settings changed:', payload);
          console.log('🔄 Refetching contact info...');
          // Refetch contact info when settings change
          fetchContact();
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to contact settings changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime subscription error');
        }
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('🔌 Cleaning up Realtime subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  return { contactInfo, loading };
}
