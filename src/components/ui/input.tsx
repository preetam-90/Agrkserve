import * as React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, wrapperClassName, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || (label ? generatedId : undefined);

    return (
      <div className={cn('w-full', wrapperClassName)}>
        {label && inputId && (
          <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <input
          type={type}
          {...(inputId && { id: inputId })}
          className={cn(
            'flex h-10 w-full rounded-lg border bg-[#1a1a1a] px-3 py-2 text-sm text-white transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-red-500 focus-visible:ring-red-500'
              : 'border-[#262626] hover:border-[#333333]',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
