import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, Icosahedron, TorusKnot } from "@react-three/drei";
import * as THREE from "three";

function Earth() {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.08;
      ref.current.rotation.x += delta * 0.01;
    }
  });
  return (
    <group ref={ref} position={[2.6, 0.4, -2]}>
      <mesh>
        <sphereGeometry args={[1.5, 48, 48]} />
        <meshStandardMaterial
          color="#0e2f1f"
          emissive="#12c48b"
          emissiveIntensity={0.25}
          roughness={0.55}
          metalness={0.2}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.52, 48, 48]} />
        <meshBasicMaterial color="#12c48b" wireframe transparent opacity={0.18} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.66, 32, 32]} />
        <meshBasicMaterial color="#7cf6d0" transparent opacity={0.05} />
      </mesh>
    </group>
  );
}

function RecyclingLoop() {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.z += delta * 0.15;
      ref.current.rotation.x += delta * 0.06;
    }
  });
  return (
    <mesh ref={ref} position={[-3.2, -1.2, -1.5]} scale={0.55}>
      <torusKnotGeometry args={[1, 0.28, 120, 16, 2, 3]} />
      <meshStandardMaterial color="#c9f95c" emissive="#c9f95c" emissiveIntensity={0.4} roughness={0.4} />
    </mesh>
  );
}

function Leaf({ position, scale, speed }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * speed) * 0.6;
      ref.current.rotation.y += 0.003;
    }
  });
  return (
    <Float speed={speed} rotationIntensity={0.6} floatIntensity={1.4}>
      <mesh ref={ref} position={position} scale={scale}>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#12c48b" emissive="#0d8f66" emissiveIntensity={0.3} flatShading />
      </mesh>
    </Float>
  );
}

function Leaves() {
  const leaves = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, i) => ({
        id: i,
        position: [
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 7,
          (Math.random() - 0.5) * 6 - 1,
        ],
        scale: 0.15 + Math.random() * 0.22,
        speed: 0.5 + Math.random() * 1.2,
      })),
    []
  );
  return (
    <>
      {leaves.map((leaf) => (
        <Leaf key={leaf.id} {...leaf} />
      ))}
    </>
  );
}

function CameraDrift() {
  useFrame((state) => {
    state.camera.position.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.6;
    state.camera.position.y = Math.cos(state.clock.elapsedTime * 0.04) * 0.3;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Background3D({ dim = false }) {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={["#03110a"]} />
        <fog attach="fog" args={["#03110a", 6, 16]} />
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#7cf6d0" />
        <pointLight position={[-5, -3, -2]} intensity={0.8} color="#c9f95c" />
        <Suspense fallback={null}>
          <Earth />
          <RecyclingLoop />
          <Leaves />
          <Sparkles count={80} scale={[14, 8, 8]} size={2.4} speed={0.25} color="#7cf6d0" opacity={0.6} />
        </Suspense>
        <CameraDrift />
      </Canvas>
      <div
        className={`absolute inset-0 bg-gradient-to-b from-void/40 via-void/70 to-void transition-opacity duration-500 ${
          dim ? "opacity-95" : "opacity-80"
        }`}
      />
      <div className="absolute inset-0 bg-noise" />
    </div>
  );
}
