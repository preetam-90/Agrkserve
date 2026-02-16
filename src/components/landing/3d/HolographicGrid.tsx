'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function HolographicGrid() {
  const ring = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!ring.current) return;
    ring.current.rotation.z += delta * 0.2;
  });

  return (
    <mesh ref={ring} position={[0, -1.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.8, 2.8, 64, 1]} />
      <meshBasicMaterial color="#22c55e" transparent opacity={0.25} side={THREE.DoubleSide} />
    </mesh>
  );
}
