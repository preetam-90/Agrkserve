'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Tractor, 
  Briefcase, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Info
} from 'lucide-react';
import { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const roleConfig = {
  renter: {
    label: 'Renter',
    icon: User,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    description: 'Rent equipment and hire agricultural labour for your farming needs',
    features: [
      'Browse and rent equipment',
      'Hire skilled labour',
      'Manage bookings',
      'Rate and review services',
    ],
    requiresSetup: false,
  },
  provider: {
    label: 'Equipment Provider',
    icon: Tractor,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    description: 'List your agricultural equipment and earn by renting it out',
    features: [
      'List unlimited equipment',
      'Set your own prices',
      'Manage availability',
      'Track earnings',
    ],
    requiresSetup: true,
    setupMessage: 'You can add your equipment after enabling this role',
  },
  labour: {
    label: 'Agricultural Labour',
    icon: Briefcase,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    description: 'Offer your agricultural skills and get hired by farmers',
    features: [
      'Create your profile',
      'List your skills',
      'Set your rates',
      'Get hired directly',
    ],
    requiresSetup: true,
    setupMessage: 'You\'ll need to complete your labour profile after enabling',
  },
};

export default function RoleManagementPage() {
  const router = useRouter();
  const { user, roles, activeRole, fetchRoles } = useAuthStore();
  const [enabledRoles, setEnabledRoles] = useState<UserRole[]>(roles);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEnabledRoles(roles);
  }, [roles]);

  const toggleRole = (role: UserRole, isCurrentlyEnabled: boolean) => {
    // If disabling and it's the last role, prevent it
    if (isCurrentlyEnabled && enabledRoles.length === 1) {
      toast.error('You must have at least one role enabled');
      return;
    }

    setEnabledRoles((prev) => {
      const newRoles = prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role];
      
      setHasChanges(JSON.stringify(newRoles.sort()) !== JSON.stringify(roles.sort()));
      return newRoles;
    });
  };

  const handleSave = async () => {
    if (!user) return;

    // Ensure at least one role is enabled
    if (enabledRoles.length === 0) {
      toast.error('You must have at least one role enabled');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/user/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: enabledRoles }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update roles');
      }

      // Refresh roles from the store
      await fetchRoles();
      
      toast.success('Roles updated successfully!');
      setHasChanges(false);

      // Check if new roles were added
      const newRoles = enabledRoles.filter(role => !roles.includes(role));
      
      if (newRoles.length > 0) {
        // Redirect to onboarding for the first new role
        const firstNewRole = newRoles[0];
        
        if (firstNewRole === 'provider') {
          toast.success('Redirecting to provider setup...');
          setTimeout(() => router.push('/onboarding/provider'), 1000);
        } else if (firstNewRole === 'labour') {
          toast.success('Redirecting to labour profile setup...');
          setTimeout(() => router.push('/onboarding/labour'), 1000);
        } else {
          // For renter or other roles, just go to dashboard
          setTimeout(() => router.push('/dashboard'), 1000);
        }
      } else if (activeRole && !enabledRoles.includes(activeRole)) {
        // If active role was disabled, redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error updating roles:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update roles');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEnabledRoles(roles);
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] px-4 py-8">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] px-4 py-8">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton variant="minimal" fallbackUrl="/settings" />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[#22C55E]/10 p-3">
              <Shield className="h-6 w-6 text-[#22C55E]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#F8FAFC]">Manage Roles</h1>
              <p className="mt-1 text-[#94A3B8]">
                Enable or disable roles to access different features
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#60A5FA]/30 bg-[#60A5FA]/10 p-4">
          <Info className="h-5 w-5 flex-shrink-0 text-[#60A5FA]" />
          <div className="text-sm text-[#94A3B8]">
            <p className="font-semibold text-[#F8FAFC]">Register for New Roles</p>
            <p>
              Enable any role to unlock new features. You can be a Renter, Provider, and Labour all at once!
              Switch between roles anytime using the role switcher in the header.
            </p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {hasChanges && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#FCD34D]/30 bg-[#FCD34D]/10 p-4">
            <AlertCircle className="h-5 w-5 text-[#FCD34D]" />
            <p className="text-sm font-medium text-[#FCD34D]">
              You have unsaved changes. Click "Save Changes" to apply them.
            </p>
          </div>
        )}

        {/* Role Cards */}
        <div className="space-y-4">
          {(Object.keys(roleConfig) as UserRole[]).map((role) => {
            const config = roleConfig[role];
            const Icon = config.icon;
            const isEnabled = enabledRoles.includes(role);
            const wasOriginallyEnabled = roles.includes(role);
            const isCurrentActive = role === activeRole;
            const isNewRole = !wasOriginallyEnabled && isEnabled;

            return (
              <Card
                key={role}
                className={cn(
                  'border transition-all duration-200',
                  isEnabled
                    ? 'border-[#1E293B] bg-[#0F172A]/80'
                    : 'border-[#1E293B]/50 bg-[#0F172A]/40'
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={cn('rounded-xl p-3', config.bgColor)}>
                        <Icon className={cn('h-6 w-6', config.color)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-[#F8FAFC]">{config.label}</CardTitle>
                          {isCurrentActive && (
                            <Badge className="bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30">
                              Active
                            </Badge>
                          )}
                          {!wasOriginallyEnabled && (
                            <Badge className="bg-[#60A5FA]/20 text-[#60A5FA] border-[#60A5FA]/30">
                              Available
                            </Badge>
                          )}
                          {isNewRole && (
                            <Badge className="bg-[#FCD34D]/20 text-[#FCD34D] border-[#FCD34D]/30">
                              New!
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="mt-1 text-[#94A3B8]">
                          {config.description}
                        </CardDescription>
                        {isNewRole && config.requiresSetup && (
                          <div className="mt-2 flex items-start gap-2 rounded-lg border border-[#FCD34D]/20 bg-[#FCD34D]/5 p-2">
                            <Info className="h-4 w-4 flex-shrink-0 text-[#FCD34D] mt-0.5" />
                            <p className="text-xs text-[#94A3B8]">{config.setupMessage}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => toggleRole(role, isEnabled)}
                      disabled={isEnabled && enabledRoles.length === 1}
                      className="data-[state=checked]:bg-[#22C55E] flex-shrink-0"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-[#F8FAFC]">Features:</p>
                    <ul className="space-y-1.5">
                      {config.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-[#94A3B8]">
                          <CheckCircle className={cn('h-4 w-4', config.color)} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Buttons */}
        {hasChanges && (
          <div className="mt-8 flex items-center justify-end gap-3 rounded-xl border border-[#1E293B] bg-[#0F172A]/80 p-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="border-[#1E293B] bg-transparent text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || enabledRoles.length === 0}
              className="bg-gradient-to-r from-[#15803D] to-[#22C55E] text-white hover:from-[#166534] hover:to-[#16A34A]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
