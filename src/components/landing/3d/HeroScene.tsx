'use client';

import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, PerspectiveCamera, Sparkles } from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { FloatingMachine } from './FloatingMachine';
import { HolographicGradientPlane } from './HolographicGradientPlane';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface HeroSceneProps {
  quality?: 'high' | 'lite';
  reducedMotion?: boolean;
}

function CameraRig({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const scrollProgress = useRef(0);

  useEffect(() => {
    if (reducedMotion) return;

    const trigger = ScrollTrigger.create({
      trigger: '#hero-chapter',
      start: 'top top',
      end: 'bottom top',
      scrub: 0.9,
      onUpdate: (self) => {
        scrollProgress.current = self.progress;
      },
    });

    return () => trigger.kill();
  }, [reducedMotion]);

  useFrame((state) => {
    const { camera } = state;
    const mouseX = state.pointer.x;
    const mouseY = state.pointer.y;

    const progress = reducedMotion ? 0 : scrollProgress.current;
    const targetZ = 5.2 - progress * 1.3;
    const targetY = 1.4 + progress * 0.42;

    // Blend pointer orbit with scroll-driven dolly movement.
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouseX * 0.55, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY + mouseY * 0.25, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
    camera.lookAt(0, 0.2, 0);
  });

  return null;
}

function SceneContent({
  quality,
  reducedMotion,
}: {
  quality: 'high' | 'lite';
  reducedMotion?: boolean;
}) {
  const lite = quality === 'lite';

  return (
    <>
      <color attach="background" args={['#020504']} />
      <fog attach="fog" args={['#03110c', 5.5, 13]} />

      <ambientLight intensity={lite ? 0.55 : 0.72} />
      <directionalLight
        position={[5, 6, 4]}
        intensity={lite ? 1.0 : 1.4}
        color="#8fffe1"
        castShadow={!lite}
      />
      <spotLight
        position={[-4, 4, 2]}
        intensity={lite ? 0.7 : 1.1}
        angle={0.45}
        penumbra={0.5}
        color="#34d399"
      />

      <HolographicGradientPlane lite={lite} />
      <FloatingMachine quality={quality} />

      {!lite && !reducedMotion && (
        <Sparkles count={48} scale={6} size={2.4} speed={0.22} color="#b7ffdb" />
      )}

      <ContactShadows
        position={[0, -1.1, 0]}
        opacity={lite ? 0.28 : 0.4}
        width={7.5}
        height={7.5}
        blur={2.2}
        far={3.2}
      />
      <Environment preset="night" />
      <CameraRig reducedMotion={reducedMotion} />
    </>
  );
}

function HeroScene({ quality = 'high', reducedMotion = false }: HeroSceneProps) {
  const lite = quality === 'lite';

  return (
    <Canvas
      shadows={!lite}
      dpr={lite ? [1, 1.4] : [1, 2]}
      gl={{
        antialias: !lite,
        powerPreference: lite ? 'default' : 'high-performance',
        alpha: true,
      }}
      className="h-full w-full"
    >
      <PerspectiveCamera makeDefault position={[0, 1.4, 5.2]} fov={43} />
      <Suspense fallback={null}>
        <SceneContent quality={quality} reducedMotion={reducedMotion} />
      </Suspense>
    </Canvas>
  );
}
