'use client';

import { Canvas } from '@react-three/fiber';
import { EnvironmentScene } from '../3d/EnvironmentScene';
import { ScrollCameraRig } from '../3d/ScrollCameraRig';

export function HeroVisualCanvas({ lite = false }: { lite?: boolean }) {
  return (
    <div className="absolute inset-0">
      <Canvas
        shadows={!lite}
        camera={{ position: [0, 1.3, 5], fov: lite ? 42 : 36 }}
        dpr={lite ? 1 : [1, 2]}
      >
        <EnvironmentScene lite={lite} />
        <ScrollCameraRig />
      </Canvas>
    </div>
  );
}
