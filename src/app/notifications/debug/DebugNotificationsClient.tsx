'use client';

/* eslint-disable */

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface DebugInfo {
  isLoggedIn: boolean;
  userId: string | null;
  tablesExist: {
    notifications: boolean;
    notification_preferences: boolean;
  };
  notificationCount: number;
  error: string | null;
}

export default function NotificationDebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [checking, setChecking] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const supabase = createClient();

  const checkSystem = async () => {
    setChecking(true);

    // Check auth directly
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUser(user);

    const info: DebugInfo = {
      isLoggedIn: !!user,
      userId: user?.id || null,
      tablesExist: {
        notifications: false,
        notification_preferences: false,
      },
      notificationCount: 0,
      error: null,
    };

    try {
      // Check if notifications table exists
      const { error: notifError, count: notifCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true });

      if (!notifError) {
        info.tablesExist.notifications = true;
        info.notificationCount = notifCount || 0;
      } else if (notifError.message.includes('does not exist')) {
        info.error = 'Notifications table does not exist. Run the migration first.';
      } else {
        info.error = notifError.message;
      }

      // Check if preferences table exists
      const { error: prefError } = await supabase
        .from('notification_preferences')
        .select('*', { count: 'exact', head: true });

      if (!prefError) {
        info.tablesExist.notification_preferences = true;
      }
    } catch (err) {
      info.error = (err as Error).message;
    }

    setDebugInfo(info);
    setChecking(false);
  };

  const createSampleNotifications = async () => {
    if (!currentUser) {
      alert('You must be logged in to create sample notifications');
      return;
    }

    try {
      const sampleNotifications = [
        {
          user_id: currentUser.id,
          title: 'Welcome to AgriServe! 🎉',
          message:
            'Thank you for joining our platform. Start by listing your equipment or browsing available rentals.',
          category: 'system',
          event_type: 'system.welcome',
          priority: 'normal',
          action_url: '/dashboard',
          action_label: 'Go to Dashboard',
        },
        {
          user_id: currentUser.id,
          title: 'New Booking Request',
          message: 'You have received a new booking request for your Tractor JD 5050.',
          category: 'booking',
          event_type: 'booking.new',
          priority: 'high',
          action_url: '/provider/bookings',
          action_label: 'View Request',
        },
        {
          user_id: currentUser.id,
          title: 'Payment Received 💰',
          message: 'You received ₹5,000 for the booking of your equipment.',
          category: 'payment',
          event_type: 'payment.received',
          priority: 'normal',
          action_url: '/provider/earnings',
          action_label: 'View Earnings',
        },
      ];

      const { error } = await supabase.from('notifications').insert(sampleNotifications);

      if (error) {
        alert('Error creating notifications: ' + error.message);
      } else {
        alert('Created 3 sample notifications!');
        checkSystem();
      }
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    }
  };

  useEffect(() => {
    checkSystem();
  }, []);

  if (checking && !debugInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-gray-600">Checking notification system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Notification System Debug</h1>
          <button
            className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
            onClick={checkSystem}
            disabled={checking}
          >
            <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Authentication Status */}
          <div>
            <h3 className="mb-2 font-semibold">Authentication</h3>
            <div className="flex items-center gap-2">
              {debugInfo?.isLoggedIn ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Logged in as: {debugInfo.userId}</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span>Not logged in</span>
                </>
              )}
            </div>
          </div>

          {/* Tables Status */}
          <div>
            <h3 className="mb-2 font-semibold">Database Tables</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {debugInfo?.tablesExist.notifications ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>notifications table exists</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span>notifications table MISSING</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {debugInfo?.tablesExist.notification_preferences ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>notification_preferences table exists</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span>notification_preferences table MISSING</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Notification Count */}
          <div>
            <h3 className="mb-2 font-semibold">Notifications</h3>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <span>Total notifications: {debugInfo?.notificationCount || 0}</span>
            </div>
          </div>

          {/* Error Display */}
          {debugInfo?.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="mb-2 font-semibold text-red-900">Error</h3>
              <p className="text-red-700">{debugInfo.error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Actions</h3>

            {!debugInfo?.tablesExist.notifications && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <p className="mb-2 text-yellow-900">
                  <strong>Database tables are missing!</strong>
                </p>
                <p className="mb-3 text-sm text-yellow-700">
                  You need to run the migration script. Go to your Supabase Dashboard → SQL Editor
                  and paste the content from:
                </p>
                <code className="block rounded bg-yellow-100 p-2 text-sm">
                  supabase/migrations/011_notification_system.sql
                </code>
              </div>
            )}

            {debugInfo?.tablesExist.notifications && debugInfo.isLoggedIn && (
              <button
                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                onClick={createSampleNotifications}
              >
                Create Sample Notifications
              </button>
            )}

            {!debugInfo?.isLoggedIn && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-blue-900">
                  Please{' '}
                  <a href="/login" className="font-medium underline">
                    log in
                  </a>{' '}
                  to test notifications.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
