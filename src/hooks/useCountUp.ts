'use client';

import { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

export function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (!isInView) return;
    
    const startTime = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Ease-out cubic function
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setCount(Math.floor(eased * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end); // Ensure we end at exact value
      }
    };
    
    animate();
  }, [isInView, end, duration]);
  
  return { count, ref };
}
