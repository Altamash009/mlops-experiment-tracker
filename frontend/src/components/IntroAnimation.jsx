import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  CSS-only fallback (no WebGL / loading state)                       */
/* ------------------------------------------------------------------ */
function FallbackAnimation({ onComplete }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 4200);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.fallbackRing1} />
      <div style={styles.fallbackRing2} />
      {[
        { left: '22%', top: '45%', color: '#1a72f5', delay: '0s' },
        { left: '22%', top: '55%', color: '#1a72f5', delay: '0.15s' },
        { left: '22%', top: '35%', color: '#1a72f5', delay: '0.3s' },
        { left: '22%', top: '65%', color: '#1a72f5', delay: '0.45s' },
        { left: '50%', top: '30%', color: '#7c3aed', delay: '0.6s' },
        { left: '50%', top: '42%', color: '#7c3aed', delay: '0.75s' },
        { left: '50%', top: '54%', color: '#7c3aed', delay: '0.9s' },
        { left: '50%', top: '66%', color: '#7c3aed', delay: '1.05s' },
        { left: '78%', top: '40%', color: '#ff7a17', delay: '1.2s' },
        { left: '78%', top: '52%', color: '#ff7a17', delay: '1.35s' },
        { left: '78%', top: '64%', color: '#ff7a17', delay: '1.5s' },
      ].map((n, i) => (
        <div key={i} style={{
          ...styles.fallbackNode,
          left: n.left, top: n.top,
          background: n.color,
          boxShadow: `0 0 20px ${n.color}88`,
          animationDelay: n.delay,
        }} />
      ))}
      <div style={styles.overlay}>
        <div style={styles.eyebrow}>ML OPS EXPERIMENT TRACKER</div>
        <h1 style={styles.headline}>
          <span>Track. </span>
          <span style={{ color: '#1a72f5' }}>Train. </span>
          <span style={{ color: '#ff7a17' }}>Deploy.</span>
        </h1>
        <p style={styles.subline}>
          End-to-end visibility into every experiment, model, and artifact.
        </p>
        <button style={styles.skipBtn} onClick={onComplete}>
          Enter Dashboard
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  GLB scene (Blender export)                                          */
/* ------------------------------------------------------------------ */
function MLOpsScene() {
  const { scene, animations } = useGLTF('/mlops_intro.glb');
  const mixerRef = useRef(null);
  const groupRef = useRef();

  useEffect(() => {
    if (animations && animations.length > 0) {
      const mixer = new THREE.AnimationMixer(scene);
      animations.forEach((clip) => mixer.clipAction(clip).play());
      mixerRef.current = mixer;
    }
    // Override materials with brand colours
    scene.traverse((child) => {
      if (!child.isMesh) return;
      const name = child.name || '';
      let emissive = null;
      let opacity = 1;
      let metalness = 0.1;
      let roughness = 0.3;

      if      (name.startsWith('NN_Node_L0'))  emissive = new THREE.Color(0x1a72f5);
      else if (name.startsWith('NN_Node_L1'))  emissive = new THREE.Color(0x7c3aed);
      else if (name.startsWith('NN_Node_L2'))  emissive = new THREE.Color(0xff7a17);
      else if (name.startsWith('Edge_'))       { emissive = new THREE.Color(0x4080eb); roughness = 0.8; }
      else if (name.startsWith('Pipeline_'))   emissive = new THREE.Color(0x18ccb8);
      else if (name.startsWith('Panel_'))      { emissive = new THREE.Color(0x0d1726); metalness = 0.95; opacity = 0.75; }
      else if (name.startsWith('DataPacket_')) emissive = new THREE.Color(0xff7a17);
      else if (name.startsWith('Particle_'))   emissive = new THREE.Color(0x4080eb);

      if (emissive) {
        child.material = new THREE.MeshStandardMaterial({
          color: emissive.clone().multiplyScalar(0.3),
          emissive,
          emissiveIntensity: name.startsWith('Edge_') ? 0.4 : name.startsWith('Pipeline_') ? 1.2 : 1.8,
          metalness,
          roughness,
          transparent: opacity < 1,
          opacity,
        });
      }
    });
  }, [scene, animations]);

  useFrame((_, delta) => {
    if (mixerRef.current) mixerRef.current.update(delta);
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.07;
    }
  });

  return <primitive ref={groupRef} object={scene} scale={0.55} />;
}

