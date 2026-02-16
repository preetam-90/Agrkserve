'use client';

import { useRef, ReactNode } from 'react';
import { useGSAPAnimation } from '@/lib/animations/gsap-context';
import { useDeviceCapability } from '@/lib/animations/device-capability';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function MagneticButton({ children, className = '', strength = 0.3 }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { capability } = useDeviceCapability();

  useGSAPAnimation(
    (gsap) => {
      // Only enable on high-end devices
      if (capability !== 'high' || !ref.current) return;

      const element = ref.current;

      const handleMouseMove = (e: Event) => {
        const mouseEvent = e as unknown as MouseEvent;
        const rect = element.getBoundingClientRect();
        const x = (mouseEvent.clientX - rect.left - rect.width / 2) * strength;
        const y = (mouseEvent.clientY - rect.top - rect.height / 2) * strength;

        gsap.to(element, {
          x,
          y,
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      const handleMouseLeave = () => {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.3)',
        });
      };

      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseleave', handleMouseLeave);
      };
    },
    [capability, strength]
  );

  return (
    <div ref={ref} className={`inline-block ${className}`}>
      {children}
    </div>
  );
}
