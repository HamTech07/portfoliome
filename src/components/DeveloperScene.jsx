import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { MathUtils } from "three";
import useMediaQuery from "../hooks/useMediaQuery";
import { observeSceneActivity, sceneQuality, startFrameLoop } from "../lib/scene-performance";

const satellites = [[2.2, 0.35, 0.1, "#55e6ff"], [-2, -0.8, 0.5, "#a88bff"], [0.2, 1.95, -0.5, "#ffb86c"]];

function CoreSystem({ active, quality }) {
  const group = useRef(null);
  const knot = useRef(null);
  const elapsed = useRef(0);
  const invalidate = useThree((state) => state.invalidate);
  const positions = useMemo(() => {
    const points = new Float32Array(quality.particles * 3);
    // A deterministic point cloud, allocated once rather than rebuilt per frame.
    for (let i = 0; i < quality.particles; i += 1) {
      const angle = i * 2.399963;
      const radius = 2.3 + (i % 17) * 0.17;
      points.set([Math.cos(angle) * radius, Math.sin(angle) * radius, -1 - (i % 11) * 0.4], i * 3);
    }
    return points;
  }, [quality.particles]);

  useEffect(() => {
    if (!active) return undefined;
    return startFrameLoop(invalidate, quality.fps);
  }, [active, invalidate, quality.fps]);

  useFrame((state, frameDelta) => {
    if (!active || !group.current || !knot.current) return;
    // Resuming a paused/offscreen scene must not produce a large rotation jump.
    const delta = Math.min(frameDelta, 0.05);
    elapsed.current += delta;
    group.current.rotation.y += delta * 0.16;
    group.current.rotation.x = MathUtils.damp(group.current.rotation.x, 0.2 + state.pointer.y * 0.16, 3.2, delta);
    group.current.rotation.z = MathUtils.damp(group.current.rotation.z, state.pointer.x * -0.1, 3.2, delta);
    group.current.position.x = MathUtils.damp(group.current.position.x, state.pointer.x * 0.28, 3.2, delta);
    group.current.position.y = Math.sin(elapsed.current * 0.65) * 0.12;
    knot.current.rotation.x -= delta * 0.2;
    knot.current.rotation.z += delta * 0.14;
  });

  return (
    <>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#a5f3fc" size={0.025} transparent opacity={0.55} depthWrite={false} />
      </points>
      <group ref={group} rotation={[0.2, -0.4, 0]}>
        <mesh ref={knot}>
          <torusKnotGeometry args={[1.05, 0.29, quality.knotSegments, quality.tubeSegments]} />
          <meshPhysicalMaterial color="#7252ff" metalness={0.78} roughness={0.16} clearcoat={1} clearcoatRoughness={0.08} emissive="#241064" emissiveIntensity={0.38} />
        </mesh>
        <mesh scale={0.58}>
          <icosahedronGeometry args={[1, 2]} />
          <meshStandardMaterial color="#8df3ff" metalness={0.45} roughness={0.18} emissive="#164454" emissiveIntensity={0.3} />
        </mesh>
        <mesh scale={1.7} rotation={[0.2, 0.3, 0.7]}>
          <torusGeometry args={[1.08, 0.018, 6, quality.ringSegments]} />
          <meshBasicMaterial color="#55e6ff" />
        </mesh>
        <mesh scale={2.05} rotation={[1.15, -0.2, -0.4]}>
          <torusGeometry args={[1.08, 0.012, 6, quality.ringSegments]} />
          <meshBasicMaterial color="#a88bff" transparent opacity={0.78} />
        </mesh>
        {satellites.map(([x, y, z, color]) => (
          <mesh key={color} position={[x, y, z]}>
            <icosahedronGeometry args={[0.2, 0]} />
            <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} emissive={color} emissiveIntensity={0.45} />
          </mesh>
        ))}
      </group>
    </>
  );
}

export default function DeveloperScene() {
  const container = useRef(null);
  const [visible, setVisible] = useState(false);
  const compact = useMediaQuery("(max-width: 767px), (pointer: coarse)");
  const reducedMotion = useReducedMotion();
  const quality = useMemo(() => sceneQuality(compact), [compact]);
  const active = visible && !reducedMotion;

  useEffect(() => observeSceneActivity(container.current, setVisible), []);

  return (
    <div ref={container} className="scene-canvas absolute inset-0" aria-hidden="true">
      <div className="scene-ground-shadow" />
      <Canvas
        frameloop="demand"
        dpr={[1, quality.dpr]}
        camera={{ position: [0, 0.15, 5.65], fov: 41 }}
        gl={{ antialias: !compact, alpha: true, powerPreference: "default" }}
        resize={{ scroll: false, debounce: { scroll: 0, resize: 100 } }}
        style={{ pointerEvents: compact ? "none" : "auto" }}
        fallback={<div className="scene-fallback">Creative development, in every dimension.</div>}
      >
        <ambientLight intensity={0.5} />
        <hemisphereLight args={["#b9f6ff", "#1b123c", 1.1]} />
        <spotLight position={[4, 6, 5]} angle={0.38} penumbra={0.75} color="#d9fbff" intensity={45} />
        <pointLight position={[-4, 0, 3]} color="#7c5cff" intensity={24} />
        <pointLight position={[3, -2, 2]} color="#ffb86c" intensity={12} />
        <CoreSystem active={active} quality={quality} />
      </Canvas>
    </div>
  );
}
