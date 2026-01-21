'use client';

import { useState } from 'react';
import { useNotificationPreferences } from '@/lib/services/notifications/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { PREFERENCE_LABELS } from '@/lib/services/notifications/config';
import { Bell, Mail, MessageSquare, Moon, RefreshCw, Loader2, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function NotificationPreferencesPage() {
  const { preferences, loading, updatePreferences, resetToDefaults } = useNotificationPreferences();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (loading || !preferences) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
    <div className="container max-w-3xl py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notification Preferences</h1>
            <p className="text-muted-foreground">
              Customize how and when you receive notifications
            </p>
          </div>

          {saved && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Saved</span>
            </div>
          )}
        </div>
      </div>

      {/* Notification Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Categories
          </CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(PREFERENCE_LABELS).map(([key, { label, description }]) => (
            <div key={key} className="flex items-start justify-between gap-4">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor={key} className="text-base">
                  {label}
                </Label>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <Switch
                id={key}
                checked={preferences[key as keyof typeof preferences] as boolean}
                onCheckedChange={(checked) =>
                  handleToggle(key as keyof typeof preferences, checked)
                }
                disabled={saving}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Delivery Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Delivery Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="in_app_enabled" className="text-base">
                In-App Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Show notifications in the notification bell
              </p>
            </div>
            <Switch
              id="in_app_enabled"
              checked={preferences.in_app_enabled}
              onCheckedChange={(checked) => handleToggle('in_app_enabled', checked)}
              disabled={saving}
            />
          </div>

          <Separator />

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="email_enabled" className="text-base">
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email_enabled"
              checked={preferences.email_enabled}
              onCheckedChange={(checked) => handleToggle('email_enabled', checked)}
              disabled={saving}
            />
          </div>

          <Separator />

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="sms_enabled" className="text-base">
                SMS Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via SMS (coming soon)
              </p>
            </div>
            <Switch
              id="sms_enabled"
              checked={preferences.sms_enabled}
              onCheckedChange={(checked) => handleToggle('sms_enabled', checked)}
              disabled={true}
            />
          </div>

          <Separator />

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="push_enabled" className="text-base">
                Push Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications (coming soon)
              </p>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Quiet Hours (Do Not Disturb)
          </CardTitle>
          <CardDescription>
            Set a time window when you don't want to be disturbed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="quiet_hours_enabled" className="text-base">
                Enable Quiet Hours
              </Label>
              <p className="text-sm text-muted-foreground">
                Pause non-critical notifications during specified hours
              </p>
            </div>
            <Switch
              id="quiet_hours_enabled"
              checked={preferences.quiet_hours_enabled}
              onCheckedChange={(checked) => handleToggle('quiet_hours_enabled', checked)}
              disabled={saving}
            />
          </div>

          {preferences.quiet_hours_enabled && (
            <>
              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiet_hours_start">Start Time</Label>
                  <Input
                    id="quiet_hours_start"
                    type="time"
                    value={preferences.quiet_hours_start || '22:00'}
                    onChange={(e) =>
                      handleUpdate({ quiet_hours_start: e.target.value })
                    }
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quiet_hours_end">End Time</Label>
                  <Input
                    id="quiet_hours_end"
                    type="time"
                    value={preferences.quiet_hours_end || '08:00'}
                    onChange={(e) =>
                      handleUpdate({ quiet_hours_end: e.target.value })
                    }
                    disabled={saving}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="allow_critical_during_quiet" className="text-base">
                    Allow Critical Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive critical alerts even during quiet hours
                  </p>
                </div>
                <Switch
                  id="allow_critical_during_quiet"
                  checked={preferences.allow_critical_during_quiet}
                  onCheckedChange={(checked) =>
                    handleToggle('allow_critical_during_quiet', checked)
                  }
                  disabled={saving}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Digest Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Notification Frequency
          </CardTitle>
          <CardDescription>
            Control how often you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="digest_mode" className="text-base">
                Digest Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Bundle notifications together instead of receiving them immediately
              </p>
            </div>
            <Switch
              id="digest_mode"
              checked={preferences.digest_mode}
              onCheckedChange={(checked) => handleToggle('digest_mode', checked)}
              disabled={saving}
            />
          </div>

          {preferences.digest_mode && (
            <>
              <Separator />

              <div className="space-y-2">
                <Label htmlFor="digest_frequency">Digest Frequency</Label>
                <Select
                  value={preferences.digest_frequency}
                  onValueChange={(value) =>
                    handleUpdate({
                      digest_frequency: value as 'immediate' | 'hourly' | 'daily',
                    })
                  }
                  disabled={saving}
                >
                  <SelectTrigger id="digest_frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Every Hour</SelectItem>
                    <SelectItem value="daily">Daily Summary</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How often you want to receive bundled notifications
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={saving}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>

        <p className="text-sm text-muted-foreground">
          Changes are saved automatically
        </p>
      </div>
    </div>
  );
}
