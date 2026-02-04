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
import { User, Bell, Shield, Smartphone, Mail, Lock, Globe, MapPin, Save, CheckCircle, AlertCircle, Key, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { BackButton } from '@/components/ui/back-button';

export default function SettingsPage() {
  const { profile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

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
    setSaved(false);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const handleSaveNotifications = () => {
    setIsLoading(true);
    setSaved(false);
    setTimeout(() => {
      setIsLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#020617] px-4 py-8">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8">
            <div className="h-10 w-48 animate-pulse rounded-lg bg-[#1E293B]" />
            <div className="mt-2 h-6 w-96 animate-pulse rounded-lg bg-[#1E293B]" />
          </div>
          <div className="h-96 animate-pulse rounded-xl bg-[#1E293B]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] px-4 py-8">
      <div className="container mx-auto max-w-5xl">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton variant="minimal" />
        </div>
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[#22C55E]/10 p-3">
              <User className="h-6 w-6 text-[#22C55E]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#F8FAFC]">Settings</h1>
              <p className="mt-1 text-[#94A3B8]">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Success Banner */}
        {saved && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 p-4">
            <CheckCircle className="h-5 w-5 text-[#22C55E]" />
            <p className="text-sm font-medium text-[#22C55E]">
              Settings saved successfully!
            </p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 border border-[#1E293B] bg-[#0F172A]/80 p-1 lg:w-[600px]">
            <TabsTrigger 
              value="profile" 
              className="flex items-center gap-2 data-[state=active]:bg-[#22C55E]/10 data-[state=active]:text-[#22C55E]"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger 
              value="roles" 
              className="flex items-center gap-2 data-[state=active]:bg-[#22C55E]/10 data-[state=active]:text-[#22C55E]"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Roles</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="flex items-center gap-2 data-[state=active]:bg-[#22C55E]/10 data-[state=active]:text-[#22C55E]"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="flex items-center gap-2 data-[state=active]:bg-[#22C55E]/10 data-[state=active]:text-[#22C55E]"
            >
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            <Card className="border-[#1E293B] bg-[#0F172A]/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
                  <div className="rounded-full bg-[#22C55E]/10 p-2">
                    <Shield className="h-5 w-5 text-[#22C55E]" />
                  </div>
                  Manage Your Roles
                </CardTitle>
                <CardDescription className="text-[#94A3B8]">
                  Register for new roles or switch between existing ones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 p-6 text-center">
                  <Shield className="mx-auto mb-4 h-12 w-12 text-[#22C55E]" />
                  <h3 className="mb-2 text-lg font-bold text-[#F8FAFC]">
                    Unlock More Features
                  </h3>
                  <p className="mb-4 text-sm text-[#94A3B8]">
                    Register as a Provider to list equipment or as Labour to offer your services.
                    You can have multiple roles and switch between them anytime!
                  </p>
                  <Button
                    onClick={() => window.location.href = '/settings/roles'}
                    className="bg-gradient-to-r from-[#15803D] to-[#22C55E] text-white hover:from-[#166534] hover:to-[#16A34A]"
                  >
                    Go to Role Management
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-[#F8FAFC]">Available Roles:</h4>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-[#60A5FA]/20 bg-[#60A5FA]/5 p-4">
                      <User className="mb-2 h-6 w-6 text-[#60A5FA]" />
                      <h5 className="mb-1 font-semibold text-[#F8FAFC]">Renter</h5>
                      <p className="text-xs text-[#94A3B8]">Rent equipment & hire labour</p>
                    </div>
                    <div className="rounded-lg border border-[#22C55E]/20 bg-[#22C55E]/5 p-4">
                      <Shield className="mb-2 h-6 w-6 text-[#22C55E]" />
                      <h5 className="mb-1 font-semibold text-[#F8FAFC]">Provider</h5>
                      <p className="text-xs text-[#94A3B8]">List equipment for rent</p>
                    </div>
                    <div className="rounded-lg border border-[#FCD34D]/20 bg-[#FCD34D]/5 p-4">
                      <User className="mb-2 h-6 w-6 text-[#FCD34D]" />
                      <h5 className="mb-1 font-semibold text-[#F8FAFC]">Labour</h5>
                      <p className="text-xs text-[#94A3B8]">Offer your services</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-[#1E293B] bg-[#0F172A]/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
                  <div className="rounded-full bg-[#60A5FA]/10 p-2">
                    <User className="h-5 w-5 text-[#60A5FA]" />
                  </div>
                  Profile Information
                </CardTitle>
                <CardDescription className="text-[#94A3B8]">
                  Update your personal information and public profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form id="profile-form" onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-[#F8FAFC]">Full Name</Label>
                      <Input 
                        id="name" 
                        defaultValue={profile?.name || ''} 
                        placeholder="Your name"
                        className="border-[#1E293B] bg-[#1E293B]/30 text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#22C55E]/50 focus:ring-[#22C55E]/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-[#F8FAFC]">Phone Number</Label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
                        <Input 
                          id="phone" 
                          defaultValue={profile?.phone || ''} 
                          className="border-[#1E293B] bg-[#1E293B]/30 pl-9 text-[#F8FAFC] opacity-60" 
                          disabled 
                        />
                      </div>
                      <p className="text-xs text-[#64748B]">Phone number cannot be changed</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#F8FAFC]">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="your@email.com" 
                        defaultValue={profile?.email || ''} 
                        className="border-[#1E293B] bg-[#1E293B]/30 pl-9 text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#22C55E]/50 focus:ring-[#22C55E]/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-[#F8FAFC]">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
                      <Input 
                        id="location" 
                        placeholder="City, State" 
                        defaultValue="Pune, Maharashtra" 
                        className="border-[#1E293B] bg-[#1E293B]/30 pl-9 text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#22C55E]/50 focus:ring-[#22C55E]/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-[#F8FAFC]">Language</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-2.5 z-10 h-4 w-4 text-[#64748B]" />
                      <Select defaultValue="en">
                        <SelectTrigger className="border-[#1E293B] bg-[#1E293B]/30 pl-9 text-[#F8FAFC] focus:border-[#22C55E]/50 focus:ring-[#22C55E]/20">
                          <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent className="border-[#1E293B] bg-[#0F172A]">
                          <SelectItem value="en" className="text-[#F8FAFC] focus:bg-[#1E293B] focus:text-[#F8FAFC]">English</SelectItem>
                          <SelectItem value="hi" className="text-[#F8FAFC] focus:bg-[#1E293B] focus:text-[#F8FAFC]">Hindi (हिंदी)</SelectItem>
                          <SelectItem value="mr" className="text-[#F8FAFC] focus:bg-[#1E293B] focus:text-[#F8FAFC]">Marathi (मराठी)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-[#1E293B] px-6 py-4">
                <Button 
                  type="submit" 
                  form="profile-form" 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-[#15803D] to-[#22C55E] text-white hover:from-[#166534] hover:to-[#16A34A]"
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-[#1E293B] bg-[#0F172A]/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
                  <div className="rounded-full bg-[#FCD34D]/10 p-2">
                    <Bell className="h-5 w-5 text-[#FCD34D]" />
                  </div>
                  Notification Preferences
                </CardTitle>
                <CardDescription className="text-[#94A3B8]">
                  Choose what updates you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#F8FAFC]">
                    <Mail className="h-4 w-4 text-[#60A5FA]" /> Email Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="group flex items-center justify-between rounded-xl border border-[#1E293B] bg-[#1E293B]/30 p-4 transition-colors hover:bg-[#1E293B]/50">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-[#60A5FA]/10 p-2 transition-colors group-hover:bg-[#60A5FA]/20">
                          <Mail className="h-4 w-4 text-[#60A5FA]" />
                        </div>
                        <div className="space-y-1">
                          <Label className="cursor-pointer text-base font-semibold text-[#F8FAFC]">Order Updates</Label>
                          <p className="text-sm text-[#94A3B8]">
                            Receive emails about your booking status
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={notifications.emailOrderUpdates}
                        onCheckedChange={(c) => setNotifications({...notifications, emailOrderUpdates: c})}
                        className="data-[state=checked]:bg-[#22C55E]"
                      />
                    </div>
                    <div className="group flex items-center justify-between rounded-xl border border-[#1E293B] bg-[#1E293B]/30 p-4 transition-colors hover:bg-[#1E293B]/50">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-[#60A5FA]/10 p-2 transition-colors group-hover:bg-[#60A5FA]/20">
                          <Mail className="h-4 w-4 text-[#60A5FA]" />
                        </div>
                        <div className="space-y-1">
                          <Label className="cursor-pointer text-base font-semibold text-[#F8FAFC]">Promotions & Offers</Label>
                          <p className="text-sm text-[#94A3B8]">
                            Receive emails about new deals and features
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={notifications.emailPromotions}
                        onCheckedChange={(c) => setNotifications({...notifications, emailPromotions: c})}
                        className="data-[state=checked]:bg-[#22C55E]"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-[#1E293B]" />

                <div>
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#F8FAFC]">
                    <Smartphone className="h-4 w-4 text-[#818CF8]" /> Push Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="group flex items-center justify-between rounded-xl border border-[#1E293B] bg-[#1E293B]/30 p-4 transition-colors hover:bg-[#1E293B]/50">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-[#818CF8]/10 p-2 transition-colors group-hover:bg-[#818CF8]/20">
                          <Bell className="h-4 w-4 text-[#818CF8]" />
                        </div>
                        <div className="space-y-1">
                          <Label className="cursor-pointer text-base font-semibold text-[#F8FAFC]">New Messages</Label>
                          <p className="text-sm text-[#94A3B8]">
                            Get notified when you receive a new message
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={notifications.pushNewMessages}
                        onCheckedChange={(c) => setNotifications({...notifications, pushNewMessages: c})}
                        className="data-[state=checked]:bg-[#22C55E]"
                      />
                    </div>
                    <div className="group flex items-center justify-between rounded-xl border border-[#1E293B] bg-[#1E293B]/30 p-4 transition-colors hover:bg-[#1E293B]/50">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-[#818CF8]/10 p-2 transition-colors group-hover:bg-[#818CF8]/20">
                          <Smartphone className="h-4 w-4 text-[#818CF8]" />
                        </div>
                        <div className="space-y-1">
                          <Label className="cursor-pointer text-base font-semibold text-[#F8FAFC]">SMS Reminders</Label>
                          <p className="text-sm text-[#94A3B8]">
                            Receive SMS reminders for upcoming bookings
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={notifications.smsReminders}
                        onCheckedChange={(c) => setNotifications({...notifications, smsReminders: c})}
                        className="data-[state=checked]:bg-[#22C55E]"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-[#1E293B] px-6 py-4">
                <Button 
                  onClick={handleSaveNotifications} 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-[#15803D] to-[#22C55E] text-white hover:from-[#166534] hover:to-[#16A34A]"
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-[#1E293B] bg-[#0F172A]/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
                  <div className="rounded-full bg-[#EF4444]/10 p-2">
                    <Shield className="h-5 w-5 text-[#EF4444]" />
                  </div>
                  Security Settings
                </CardTitle>
                <CardDescription className="text-[#94A3B8]">
                  Manage your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-[#F8FAFC]">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
                      <Input 
                        id="current-password" 
                        type={showPassword ? "text" : "password"}
                        className="border-[#1E293B] bg-[#1E293B]/30 pl-9 pr-10 text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#22C55E]/50 focus:ring-[#22C55E]/20"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-[#64748B] hover:text-[#F8FAFC]"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-[#F8FAFC]">New Password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
                      <Input 
                        id="new-password" 
                        type={showPassword ? "text" : "password"}
                        className="border-[#1E293B] bg-[#1E293B]/30 pl-9 text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#22C55E]/50 focus:ring-[#22C55E]/20"
                        placeholder="Enter new password"
                      />
                    </div>
                    <p className="text-xs text-[#64748B]">
                      Must be at least 8 characters with uppercase, lowercase, and numbers
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-[#F8FAFC]">Confirm New Password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
                      <Input 
                        id="confirm-password" 
                        type={showPassword ? "text" : "password"}
                        className="border-[#1E293B] bg-[#1E293B]/30 pl-9 text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#22C55E]/50 focus:ring-[#22C55E]/20"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>

                {/* Security Tips */}
                <div className="rounded-xl border border-[#60A5FA]/20 bg-[#60A5FA]/5 p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-[#60A5FA]" />
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-[#F8FAFC]">Password Security Tips</p>
                      <ul className="space-y-1 text-xs text-[#94A3B8]">
                        <li>• Use a unique password you don't use elsewhere</li>
                        <li>• Include a mix of letters, numbers, and symbols</li>
                        <li>• Avoid common words or personal information</li>
                        <li>• Consider using a password manager</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-[#1E293B] px-6 py-4">
                <Button 
                  onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => {
                      setIsLoading(false);
                      setSaved(true);
                      setTimeout(() => setSaved(false), 3000);
                    }, 1000);
                  }} 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-[#15803D] to-[#22C55E] text-white hover:from-[#166534] hover:to-[#16A34A]"
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
