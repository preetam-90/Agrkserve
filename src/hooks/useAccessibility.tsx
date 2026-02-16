/**
 * Accessibility Hook
 *
 * Manages accessibility features including keyboard navigation,
 * screen reader support, and reduced motion preferences
 */

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

export interface AccessibilityState {
  isKeyboardMode: boolean;
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
  prefersDarkMode: boolean;
  reducedTransparency: boolean;
  closedCaptions: boolean;
  animationEnabled: boolean;
  focusVisible: boolean;
}

const DEFAULT_ACCESSIBILITY_STATE: AccessibilityState = {
  isKeyboardMode: false,
  prefersReducedMotion: false,
  prefersHighContrast: false,
  prefersDarkMode: false,
  reducedTransparency: false,
  closedCaptions: false,
  animationEnabled: true,
  focusVisible: false,
};

let accessibilityState: AccessibilityState = DEFAULT_ACCESSIBILITY_STATE;
const subscribers = new Set<() => void>();
let keyboardTimer: ReturnType<typeof setTimeout> | null = null;
let removeGlobalListeners: (() => void) | null = null;
let initialized = false;

function isBrowser() {
  return typeof window !== 'undefined';
}

function readPreferencesState(): Partial<AccessibilityState> {
  if (!isBrowser()) {
    return {};
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const reducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)').matches;

  return {
    prefersReducedMotion,
    prefersHighContrast,
    prefersDarkMode,
    reducedTransparency,
    closedCaptions: prefersReducedMotion,
    animationEnabled: !prefersReducedMotion,
  };
}

function statesEqual(a: AccessibilityState, b: AccessibilityState): boolean {
  return (
    a.isKeyboardMode === b.isKeyboardMode &&
    a.prefersReducedMotion === b.prefersReducedMotion &&
    a.prefersHighContrast === b.prefersHighContrast &&
    a.prefersDarkMode === b.prefersDarkMode &&
    a.reducedTransparency === b.reducedTransparency &&
    a.closedCaptions === b.closedCaptions &&
    a.animationEnabled === b.animationEnabled &&
    a.focusVisible === b.focusVisible
  );
}

function notifySubscribers() {
  subscribers.forEach((callback) => callback());
}

function setAccessibilityState(patch: Partial<AccessibilityState>) {
  const nextState: AccessibilityState = { ...accessibilityState, ...patch };
  if (statesEqual(accessibilityState, nextState)) {
    return;
  }
  accessibilityState = nextState;
  notifySubscribers();
}

function initializeAccessibilityStore() {
  if (!isBrowser() || initialized) {
    return;
  }

  initialized = true;
  setAccessibilityState(readPreferencesState());

  const mediaQueries = [
    window.matchMedia('(prefers-reduced-motion: reduce)'),
    window.matchMedia('(prefers-contrast: high)'),
    window.matchMedia('(prefers-color-scheme: dark)'),
    window.matchMedia('(prefers-reduced-transparency: reduce)'),
  ];

  const handlePreferencesChange = () => {
    setAccessibilityState(readPreferencesState());
  };

  const handleKeyDown = () => {
    if (keyboardTimer) {
      clearTimeout(keyboardTimer);
      keyboardTimer = null;
    }

    setAccessibilityState({ isKeyboardMode: true, focusVisible: true });
    keyboardTimer = setTimeout(() => {
      setAccessibilityState({ isKeyboardMode: false });
      keyboardTimer = null;
    }, 1000);
  };

  const handlePointerDown = () => {
    if (keyboardTimer) {
      clearTimeout(keyboardTimer);
      keyboardTimer = null;
    }
    setAccessibilityState({ isKeyboardMode: false, focusVisible: false });
  };

  mediaQueries.forEach((mediaQuery) => {
    mediaQuery.addEventListener('change', handlePreferencesChange);
  });
  window.addEventListener('keydown', handleKeyDown, { passive: true });
  window.addEventListener('mousedown', handlePointerDown, { passive: true });
  window.addEventListener('touchstart', handlePointerDown, { passive: true });

  removeGlobalListeners = () => {
    mediaQueries.forEach((mediaQuery) => {
      mediaQuery.removeEventListener('change', handlePreferencesChange);
    });
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('mousedown', handlePointerDown);
    window.removeEventListener('touchstart', handlePointerDown);
    if (keyboardTimer) {
      clearTimeout(keyboardTimer);
      keyboardTimer = null;
    }
    removeGlobalListeners = null;
    initialized = false;
  };
}

