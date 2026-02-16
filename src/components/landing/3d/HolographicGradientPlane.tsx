'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HolographicGradientPlaneProps {
  lite?: boolean;
}

const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform float uIntensity;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(27.61, 91.27))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = vUv;
  float t = uTime * 0.18;

  float waveA = sin((uv.x * 6.0 + t * 7.0)) * 0.04;
  float waveB = cos((uv.y * 8.0 - t * 5.0)) * 0.03;
  uv.x += waveB;
  uv.y += waveA;

  float n = noise(uv * 5.2 + t * 2.0) * 0.24;
  float glowBand = smoothstep(0.12, 0.78, uv.y + n * 0.5);

  vec3 base = vec3(0.01, 0.03, 0.02);
  vec3 emerald = vec3(0.04, 0.68, 0.43);
  vec3 cyan = vec3(0.03, 0.58, 0.72);
  vec3 soil = vec3(0.38, 0.20, 0.09);

  vec3 col = mix(base, emerald, glowBand);
  col = mix(col, cyan, smoothstep(0.45, 0.95, uv.x + n));
  col = mix(col, soil, smoothstep(0.62, 0.98, 1.0 - uv.y));

  float vignette = smoothstep(1.25, 0.35, length(uv - vec2(0.5, 0.5)));
  float alpha = (0.55 + n * 0.2) * vignette * uIntensity;

  gl_FragColor = vec4(col, alpha);
}
`;

export function HolographicGradientPlane({ lite = false }: HolographicGradientPlaneProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: lite ? 0.55 : 0.9 },
    }),
    [lite]
  );

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value += delta;
  });

  return (
    <mesh position={[0, 0, -2.8]}>
      <planeGeometry args={[14, 9]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
