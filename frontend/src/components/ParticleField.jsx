import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PointMaterial, Points } from '@react-three/drei';
import * as THREE from 'three';

/* ── Generate random points in a sphere ──────────────────── */
function generateSpherePoints(count, radius) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * Math.cbrt(Math.random());
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  return positions;
}

/* ── Animated Points Cloud ───────────────────────────────── */
const StarField = () => {
  const ref = useRef();
  const positions = useMemo(() => generateSpherePoints(800, 8), []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#FF6B2B"
        size={0.015}
        sizeAttenuation
        depthWrite={false}
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

/* ── Secondary Teal Points ───────────────────────────────── */
const TealField = () => {
  const ref = useRef();
  const positions = useMemo(() => generateSpherePoints(400, 10), []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = -state.clock.elapsedTime * 0.015;
      ref.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.008) * 0.05;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00F5D4"
        size={0.01}
        sizeAttenuation
        depthWrite={false}
        opacity={0.35}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

/* ── Floating Orbs ───────────────────────────────────────── */
const FloatingOrb = ({ position, color, speed = 1 }) => {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * speed;
      ref.current.position.y = position[1] + Math.sin(t) * 0.5;
      ref.current.position.x = position[0] + Math.cos(t * 0.7) * 0.3;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} />
    </mesh>
  );
};

/* ── Main ParticleField Component ────────────────────────── */
const ParticleField = () => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.1} />
        <StarField />
        <TealField />
        <FloatingOrb position={[-3, 2, -2]} color="#FF6B2B" speed={0.6} />
        <FloatingOrb position={[4, -1, -3]} color="#00F5D4" speed={0.8} />
        <FloatingOrb position={[-2, -2, -4]} color="#8B5CF6" speed={0.5} />
        <FloatingOrb position={[3, 3, -5]} color="#FF6B2B" speed={0.4} />
        <FloatingOrb position={[0, -3, -2]} color="#00F5D4" speed={0.7} />
      </Canvas>
    </div>
  );
};

export default ParticleField;
