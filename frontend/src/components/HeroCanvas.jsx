import { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Stars, AdaptiveDpr } from "@react-three/drei";
import * as THREE from "three";

/* ── Mobile detection hook ── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

/* ────────────────────────────────────────────
   Holographic Orb — Morphing sphere + wireframe
   ──────────────────────────────────────────── */
function HolographicOrb() {
  const outerRef = useRef();
  const wireRef = useRef();
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Smooth lerp targets
  const targetScale = useRef(1);
  const targetEmissive = useRef(0.35);
  const currentScale = useRef(1);
  const currentEmissive = useRef(0.35);

  useEffect(() => {
    targetScale.current = hovered ? 1.15 : 1;
    targetEmissive.current = hovered ? 0.8 : 0.35;
  }, [hovered]);

  useFrame((_, delta) => {
    // Smooth rotation
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
      groupRef.current.rotation.x += delta * 0.05;
    }

    // Wireframe counter-rotation
    if (wireRef.current) {
      wireRef.current.rotation.y -= delta * 0.25;
      wireRef.current.rotation.z += delta * 0.1;
    }

    // Smooth scale lerp
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale.current, delta * 4);
    if (groupRef.current) {
      groupRef.current.scale.setScalar(currentScale.current);
    }

    // Smooth emissive lerp
    currentEmissive.current = THREE.MathUtils.lerp(currentEmissive.current, targetEmissive.current, delta * 4);
    if (outerRef.current?.material) {
      outerRef.current.material.emissiveIntensity = currentEmissive.current;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.6}>
      <group
        ref={groupRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Main distorted sphere */}
        <mesh ref={outerRef}>
          <icosahedronGeometry args={[1.1, 20]} />
          <MeshDistortMaterial
            color="#00e5ff"
            emissive="#00e5ff"
            emissiveIntensity={0.35}
            roughness={0.15}
            metalness={0.9}
            distort={0.35}
            speed={1.8}
            transparent
            opacity={0.55}
          />
        </mesh>

        {/* Wireframe inner shell */}
        <mesh ref={wireRef}>
          <icosahedronGeometry args={[0.9, 4]} />
          <meshBasicMaterial
            color="#00e5ff"
            wireframe
            transparent
            opacity={0.15}
          />
        </mesh>
      </group>
    </Float>
  );
}

/* ────────────────────────────────────────────
   Orbital Rings — Spinning torus rings
   ──────────────────────────────────────────── */
function OrbitalRings() {
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();

  useFrame((_, delta) => {
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.3;
    if (ring2Ref.current) ring2Ref.current.rotation.x += delta * 0.25;
    if (ring3Ref.current) ring3Ref.current.rotation.y += delta * 0.2;
  });

  const ringMaterial = useMemo(
    () => (color, opacity) => ({
      color,
      wireframe: true,
      transparent: true,
      opacity,
    }),
    []
  );

  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
      {/* Ring 1 — Cyan, tilted */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.8, 0.008, 16, 100]} />
        <meshBasicMaterial {...ringMaterial("#00e5ff", 0.35)} />
      </mesh>

      {/* Ring 2 — Purple, opposite tilt */}
      <mesh ref={ring2Ref} rotation={[0, Math.PI / 4, Math.PI / 6]}>
        <torusGeometry args={[2.1, 0.006, 16, 100]} />
        <meshBasicMaterial {...ringMaterial("#7c3aed", 0.25)} />
      </mesh>

      {/* Ring 3 — Blue, subtle */}
      <mesh ref={ring3Ref} rotation={[Math.PI / 5, Math.PI / 3, 0]}>
        <torusGeometry args={[1.6, 0.005, 16, 80]} />
        <meshBasicMaterial {...ringMaterial("#3b82f6", 0.2)} />
      </mesh>
    </Float>
  );
}

/* ────────────────────────────────────────────
   Glowing Particles — Tiny floating specks
   ──────────────────────────────────────────── */
function GlowParticles({ count = 60 }) {
  const meshRef = useRef();

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#00e5ff"
        size={0.025}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

/* ────────────────────────────────────────────
   Main HeroCanvas — Assembled 3D scene
   ──────────────────────────────────────────── */
export default function HeroCanvas() {
  const isMobile = useIsMobile();

  return (
    <div className="hero-canvas-container" aria-hidden="true">
      <Canvas
        dpr={[1, isMobile ? 1 : 1.5]}
        camera={{ position: [0, 0, 6.5], fov: 45 }}
        gl={{ alpha: true, antialias: !isMobile }}
        style={{ background: "transparent" }}
      >
        {/* Adaptive resolution under load */}
        <AdaptiveDpr pixelated />

        {/* Lighting — holographic glow */}
        <ambientLight intensity={0.15} color="#ffffff" />
        <pointLight position={[3, 3, 4]} intensity={2.5} color="#00e5ff" distance={12} />
        <pointLight position={[-3, -2, 3]} intensity={1.5} color="#7c3aed" distance={10} />
        <pointLight position={[0, 4, -2]} intensity={0.8} color="#3b82f6" distance={8} />

        {/* Main holographic orb */}
        <HolographicOrb />

        {/* Orbital rings */}
        <OrbitalRings />

        {/* Floating glow particles */}
        <GlowParticles count={isMobile ? 30 : 60} />

        {/* Star background */}
        <Stars
          radius={50}
          depth={60}
          count={isMobile ? 300 : 800}
          factor={2.5}
          saturation={0}
          fade
          speed={0.5}
        />
      </Canvas>
    </div>
  );
}
