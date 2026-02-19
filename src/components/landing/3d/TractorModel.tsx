'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface TractorModelProps {
  lite?: boolean;
}

export function TractorModel({ lite = false }: TractorModelProps) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const x = state.mouse.x * 0.2;
    const y = state.mouse.y * 0.14;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, x, 0.08);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, y, 0.08);
  });

  return (
    <Float speed={1.2} rotationIntensity={0.35} floatIntensity={0.9}>
      <group ref={group} position={[0, -0.2, 0]} scale={lite ? 0.84 : 1}>
        {/* Main matte metal chassis */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[2.4, 0.9, 1.2]} />
          <meshStandardMaterial color="#121826" metalness={0.76} roughness={0.24} />
        </mesh>

        {/* Aerodynamic cockpit */}
        <mesh position={[0.2, 0.84, 0]} castShadow>
          <boxGeometry args={[1.32, 0.78, 1]} />
          <meshStandardMaterial color="#1f2937" metalness={0.65} roughness={0.28} />
        </mesh>

        {/* Glass canopy with holographic tint */}
        <mesh position={[0.26, 0.9, 0]}>
          <boxGeometry args={[1.08, 0.52, 0.88]} />
          <meshPhysicalMaterial
            color="#9fdcff"
            transmission={0.82}
            roughness={0.1}
            thickness={0.5}
            transparent
            opacity={0.62}
          />
        </mesh>

        {/* Front sensor module */}
        <mesh position={[1.34, 0.44, 0]} castShadow>
          <boxGeometry args={[0.84, 0.45, 0.9]} />
          <meshStandardMaterial color="#0b0f14" metalness={0.68} roughness={0.32} />
        </mesh>

        {/* Neon emissive strips */}
        {[0.58, -0.58].map((z, i) => (
          <mesh key={i} position={[-0.05, 0.06, z]}>
            <boxGeometry args={[2.06, 0.05, 0.05]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.7} />
          </mesh>
        ))}

        {/* Autonomous camera pods and antenna */}
        <mesh position={[0.95, 0.98, 0.38]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#86efac" emissive="#34d399" emissiveIntensity={1.2} />
        </mesh>
        <mesh position={[0.95, 0.98, -0.38]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#86efac" emissive="#34d399" emissiveIntensity={1.2} />
        </mesh>
        <mesh position={[-0.22, 1.34, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 12]} />
          <meshStandardMaterial color="#a7f3d0" metalness={0.4} roughness={0.3} />
        </mesh>

        {/* Futuristic illuminated rims */}
        {[
          [-0.9, -0.7, 0.75],
          [0.9, -0.7, 0.75],
          [-0.9, -0.7, -0.75],
          [0.9, -0.7, -0.75],
        ].map((position, i) => (
          <group key={i} position={position as [number, number, number]}>
            <mesh castShadow>
              <torusGeometry args={[0.36, 0.13, 14, 30]} />
              <meshStandardMaterial color="#030712" metalness={0.24} roughness={0.82} />
            </mesh>
            <mesh>
              <torusGeometry args={[0.25, 0.03, 10, 24]} />
              <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={1.4} />
            </mesh>
          </group>
        ))}
      </group>
    </Float>
  );
}
