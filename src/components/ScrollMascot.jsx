import React, { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

/* SANYAM: Insert Three.js Loader for Hackathon Symbol Asset Here */
/* To swap this for a 3D model:
   1. npm install @react-three/fiber @react-three/drei
   2. import { Canvas } from '@react-three/fiber'
   3. import { useGLTF } from '@react-three/drei'
   4. Replace the <img> below with a <Canvas> rendering your GLB/GLTF model.
*/

/* ── Scroll state labels ──────────────────────────────── */
const stateConfig = {
  home:      { label: 'Idle',     emoji: '🟢', rotate: 0,   scale: 1,    y: 0 },
  company:   { label: 'Scanning', emoji: '🔍', rotate: -12, scale: 1.08, y: -8 },
  candidate: { label: 'Verified', emoji: '✅', rotate: 8,   scale: 1.12, y: -12 },
  registry:  { label: 'Watching', emoji: '🛡️', rotate: -4,  scale: 1.0,  y: -4 },
  team:      { label: 'Cheering', emoji: '🎉', rotate: 6,   scale: 1.05, y: -6 },
};

const ScrollMascot = () => {
  const { scrollY } = useScroll();
  const [scrollState, setScrollState] = useState('home');

  useMotionValueEvent(scrollY, 'change', (y) => {
    const h = window.innerHeight;
    let s = 'home';
    if (y < h * 0.8) s = 'home';
    else if (y < h * 2.2) s = 'company';
    else if (y < h * 3.8) s = 'candidate';
    else if (y < h * 5.0) s = 'registry';
    else s = 'team';

    if (s !== scrollState) setScrollState(s);
  });

  const cfg = stateConfig[scrollState];

  /* Bobbing animation for 'home' state */
  const [bobY, setBobY] = useState(0);

  useEffect(() => {
    let frame;
    const animate = () => {
      const t = Date.now() / 1000;
      if (scrollState === 'home') {
        setBobY(Math.sin(t * 0.8) * 10);
      } else if (scrollState === 'company') {
        setBobY(Math.sin(t * 2.5) * 4);
      } else if (scrollState === 'candidate') {
        setBobY(Math.abs(Math.sin(t * 1.8)) * 8);
      } else {
        setBobY(Math.sin(t * 0.6) * 6);
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [scrollState]);

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 40,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      {/* Neon cat container */}
      <motion.div
        animate={{
          rotate: cfg.rotate,
          scale: cfg.scale,
          y: cfg.y + bobY,
        }}
        transition={{
          type: 'spring',
          stiffness: 120,
          damping: 14,
        }}
        style={{
          width: 180,
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Neon glow ring behind the cat */}
        <div
          style={{
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(138,43,226,0.08) 0%, rgba(0,255,255,0.04) 50%, transparent 70%)',
            filter: 'blur(8px)',
          }}
        />
        <img
          src="/neon-cat.png"
          alt="HireChain Neon Cat Mascot"
          style={{
            width: 160,
            height: 160,
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 16px rgba(138,43,226,0.35)) drop-shadow(0 0 32px rgba(0,255,255,0.15))',
            position: 'relative',
            zIndex: 1,
          }}
        />
      </motion.div>

      {/* State label pill */}
      <motion.div
        key={scrollState}
        initial={{ opacity: 0, y: 8, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(138,43,226,0.12)',
          borderRadius: 999,
          padding: '0.35rem 0.85rem',
          fontSize: '0.7rem',
          fontWeight: 700,
          fontFamily: "'Inter', sans-serif",
          color: '#6A737D',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 0 12px rgba(138,43,226,0.06)',
          whiteSpace: 'nowrap',
        }}
      >
        {cfg.emoji} {cfg.label}
      </motion.div>
    </div>
  );
};

export default ScrollMascot;
