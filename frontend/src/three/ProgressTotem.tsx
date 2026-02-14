import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

/* ─── XP thresholds matching AchievementsPage TITLES ─── */
const STAGES = [
    { xp: 0, name: 'Novice', color: '#9CA3AF', emissive: '#4B5563', scale: 0.6, segments: 4 },
    { xp: 200, name: 'Confident', color: '#60A5FA', emissive: '#2563EB', scale: 0.8, segments: 6 },
    { xp: 500, name: 'Strategist', color: '#818CF8', emissive: '#4F46E5', scale: 1.0, segments: 8 },
    { xp: 900, name: 'Investor', color: '#FBBF24', emissive: '#D97706', scale: 1.15, segments: 6 },
    { xp: 1400, name: 'Master', color: '#F472B6', emissive: '#DB2777', scale: 1.3, segments: 8 },
];

function getStageIndex(xp: number): number {
    let idx = 0;
    for (let i = STAGES.length - 1; i >= 0; i--) {
        if (xp >= STAGES[i].xp) { idx = i; break; }
    }
    return idx;
}

/* ─── Particle ring (only for stages 3+) ─── */
const Particles: React.FC<{ count: number; color: string; radius: number }> = ({ count, color, radius }) => {
    const ref = useRef<THREE.Points>(null);
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const r = radius + (Math.random() - 0.5) * 0.3;
            pos[i * 3] = Math.cos(angle) * r;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
            pos[i * 3 + 2] = Math.sin(angle) * r;
        }
        return pos;
    }, [count, radius]);

    useFrame((_, delta) => {
        if (ref.current) ref.current.rotation.y += delta * 0.3;
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                    count={count}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial size={0.06} color={color} transparent opacity={0.7} sizeAttenuation />
        </points>
    );
};

/* ─── Totem mesh ─── */
const TotemMesh: React.FC<{ stageIdx: number }> = ({ stageIdx }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const stage = STAGES[stageIdx];

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
        }
    });

    const geometry = useMemo(() => {
        switch (stageIdx) {
            case 0: return <icosahedronGeometry args={[1, 0]} />;        // raw stone
            case 1: return <octahedronGeometry args={[1, 0]} />;         // polished crystal
            case 2: return <dodecahedronGeometry args={[1, 0]} />;       // prism
            case 3: return <octahedronGeometry args={[1, 2]} />;         // golden obelisk
            case 4: return <icosahedronGeometry args={[1, 2]} />;        // radiant sphere
            default: return <icosahedronGeometry args={[1, 0]} />;
        }
    }, [stageIdx]);

    return (
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
            <mesh ref={meshRef} scale={stage.scale} castShadow>
                {geometry}
                <MeshDistortMaterial
                    color={stage.color}
                    emissive={stage.emissive}
                    emissiveIntensity={stageIdx >= 2 ? 0.4 : 0.1}
                    roughness={stageIdx === 0 ? 0.8 : 0.15}
                    metalness={stageIdx >= 3 ? 0.9 : 0.3}
                    distort={stageIdx >= 4 ? 0.25 : 0.1}
                    speed={2}
                    transparent
                    opacity={0.92}
                />
            </mesh>
            {stageIdx >= 2 && (
                <Particles count={stageIdx * 20} color={stage.emissive} radius={1.5 * stage.scale} />
            )}
        </Float>
    );
};

/* ─── Exported component ─── */
interface ProgressTotemProps {
    totalXP: number;
}

export const ProgressTotem: React.FC<ProgressTotemProps> = ({ totalXP }) => {
    const stageIdx = getStageIndex(totalXP);
    const stage = STAGES[stageIdx];
    const nextStage = STAGES[stageIdx + 1];
    const progressToNext = nextStage
        ? ((totalXP - stage.xp) / (nextStage.xp - stage.xp)) * 100
        : 100;

    return (
        <div className="flex flex-col items-center">
            <div className="w-full h-48 rounded-2xl overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800 relative">
                <Canvas>
                    <ambientLight intensity={0.4} />
                    <pointLight position={[3, 3, 3]} intensity={1.2} color={stage.color} />
                    <pointLight position={[-2, -1, 2]} intensity={0.5} color="#ffffff" />
                    <Environment preset="night" />
                    <TotemMesh stageIdx={stageIdx} />
                </Canvas>
                {/* Glow overlay */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `radial-gradient(circle at 50% 60%, ${stage.emissive}20, transparent 70%)`,
                    }}
                />
            </div>
            {/* Label */}
            <div className="text-center mt-3">
                <div className="font-bold text-gray-900">{stage.name}</div>
                {nextStage && (
                    <div className="mt-1">
                        <div className="text-xs text-gray-400 mb-1">
                            {totalXP - stage.xp} / {nextStage.xp - stage.xp} XP to {nextStage.name}
                        </div>
                        <div className="w-32 h-1.5 bg-gray-200 rounded-full mx-auto overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                    width: `${progressToNext}%`,
                                    background: `linear-gradient(90deg, ${stage.color}, ${nextStage.color})`,
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
