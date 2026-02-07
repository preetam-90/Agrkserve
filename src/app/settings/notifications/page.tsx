'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Bell, BellOff, Mail, MessageSquare, DollarSign, Calendar, 
  Shield, Star, TrendingUp, Smartphone, Monitor, Volume2, 
  VolumeX, Clock, Zap, CheckCircle, ArrowLeft, Save, 
  RefreshCw, Tractor, Users, Wheat, Truck, Sunrise,
  Settings2, Filter, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NotificationPreferences {
  // Delivery channels
  email: boolean;
  push: boolean;
  inApp: boolean;
  sms: boolean;

  // Category preferences
  bookings: boolean;
  messages: boolean;
  payments: boolean;
  reviews: boolean;
  security: boolean;
  updates: boolean;
  marketing: boolean;
  equipment: boolean;
  labor: boolean;
  harvest: boolean;
  weather: boolean;

  // Timing preferences
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  
  // Priority filtering
  criticalOnly: boolean;
  highPriorityOnly: boolean;

  // Digest options
  dailyDigest: boolean;
  weeklyDigest: boolean;
}

const defaultPreferences: NotificationPreferences = {
  email: true,
  push: true,
  inApp: true,
  sms: false,
  bookings: true,
  messages: true,
  payments: true,
  reviews: true,
  security: true,
  updates: true,
  marketing: false,
  equipment: true,
  labor: true,
  harvest: true,
  weather: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  criticalOnly: false,
  highPriorityOnly: false,
  dailyDigest: false,
  weeklyDigest: false,
};

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isSaving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('notificationPreferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load preferences:', e);
      }
    }
  }, []);

  const updatePreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage (in production, this would be an API call)
      localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPreferences(defaultPreferences);
    setHasChanges(true);
  };

  const deliveryChannels = [
    { key: 'email' as const, label: 'Email', icon: Mail, description: 'Receive notifications via email' },
    { key: 'push' as const, label: 'Push Notifications', icon: Smartphone, description: 'Browser and mobile push notifications' },
    { key: 'inApp' as const, label: 'In-App', icon: Bell, description: 'Show notifications in the app' },
    { key: 'sms' as const, label: 'SMS', icon: MessageSquare, description: 'Text message alerts (critical only)' },
  ];

  const categories = [
    { key: 'bookings' as const, label: 'Bookings', icon: Tractor, description: 'Equipment rental bookings and updates', color: 'text-emerald-400' },
    { key: 'equipment' as const, label: 'Equipment', icon: Truck, description: 'Equipment availability and maintenance', color: 'text-amber-400' },
    { key: 'labor' as const, label: 'Labor', icon: Users, description: 'Labor requests and schedules', color: 'text-blue-400' },
    { key: 'messages' as const, label: 'Messages', icon: MessageSquare, description: 'Direct messages and chat', color: 'text-cyan-400' },
    { key: 'payments' as const, label: 'Payments', icon: DollarSign, description: 'Payment confirmations and invoices', color: 'text-green-400' },
    { key: 'harvest' as const, label: 'Harvest', icon: Wheat, description: 'Harvest schedules and updates', color: 'text-yellow-400' },
    { key: 'weather' as const, label: 'Weather', icon: Sunrise, description: 'Weather alerts and forecasts', color: 'text-orange-400' },
    { key: 'reviews' as const, label: 'Reviews', icon: Star, description: 'New reviews and ratings', color: 'text-pink-400' },
    { key: 'security' as const, label: 'Security', icon: Shield, description: 'Security alerts and account activity', color: 'text-red-400' },
    { key: 'updates' as const, label: 'Updates', icon: TrendingUp, description: 'Platform updates and new features', color: 'text-violet-400' },
    { key: 'marketing' as const, label: 'Marketing', icon: Sparkles, description: 'Promotions and special offers', color: 'text-fuchsia-400' },
  ];

  const enabledChannels = deliveryChannels.filter((ch) => preferences[ch.key]).length;
  const enabledCategories = categories.filter((cat) => preferences[cat.key]).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/10 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-slate-300 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full blur opacity-25" />
                  <Settings2 className="relative w-8 h-8 text-emerald-400" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-amber-300">
                  Notification Settings
                </h1>
              </div>
              <p className="text-slate-300 max-w-2xl">
                Customize how and when you receive notifications about your agricultural activities
              </p>
            </div>

            {hasChanges && (
              <Badge variant="secondary" className="bg-amber-400/20 text-amber-200 animate-pulse">
                Unsaved Changes
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/5 backdrop-blur-sm border-slate-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Channels</p>
                  <p className="text-2xl font-bold text-emerald-400">{enabledChannels}/4</p>
                </div>
                <Monitor className="w-8 h-8 text-emerald-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-slate-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Enabled Categories</p>
                  <p className="text-2xl font-bold text-amber-400">{enabledCategories}/{categories.length}</p>
                </div>
                <Filter className="w-8 h-8 text-amber-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-slate-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Quiet Hours</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {preferences.quietHoursEnabled ? 'On' : 'Off'}
                  </p>
                </div>
                {preferences.quietHoursEnabled ? (
                  <VolumeX className="w-8 h-8 text-cyan-400/50" />
                ) : (
                  <Volume2 className="w-8 h-8 text-slate-400/50" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delivery Channels */}
        <Card className="mb-6 bg-white/5 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-300">
              <Bell className="w-5 h-5" />
              Delivery Channels
            </CardTitle>
            <CardDescription className="text-slate-400">
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {deliveryChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <div
                  key={channel.key}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <Icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <Label htmlFor={channel.key} className="text-slate-200 font-medium cursor-pointer">
                        {channel.label}
                      </Label>
                      <p className="text-sm text-slate-400">{channel.description}</p>
                    </div>
                  </div>
                  <Switch
                    id={channel.key}
                    checked={preferences[channel.key]}
                    onCheckedChange={(checked) => updatePreference(channel.key, checked)}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Notification Categories */}
        <Card className="mb-6 bg-white/5 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-300">
              <Filter className="w-5 h-5" />
              Notification Categories
            </CardTitle>
            <CardDescription className="text-slate-400">
              Select which types of notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <div
                    key={category.key}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-700/50 rounded-lg">
                        <Icon className={cn('w-5 h-5', category.color)} />
                      </div>
                      <div>
                        <Label htmlFor={category.key} className="text-slate-200 font-medium cursor-pointer">
                          {category.label}
                        </Label>
                        <p className="text-xs text-slate-400">{category.description}</p>
                      </div>
                    </div>
                    <Switch
                      id={category.key}
                      checked={preferences[category.key]}
                      onCheckedChange={(checked) => updatePreference(category.key, checked)}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card className="mb-6 bg-white/5 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-300">
              <Clock className="w-5 h-5" />
              Advanced Settings
            </CardTitle>
            <CardDescription className="text-slate-400">
              Fine-tune your notification experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quiet Hours */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label htmlFor="quietHours" className="text-slate-200 font-medium">
                    Quiet Hours
                  </Label>
                  <p className="text-sm text-slate-400">Pause non-critical notifications during specific hours</p>
                </div>
                <Switch
                  id="quietHours"
                  checked={preferences.quietHoursEnabled}
                  onCheckedChange={(checked) => updatePreference('quietHoursEnabled', checked)}
                />
              </div>

              {preferences.quietHoursEnabled && (
                <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-emerald-500/30">
                  <div>
                    <Label htmlFor="quietStart" className="text-slate-300 text-sm">Start Time</Label>
                    <input
                      id="quietStart"
                      type="time"
                      value={preferences.quietHoursStart}
                      onChange={(e) => updatePreference('quietHoursStart', e.target.value)}
                      className="mt-1 w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quietEnd" className="text-slate-300 text-sm">End Time</Label>
                    <input
                      id="quietEnd"
                      type="time"
                      value={preferences.quietHoursEnd}
                      onChange={(e) => updatePreference('quietHoursEnd', e.target.value)}
                      className="mt-1 w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator className="bg-slate-700/50" />

            {/* Priority Filtering */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="criticalOnly" className="text-slate-200 font-medium">
                    Critical Only Mode
                  </Label>
                  <p className="text-sm text-slate-400">Only receive urgent notifications</p>
                </div>
                <Switch
                  id="criticalOnly"
                  checked={preferences.criticalOnly}
                  onCheckedChange={(checked) => updatePreference('criticalOnly', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="highPriority" className="text-slate-200 font-medium">
                    High Priority Only
                  </Label>
                  <p className="text-sm text-slate-400">Filter out low priority notifications</p>
                </div>
                <Switch
                  id="highPriority"
                  checked={preferences.highPriorityOnly}
                  onCheckedChange={(checked) => updatePreference('highPriorityOnly', checked)}
                  disabled={preferences.criticalOnly}
                />
              </div>
            </div>

            <Separator className="bg-slate-700/50" />

            {/* Digest Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dailyDigest" className="text-slate-200 font-medium">
                    Daily Digest
                  </Label>
                  <p className="text-sm text-slate-400">Receive a summary of daily activities</p>
                </div>
                <Switch
                  id="dailyDigest"
                  checked={preferences.dailyDigest}
                  onCheckedChange={(checked) => updatePreference('dailyDigest', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weeklyDigest" className="text-slate-200 font-medium">
                    Weekly Digest
                  </Label>
                  <p className="text-sm text-slate-400">Receive a weekly summary every Monday</p>
                </div>
                <Switch
                  id="weeklyDigest"
                  checked={preferences.weeklyDigest}
                  onCheckedChange={(checked) => updatePreference('weeklyDigest', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handleReset}
            className="bg-white/5 border-slate-700/50 text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>

          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/20"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </div>

        {/* Success Message */}
        {!hasChanges && !isSaving && (
          <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <p className="text-emerald-300 text-sm">Your notification preferences have been saved successfully</p>
          </div>
        )}
      </div>
    </div>
  );
}
