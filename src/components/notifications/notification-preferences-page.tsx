'use client';

import { useState } from 'react';
import { useNotificationPreferences } from '@/lib/services/notifications/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, MessageSquare, Moon, RefreshCw, Loader2, CheckCircle, Smartphone, Clock, Zap, Shield, Volume2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const PREFERENCE_LABELS: Record<string, { label: string; description: string; icon: any }> = {
  booking_notifications: {
    label: 'Booking Updates',
    description: 'Get notified about booking status changes and confirmations',
    icon: Bell,
  },
  message_notifications: {
    label: 'Messages',
    description: 'Receive instant notifications for new messages and replies',
    icon: MessageSquare,
  },
  payment_notifications: {
    label: 'Payment Reminders',
    description: 'Stay informed about upcoming and overdue payments',
    icon: Zap,
  },
  review_notifications: {
    label: 'Reviews & Ratings',
    description: 'Get notified when someone leaves a review for your services',
    icon: Shield,
  },
};

export function NotificationPreferencesPage() {
  const { preferences, loading, updatePreferences, resetToDefaults } = useNotificationPreferences();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (loading || !preferences) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#1E293B] border-t-[#22C55E]"></div>
            <Bell className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-[#22C55E]" />
          </div>
          <p className="text-sm text-[#64748B]">Loading preferences...</p>
        </div>
      </div>
    );
  }

  const handleToggle = async (field: keyof typeof preferences, value: boolean) => {
    setSaving(true);
    setSaved(false);

    try {
      await updatePreferences({ [field]: value });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to update preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (updates: Partial<typeof preferences>) => {
    setSaving(true);
    setSaved(false);

    try {
      await updatePreferences(updates);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to update preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset all notification preferences to defaults?')) {
      setSaving(true);
      try {
        await resetToDefaults();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        console.error('Failed to reset preferences:', err);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] px-4 py-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-[#22C55E]/10 p-3">
                  <Bell className="h-6 w-6 text-[#22C55E]" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-[#F8FAFC]">
                    Notification Preferences
                  </h1>
                  <p className="mt-1 text-[#94A3B8]">
                    Customize how and when you receive notifications
                  </p>
                </div>
              </div>
            </div>

            {saved && (
              <div className="flex items-center gap-2 rounded-full bg-[#22C55E]/10 px-4 py-2 text-[#22C55E]">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-semibold">Saved Successfully</span>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-[#1E293B] bg-[#0F172A]/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[#DBEAFE]/10 p-2">
                    <Bell className="h-4 w-4 text-[#60A5FA]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B]">Active Channels</p>
                    <p className="text-lg font-bold text-[#F8FAFC]">
                      {[preferences.in_app_enabled, preferences.email_enabled].filter(Boolean).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#1E293B] bg-[#0F172A]/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[#FEF3C7]/10 p-2">
                    <Volume2 className="h-4 w-4 text-[#FCD34D]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B]">Categories</p>
                    <p className="text-lg font-bold text-[#F8FAFC]">
                      {Object.keys(PREFERENCE_LABELS).filter(
                        (key) => preferences[key as keyof typeof preferences]
                      ).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#1E293B] bg-[#0F172A]/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[#E0E7FF]/10 p-2">
                    <Moon className="h-4 w-4 text-[#818CF8]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B]">Quiet Hours</p>
                    <p className="text-lg font-bold text-[#F8FAFC]">
                      {preferences.quiet_hours_enabled ? 'On' : 'Off'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Notification Categories */}
        <Card className="border-[#1E293B] bg-[#0F172A]/80 backdrop-blur-sm transition-all duration-200 hover:border-[#22C55E]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
              <div className="rounded-full bg-[#22C55E]/10 p-2">
                <Bell className="h-5 w-5 text-[#22C55E]" />
              </div>
              Notification Categories
            </CardTitle>
            <CardDescription className="text-[#94A3B8]">
              Choose which types of notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(PREFERENCE_LABELS).map(([key, { label, description, icon: Icon }]) => (
              <div
                key={key}
                className="group flex items-start justify-between gap-4 rounded-lg border border-[#1E293B] bg-[#1E293B]/30 p-4 transition-all duration-200 hover:border-[#22C55E]/30 hover:bg-[#1E293B]/50"
              >
                <div className="flex flex-1 items-start gap-3">
                  <div className="rounded-full bg-[#22C55E]/10 p-2 transition-colors group-hover:bg-[#22C55E]/20">
                    <Icon className="h-4 w-4 text-[#22C55E]" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label htmlFor={key} className="cursor-pointer text-base font-semibold text-[#F8FAFC]">
                      {label}
                    </Label>
                    <p className="text-sm text-[#94A3B8]">{description}</p>
                  </div>
                </div>
                <Switch
                  id={key}
                  checked={preferences[key as keyof typeof preferences] as boolean}
                  onCheckedChange={(checked) =>
                    handleToggle(key as keyof typeof preferences, checked)
                  }
                  disabled={saving}
                  className="data-[state=checked]:bg-[#22C55E]"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Delivery Channels */}
        <Card className="border-[#1E293B] bg-[#0F172A]/80 backdrop-blur-sm transition-all duration-200 hover:border-[#22C55E]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
              <div className="rounded-full bg-[#60A5FA]/10 p-2">
                <Mail className="h-5 w-5 text-[#60A5FA]" />
              </div>
              Delivery Channels
            </CardTitle>
            <CardDescription className="text-[#94A3B8]">
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="group flex items-start justify-between gap-4 rounded-lg border border-[#1E293B] bg-[#1E293B]/30 p-4 transition-all duration-200 hover:border-[#22C55E]/30 hover:bg-[#1E293B]/50">
              <div className="flex flex-1 items-start gap-3">
                <div className="rounded-full bg-[#60A5FA]/10 p-2 transition-colors group-hover:bg-[#60A5FA]/20">
                  <Bell className="h-4 w-4 text-[#60A5FA]" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="in_app_enabled" className="cursor-pointer text-base font-semibold text-[#F8FAFC]">
                    In-App Notifications
                  </Label>
                  <p className="text-sm text-[#94A3B8]">
                    Show notifications in the notification bell
                  </p>
                </div>
              </div>
              <Switch
                id="in_app_enabled"
                checked={preferences.in_app_enabled}
                onCheckedChange={(checked) => handleToggle('in_app_enabled', checked)}
                disabled={saving}
                className="data-[state=checked]:bg-[#22C55E]"
              />
            </div>

            <div className="group flex items-start justify-between gap-4 rounded-lg border border-[#1E293B] bg-[#1E293B]/30 p-4 transition-all duration-200 hover:border-[#22C55E]/30 hover:bg-[#1E293B]/50">
              <div className="flex flex-1 items-start gap-3">
                <div className="rounded-full bg-[#60A5FA]/10 p-2 transition-colors group-hover:bg-[#60A5FA]/20">
                  <Mail className="h-4 w-4 text-[#60A5FA]" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="email_enabled" className="cursor-pointer text-base font-semibold text-[#F8FAFC]">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-[#94A3B8]">Receive notifications via email</p>
                </div>
              </div>
              <Switch
                id="email_enabled"
                checked={preferences.email_enabled}
                onCheckedChange={(checked) => handleToggle('email_enabled', checked)}
                disabled={saving}
                className="data-[state=checked]:bg-[#22C55E]"
              />
            </div>

            <div className="group flex items-start justify-between gap-4 rounded-lg border border-[#1E293B] bg-[#1E293B]/30 p-4 opacity-60">
              <div className="flex flex-1 items-start gap-3">
                <div className="rounded-full bg-[#64748B]/10 p-2">
                  <Smartphone className="h-4 w-4 text-[#64748B]" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="sms_enabled" className="text-base font-semibold text-[#94A3B8]">
                    SMS Notifications
                    <span className="ml-2 rounded-full bg-[#FCD34D]/20 px-2 py-0.5 text-xs text-[#FCD34D]">
                      Coming Soon
                    </span>
                  </Label>
                  <p className="text-sm text-[#64748B]">
                    Receive notifications via SMS
                  </p>
                </div>
              </div>
              <Switch
                id="sms_enabled"
                checked={preferences.sms_enabled}
                onCheckedChange={(checked) => handleToggle('sms_enabled', checked)}
                disabled={true}
              />
            </div>

            <div className="group flex items-start justify-between gap-4 rounded-lg border border-[#1E293B] bg-[#1E293B]/30 p-4 opacity-60">
              <div className="flex flex-1 items-start gap-3">
                <div className="rounded-full bg-[#64748B]/10 p-2">
                  <Smartphone className="h-4 w-4 text-[#64748B]" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="push_enabled" className="text-base font-semibold text-[#94A3B8]">
                    Push Notifications
                    <span className="ml-2 rounded-full bg-[#FCD34D]/20 px-2 py-0.5 text-xs text-[#FCD34D]">
                      Coming Soon
                    </span>
                  </Label>
                  <p className="text-sm text-[#64748B]">
                    Receive push notifications on your device
                  </p>
                </div>
              </div>
              <Switch
                id="push_enabled"
                checked={preferences.push_enabled}
                onCheckedChange={(checked) => handleToggle('push_enabled', checked)}
                disabled={true}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card className="border-[#1E293B] bg-[#0F172A]/80 backdrop-blur-sm transition-all duration-200 hover:border-[#22C55E]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
              <div className="rounded-full bg-[#818CF8]/10 p-2">
                <Moon className="h-5 w-5 text-[#818CF8]" />
              </div>
              Quiet Hours (Do Not Disturb)
            </CardTitle>
            <CardDescription className="text-[#94A3B8]">
              Set a time window when you don't want to be disturbed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="group flex items-start justify-between gap-4 rounded-lg border border-[#1E293B] bg-[#1E293B]/30 p-4 transition-all duration-200 hover:border-[#22C55E]/30 hover:bg-[#1E293B]/50">
              <div className="flex flex-1 items-start gap-3">
                <div className="rounded-full bg-[#818CF8]/10 p-2 transition-colors group-hover:bg-[#818CF8]/20">
                  <Moon className="h-4 w-4 text-[#818CF8]" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="quiet_hours_enabled" className="cursor-pointer text-base font-semibold text-[#F8FAFC]">
                    Enable Quiet Hours
                  </Label>
                  <p className="text-sm text-[#94A3B8]">
                    Pause non-critical notifications during specified hours
                  </p>
                </div>
              </div>
              <Switch
                id="quiet_hours_enabled"
                checked={preferences.quiet_hours_enabled}
                onCheckedChange={(checked) => handleToggle('quiet_hours_enabled', checked)}
                disabled={saving}
                className="data-[state=checked]:bg-[#22C55E]"
              />
            </div>

            {preferences.quiet_hours_enabled && (
              <div className="space-y-4 rounded-lg border border-[#818CF8]/20 bg-[#818CF8]/5 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="quiet_hours_start" className="flex items-center gap-2 text-[#F8FAFC]">
                      <Clock className="h-4 w-4 text-[#818CF8]" />
                      Start Time
                    </Label>
                    <Input
                      id="quiet_hours_start"
                      type="time"
                      value={preferences.quiet_hours_start || '22:00'}
                      onChange={(e) => handleUpdate({ quiet_hours_start: e.target.value })}
                      disabled={saving}
                      className="border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] focus:border-[#22C55E]/50 focus:ring-[#22C55E]/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quiet_hours_end" className="flex items-center gap-2 text-[#F8FAFC]">
                      <Clock className="h-4 w-4 text-[#818CF8]" />
                      End Time
                    </Label>
                    <Input
                      id="quiet_hours_end"
                      type="time"
                      value={preferences.quiet_hours_end || '08:00'}
                      onChange={(e) => handleUpdate({ quiet_hours_end: e.target.value })}
                      disabled={saving}
                      className="border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] focus:border-[#22C55E]/50 focus:ring-[#22C55E]/20"
                    />
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4 rounded-lg border border-[#1E293B] bg-[#1E293B]/30 p-3">
                  <div className="flex flex-1 items-start gap-3">
                    <div className="rounded-full bg-[#EF4444]/10 p-2">
                      <Shield className="h-4 w-4 text-[#EF4444]" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label htmlFor="allow_critical_during_quiet" className="cursor-pointer text-sm font-semibold text-[#F8FAFC]">
                        Allow Critical Notifications
                      </Label>
                      <p className="text-xs text-[#94A3B8]">
                        Receive critical alerts even during quiet hours
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="allow_critical_during_quiet"
                    checked={preferences.allow_critical_during_quiet}
                    onCheckedChange={(checked) =>
                      handleToggle('allow_critical_during_quiet', checked)
                    }
                    disabled={saving}
                    className="data-[state=checked]:bg-[#22C55E]"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Digest Mode */}
        <Card className="border-[#1E293B] bg-[#0F172A]/80 backdrop-blur-sm transition-all duration-200 hover:border-[#22C55E]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
              <div className="rounded-full bg-[#FCD34D]/10 p-2">
                <MessageSquare className="h-5 w-5 text-[#FCD34D]" />
              </div>
              Notification Frequency
            </CardTitle>
            <CardDescription className="text-[#94A3B8]">
              Control how often you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="group flex items-start justify-between gap-4 rounded-lg border border-[#1E293B] bg-[#1E293B]/30 p-4 transition-all duration-200 hover:border-[#22C55E]/30 hover:bg-[#1E293B]/50">
              <div className="flex flex-1 items-start gap-3">
                <div className="rounded-full bg-[#FCD34D]/10 p-2 transition-colors group-hover:bg-[#FCD34D]/20">
                  <MessageSquare className="h-4 w-4 text-[#FCD34D]" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="digest_mode" className="cursor-pointer text-base font-semibold text-[#F8FAFC]">
                    Digest Mode
                  </Label>
                  <p className="text-sm text-[#94A3B8]">
                    Bundle notifications together instead of receiving them immediately
                  </p>
                </div>
              </div>
              <Switch
                id="digest_mode"
                checked={preferences.digest_mode}
                onCheckedChange={(checked) => handleToggle('digest_mode', checked)}
                disabled={saving}
                className="data-[state=checked]:bg-[#22C55E]"
              />
            </div>

            {preferences.digest_mode && (
              <div className="space-y-3 rounded-lg border border-[#FCD34D]/20 bg-[#FCD34D]/5 p-4">
                <div className="space-y-2">
                  <Label htmlFor="digest_frequency" className="flex items-center gap-2 text-[#F8FAFC]">
                    <Clock className="h-4 w-4 text-[#FCD34D]" />
                    Digest Frequency
                  </Label>
                  <Select
                    value={preferences.digest_frequency}
                    onValueChange={(value) =>
                      handleUpdate({
                        digest_frequency: value as 'immediate' | 'hourly' | 'daily',
                      })
                    }
                    disabled={saving}
                  >
                    <SelectTrigger 
                      id="digest_frequency"
                      className="border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] focus:border-[#22C55E]/50 focus:ring-[#22C55E]/20"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-[#1E293B] bg-[#0F172A]">
                      <SelectItem value="hourly" className="text-[#F8FAFC] focus:bg-[#1E293B] focus:text-[#F8FAFC]">
                        Every Hour
                      </SelectItem>
                      <SelectItem value="daily" className="text-[#F8FAFC] focus:bg-[#1E293B] focus:text-[#F8FAFC]">
                        Daily Summary
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-[#94A3B8]">
                    How often you want to receive bundled notifications
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-4 rounded-lg border border-[#1E293B] bg-[#0F172A]/50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-[#F8FAFC]">Need to start fresh?</p>
            <p className="text-xs text-[#64748B]">Reset all preferences to their default values</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleReset} 
            disabled={saving}
            className="border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 hover:text-[#EF4444]"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
        </div>

        {/* Auto-save Notice */}
        <div className="flex items-center justify-center gap-2 rounded-lg border border-[#22C55E]/20 bg-[#22C55E]/5 p-4">
          <CheckCircle className="h-4 w-4 text-[#22C55E]" />
          <p className="text-sm text-[#94A3B8]">
            All changes are <span className="font-semibold text-[#22C55E]">saved automatically</span>
          </p>
        </div>
      </div>
    </div>
  );
}
