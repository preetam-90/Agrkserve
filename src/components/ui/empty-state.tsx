import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      {icon && <div className="mb-4 text-gray-600">{icon}</div>}
      <h3 className="text-lg font-medium text-white">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-gray-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const alertVariants = {
  info: {
    container: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    icon: <Info className="h-5 w-5 text-blue-400" />,
  },
  success: {
    container: 'bg-green-500/10 border-green-500/30 text-green-300',
    icon: <CheckCircle className="h-5 w-5 text-green-400" />,
  },
  warning: {
    container: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
    icon: <AlertCircle className="h-5 w-5 text-yellow-400" />,
  },
  error: {
    container: 'bg-red-500/10 border-red-500/30 text-red-300',
    icon: <XCircle className="h-5 w-5 text-red-400" />,
  },
};

export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  const styles = alertVariants[variant];

  return (
    <div className={cn('flex gap-3 rounded-lg border p-4', styles.container, className)}>
      <div className="shrink-0">{styles.icon}</div>
      <div>
        {title && <h4 className="mb-1 font-medium">{title}</h4>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}
