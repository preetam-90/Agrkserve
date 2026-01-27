'use client';

import { useEffect, useRef, useState } from 'react';

interface Particle {
    id: number;
    x: number;
    y: number;
    opacity: number;
    size: number;
    color: string;
}

export function CustomCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);
    const particleIdRef = useRef(0);
    const lastParticleTime = useRef(0);

    const colors = ['#2E7D32', '#FFD700', '#FFFDD0'];

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });

            // Create particle trail (throttled)
            const now = Date.now();
            if (now - lastParticleTime.current > 50) {
                const colorIndex = Math.floor((Date.now() / 1000) % colors.length);
                const newParticle: Particle = {
                    id: particleIdRef.current++,
                    x: e.clientX,
                    y: e.clientY,
                    opacity: 1,
                    size: Math.random() * 4 + 2,
                    color: colors[colorIndex]
                };
                setParticles((prev) => [...prev.slice(-20), newParticle]);
                lastParticleTime.current = now;
            }
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.closest('button') ||
                target.closest('a') ||
                target.closest('.hover-trigger')
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    // Fade out particles
    useEffect(() => {
        const interval = setInterval(() => {
            setParticles((prev) =>
                prev
                    .map((p) => ({ ...p, opacity: p.opacity - 0.05 }))
                    .filter((p) => p.opacity > 0)
            );
        }, 50);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {/* Main cursor */}
            <div
                className="custom-cursor pointer-events-none fixed z-[9999] mix-blend-difference"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: 'translate(-50%, -50%)',
                    transition: 'width 0.2s ease, height 0.2s ease'
                }}
            >
                <div
                    className={`rounded-full border-2 transition-all duration-200 ${isHovering
                            ? 'w-12 h-12 border-golden-accent bg-golden-accent/20'
                            : 'w-6 h-6 border-white bg-white/10'
                        }`}
                    style={{
                        backdropFilter: 'blur(4px)'
                    }}
                />
            </div>

            {/* Particle trail */}
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="particle pointer-events-none fixed z-[9998] rounded-full"
                    style={{
                        left: `${particle.x}px`,
                        top: `${particle.y}px`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        backgroundColor: particle.color,
                        opacity: particle.opacity,
                        transform: 'translate(-50%, -50%)',
                        boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                        transition: 'opacity 0.3s ease-out'
                    }}
                />
            ))}

            {/* Cursor burst on hover */}
            {isHovering && (
                <div
                    className="pointer-events-none fixed z-[9997]"
                    style={{
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary-green/20 to-golden-accent/20 animate-ping" />
                </div>
            )}
        </>
    );
}
