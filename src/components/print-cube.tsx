"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

type PointerRef = React.MutableRefObject<{ x: number; y: number }>;

function RotatingRig({ pointer, children }: { pointer: PointerRef; children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const auto = useRef(0);

  useFrame((_, delta) => {
    if (!group.current) return;
    auto.current += delta * 0.25;
    const targetY = pointer.current.x * 0.6 + auto.current;
    const targetX = -pointer.current.y * 0.4 + 0.4;
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.04;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.04;
  });

  return <group ref={group}>{children}</group>;
}

function PrintedCube() {
  const layers = 6;
  const size = 1.6;

  return (
    <>
      {/* casco externo em wireframe, como a área de impressão */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(size, size, size)]} />
        <lineBasicMaterial color="#a78bfa" transparent opacity={0.55} />
      </lineSegments>

      {/* camadas empilhadas, como se a peça estivesse sendo impressa */}
      {Array.from({ length: layers }).map((_, i) => {
        const t = i / (layers - 1);
        const y = -size / 2 + t * size + size / (layers * 2);
        return (
          <mesh key={i} position={[0, y, 0]}>
            <boxGeometry args={[size * (0.55 + t * 0.35), size / layers - 0.02, size * (0.55 + t * 0.35)]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#7c3aed" : "#2563eb"}
              transparent
              opacity={0.35 + t * 0.35}
              emissive={i % 2 === 0 ? "#7c3aed" : "#2563eb"}
              emissiveIntensity={0.4}
            />
          </mesh>
        );
      })}
    </>
  );
}

function Scene({ pointer }: { pointer: PointerRef }) {
  const nozzle = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!nozzle.current) return;
    const t = clock.getElapsedTime();
    nozzle.current.position.x = Math.sin(t * 1.4) * 0.85;
    nozzle.current.position.z = Math.cos(t * 1.1) * 0.85;
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 3, 3]} intensity={40} color="#a78bfa" />
      <pointLight position={[-3, -2, -3]} intensity={20} color="#60a5fa" />

      <RotatingRig pointer={pointer}>
        <PrintedCube />
      </RotatingRig>

      {/* bico de impressão sobrevoando o cubo */}
      <mesh ref={nozzle} position={[0.85, 1.1, 0]}>
        <coneGeometry args={[0.09, 0.22, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#a78bfa" emissiveIntensity={0.8} />
      </mesh>
    </>
  );
}

export function PrintCube({ className, size = 360 }: { className?: string; size?: number }) {
  const [ready, setReady] = useState(false);
  const pointer = useRef({ x: 0, y: 0 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    pointer.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: ((e.clientY - rect.top) / rect.height) * 2 - 1,
    };
  }

  return (
    <div className={className} style={{ width: size, height: size }} onMouseMove={onMouseMove}>
      <Canvas
        camera={{ position: [0, 0.6, 4.2], fov: 40 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        onCreated={() => setReady(true)}
        style={{ opacity: ready ? 1 : 0, transition: "opacity 0.6s ease" }}
      >
        <Scene pointer={pointer} />
      </Canvas>
    </div>
  );
}
