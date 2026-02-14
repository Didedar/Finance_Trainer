import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Single coin component ─── */
const Coin: React.FC<{ position: [number, number, number]; delay: number }> = ({ position, delay }) => {
    const ref = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.elapsedTime * 2 + delay;
            // Gentle float
            ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + delay) * 0.03;
        }
    });

    return (
        <mesh ref={ref} position={position} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.03, 16]} />
            <meshStandardMaterial
                color="#FCD34D"
                emissive="#D97706"
                emissiveIntensity={0.3}
                metalness={0.9}
                roughness={0.15}
            />
        </mesh>
    );
};

/* ─── Piggy body (constructed from primitives) ─── */
const PiggyBody: React.FC<{ fillRatio: number }> = ({ fillRatio }) => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
        }
    });

    // Coin positions inside the piggy (up to 15 coins based on fill)
    const coins = useMemo(() => {
        const count = Math.floor(fillRatio * 15);
        const result: [number, number, number][] = [];
        for (let i = 0; i < count; i++) {
            const angle = (i / Math.max(count, 1)) * Math.PI * 2;
            const r = 0.25 + Math.random() * 0.2;
            result.push([
                Math.cos(angle) * r,
                -0.3 + (i * 0.06),
                Math.sin(angle) * r * 0.5,
            ]);
        }
        return result;
    }, [fillRatio]);

    const bodyColor = fillRatio > 0.7 ? '#F9A8D4' : fillRatio > 0.3 ? '#FCA5A5' : '#D1D5DB';

    return (
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
            <group ref={groupRef}>
                {/* Main body */}
                <mesh position={[0, 0, 0]} castShadow>
                    <sphereGeometry args={[0.7, 32, 32]} />
                    <meshStandardMaterial
                        color={bodyColor}
                        roughness={0.4}
                        metalness={0.1}
                        transparent
                        opacity={0.85}
                    />
                </mesh>

                {/* Snout */}
                <mesh position={[0.65, 0, 0]} castShadow>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshStandardMaterial color={bodyColor} roughness={0.5} />
                </mesh>
                {/* Nostrils */}
                <mesh position={[0.8, 0.03, 0.05]}>
                    <sphereGeometry args={[0.03, 8, 8]} />
                    <meshStandardMaterial color="#9CA3AF" />
                </mesh>
                <mesh position={[0.8, 0.03, -0.05]}>
                    <sphereGeometry args={[0.03, 8, 8]} />
                    <meshStandardMaterial color="#9CA3AF" />
                </mesh>

                {/* Ears */}
                <mesh position={[-0.2, 0.6, 0.25]} rotation={[0.3, 0, -0.5]}>
                    <coneGeometry args={[0.15, 0.25, 4]} />
                    <meshStandardMaterial color={bodyColor} roughness={0.5} />
                </mesh>
                <mesh position={[-0.2, 0.6, -0.25]} rotation={[-0.3, 0, -0.5]}>
                    <coneGeometry args={[0.15, 0.25, 4]} />
                    <meshStandardMaterial color={bodyColor} roughness={0.5} />
                </mesh>

                {/* Eyes */}
                <mesh position={[0.45, 0.2, 0.25]}>
                    <sphereGeometry args={[0.06, 8, 8]} />
                    <meshStandardMaterial color="#1F2937" />
                </mesh>
                <mesh position={[0.45, 0.2, -0.25]}>
                    <sphereGeometry args={[0.06, 8, 8]} />
                    <meshStandardMaterial color="#1F2937" />
                </mesh>

                {/* Legs */}
                {[
                    [0.3, -0.65, 0.35],
                    [0.3, -0.65, -0.35],
                    [-0.3, -0.65, 0.35],
                    [-0.3, -0.65, -0.35],
                ].map((pos, i) => (
                    <mesh key={i} position={pos as [number, number, number]}>
                        <cylinderGeometry args={[0.08, 0.1, 0.2, 8]} />
                        <meshStandardMaterial color={bodyColor} roughness={0.5} />
                    </mesh>
                ))}

                {/* Tail curl */}
                <mesh position={[-0.7, 0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
                    <torusGeometry args={[0.1, 0.025, 8, 16, Math.PI * 1.5]} />
                    <meshStandardMaterial color={bodyColor} />
                </mesh>

                {/* Coin slot on top */}
                <mesh position={[0, 0.68, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <boxGeometry args={[0.04, 0.25, 0.04]} />
                    <meshStandardMaterial color="#6B7280" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Coins inside (visible through transparent body) */}
                {coins.map((pos, i) => (
                    <Coin key={i} position={pos} delay={i * 0.5} />
                ))}
            </group>
        </Float>
    );
};

/* ─── Exported component ─── */
interface PiggyBankProps {
    totalXP: number;
    maxXP?: number;
}

export const PiggyBank: React.FC<PiggyBankProps> = ({ totalXP, maxXP = 1400 }) => {
    const fillRatio = Math.min(totalXP / maxXP, 1);
    const coinCount = Math.floor(fillRatio * 15);

    return (
        <div className="flex flex-col items-center">
            <div className="w-full h-48 rounded-2xl overflow-hidden bg-gradient-to-b from-amber-900/80 to-amber-950 relative">
                <Canvas camera={{ position: [0, 0.5, 2.5], fov: 40 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[2, 3, 2]} intensity={1} color="#FCD34D" />
                    <pointLight position={[-2, 1, 1]} intensity={0.4} />
                    <Environment preset="sunset" />
                    <PiggyBody fillRatio={fillRatio} />
                </Canvas>
                {/* Gold shine overlay */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-transparent via-transparent to-amber-400/5" />
            </div>
            <div className="text-center mt-3">
                <div className="font-bold text-gray-900 flex items-center gap-1 justify-center">
                    🐷 Piggy Bank
                </div>
                <div className="text-xs text-gray-400 mt-1">
                    {coinCount} coin{coinCount !== 1 ? 's' : ''} • {(fillRatio * 100).toFixed(0)}% full
                </div>
                <div className="w-32 h-1.5 bg-gray-200 rounded-full mx-auto overflow-hidden mt-1">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-700"
                        style={{ width: `${fillRatio * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
