'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Bell, Shield, Smartphone, Mail, Lock, Globe, MapPin } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function SettingsPage() {
  const { profile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mock state for form fields
  const [notifications, setNotifications] = useState({
    emailOrderUpdates: true,
    emailPromotions: false,
    pushNewMessages: true,
    pushOrderUpdates: true,
    smsReminders: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('Profile updated successfully');
    }, 1000);
  };

  const handleSaveNotifications = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Notification preferences saved');
    }, 1000);
  };

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences.
          </p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-[400px]"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and public profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="profile-form" onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={profile?.name || ''} placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" defaultValue={profile?.phone || ''} className="pl-9" disabled />
                    </div>
                    <p className="text-[0.8rem] text-muted-foreground">Phone number cannot be changed.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="your@email.com" defaultValue={profile?.email || ''} className="pl-9" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="location" placeholder="City, State" defaultValue="Pune, Maharashtra" className="pl-9" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
                      <SelectItem value="mr">Marathi (मराठी)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-end border-t px-6 py-4">
              <Button type="submit" form="profile-form" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what updates you want to receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email Notifications
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label className="text-base">Order Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about your booking status.
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailOrderUpdates}
                      onCheckedChange={(c) => setNotifications({...notifications, emailOrderUpdates: c})}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label className="text-base">Promotions & Offers</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about new deals and features.
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailPromotions}
                      onCheckedChange={(c) => setNotifications({...notifications, emailPromotions: c})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" /> Push Notifications
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label className="text-base">New Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when you receive a new message.
                      </p>
                    </div>
                    <Switch
                      checked={notifications.pushNewMessages}
                      onCheckedChange={(c) => setNotifications({...notifications, pushNewMessages: c})}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label className="text-base">SMS Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive SMS reminders for upcoming bookings.
                      </p>
                    </div>
                    <Switch
                      checked={notifications.smsReminders}
                      onCheckedChange={(c) => setNotifications({...notifications, smsReminders: c})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t px-6 py-4">
              <Button onClick={handleSaveNotifications} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="current-password" type="password" className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="new-password" type="password" className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="confirm-password" type="password" className="pl-9" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t px-6 py-4">
              <Button onClick={() => alert('Password updated!')} disabled={isLoading}>
                Update Password
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
