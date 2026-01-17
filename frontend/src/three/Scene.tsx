import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';

const Triangle = ({ position, rotation, scale, color }: any) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((_state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += 0.002;
            meshRef.current.rotation.y += 0.003;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
                <tetrahedronGeometry args={[1, 0]} />
                <meshStandardMaterial
                    color={color}
                    roughness={0.1}
                    metalness={0.1}
                    transparent
                    opacity={0.8}
                />
            </mesh>
        </Float>
    );
};

export const Scene: React.FC = () => {
    return (
        <Canvas className="absolute inset-0 z-0 h-full w-full pointer-events-none">
            <PerspectiveCamera makeDefault position={[0, 0, 10]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Environment preset="city" />

            {/* Large background triangles */}
            <Triangle position={[-4, 2, -5]} rotation={[0.5, 1, 0]} scale={2} color="#e5e7eb" />
            <Triangle position={[4, -2, -5]} rotation={[0.2, -0.5, 0.5]} scale={2.5} color="#e5e7eb" />
            <Triangle position={[-3, -3, -2]} rotation={[-0.2, 0.5, 0]} scale={1.5} color="#f3f4f6" />

            {/* Accent triangles (representing money/growth) */}
            <Triangle position={[3, 3, -8]} rotation={[0, 0, 0.2]} scale={1.2} color="#3B82F6" />
            <Triangle position={[-2, 0, -6]} rotation={[0.5, 0.5, 0]} scale={0.8} color="#93C5FD" />
        </Canvas>
    );
};
