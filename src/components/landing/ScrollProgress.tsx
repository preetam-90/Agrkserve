'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

export function ScrollProgress() {
  const [pageLoaded, setPageLoaded] = useState(false);
  const { scrollYProgress } = useScroll();

  // Transform scroll progress to position the logo at the end of the progress bar
  const logoX = useTransform(scrollYProgress, [0, 1], ['0%', 'calc(100vw - 24px)']);

  // Only show progress bar after page is fully loaded in background
  useEffect(() => {
    const checkPageLoad = () => {
      if (document.readyState === 'complete') {
        setPageLoaded(true);
      } else {
        window.addEventListener(
          'load',
          () => {
            setPageLoaded(true);
          },
          { once: true }
        );
      }
    };

    checkPageLoad();
  }, []);

  // Don't render until page is fully loaded
  if (!pageLoaded) {
    return null;
  }

  return (
    <div className="fixed left-0 right-0 top-0 z-50 h-8">
      {/* Tractor Logo indicator - always visible, moves with scroll progress */}
      <motion.div
        className="absolute top-1/2 h-8 w-8 -translate-y-1/2 translate-x-[-50%]"
        style={{ left: logoX }}
      >
        <Image
          src="/logo.png"
          alt="AgriServe"
          width={32}
          height={32}
          className="rounded-full object-contain"
          priority
        />
      </motion.div>
    </div>
  );
}
