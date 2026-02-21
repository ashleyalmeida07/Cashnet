'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Create earth geometry with points (optimized for performance)
  const { pointsGeometry, linesGeometry } = useMemo(() => {
    const radius = 1.8;
    const pointsCount = 150; // Reduced from 500
    const seed = 12345; // Use seed for consistent randomness
    
    // Seeded random for consistency
    let seedVal = seed;
    const seededRandom = () => {
      seedVal = (seedVal * 9301 + 49297) % 233280;
      return seedVal / 233280;
    };

    // Create random points on sphere surface
    const positions = new Float32Array(pointsCount * 3);
    for (let i = 0; i < pointsCount; i++) {
      const theta = seededRandom() * Math.PI * 2;
      const phi = Math.acos(seededRandom() * 2 - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Create connection lines between random points (reduced count)
    const lineCount = 80; // Reduced from 200
    const linePositions = new Float32Array(lineCount * 6);
    for (let i = 0; i < lineCount; i++) {
      const idx1 = Math.floor(seededRandom() * pointsCount);
      const idx2 = Math.floor(seededRandom() * pointsCount);
      
      linePositions[i * 6] = positions[idx1 * 3];
      linePositions[i * 6 + 1] = positions[idx1 * 3 + 1];
      linePositions[i * 6 + 2] = positions[idx1 * 3 + 2];
      linePositions[i * 6 + 3] = positions[idx2 * 3];
      linePositions[i * 6 + 4] = positions[idx2 * 3 + 1];
      linePositions[i * 6 + 5] = positions[idx2 * 3 + 2];
    }

    const linesGeo = new THREE.BufferGeometry();
    linesGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    return { pointsGeometry: pointsGeo, linesGeometry: linesGeo };
  }, []);

  // Animate rotation
  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.1;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.1;
    }
    if (linesRef.current) {
      linesRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group>
      {/* Main Earth sphere with wireframe */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshStandardMaterial
          color="#0a0e27"
          wireframe
          wireframeLinewidth={1}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Glowing points on surface */}
      <points ref={pointsRef} geometry={pointsGeometry}>
        <pointsMaterial
          size={0.05}
          color="#00d4ff"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {/* Connection lines */}
      <lineSegments ref={linesRef} geometry={linesGeometry}>
        <lineBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.15}
          linewidth={1}
        />
      </lineSegments>

      {/* Outer glow ring */}
      <mesh>
        <sphereGeometry args={[1.9, 32, 32]} />
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

export default function TechEarth() {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Stars
          radius={100}
          depth={50}
          count={500}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />
        <Earth />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
}
