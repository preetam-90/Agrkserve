'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
varying vec2 vUv;

float noise(vec2 p) {
  return sin(p.x) * sin(p.y);
}

void main() {
  vec2 uv = vUv;
  float wave = sin((uv.x + uTime * 0.03) * 9.0) * 0.05;
  uv.y += wave;

  float n = noise(uv * 24.0 + uTime * 0.04) * 0.06;

  vec3 deep = vec3(0.04, 0.06, 0.05);
  vec3 emerald = vec3(0.13, 0.77, 0.46);
  vec3 cyan = vec3(0.02, 0.71, 0.81);

  float grad = smoothstep(0.0, 1.0, uv.y + n);
  vec3 col = mix(deep, emerald, grad);
  col = mix(col, cyan, smoothstep(0.55, 1.0, uv.x + n));

  gl_FragColor = vec4(col, 0.62);
}
`;

export function ShaderPlane() {
  const material = useRef<THREE.ShaderMaterial>(null);

  useFrame((_, delta) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value += delta;
  });

  return (
    <mesh position={[0, 0, -3]}>
      <planeGeometry args={[12, 8]} />
      <shaderMaterial
        ref={material}
        transparent
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ uTime: { value: 0 } }}
      />
    </mesh>
  );
}
