'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, type RootState, useFrame, useThree } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  OrbitControls,
  PerspectiveCamera,
  Sparkles,
} from '@react-three/drei';
import * as THREE from 'three';
import { InteractiveTractorModel } from './InteractiveTractorModel';

interface TractorInteractionState {
  hovered: boolean;
  turboMode: boolean;
  dragging: boolean;
  loaded: boolean;
}

interface InteractiveTractorSceneProps {
  reducedMotion?: boolean;
  mode?: 'default' | 'cinematic';
  scrollProgress?: number;
  activeStep?: number;
  onInteractionChange?: (state: TractorInteractionState) => void;
}

type QualityTier = 'low' | 'high';

/**
 * Hook to manage demand-based rendering
 * Forces an initial render, then only renders when in viewport
 */
function useDemandRender(isInView: boolean) {
  const { invalidate } = useThree();
  const rafRef = useRef<number>(0);
  const initialRenderDone = useRef(false);

  // Force an initial render immediately on mount
  useEffect(() => {
    if (!initialRenderDone.current) {
      initialRenderDone.current = true;
      // Multiple invalidations to ensure scene renders
      invalidate();
      setTimeout(() => invalidate(), 100);
      setTimeout(() => invalidate(), 500);
    }
  }, [invalidate]);

  useEffect(() => {
    if (!isInView) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      return;
    }

    // Request animation frame loop for demand rendering
    const animate = () => {
      invalidate();
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [isInView, invalidate]);

  return invalidate;
}

function CameraRig({
  mode,
  reducedMotion,
  scrollProgress,
  activeStep,
}: {
  mode: 'default' | 'cinematic';
  reducedMotion: boolean;
  scrollProgress: number;
  activeStep: number;
}) {
  const lookAtTarget = useRef(new THREE.Vector3(0, 0.24, 0));

  useEffect(() => {
    if (mode !== 'cinematic') return;
    lookAtTarget.current.set(0, 0.28 + scrollProgress * 0.06, 0);
  }, [mode, scrollProgress]);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={mode === 'cinematic' ? [0, 1.52, 5.45] : [0, 1.6, 5.0]}
        fov={mode === 'cinematic' ? 43 : 42}
      />
      <CameraUpdater
        mode={mode}
        reducedMotion={reducedMotion}
        scrollProgress={scrollProgress}
        activeStep={activeStep}
        lookAtTarget={lookAtTarget}
      />
    </>
  );
}

function CameraUpdater({
  mode,
  reducedMotion,
  scrollProgress,
  activeStep,
  lookAtTarget,
}: {
  mode: 'default' | 'cinematic';
  reducedMotion: boolean;
  scrollProgress: number;
  activeStep: number;
  lookAtTarget: React.MutableRefObject<THREE.Vector3>;
}) {
  const spring = useRef(new THREE.Vector3(0, 1.52, 5.45));

  useFrame((state: RootState, delta: number) => {
    if (mode !== 'cinematic') return;

    const pulse = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.24) * 0.05;
    const stepInfluence = (activeStep - 1.5) * 0.15;
    const targetX = stepInfluence + pulse;
    const targetY = 1.46 + scrollProgress * 0.2;
    const targetZ = 5.45 - scrollProgress * 0.32 - (activeStep === 2 ? 0.05 : 0);

    spring.current.x = THREE.MathUtils.damp(spring.current.x, targetX, 3.6, delta);
    spring.current.y = THREE.MathUtils.damp(spring.current.y, targetY, 3.8, delta);
    spring.current.z = THREE.MathUtils.damp(spring.current.z, targetZ, 3.8, delta);
    state.camera.position.copy(spring.current);
    state.camera.lookAt(lookAtTarget.current);
  });

  return null;
}

