'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function ScrollCameraRig() {
  const { camera } = useThree();

  useEffect(() => {
    // Camera dolly synced to page scroll for launch-film feeling.
    const trigger = ScrollTrigger.create({
      trigger: '.hero-scene',
      start: 'top top',
      end: 'bottom top',
      scrub: 0.8,
      onUpdate: (self) => {
        camera.position.z = 5 - self.progress * 1.25;
        camera.position.y = 1.3 + self.progress * 0.35;
      },
    });

    return () => trigger.kill();
  }, [camera]);

  return null;
}