function subscribe(callback: () => void) {
  if (!isBrowser()) {
    return () => {};
  }

  subscribers.add(callback);
  initializeAccessibilityStore();

  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0 && removeGlobalListeners) {
      removeGlobalListeners();
    }
  };
}

function getSnapshot() {
  return accessibilityState;
}

function getServerSnapshot() {
  return DEFAULT_ACCESSIBILITY_STATE;
}

/**
 * Accessibility hook for managing user preferences and state
 */
export function useAccessibility(): AccessibilityState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Hook for managing focus trap
 */
export function useFocusTrap(isActive: boolean, containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      } else if (e.key === 'Escape') {
        // Handle escape key if needed
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Focus first element
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, containerRef]);
}

/**
 * Hook for skip navigation link
 */
export function useSkipNavigation() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && e.shiftKey && document.activeElement === document.body) {
        const skipLink = document.querySelector('.skip-link') as HTMLElement;
        if (skipLink) {
          skipLink.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, { passive: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}

/**
 * Hook for ARIA live regions
 */
export function useLiveRegion(message: string, politeness: 'polite' | 'assertive' = 'polite') {
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (message && liveRegionRef.current) {
      liveRegionRef.current.textContent = message;
      
      // Clear message after a short delay
      const timer = setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = '';
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const LiveRegion = () => (
    <div
      ref={liveRegionRef}
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
      role="status"
    />
  );

  return { LiveRegion };
}

/**
 * Hook for managing modal accessibility
 */
export function useModalAccessibility(
  isOpen: boolean,
  onClose: () => void,
  title: string
) {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Set aria-hidden on main content
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.setAttribute('aria-hidden', 'true');
      }

      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('keydown', handleEscape);
        if (mainContent) {
          mainContent.removeAttribute('aria-hidden');
        }
      };
    } else {
      // Restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
    }
  }, [isOpen, onClose]);

  return {
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': title ? undefined : 'modal-title',
    'aria-describedby': 'modal-description',
  };
}

/**
 * Hook for accessible tooltips
 */
export function useTooltip() {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [content, setContent] = useState('');

  const showTooltip = (element: HTMLElement, tooltipContent: string) => {
    const rect = element.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2,
    });
    setContent(tooltipContent);
    setIsVisible(true);
  };

  const hideTooltip = () => {
    setIsVisible(false);
    setContent('');
  };

  return {
    isVisible,
    position,
    content,
    showTooltip,
    hideTooltip,
  };
}

/**
 * Hook for accessible tabs
 */
export function useTabs(initialIndex: number = 0) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const tabRefs = useRef<(HTMLElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        const nextIndex = (index + 1) % tabRefs.current.length;
        setActiveIndex(nextIndex);
        tabRefs.current[nextIndex]?.focus();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        const prevIndex = (index - 1 + tabRefs.current.length) % tabRefs.current.length;
        setActiveIndex(prevIndex);
        tabRefs.current[prevIndex]?.focus();
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        tabRefs.current[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        const lastIndex = tabRefs.current.length - 1;
        setActiveIndex(lastIndex);
        tabRefs.current[lastIndex]?.focus();
        break;
    }
  };

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    tabRefs,
  };
}

/**
 * Hook for accessible dropdowns
 */
export function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggle = () => setIsOpen(!isOpen);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return {
    isOpen,
    toggle,
    open,
    close,
    dropdownRef,
  };
}

/**
 * Hook for accessible form validation
 */
export function useFormValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string, rules: string[]) => {
    const newErrors: string[] = [];

    for (const rule of rules) {
      switch (rule) {
        case 'required':
          if (!value || value.trim() === '') {
            newErrors.push('This field is required');
          }
          break;
        case 'email':
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            newErrors.push('Please enter a valid email address');
          }
          break;
        case 'minLength:6':
          if (value && value.length < 6) {
            newErrors.push('Password must be at least 6 characters long');
          }
          break;
      }
    }

    setErrors(prev => ({
      ...prev,
      [name]: newErrors.join(', '),
    }));

    return newErrors.length === 0;
  };

  const clearError = (name: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    validateField,
    clearError,
    hasErrors,
  };
}