function TractorSceneContent({
  reducedMotion = false,
  mode = 'default',
  scrollProgress = 0,
  activeStep = 0,
  qualityTier = 'high',
  isInView = true,
  onInteractionChange,
}: InteractiveTractorSceneProps & { qualityTier: QualityTier; isInView: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [turboMode, setTurboMode] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const cinematic = mode === 'cinematic';
  const glowPhase = cinematic ? 0.9 + activeStep * 0.07 : 1;

  // Use demand-based rendering when in view
  useDemandRender(isInView);

  useEffect(() => {
    onInteractionChange?.({ hovered, turboMode, dragging: false, loaded });
  }, [hovered, loaded, onInteractionChange, turboMode]);

  return (
    <>
      <fog attach="fog" args={cinematic ? ['#070d12', 5.2, 15] : ['#07120f', 6.5, 14]} />

      <ambientLight intensity={cinematic ? 0.62 : hovered ? 1.1 : 0.95} color="#ffffff" />
      <directionalLight
        position={cinematic ? [5.6, 6.4, 2.8] : [4.8, 6, 3.4]}
        intensity={cinematic ? 1.1 + glowPhase * 0.28 : turboMode ? 1.55 : 1.2}
        color="#ffffff"
        castShadow
      />
      <spotLight
        position={cinematic ? [-4.6, 4.8, 1.7] : [-4, 5, 2]}
        intensity={cinematic ? 0.8 : hovered ? 1.18 : 0.82}
        color="#ffe7c7"
        angle={cinematic ? 0.42 : 0.5}
        penumbra={0.44}
      />
      <pointLight
        position={cinematic ? [0, 1.8, -2.6] : [0, 1.3, -2.2]}
        intensity={cinematic ? 0.54 : 0.35}
        color="#dbeafe"
      />
      <pointLight
        position={cinematic ? [0, 0.9, 2.7] : [0, 0.5, 2.1]}
        intensity={cinematic ? 1.15 + activeStep * 0.08 : 0.62}
        color={cinematic ? '#22d3ee' : '#34d399'}
      />

      <mesh position={[0, -1.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={cinematic ? [1.7, 3.1, 72] : [1.4, 2.7, 64]} />
        <meshBasicMaterial
          color={cinematic ? '#67e8f9' : turboMode ? '#22d3ee' : '#34d399'}
          transparent
          opacity={cinematic ? 0.24 + activeStep * 0.05 : hovered ? 0.48 : 0.24}
        />
      </mesh>

      <InteractiveTractorModel
        quality={qualityTier === 'low' ? 'lite' : 'high'}
        hovered={hovered}
        turboMode={turboMode}
        reducedMotion={reducedMotion}
        mode={mode}
        scrollProgress={scrollProgress}
        activeStep={activeStep}
        onHoverChange={setHovered}
        onToggleTurbo={() => setTurboMode((value) => !value)}
        onLoadedChange={setLoaded}
      />

      {!reducedMotion && qualityTier !== 'low' && (
        <Sparkles
          count={cinematic ? 48 : 34}
          scale={cinematic ? 7.2 : 6}
          size={cinematic ? 2.5 : 2.2}
          speed={cinematic ? 0.2 : 0.22}
          color={cinematic ? '#67e8f9' : '#86efac'}
        />
      )}

      <ContactShadows
        position={[0, -1.05, 0]}
        opacity={cinematic ? 0.56 : 0.42}
        width={cinematic ? 8.3 : 7.2}
        height={cinematic ? 8.3 : 7.2}
        blur={cinematic ? 2.8 : 2.3}
        far={cinematic ? 3.8 : 3.4}
      />

      <OrbitControls
        enablePan={false}
        enableZoom={!cinematic}
        enableRotate={false}
        minDistance={3.2}
        maxDistance={cinematic ? 6.2 : 7.5}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 1.9}
        autoRotate
        autoRotateSpeed={0.4}
      />

      <Environment preset={cinematic ? 'city' : 'warehouse'} />
    </>
  );
}

export function InteractiveTractorScene({
  reducedMotion = false,
  mode = 'default',
  scrollProgress = 0,
  activeStep = 0,
  onInteractionChange,
}: InteractiveTractorSceneProps) {
  const [isInView, setIsInView] = useState(true); // Start as true for immediate render
  const containerRef = useRef<HTMLDivElement>(null);
  const qualityTier = useMemo<QualityTier>(() => {
    if (typeof window === 'undefined' || reducedMotion) {
      return 'low';
    }

    const nav = navigator as Navigator & { deviceMemory?: number };
    const cpu = nav.hardwareConcurrency ?? 8;
    const memory = nav.deviceMemory ?? 8;
    return cpu <= 4 || memory <= 4 ? 'low' : 'high';
  }, [reducedMotion]);

  // Detect when the canvas is in viewport for demand-based rendering
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '100px 0px',
      }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full">
      <Canvas
        shadows
        frameloop="demand"
        dpr={qualityTier === 'low' ? [1, 1.2] : [1, 2]}
        gl={{
          antialias: qualityTier !== 'low',
          alpha: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        className="h-full w-full"
        style={{ background: 'transparent' }}
      >
        <CameraRig
          mode={mode}
          reducedMotion={reducedMotion}
          scrollProgress={scrollProgress}
          activeStep={activeStep}
        />
        <Suspense fallback={null}>
          <TractorSceneContent
            reducedMotion={reducedMotion}
            mode={mode}
            scrollProgress={scrollProgress}
            activeStep={activeStep}
            qualityTier={qualityTier}
            isInView={isInView}
            onInteractionChange={onInteractionChange}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
