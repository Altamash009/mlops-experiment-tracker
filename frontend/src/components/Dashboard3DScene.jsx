import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/*
  ════════════════════════════════════════════════════════════════════
  CINEMATIC TIMELINE  (all time values in seconds)
  ────────────────────────────────────────────────────────────────────
  0.0 – 1.8   Phase 1 › Stars / particle field fades in
  1.8 – 3.6   Phase 2 › Camera dollies in (zoom)
  3.6 – 5.4   Phase 3 › Orbital rings rise + neural nodes pop in
  5.4 +       Phase 4 › Continuous idle loop
  ════════════════════════════════════════════════════════════════════
*/
const P1_END  = 1.8;
const P2_END  = 3.6;
const P3_END  = 5.4;

/** clamp a value between 0 and 1 */
const clamp01 = (v) => Math.max(0, Math.min(1, v));

/** linear remap [inA,inB] → [0,1] */
const progress = (t, inA, inB) => clamp01((t - inA) / (inB - inA));

/* ─────────────────────────────────────────────────────────────
   Phase-aware Camera
   ───────────────────────────────────────────────────────────── */
function CinemaCamera({ clockRef }) {
  useFrame(({ camera }) => {
    const t  = clockRef.current;
    const p2 = progress(t, P1_END, P2_END);    // 0→1 during phase 2
    const p4 = t > P3_END ? t - P3_END : 0;   // idle seconds in phase 4

    // Phase 1: camera sits far away
    // Phase 2: dolly from Z=18 → Z=9
    const baseZ = 18 - p2 * 9;
    // Phase 4: gentle bob
    const bobZ  = t > P3_END ? Math.sin(p4 * 0.15) * 0.6 : 0;
    const bobY  = t > P3_END ? Math.sin(p4 * 0.22) * 0.4 : 0;
    const bobX  = t > P3_END ? Math.sin(p4 * 0.10) * 0.5 : 0;

    camera.position.z = THREE.MathUtils.lerp(camera.position.z, baseZ + bobZ, 0.055);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, -0.5 + bobY,  0.055);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, bobX,          0.055);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ─────────────────────────────────────────────────────────────
   Phase 1 — Star / particle field
   Fades in during 0 → P1_END, then keeps rotating
   ───────────────────────────────────────────────────────────── */
function StarField({ clockRef }) {
  const meshRef = useRef();
  const matRef  = useRef();

  const positions = useMemo(() => {
    const arr = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 36;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 22;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    return arr;
  }, []);

  useFrame(() => {
    const t     = clockRef.current;
    const alpha = clamp01(t / P1_END);          // fade in during phase 1

    if (matRef.current)  matRef.current.opacity = alpha * 0.65;
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.025;
      meshRef.current.rotation.x = t * 0.008;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        color="#5588ff"
        size={0.07}
        transparent
        opacity={0}
        sizeAttenuation
      />
    </points>
  );
}

/* ─────────────────────────────────────────────────────────────
   Phase 3 — Orbital Rings (torus rings)
   Materialise during P2_END → P3_END, then idle-loop
   ───────────────────────────────────────────────────────────── */
function OrbitalRings({ clockRef }) {
  const refs = [useRef(), useRef(), useRef()];

  const RINGS = [
    { radius: 4.2, tube: 0.030, color: '#18ccb8', speed:  0.35, tiltX: Math.PI / 2 * 0.82, delay: 0.0 },
    { radius: 3.4, tube: 0.022, color: '#1a72f5', speed: -0.22, tiltX: Math.PI / 2 * 0.55, delay: 0.3 },
    { radius: 2.6, tube: 0.018, color: '#7c3aed', speed:  0.18, tiltX: Math.PI / 4,         delay: 0.6 },
  ];

  useFrame(() => {
    const t = clockRef.current;
    refs.forEach((ref, i) => {
      if (!ref.current) return;
      const r     = RINGS[i];
      const alpha = clamp01((t - P2_END - r.delay) / (P3_END - P2_END - r.delay));
      // scale: grow from 0 → 1 during phase 3
      const sc    = alpha;
      ref.current.scale.setScalar(sc);
      ref.current.material.opacity = alpha;
      // rotation loop after appearing
      if (i === 0) { ref.current.rotation.z = t * r.speed; ref.current.rotation.x = r.tiltX; }
      if (i === 1) { ref.current.rotation.z = t * r.speed; ref.current.rotation.x = r.tiltX; }
      if (i === 2) { ref.current.rotation.y = t * r.speed; ref.current.rotation.z = r.tiltX; }
    });
  });

  return (
    <>
      {RINGS.map((r, i) => (
        <mesh key={i} ref={refs[i]} scale={0}>
          <torusGeometry args={[r.radius, r.tube, 14, 100]} />
          <meshStandardMaterial
            color={r.color}
            emissive={r.color}
            emissiveIntensity={1.2}
            transparent
            opacity={0}
          />
        </mesh>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   Phase 3 — Neural Network nodes + edges
   Nodes pop in one-by-one during phase 3
   ───────────────────────────────────────────────────────────── */
const NN_LAYERS = [
  { count: 4, x: -2.8, color: new THREE.Color(0x1a72f5) },
  { count: 6, x:  0.0, color: new THREE.Color(0x7c3aed) },
  { count: 3, x:  2.8, color: new THREE.Color(0xff7a17) },
];
const NN_SPACING = 0.72;

function NeuralNetworkNodes({ clockRef }) {
  const groupRef  = useRef();
  const nodeRefs  = useRef([]);

  const nodeData = useMemo(() => {
    const list = [];
    NN_LAYERS.forEach((layer) => {
      const yStart = -((layer.count - 1) * NN_SPACING) / 2;
      for (let ni = 0; ni < layer.count; ni++) {
        list.push({ pos: [layer.x, yStart + ni * NN_SPACING, 0], color: layer.color });
      }
    });
    return list;
  }, []);

  const edges = useMemo(() => {
    const pairs = [];
    for (let li = 0; li < NN_LAYERS.length - 1; li++) {
      const A = NN_LAYERS[li], B = NN_LAYERS[li + 1];
      const yA = -((A.count - 1) * NN_SPACING) / 2;
      const yB = -((B.count - 1) * NN_SPACING) / 2;
      for (let a = 0; a < A.count; a++) {
        for (let b = 0; b < B.count; b++) {
          pairs.push({
            start: new THREE.Vector3(A.x, yA + a * NN_SPACING, 0),
            end:   new THREE.Vector3(B.x, yB + b * NN_SPACING, 0),
          });
        }
      }
    }
    return pairs;
  }, []);

  const total = nodeData.length;

  useFrame(() => {
    const t   = clockRef.current;
    // Each node pops in sequentially across phase 3 window
    nodeRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const nodeStart = P2_END + (i / total) * (P3_END - P2_END);
      const sc = clamp01((t - nodeStart) / 0.35);   // 350ms pop-in per node
      mesh.scale.setScalar(sc);
    });

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.22;
      groupRef.current.rotation.x = Math.sin(t * 0.25) * 0.22;
      groupRef.current.position.z = Math.sin(t * 0.18) * 0.4;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Nodes */}
      {nodeData.map((n, i) => (
        <mesh key={i} position={n.pos} ref={(el) => (nodeRefs.current[i] = el)} scale={0}>
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

      {/* Edges — shown after all nodes are in */}
      {edges.map((e, i) => {
        const dir    = new THREE.Vector3().subVectors(e.end, e.start);
        const length = dir.length();
        const mid    = new THREE.Vector3().addVectors(e.start, e.end).multiplyScalar(0.5);
        const up     = new THREE.Vector3(0, 1, 0);
        const quat   = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
        return (
          <mesh key={i} position={[mid.x, mid.y, mid.z]} quaternion={quat}>
            <cylinderGeometry args={[0.009, 0.009, length, 6]} />
            <meshStandardMaterial
              color="#4488ee"
              emissive="#2255cc"
              emissiveIntensity={0.5}
              roughness={0.8}
              transparent
            />
          </mesh>
        );
      })}
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   Phase 4 — Orbiting data packets (appear after rings)
   ───────────────────────────────────────────────────────────── */
const PACKET_COLORS = ['#ff7a17', '#1a72f5', '#18ccb8', '#7c3aed', '#ff7a17', '#a0c3ec', '#1a72f5', '#18ccb8'];

function DataPackets({ clockRef }) {
  const count = 8;
  const refs  = useRef([]);

  useFrame(() => {
    const t     = clockRef.current;
    const alpha = clamp01((t - P3_END) / 1.0);   // fade in over 1s after phase 3
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const angle  = (i / count) * Math.PI * 2 + t * (0.4 + i * 0.05);
      const radius = 3.0 + Math.sin(t * 0.3 + i) * 0.4;
      mesh.position.x = Math.cos(angle) * radius * 0.7;
      mesh.position.y = Math.sin(angle * 0.7) * 1.2;
      mesh.position.z = Math.sin(angle) * radius * 0.35;
      mesh.scale.setScalar(alpha);
    });
  });

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)} scale={0}>
          <sphereGeometry args={[0.07, 10, 8]} />
          <meshStandardMaterial
            color={PACKET_COLORS[i]}
            emissive={PACKET_COLORS[i]}
            emissiveIntensity={2.5}
          />
        </mesh>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   Root scene — wires a shared clock ref into every sub-component
   ───────────────────────────────────────────────────────────── */
function Scene({ clockRef }) {
  // Advance the shared timeline clock every frame
  useFrame((_, delta) => {
    clockRef.current += delta;
  });
  return null;
}

/* ─────────────────────────────────────────────────────────────
   Main export
   ───────────────────────────────────────────────────────────── */
export default function Dashboard3DScene() {
  // Independent timeline starting at 0 when the component mounts
  const clockRef = useRef(0);

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
        camera={{ position: [0, -0.5, 18], fov: 48, near: 0.1, far: 200 }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        {/* Lighting */}
        <ambientLight intensity={0.06} />
        <pointLight position={[5,  -2,  6]} color="#ff7a17" intensity={220} decay={2} />
        <pointLight position={[-5,  3,  4]} color="#1a72f5" intensity={160} decay={2} />
        <pointLight position={[0,   8, -1]} color="#18ccb8" intensity={100} decay={2} />
        <pointLight position={[0,  -5,  3]} color="#7c3aed" intensity={80}  decay={2} />

        {/* Advance timeline */}
        <Scene clockRef={clockRef} />

        {/* Phase 1: stars */}
        <StarField clockRef={clockRef} />

        {/* Phase 2: camera zooms (handled inside CinemaCamera) */}
        <CinemaCamera clockRef={clockRef} />

        {/* Phase 3: rings + nodes */}
        <OrbitalRings clockRef={clockRef} />
        <NeuralNetworkNodes clockRef={clockRef} />

        {/* Phase 4: packets */}
        <DataPackets clockRef={clockRef} />
      </Canvas>

      {/* Phase label */}
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
        ▶ live 3d pipeline
      </div>
    </div>
  );
}
