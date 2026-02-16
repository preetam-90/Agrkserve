'use client';

import { useEffect, useRef, useState } from 'react';
import { Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import * as THREE from 'three';

interface FloatingMachineProps {
  quality: 'high' | 'lite';
}

const MODEL_PATHS = [
  '/tractor_optimized.glb',
  '/lamborghini_tractor_r6_125_dcr__www.vecarz.com.glb',
  '/models/futuristic-tractor.glb',
];

function ProceduralMachine({ quality }: FloatingMachineProps) {
  return (
    <group scale={quality === 'high' ? 1 : 0.9}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[2.2, 0.9, 1.2]} />
        <meshStandardMaterial color="#0f1720" metalness={0.75} roughness={0.32} />
      </mesh>
      <mesh position={[0.1, 0.8, 0]} castShadow>
        <boxGeometry args={[1.3, 0.75, 0.95]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.12, 0.85, 0]}>
        <boxGeometry args={[1.02, 0.5, 0.82]} />
        <meshPhysicalMaterial
          color="#9dd7ff"
          transparent
          opacity={0.62}
          transmission={0.9}
          roughness={0.08}
          thickness={0.4}
        />
      </mesh>
      <mesh position={[1.2, 0.33, 0]} castShadow>
        <boxGeometry args={[0.72, 0.36, 0.85]} />
        <meshStandardMaterial color="#111827" metalness={0.7} roughness={0.35} />
      </mesh>

      {[
        [-0.8, -0.62, 0.7],
        [0.8, -0.62, 0.7],
        [-0.8, -0.62, -0.7],
        [0.8, -0.62, -0.7],
      ].map((position, index) => (
        <group key={index} position={position as [number, number, number]}>
          <mesh castShadow>
            <torusGeometry args={[0.33, 0.12, 14, 24]} />
            <meshStandardMaterial color="#020617" roughness={0.85} metalness={0.24} />
          </mesh>
          <mesh>
            <torusGeometry args={[0.24, 0.03, 8, 20]} />
            <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.4} />
          </mesh>
        </group>
      ))}

      <mesh position={[-0.02, 0.05, 0.56]}>
        <boxGeometry args={[1.95, 0.04, 0.04]} />
        <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={1.8} />
      </mesh>
      <mesh position={[-0.02, 0.05, -0.56]}>
        <boxGeometry args={[1.95, 0.04, 0.04]} />
        <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={1.8} />
      </mesh>
    </group>
  );
}

export function FloatingMachine({ quality }: FloatingMachineProps) {
  const group = useRef<THREE.Group>(null);
  const [externalModel, setExternalModel] = useState<THREE.Group | null>(null);
  const [externalScale, setExternalScale] = useState(1);

  useEffect(() => {
    let mounted = true;
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const tryLoadModel = (index: number) => {
      if (index >= MODEL_PATHS.length) {
        if (mounted) setExternalModel(null);
        return;
      }

      loader.load(
        MODEL_PATHS[index],
        (gltf) => {
          if (!mounted) return;

          const model = gltf.scene.clone(true);
          model.traverse((object) => {
            if ((object as THREE.Mesh).isMesh) {
              const mesh = object as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          });

          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          // Center and normalize unknown source-model dimensions so it remains visible.
          model.position.sub(center);
          const maxDimension = Math.max(size.x, size.y, size.z) || 1;
          const targetSize = quality === 'high' ? 3.1 : 2.6;
          const normalizedScale = targetSize / maxDimension;
          setExternalScale(normalizedScale);

          setExternalModel(model);
        },
        undefined,
        () => {
          tryLoadModel(index + 1);
        }
      );
    };

    // Prefer a real GLB export when available, then gracefully fallback to procedural geometry.
    tryLoadModel(0);

    return () => {
      mounted = false;
    };
  }, [quality]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const targetY = state.pointer.x * 0.35;
    const targetX = state.pointer.y * 0.14;

    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.08);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.08);
    group.current.position.y += Math.sin(state.clock.elapsedTime * 0.9) * delta * 0.15;
  });

  return (
    <Float
      speed={quality === 'high' ? 1.2 : 0.8}
      rotationIntensity={quality === 'high' ? 0.3 : 0.16}
      floatIntensity={quality === 'high' ? 0.9 : 0.45}
    >
      <group ref={group} position={[0, -0.15, 0]}>
        {externalModel ? (
          <primitive
            object={externalModel}
            scale={externalScale}
            position={[0, -0.45, 0]}
            rotation={[0, Math.PI * 0.12, 0]}
          />
        ) : (
          <ProceduralMachine quality={quality} />
        )}
      </group>
    </Float>
  );
}
