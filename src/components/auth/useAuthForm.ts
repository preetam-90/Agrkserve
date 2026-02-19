'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * useAuthForm - Reusable hook for auth form state management
 * Consolidates common auth form patterns into a single hook
 */
interface UseAuthFormOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  successMessage?: string;
  errorMessage?: string;
}

interface UseAuthFormReturn {
  isLoading: boolean;
  error: string;
  setError: (error: string) => void;
  handleSubmit: (submitFn: () => Promise<void>) => Promise<void>;
  clearError: () => void;
}

export function useAuthForm({
  onSuccess,
  onError,
  successMessage,
  errorMessage,
}: UseAuthFormOptions = {}): UseAuthFormReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const clearError = useCallback(() => {
    setError('');
  }, []);

  const handleSubmit = useCallback(
    async (submitFn: () => Promise<void>) => {
      setIsLoading(true);
      setError('');

      try {
        await submitFn();
        
        if (successMessage) {
          toast.success(successMessage);
        }
        
        onSuccess?.();
      } catch (err: unknown) {
        const error = err as Error;
        const errorMsg = error.message || errorMessage || 'An error occurred';
        
        setError(errorMsg);
        
        if (onError) {
          onError(errorMsg);
        } else {
          toast.error(errorMessage || 'Operation failed');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError, successMessage, errorMessage]
  );

  return {
    isLoading,
    error,
    setError,
    handleSubmit,
    clearError,
  };
}

/**
 * usePasswordValidation - Hook for password validation logic
 */
interface UsePasswordValidationReturn {
  validatePassword: (password: string, isSignup?: boolean) => string | null;
  validatePasswordMatch: (password: string, confirmPassword: string) => string | null;
}

export function usePasswordValidation(): UsePasswordValidationReturn {
  const validatePassword = useCallback((password: string, isSignup = false): string | null => {
    if (!password) {
      return 'Password is required';
    }

    if (isSignup) {
      if (password.length < 8) {
        return 'Password must be at least 8 characters long';
      }
      if (!/[A-Z]/.test(password)) {
        return 'Password must contain at least one uppercase letter';
      }
      if (!/[a-z]/.test(password)) {
        return 'Password must contain at least one lowercase letter';
      }
      if (!/[0-9]/.test(password)) {
        return 'Password must contain at least one number';
      }
    } else {
      if (password.length < 6) {
        return 'Password must be at least 6 characters';
      }
    }

    return null;
  }, []);

  const validatePasswordMatch = useCallback(
    (password: string, confirmPassword: string): string | null => {
      if (!confirmPassword) {
        return 'Please confirm your password';
      }
      if (password !== confirmPassword) {
        return 'Passwords do not match';
      }
      return null;
    },
    []
  );

  return {
    validatePassword,
    validatePasswordMatch,
  };
}

/**
 * useEmailValidation - Hook for email validation
 */
interface UseEmailValidationReturn {
  validateEmail: (email: string) => string | null;
}

export function useEmailValidation(): UseEmailValidationReturn {
  const validateEmail = useCallback((email: string): string | null => {
    if (!email) {
      return 'Email is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }

    return null;
  }, []);

  return { validateEmail };
}
