import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ReadReceiptStatus() {
  const statuses = [
    {
      status: 'sent',
      label: 'Sent',
      description: 'Message sent to server',
      icon: <Check className="h-4 w-4" />,
      color: 'text-gray-400',
    },
    {
      status: 'delivered',
      label: 'Delivered',
      description: 'Message delivered to recipient',
      icon: <CheckCheck className="h-4 w-4" />,
      color: 'text-gray-400',
    },
    {
      status: 'read',
      label: 'Read',
      description: 'Message read by recipient',
      icon: <CheckCheck className="h-4 w-4" />,
      color: 'text-blue-400',
    },
  ] as const;

  return (
    <div className="space-y-4 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Read Receipt States</h3>

      {statuses.map((status) => (
        <div
          key={status.status}
          className="flex items-start gap-4 rounded-xl border border-[#262626] bg-[#1a1a1a] p-4"
        >
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full bg-[#262626]',
              status.color
            )}
          >
            {status.icon}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-white">{status.label}</h4>
            <p className="mt-1 text-sm text-gray-400">{status.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
