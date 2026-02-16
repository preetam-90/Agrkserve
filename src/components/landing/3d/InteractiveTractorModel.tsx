'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import * as THREE from 'three';

const MODEL_PATHS = [
  '/tractor_optimized.glb',
  '/lamborghini_tractor_r6_125_dcr__www.vecarz.com.glb',
];

interface InteractiveTractorModelProps {
  quality: 'high' | 'lite';
  hovered: boolean;
  turboMode: boolean;
  reducedMotion?: boolean;
  mode?: 'default' | 'cinematic';
  scrollProgress?: number;
  activeStep?: number;
  onHoverChange: (hovered: boolean) => void;
  onToggleTurbo: () => void;
  onLoadedChange: (loaded: boolean) => void;
}

function ProceduralFallback({ hovered, turboMode }: { hovered: boolean; turboMode: boolean }) {
  const emissiveColor = turboMode ? '#22d3ee' : '#34d399';
  const emissiveIntensity = hovered ? 2.2 : 1.4;

  return (
    <group>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[2.2, 0.85, 1.15]} />
        <meshStandardMaterial color="#101827" metalness={0.72} roughness={0.3} />
      </mesh>

      <mesh position={[0.08, 0.78, 0]} castShadow>
        <boxGeometry args={[1.2, 0.7, 0.9]} />
        <meshStandardMaterial color="#1f2937" metalness={0.66} roughness={0.28} />
      </mesh>

      <mesh position={[0.08, 0.82, 0]}>
        <boxGeometry args={[0.96, 0.45, 0.76]} />
        <meshPhysicalMaterial
          color="#9fdcff"
          transmission={0.85}
          transparent
          opacity={0.62}
          roughness={0.08}
          thickness={0.45}
        />
      </mesh>

      {[
        [-0.78, -0.6, 0.66],
        [0.78, -0.6, 0.66],
        [-0.78, -0.6, -0.66],
        [0.78, -0.6, -0.66],
      ].map((position, index) => (
        <group key={index} position={position as [number, number, number]}>
          <mesh castShadow>
            <torusGeometry args={[0.33, 0.12, 14, 26]} />
            <meshStandardMaterial color="#020617" roughness={0.84} metalness={0.24} />
          </mesh>
          <mesh>
            <torusGeometry args={[0.24, 0.03, 10, 24]} />
            <meshStandardMaterial
              color={emissiveColor}
              emissive={emissiveColor}
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
        </group>
      ))}

      <mesh position={[-0.02, 0.04, 0.52]}>
        <boxGeometry args={[1.9, 0.04, 0.04]} />
        <meshStandardMaterial
          color={emissiveColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      <mesh position={[-0.02, 0.04, -0.52]}>
        <boxGeometry args={[1.9, 0.04, 0.04]} />
        <meshStandardMaterial
          color={emissiveColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
    </group>
  );
}

export function InteractiveTractorModel({
  quality,
  hovered,
  turboMode,
  reducedMotion = false,
  mode = 'default',
  scrollProgress = 0,
  activeStep = 0,
  onHoverChange,
  onToggleTurbo,
  onLoadedChange,
}: InteractiveTractorModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [externalModel, setExternalModel] = useState<THREE.Group | null>(null);
  const [externalScale, setExternalScale] = useState(1);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setCanHover(mediaQuery.matches);
    update();

    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    let mounted = true;
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    // Simple loader without Draco - the model is not Draco-compressed
    const loadTimeout = setTimeout(() => {
      if (mounted && !externalModel) {
        console.warn('[TractorModel] Loading timeout, using procedural fallback');
        onLoadedChange(true); // Mark as "loaded" with fallback
      }
    }, 10000); // 10 second timeout

    const tryLoadModel = (index: number) => {
      if (index >= MODEL_PATHS.length) {
        if (mounted) {
          clearTimeout(loadTimeout);
          onLoadedChange(true); // Use procedural fallback
        }
        return;
      }

      console.log(`[TractorModel] Attempting to load: ${MODEL_PATHS[index]}`);

      loader.load(
        MODEL_PATHS[index],
        (gltf) => {
          if (!mounted) return;
          clearTimeout(loadTimeout);

          console.log('[TractorModel] Model loaded successfully');

          const model = gltf.scene.clone(true);
          model.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              object.castShadow = true;
              object.receiveShadow = true;
            }
          });

          const bounds = new THREE.Box3().setFromObject(model);
          const size = bounds.getSize(new THREE.Vector3());
          const center = bounds.getCenter(new THREE.Vector3());

          model.position.sub(center);

          const maxDimension = Math.max(size.x, size.y, size.z) || 1;
          const targetSize = quality === 'high' ? 6.8 : 5.6;
          setExternalScale(targetSize / maxDimension);
          setExternalModel(model);
          onLoadedChange(true);
        },
        (progress) => {
          if (progress.total > 0) {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            console.log(`[TractorModel] Loading: ${percent}%`);
          }
        },
        (error) => {
          console.error(`[TractorModel] Failed to load ${MODEL_PATHS[index]}:`, error);
          tryLoadModel(index + 1);
        }
      );
    };

    tryLoadModel(0);

    return () => {
      mounted = false;
      clearTimeout(loadTimeout);
    };
  }, [onLoadedChange, quality, externalModel]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const cinematic = mode === 'cinematic';
    const pointerX = reducedMotion || !canHover ? 0 : state.pointer.x;
    const pointerY = reducedMotion || !canHover ? 0 : state.pointer.y;
    const idleWave = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.95) * 0.055;
    const idleRoll = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.5) * 0.015;

    const targetRotationX = cinematic ? idleRoll * 0.8 : -pointerY * 0.12;
    const targetRotationY = cinematic
      ? state.clock.elapsedTime * 0.12 + (activeStep - 1.5) * 0.08
      : pointerX * 0.2;
    const targetPositionX = cinematic ? (activeStep - 1.5) * 0.045 : pointerX * 0.15;
    const targetPositionY = cinematic
      ? -0.2 + idleWave + scrollProgress * 0.08
      : -0.2 + (hovered && !reducedMotion ? 0.1 : 0);
    const targetPositionZ = cinematic ? -0.03 * scrollProgress : -Math.abs(pointerX) * 0.03;
    const targetScale = cinematic
      ? 0.95 + (quality === 'high' ? 0.01 : 0) + scrollProgress * 0.006
      : hovered && !reducedMotion
        ? 1.04
        : 1;

    group.rotation.x = THREE.MathUtils.damp(
      group.rotation.x,
      targetRotationX,
      cinematic ? 4.2 : 8,
      delta
    );
    group.rotation.y = THREE.MathUtils.damp(
      group.rotation.y,
      targetRotationY,
      cinematic ? 2.5 : 8,
      delta
    );
    group.position.x = THREE.MathUtils.damp(
      group.position.x,
      targetPositionX,
      cinematic ? 4.4 : 8,
      delta
    );
    group.position.y = THREE.MathUtils.damp(
      group.position.y,
      targetPositionY,
      cinematic ? 4.2 : 8,
      delta
    );
    group.position.z = THREE.MathUtils.damp(
      group.position.z,
      targetPositionZ,
      cinematic ? 4.2 : 8,
      delta
    );
    group.scale.setScalar(
      THREE.MathUtils.damp(group.scale.x, targetScale, cinematic ? 5.5 : 10, delta)
    );
  });

  return (
    <group
      ref={groupRef}
      position={[0, -0.2, 0]}
      onPointerEnter={(event) => {
        event.stopPropagation();
        if (mode === 'default' && canHover && !reducedMotion) onHoverChange(true);
      }}
      onPointerLeave={(event) => {
        event.stopPropagation();
        if (mode === 'default') onHoverChange(false);
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        if (mode === 'default' && canHover && !reducedMotion) onToggleTurbo();
      }}
    >
      {externalModel ? (
        <primitive
          object={externalModel}
          scale={externalScale}
          rotation={[0, Math.PI * 0.15, 0]}
          position={[0, -0.85, 0]}
        />
      ) : (
        <group scale={2.1}>
          <ProceduralFallback hovered={hovered} turboMode={turboMode} />
        </group>
      )}
    </group>
  );
}
