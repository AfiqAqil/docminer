"use client";

import { Float, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";

function Gem() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = clock.elapsedTime * 0.3;
    meshRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.2) * 0.15;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshPhysicalMaterial
          color="#7c3aed"
          emissive="#7c3aed"
          emissiveIntensity={0.4}
          roughness={0.15}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1.5}
          transparent
          opacity={0.92}
        />
      </mesh>
    </Float>
  );
}

function ScanBeam() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.position.y = Math.sin(clock.elapsedTime * 0.8) * 2;
  });

  return (
    <mesh ref={meshRef} rotation={[0, 0, 0]}>
      <planeGeometry args={[6, 0.02]} />
      <meshBasicMaterial color="#7c3aed" transparent opacity={0.6} />
    </mesh>
  );
}

export function HeroScene() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <Canvas
      frameloop={visible ? "always" : "never"}
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#e0d4ff" />
      <pointLight position={[-3, -2, 2]} intensity={0.5} color="#7c3aed" />
      <pointLight position={[3, 2, -2]} intensity={0.3} color="#a78bfa" />

      <Gem />
      <ScanBeam />

      <Sparkles
        count={60}
        scale={5}
        size={1.5}
        speed={0.4}
        opacity={0.5}
        color="#a78bfa"
      />
    </Canvas>
  );
}
