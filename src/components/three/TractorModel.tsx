'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { Suspense } from 'react';

// Placeholder 3D tractor geometry
function TractorMesh() {
  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2, 1, 3]} />
        <meshStandardMaterial color="#22c55e" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Cabin */}
      <mesh position={[0, 1.3, -0.5]}>
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshStandardMaterial color="#10b981" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Front wheels */}
      <mesh position={[-0.8, 0, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#1f2937" roughness={0.8} />
      </mesh>
      <mesh position={[0.8, 0, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#1f2937" roughness={0.8} />
      </mesh>

      {/* Rear wheels (larger) */}
      <mesh position={[-0.9, 0.2, -1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.4, 16]} />
        <meshStandardMaterial color="#1f2937" roughness={0.8} />
      </mesh>
      <mesh position={[0.9, 0.2, -1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.4, 16]} />
        <meshStandardMaterial color="#1f2937" roughness={0.8} />
      </mesh>

      {/* Exhaust pipe */}
      <mesh position={[0.5, 1.8, 0.3]}>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
        <meshStandardMaterial color="#374151" metalness={0.9} />
      </mesh>
    </group>
  );
}

export function TractorModel() {
  return (
    <Canvas style={{ width: '100%', height: '100%' }}>
      <PerspectiveCamera makeDefault position={[5, 3, 5]} fov={50} />

      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="sunset" />

        <TractorMesh />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
          autoRotate
          autoRotateSpeed={1}
        />
      </Suspense>
    </Canvas>
  );
}
