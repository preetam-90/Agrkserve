'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}

interface ResponsiveSectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  contentClassName?: string;
  fullViewport?: boolean;
}

/**
 * Shared responsive section wrapper for landing chapters.
 * Uses CSS variables from globals for consistent spacing across breakpoints.
 */
export const ResponsiveSection = forwardRef<HTMLElement, ResponsiveSectionProps>(
  function ResponsiveSection(
    { children, className, contentClassName, fullViewport = false, ...props },
    ref
  ) {
    return (
      <section
        ref={ref}
        className={joinClasses(
          'landing-section relative overflow-hidden',
          fullViewport && 'landing-min-screen',
          className
        )}
        {...props}
      >
        <div className={joinClasses('landing-container relative z-10', contentClassName)}>{children}</div>
      </section>
    );
  }
);

interface ResponsiveContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  narrow?: boolean;
}

export function ResponsiveContainer({
  children,
  className,
  narrow = false,
  ...props
}: ResponsiveContainerProps) {
  return (
    <div
      className={joinClasses(
        narrow ? 'landing-container landing-container-narrow' : 'landing-container',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface ResponsiveGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  cols?: 2 | 3 | 4;
}

export function ResponsiveGrid({ children, className, cols = 3, ...props }: ResponsiveGridProps) {
  const gridClass =
    cols === 2 ? 'landing-grid-2' : cols === 4 ? 'landing-grid-4' : 'landing-grid-3';

  return (
    <div className={joinClasses('landing-grid', gridClass, className)} {...props}>
      {children}
    </div>
  );
}
