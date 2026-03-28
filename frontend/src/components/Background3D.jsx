import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Wireframe } from '@react-three/drei';

const ScrollObject = () => {
  const meshRef = useRef();

  useFrame((state) => {
    // Read the window scroll position directly inside the render loop for silky smooth rotation
    const scrollY = window.scrollY;
    
    // Very subtle idle rotation combined with scroll-linked rotation
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1 + scrollY * 0.001;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.05 + scrollY * 0.0005;
    }
  });

  return (
    <Float
      speed={2} // Animation speed
      rotationIntensity={0.5} // XYZ rotation intensity
      floatIntensity={0.5} // Up/down float intensity
      floatingRange={[-0.2, 0.2]} // Range of y-axis values
    >
      <mesh ref={meshRef} position={[2, 0, -2]} scale={1.8}>
        {/* We use an Icosahedron (D20-like shape) to represent an elegant web3 node */}
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial 
          color="#FF8131" 
          wireframe={false} 
          roughness={0.2}
          metalness={0.8}
          transparent={true}
          opacity={0.15}
        />
        {/* Adds a sophisticated wireframe shell to the shape */}
        <mesh>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color="#030D1E" wireframe={true} transparent opacity={0.08} />
        </mesh>
      </mesh>
    </Float>
  );
};

const Background3D = () => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0, // Sits strictly in the background
        pointerEvents: 'none',
        background: '#FAFAFA' // Clean white background
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#FF8131" />
        
        <ScrollObject />
      </Canvas>
    </div>
  );
};

export default Background3D;
