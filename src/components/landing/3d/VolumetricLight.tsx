'use client';

export function VolumetricLight() {
  return (
    <mesh position={[0, 2.2, 1.5]} rotation={[-Math.PI / 2.3, 0, 0]}>
      <coneGeometry args={[2.2, 5.4, 24, 1, true]} />
      <meshBasicMaterial color="#6ee7b7" transparent opacity={0.11} depthWrite={false} />
    </mesh>
  );
}
