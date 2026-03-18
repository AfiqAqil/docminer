"use client";

import { Float, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

function Crystal() {
  const groupRef = useRef<THREE.Group>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.15;
    groupRef.current.rotation.x = Math.sin(t * 0.12) * 0.1;

    if (wireRef.current) {
      (wireRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.08 + Math.sin(t * 1.5) * 0.04;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.6}>
      <group ref={groupRef}>
        {/* Solid crystal */}
        <mesh>
          <dodecahedronGeometry args={[1.35, 0]} />
          <meshPhysicalMaterial
            color="#8b5cf6"
            emissive="#6d28d9"
            emissiveIntensity={0.3}
            roughness={0.08}
            metalness={0.95}
            clearcoat={1}
            clearcoatRoughness={0.05}
            envMapIntensity={2}
            transparent
            opacity={0.88}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Wireframe overlay — analysis grid */}
        <mesh ref={wireRef} scale={1.005}>
          <dodecahedronGeometry args={[1.35, 0]} />
          <meshBasicMaterial
            color="#c4b5fd"
            wireframe
            transparent
            opacity={0.1}
          />
        </mesh>

        {/* Inner glow core */}
        <mesh scale={0.6}>
          <dodecahedronGeometry args={[1.35, 0]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.15} />
        </mesh>
      </group>
    </Float>
  );
}

function OrbitalRing() {
  const ringRef = useRef<THREE.Mesh>(null);

  const ringGeo = useMemo(() => {
    const geo = new THREE.TorusGeometry(2.2, 0.008, 8, 128);
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    const t = clock.elapsedTime;
    ringRef.current.rotation.x = Math.PI * 0.42 + Math.sin(t * 0.2) * 0.03;
    ringRef.current.rotation.z = t * 0.08;
  });

  return (
    <mesh ref={ringRef} geometry={ringGeo}>
      <meshBasicMaterial color="#a78bfa" transparent opacity={0.25} />
    </mesh>
  );
}

function ScanPlane() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    meshRef.current.position.y = Math.sin(t * 0.6) * 1.8;
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity =
      0.3 + Math.sin(t * 2) * 0.15;
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[5, 0.015]} />
      <meshBasicMaterial color="#c4b5fd" transparent opacity={0.35} />
    </mesh>
  );
}

function DataMotes() {
  const count = 8;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const offsets = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        angle: Math.random() * Math.PI * 2,
        radius: 1.8 + Math.random() * 0.8,
        speed: 0.15 + Math.random() * 0.2,
        y: (Math.random() - 0.5) * 2,
        ySpeed: 0.3 + Math.random() * 0.3,
      })),
    [],
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const o = offsets[i];
      const a = o.angle + t * o.speed;
      dummy.position.set(
        Math.cos(a) * o.radius,
        o.y + Math.sin(t * o.ySpeed) * 0.5,
        Math.sin(a) * o.radius,
      );
      dummy.scale.setScalar(0.015 + Math.sin(t * 2 + i) * 0.008);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#e9d5ff" transparent opacity={0.7} />
    </instancedMesh>
  );
}

export function HeroScene() {
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () =>
      document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <Canvas
      frameloop={visible && !reducedMotion ? "always" : "demand"}
      camera={{ position: [0, 0, 5.5], fov: 40 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      {/* Ambient fill */}
      <ambientLight intensity={0.2} />

      {/* Key light — warm highlight from upper right */}
      <directionalLight
        position={[4, 4, 3]}
        intensity={0.9}
        color="#ede9fe"
      />

      {/* Rim light — cool violet from behind left */}
      <directionalLight
        position={[-3, 1, -4]}
        intensity={0.4}
        color="#7c3aed"
      />

      {/* Accent point lights */}
      <pointLight position={[-2, -2, 3]} intensity={0.4} color="#8b5cf6" />
      <pointLight position={[3, 2, -1]} intensity={0.25} color="#c4b5fd" />
      <pointLight position={[0, -3, 1]} intensity={0.15} color="#6d28d9" />

      <Crystal />
      <OrbitalRing />
      <ScanPlane />
      <DataMotes />

      <Sparkles
        count={40}
        scale={6}
        size={1.2}
        speed={0.3}
        opacity={0.4}
        color="#c4b5fd"
      />
    </Canvas>
  );
}
