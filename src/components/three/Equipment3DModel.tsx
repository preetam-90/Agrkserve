/**
 * Example: 3D Equipment Showcase Component
 *
 * Demonstrates lazy-loaded Three.js integration for agricultural equipment
 */

'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Environment } from '@react-three/drei';
import { Suspense, useEffect } from 'react';
import type { DeviceCapability } from '@/lib/animations/device-capability';

interface Equipment3DModelProps {
  modelUrl: string;
  deviceCapability?: DeviceCapability;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

/**
 * 3D Model Viewer Component
 * This component should be wrapped with LazyThreeScene for optimal performance
 */
export default function Equipment3DModel({
  modelUrl,
  deviceCapability = 'medium',
  onLoad,
}: Equipment3DModelProps) {
  useEffect(() => {
    onLoad?.();
  }, [modelUrl, onLoad]);

  // Quality settings based on device capability
  const qualitySettings = {
    high: {
      shadows: true,
      toneMapping: true,
      environment: 'sunset' as const,
      intensity: 1.5,
    },
    medium: {
      shadows: false,
      toneMapping: false,
      environment: 'sunset' as const,
      intensity: 1,
    },
    low: {
      shadows: false,
      toneMapping: false,
      environment: null,
      intensity: 0.8,
    },
  }[deviceCapability];

  return (
    <Canvas
      shadows={qualitySettings.shadows}
      dpr={deviceCapability === 'high' ? [1, 2] : 1}
      camera={{ position: [5, 3, 5], fov: 45 }}
      gl={{
        powerPreference: deviceCapability === 'high' ? 'high-performance' : 'low-power',
        antialias: deviceCapability === 'high',
      }}
    >
      <Suspense fallback={null}>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={qualitySettings.intensity}
          castShadow={qualitySettings.shadows}
        />

        {/* 3D Model */}
        <Stage
          shadows={qualitySettings.shadows}
          adjustCamera={1.5}
          intensity={qualitySettings.intensity}
          environment={qualitySettings.environment ?? undefined}
        >
          {/* 
            Replace this with actual model loader:
            <Model url={modelUrl} onLoad={onLoad} onError={onError} />
          */}
          <mesh>
            <boxGeometry args={[2, 1, 3]} />
            <meshStandardMaterial color="#16a34a" />
          </mesh>
        </Stage>

        {/* Camera Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={15}
          maxPolarAngle={Math.PI / 2}
        />

        {/* Environment Map (only for high-end devices) */}
        {deviceCapability === 'high' && <Environment preset="sunset" />}
      </Suspense>
    </Canvas>
  );
}

/**
 * Example usage with LazyThreeScene:
 *
 * ```tsx
 * import { LazyThreeScene } from '@/components/three/LazyThreeScene';
 *
 * function EquipmentDetailPage({ equipmentId }) {
 *   return (
 *     <LazyThreeScene
 *       componentPath="@/components/three/Equipment3DModel"
 *       componentProps={{
 *         modelUrl: `/models/${equipmentId}.glb`,
 *         onLoad: () => console.log('Model loaded'),
 *       }}
 *       className="h-[600px] w-full"
 *     />
 *   );
 * }
 * ```
 */
