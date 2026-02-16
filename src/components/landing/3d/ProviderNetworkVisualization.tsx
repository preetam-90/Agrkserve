'use client';

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface NetworkNode {
  id: string;
  position: [number, number, number];
  type: 'provider' | 'farmer' | 'equipment';
}

interface NetworkConnection {
  from: string;
  to: string;
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function NetworkParticles({ nodes, connections }: { nodes: NetworkNode[]; connections: NetworkConnection[] }) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Create node positions
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(nodes.length * 3);
    const cols = new Float32Array(nodes.length * 3);
    
    const colorMap: Record<string, [number, number, number]> = {
      provider: [0.06, 0.72, 0.51],
      farmer: [0.02, 0.71, 0.83],
      equipment: [0.96, 0.62, 0.04],
    };

    nodes.forEach((node, i) => {
      pos[i * 3] = node.position[0];
      pos[i * 3 + 1] = node.position[1];
      pos[i * 3 + 2] = node.position[2];
      
      const [r, g, b] = colorMap[node.type] || [1, 1, 1];
      cols[i * 3] = r;
      cols[i * 3 + 1] = g;
      cols[i * 3 + 2] = b;
    });
    
    return [pos, cols];
  }, [nodes]);

  // Create connection lines
  const linePositions = useMemo(() => {
    const pos: number[] = [];
    connections.forEach((conn) => {
      const fromNode = nodes.find((n) => n.id === conn.from);
      const toNode = nodes.find((n) => n.id === conn.to);
      if (fromNode && toNode) {
        pos.push(...fromNode.position, ...toNode.position);
      }
    });
    return new Float32Array(pos);
  }, [nodes, connections]);

  // Animation
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      
      const positionAttr = pointsRef.current.geometry.attributes.position;
      if (positionAttr) {
        const posArray = positionAttr.array as Float32Array;
        for (let i = 0; i < posArray.length; i += 3) {
          posArray[i + 1] += Math.sin(state.clock.elapsedTime + i) * 0.001;
        }
        positionAttr.needsUpdate = true;
      }
    }
    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group>
      {/* Particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {/* Connection lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#10b981"
          transparent
          opacity={0.2}
        />
      </lineSegments>
    </group>
  );
}

function Scene({ reducedMotion }: { reducedMotion?: boolean }) {
  // Generate network data
  const { nodes, connections } = useMemo(() => {
    const nodeData: NetworkNode[] = [];
    const connectionData: NetworkConnection[] = [];
    const nodeTypes: NetworkNode['type'][] = ['provider', 'farmer', 'equipment'];

    // Create nodes in a sphere-like distribution
    for (let i = 0; i < 60; i++) {
      const theta = pseudoRandom(i * 6 + 1) * Math.PI * 2;
      const phi = Math.acos(2 * pseudoRandom(i * 6 + 2) - 1);
      const radius = 2 + pseudoRandom(i * 6 + 3) * 2;
      const typeIndex = Math.floor(pseudoRandom(i * 6 + 4) * nodeTypes.length);

      nodeData.push({
        id: `node-${i}`,
        position: [
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi),
        ],
        type: nodeTypes[typeIndex],
      });
    }

    // Create some connections
    for (let i = 0; i < 30; i++) {
      const from = Math.floor(pseudoRandom(i * 2 + 101) * nodeData.length);
      const to = Math.floor(pseudoRandom(i * 2 + 102) * nodeData.length);
      if (from !== to) {
        connectionData.push({
          from: nodeData[from].id,
          to: nodeData[to].id,
        });
      }
    }

    return { nodes: nodeData, connections: connectionData };
  }, []);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {!reducedMotion && (
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
          <NetworkParticles nodes={nodes} connections={connections} />
        </Float>
      )}
      {reducedMotion && (
        <NetworkParticles nodes={nodes} connections={connections} />
      )}
    </>
  );
}

interface ProviderNetworkVisualizationProps {
  reducedMotion?: boolean;
  className?: string;
}

export function ProviderNetworkVisualization({ reducedMotion, className = '' }: ProviderNetworkVisualizationProps) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default ProviderNetworkVisualization;
