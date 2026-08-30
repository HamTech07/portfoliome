import { ContactShadows, Float, Sparkles, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { MathUtils } from "three";

function CoreSystem() {
  const group = useRef(null);
  const knot = useRef(null);

  useFrame((state, delta) => {
    if (!group.current || !knot.current) return;
    group.current.rotation.y += delta * 0.16;
    group.current.rotation.x = MathUtils.damp(group.current.rotation.x, 0.2 + state.pointer.y * 0.16, 3.2, delta);
    group.current.rotation.z = MathUtils.damp(group.current.rotation.z, state.pointer.x * -0.1, 3.2, delta);
    group.current.position.x = MathUtils.damp(group.current.position.x, state.pointer.x * 0.28, 3.2, delta);
    knot.current.rotation.x -= delta * 0.2;
    knot.current.rotation.z += delta * 0.14;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.65) * 0.12;
  });

  return (
    <group ref={group} rotation={[0.2, -0.4, 0]}>
      <Float speed={1.6} rotationIntensity={0.35} floatIntensity={0.5}>
        <mesh ref={knot} castShadow receiveShadow>
          <torusKnotGeometry args={[1.05, 0.29, 220, 32]} />
          <meshPhysicalMaterial
            color="#7252ff"
            metalness={0.78}
            roughness={0.16}
            clearcoat={1}
            clearcoatRoughness={0.08}
            emissive="#241064"
            emissiveIntensity={0.38}
          />
        </mesh>
        <mesh scale={0.58} castShadow>
          <icosahedronGeometry args={[1, 5]} />
          <meshPhysicalMaterial
            color="#8df3ff"
            metalness={0.2}
            roughness={0.08}
            transmission={0.22}
            thickness={1.4}
            clearcoat={1}
            transparent
            opacity={0.8}
          />
        </mesh>
        <mesh scale={1.7} rotation={[0.2, 0.3, 0.7]}>
          <torusGeometry args={[1.08, 0.018, 12, 160]} />
          <meshStandardMaterial color="#55e6ff" emissive="#55e6ff" emissiveIntensity={2.2} />
        </mesh>
        <mesh scale={2.05} rotation={[1.15, -0.2, -0.4]}>
          <torusGeometry args={[1.08, 0.012, 12, 160]} />
          <meshStandardMaterial color="#a88bff" emissive="#a88bff" emissiveIntensity={1.8} transparent opacity={0.78} />
        </mesh>
      </Float>

      {[[2.2, 0.35, 0.1, "#55e6ff"], [-2, -0.8, 0.5, "#a88bff"], [0.2, 1.95, -0.5, "#ffb86c"]].map(([x, y, z, color]) => (
        <Float key={color} speed={2.4} rotationIntensity={1.1} floatIntensity={1.2}>
          <mesh position={[x, y, z]} castShadow>
            <icosahedronGeometry args={[0.2, 0]} />
            <meshPhysicalMaterial color={color} metalness={0.6} roughness={0.2} clearcoat={1} emissive={color} emissiveIntensity={0.45} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export default function DeveloperScene() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas shadows="basic" dpr={[1, 1.6]} camera={{ position: [0, 0.15, 5.65], fov: 41 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
        <fog attach="fog" args={["#080a12", 8, 15]} />
        <ambientLight intensity={0.5} />
        <hemisphereLight args={["#b9f6ff", "#1b123c", 1.1]} />
        <spotLight castShadow position={[4, 6, 5]} angle={0.38} penumbra={0.75} color="#d9fbff" intensity={45} />
        <pointLight position={[-4, 0, 3]} color="#7c5cff" intensity={24} />
        <pointLight position={[3, -2, 2]} color="#ffb86c" intensity={12} />
        <Stars radius={36} depth={18} count={520} factor={2} fade speed={0.3} />
        <Sparkles count={65} scale={7} size={1.8} speed={0.25} opacity={0.55} color="#a5f3fc" />
        <CoreSystem />
        <ContactShadows position={[0, -2.2, 0]} opacity={0.58} scale={8} blur={2.7} far={7} color="#27165e" />
      </Canvas>
    </div>
  );
}
