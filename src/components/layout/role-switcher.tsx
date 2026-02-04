'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Tractor, 
  Briefcase, 
  Shield, 
  ChevronDown, 
  Check,
  Settings
} from 'lucide-react';
import { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

const roleConfig = {
  renter: {
    label: 'Renter',
    icon: User,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    description: 'Rent equipment & hire labour',
    dashboard: '/dashboard',
  },
  provider: {
    label: 'Provider',
    icon: Tractor,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    description: 'List equipment for rent',
    dashboard: '/provider/dashboard',
  },
  labour: {
    label: 'Labour',
    icon: Briefcase,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    description: 'Offer your services',
    dashboard: '/dashboard',
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    description: 'Manage platform',
    dashboard: '/admin',
  },
};

export function RoleSwitcher() {
  const router = useRouter();
  const { roles, activeRole, switchRole } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!activeRole || roles.length === 0) {
    return null;
  }

  const currentRoleConfig = roleConfig[activeRole];
  const CurrentIcon = currentRoleConfig.icon;

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);
    setIsOpen(false);
    
    // Navigate to the appropriate dashboard
    const targetDashboard = roleConfig[role].dashboard;
    router.push(targetDashboard);
  };

  // Don't show switcher if user only has one role
  if (roles.length === 1) {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 border',
          currentRoleConfig.bgColor,
          currentRoleConfig.borderColor,
          currentRoleConfig.color
        )}
      >
        <CurrentIcon className="h-4 w-4" />
        <span className="font-semibold">{currentRoleConfig.label}</span>
      </Badge>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'flex items-center gap-2 border transition-all duration-200',
            currentRoleConfig.bgColor,
            currentRoleConfig.borderColor,
            'hover:shadow-lg'
          )}
        >
          <CurrentIcon className={cn('h-4 w-4', currentRoleConfig.color)} />
          <span className={cn('font-semibold', currentRoleConfig.color)}>
            {currentRoleConfig.label}
          </span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 border-slate-800 bg-slate-900/95 backdrop-blur-xl">
        <DropdownMenuLabel className="text-slate-400">Switch Role</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-800" />
        
        {roles.map((role) => {
          const config = roleConfig[role];
          const Icon = config.icon;
          const isActive = role === activeRole;

          return (
            <DropdownMenuItem
              key={role}
              onClick={() => handleRoleSwitch(role)}
              className={cn(
                'flex items-start gap-3 cursor-pointer p-3 transition-all',
                isActive && config.bgColor,
                'hover:bg-slate-800 focus:bg-slate-800'
              )}
            >
              <div className={cn('rounded-lg p-2', config.bgColor)}>
                <Icon className={cn('h-5 w-5', config.color)} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={cn('font-semibold', isActive && config.color)}>
                    {config.label}
                  </span>
                  {isActive && <Check className={cn('h-4 w-4', config.color)} />}
                </div>
                <p className="text-xs text-slate-500">{config.description}</p>
              </div>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator className="bg-slate-800" />
        
        <DropdownMenuItem
          onClick={() => {
            setIsOpen(false);
            router.push('/settings/roles');
          }}
          className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200"
        >
          <Settings className="h-4 w-4" />
          <span>Manage Roles</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