/* ------------------------------------------------------------------ */
/*  Ambient star/particle field                                         */
/* ------------------------------------------------------------------ */
function StarField() {
  const meshRef = useRef();
  const count = 100;

  const positions = React.useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 25;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.025;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#4488ff" size={0.07} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */
export default function IntroAnimation({ onComplete }) {
  const [webgl, setWebgl]   = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      if (!(c.getContext('webgl') || c.getContext('experimental-webgl'))) setWebgl(false);
    } catch { setWebgl(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 6500);
    return () => clearTimeout(t);
  }, [onComplete]);

  const handleSkip = () => { setVisible(false); onComplete?.(); };

  if (!visible) return null;
  if (!webgl)   return <FallbackAnimation onComplete={handleSkip} />;

  return (
    <div style={styles.wrapper}>
      {/* 3-D canvas */}
      <Canvas
        style={styles.canvas}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => gl.setClearColor('#0a0a0a', 1)}
      >
        <PerspectiveCamera makeDefault position={[8, -6, 2]} fov={45} near={0.1} far={200} />
        <ambientLight intensity={0.04} />
        <pointLight position={[6, -3, 8]}  color="#ff7a17" intensity={350} decay={2} />
        <pointLight position={[-8, 4, 5]}  color="#1a72f5" intensity={180} decay={2} />
        <pointLight position={[0, 10, -2]} color="#18ccb8" intensity={100} decay={2} />
        <StarField />
        <Suspense fallback={null}>
          <MLOpsScene />
        </Suspense>
      </Canvas>

      {/* Overlay text */}
      <div style={styles.overlay}>
        <div style={styles.eyebrow}>ML OPS EXPERIMENT TRACKER</div>
        <h1 style={styles.headline}>
          Track.{' '}
          <span style={{ color: '#1a72f5' }}>Train.</span>{' '}
          <span style={{ color: '#ff7a17' }}>Deploy.</span>
        </h1>
        <p style={styles.subline}>
          End-to-end visibility into every experiment, model, and artifact.
        </p>
        <button style={styles.skipBtn} onClick={handleSkip}
          onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.08)'}
          onMouseLeave={e => e.target.style.background = 'transparent'}
        >
          Enter Dashboard →
        </button>
      </div>

      {/* Bottom gradient */}
      <div style={styles.bottomFade} />
    </div>
  );
}

/* Pre-load the GLB */
useGLTF.preload('/mlops_intro.glb');

/* ------------------------------------------------------------------ */
/*  Styles                                                              */
/* ------------------------------------------------------------------ */
const styles = {
  wrapper: {
    position: 'fixed',
    inset: 0,
    background: '#0a0a0a',
    zIndex: 9999,
    overflow: 'hidden',
    fontFamily: "'Inter', 'Geist', system-ui, sans-serif",
  },
  canvas: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 24px',
    textAlign: 'center',
    pointerEvents: 'none',
  },
  eyebrow: {
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    fontSize: '12px',
    fontWeight: 400,
    letterSpacing: '1.4px',
    color: '#7d8187',
    textTransform: 'uppercase',
    marginBottom: '20px',
  },
  headline: {
    fontSize: 'clamp(48px, 6vw, 96px)',
    fontWeight: 400,
    lineHeight: 1,
    letterSpacing: '-2.4px',
    color: '#ffffff',
    margin: '0 0 24px',
  },
  subline: {
    fontSize: '18px',
    fontWeight: 400,
    lineHeight: '28px',
    color: '#dadbdf',
    maxWidth: '520px',
    margin: '0 0 48px',
  },
  skipBtn: {
    pointerEvents: 'all',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: 400,
    color: '#ffffff',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: '9999px',
    cursor: 'pointer',
    transition: 'background 0.2s, border-color 0.2s',
    letterSpacing: 0,
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '200px',
    background: 'linear-gradient(to bottom, transparent, #0a0a0a)',
    pointerEvents: 'none',
  },
  /* Fallback */
  fallbackRing1: {
    position: 'absolute',
    width: '60vmin',
    height: '60vmin',
    border: '1px solid rgba(16,204,184,0.4)',
    borderRadius: '50%',
    animation: 'ringRotate 8s linear infinite',
  },
  fallbackRing2: {
    position: 'absolute',
    width: '70vmin',
    height: '70vmin',
    border: '1px solid rgba(26,114,245,0.3)',
    borderRadius: '50%',
    animation: 'ringRotate 12s linear infinite reverse',
  },
  fallbackNode: {
    position: 'absolute',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    animation: 'nodePop 0.5s ease both',
  },
};
