'use client';

import { Environment, OrbitControls, Sparkles } from '@react-three/drei';
import { TractorModel } from './TractorModel';
import { ShaderPlane } from './ShaderPlane';
import { HolographicGrid } from './HolographicGrid';
import { VolumetricLight } from './VolumetricLight';

interface EnvironmentSceneProps {
  lite?: boolean;
}

export function EnvironmentScene({ lite = false }: EnvironmentSceneProps) {
  return (
    <>
      <color attach="background" args={['#050a08']} />
      <fog attach="fog" args={['#050a08', 6, 18]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[6, 7, 4]} intensity={1.3} color="#99f6e4" castShadow />
      <spotLight position={[-3, 5, 3]} intensity={0.9} color="#22c55e" angle={0.5} penumbra={0.4} />

      {!lite && <ShaderPlane />}
      <TractorModel lite={lite} />
      {!lite && <HolographicGrid />}
      {!lite && <VolumetricLight />}

      {!lite && <Sparkles count={32} scale={6} size={2.2} speed={0.3} color="#6ee7b7" />}
      <Environment preset="night" />
      <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2.2} minPolarAngle={Math.PI / 2.8} />
    </>
  );
}
