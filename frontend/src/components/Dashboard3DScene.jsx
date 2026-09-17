import React, { useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─────────────────────────────────────────────────────────────
   Neural Network — 3 layers of glowing sphere nodes + edges
   ───────────────────────────────────────────────────────────── */
// Module-level constants (stable, no re-render dependency)
const NN_LAYERS = [
  { count: 4, x: -2.8, color: new THREE.Color(0x1a72f5) },  // blue   – input
  { count: 6, x:  0.0, color: new THREE.Color(0x7c3aed) },  // violet – hidden
  { count: 3, x:  2.8, color: new THREE.Color(0xff7a17) },  // orange – output
];
const NN_SPACING = 0.72;

function NeuralNetworkNodes({ scrollRef }) {
  const groupRef = useRef();

  /* Build node positions */
  const nodePositions = useMemo(() => {
    const list = [];
    NN_LAYERS.forEach((layer, li) => {
      const yStart = -((layer.count - 1) * NN_SPACING) / 2;
      for (let ni = 0; ni < layer.count; ni++) {
        list.push({ pos: [layer.x, yStart + ni * NN_SPACING, 0], color: layer.color, li, ni });
      }
    });
    return list;
  }, []);

  /* Build edge pairs */
  const edges = useMemo(() => {
    const pairs = [];
    for (let li = 0; li < NN_LAYERS.length - 1; li++) {
      const layerA = NN_LAYERS[li];
      const layerB = NN_LAYERS[li + 1];
      const yStartA = -((layerA.count - 1) * NN_SPACING) / 2;
      const yStartB = -((layerB.count - 1) * NN_SPACING) / 2;
      for (let a = 0; a < layerA.count; a++) {
        for (let b = 0; b < layerB.count; b++) {
          pairs.push({
            start: new THREE.Vector3(layerA.x, yStartA + a * NN_SPACING, 0),
            end:   new THREE.Vector3(layerB.x, yStartB + b * NN_SPACING, 0),
          });
        }
      }
    }
    return pairs;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const scroll = scrollRef.current;          // 0 → 1
    const t      = clock.getElapsedTime();

    /* Rotation driven by both time and scroll */
    groupRef.current.rotation.y = t * 0.18 + scroll * Math.PI * 2.2;
    groupRef.current.rotation.x = Math.sin(t * 0.25) * 0.18 + (scroll - 0.5) * 0.55;
    groupRef.current.position.z = (scroll - 0.5) * 0.8;
    groupRef.current.scale.setScalar(0.82 + scroll * 0.36);
  });

  return (
    <group ref={groupRef}>
      {/* Nodes */}
      {nodePositions.map((n, i) => (
        <mesh key={i} position={n.pos}>
          <sphereGeometry args={[0.16, 20, 14]} />
          <meshStandardMaterial
            color={n.color}
            emissive={n.color}
            emissiveIntensity={1.8}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* Edges */}
      {edges.map((e, i) => {
        const dir    = new THREE.Vector3().subVectors(e.end, e.start);
        const length = dir.length();
        const mid    = new THREE.Vector3().addVectors(e.start, e.end).multiplyScalar(0.5);
        const up     = new THREE.Vector3(0, 1, 0);
        const quat   = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
        return (
          <mesh key={i} position={[mid.x, mid.y, mid.z]} quaternion={quat}>
            <cylinderGeometry args={[0.011, 0.011, length, 6]} />
            <meshStandardMaterial
              color="#4488ee"
              emissive="#2255cc"
              emissiveIntensity={0.5}
              roughness={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   Orbital Rings (data pipeline rings)
   ───────────────────────────────────────────────────────────── */
function OrbitalRings({ scrollRef }) {
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();

  useFrame(({ clock }) => {
    const t      = clock.getElapsedTime();
    const scroll = scrollRef.current;

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.35 + scroll * Math.PI * 1.5;
      ring1Ref.current.rotation.x = Math.PI / 2 * 0.82;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.22 - scroll * Math.PI;
      ring2Ref.current.rotation.x = Math.PI / 2 * 0.55;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = t * 0.18 + scroll * Math.PI * 0.8;
      ring3Ref.current.rotation.z = Math.PI / 4;
    }
  });

  return (
    <>
      {/* Teal outer ring */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[4.2, 0.03, 12, 100]} />
        <meshStandardMaterial color="#18ccb8" emissive="#18ccb8" emissiveIntensity={1.2} />
      </mesh>
      {/* Blue mid ring */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[3.4, 0.02, 12, 80]} />
        <meshStandardMaterial color="#1a72f5" emissive="#1a72f5" emissiveIntensity={1.0} />
      </mesh>
      {/* Violet inner ring */}
      <mesh ref={ring3Ref}>
        <torusGeometry args={[2.6, 0.018, 12, 60]} />
        <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={0.9} />
      </mesh>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   Floating data-packet spheres that orbit the network
   ───────────────────────────────────────────────────────────── */
function DataPackets({ scrollRef }) {
  const count = 8;
  const refs  = useRef([]);

  useFrame(({ clock }) => {
    const t      = clock.getElapsedTime();
    const scroll = scrollRef.current;
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const angle  = (i / count) * Math.PI * 2 + t * (0.4 + i * 0.05) + scroll * Math.PI * 3;
      const radius = 3.0 + Math.sin(t * 0.3 + i) * 0.4;
      mesh.position.x = Math.cos(angle) * radius * 0.7;
      mesh.position.y = Math.sin(angle * 0.7) * 1.2;
      mesh.position.z = Math.sin(angle) * radius * 0.35;
    });
  });

  const COLORS = ['#ff7a17', '#1a72f5', '#18ccb8', '#7c3aed', '#ff7a17', '#a0c3ec', '#1a72f5', '#18ccb8'];

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} ref={el => refs.current[i] = el}>
          <sphereGeometry args={[0.07, 10, 8]} />
          <meshStandardMaterial
            color={COLORS[i]}
            emissive={COLORS[i]}
            emissiveIntensity={2.5}
          />
        </mesh>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   Star/Particle background field
   ───────────────────────────────────────────────────────────── */
function StarField({ scrollRef }) {
  const meshRef = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(120 * 3);
    for (let i = 0; i < 120; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 28;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const scroll = scrollRef.current;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.025 + scroll * 1.2;
      meshRef.current.rotation.x = scroll * 0.4;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#5588ff" size={0.055} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

/* ─────────────────────────────────────────────────────────────
   Camera dolly responds to scroll
   ───────────────────────────────────────────────────────────── */
function ScrollCamera({ scrollRef }) {
  useFrame(({ camera }) => {
    const s = scrollRef.current;
    // Dolly in/out based on scroll; start far, zoom in
    const targetZ = 9 - s * 4.5;
    const targetY = -1 + s * 1.5;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.06);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.06);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ─────────────────────────────────────────────────────────────
   Main export — embeds inside Dashboard hero card
   ───────────────────────────────────────────────────────────── */
export default function Dashboard3DScene() {
  /* scrollRef stores 0-1 progress; updated by scroll listener on .app-content */
  const scrollRef = useRef(0);

  useEffect(() => {
    /* The page scrolls on window — .app-content has no overflow set */
    const onScroll = () => {
      const scrollTop    = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current  = scrollHeight > 0 ? Math.min(Math.max(scrollTop / scrollHeight, 0), 1) : 0;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      minHeight: '260px',
      borderRadius: '14px',
      overflow: 'hidden',
      background: 'transparent',
    }}>
      <Canvas
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, -1, 9], fov: 48, near: 0.1, far: 120 }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        {/* Lighting — brand colour themed */}
        <ambientLight intensity={0.08} />
        <pointLight position={[5, -2, 6]}  color="#ff7a17" intensity={220} decay={2} />
        <pointLight position={[-5, 3, 4]}  color="#1a72f5" intensity={160} decay={2} />
        <pointLight position={[0,  8, -1]} color="#18ccb8" intensity={100} decay={2} />
        <pointLight position={[0, -5, 3]}  color="#7c3aed" intensity={80}  decay={2} />

        <ScrollCamera scrollRef={scrollRef} />
        <StarField    scrollRef={scrollRef} />
        <OrbitalRings scrollRef={scrollRef} />
        <NeuralNetworkNodes scrollRef={scrollRef} />
        <DataPackets  scrollRef={scrollRef} />
      </Canvas>

      {/* Scroll hint badge */}
      <div style={{
        position: 'absolute',
        bottom: 8,
        right: 10,
        fontSize: 9,
        fontFamily: 'JetBrains Mono, monospace',
        color: 'rgba(160,195,236,0.6)',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        ↕ scroll to scrub
      </div>
    </div>
  );
}
