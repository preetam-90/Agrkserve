'use client';

import { motion } from 'framer-motion';
import { Leaf, Cloud } from 'lucide-react';

export function FloatingElements() {
    // Generate random positions and animation durations
    const elements = [
        // Leaves
        { type: 'leaf', top: '10%', left: '5%', duration: 20, delay: 0, size: 24 },
        { type: 'leaf', top: '30%', left: '85%', duration: 25, delay: 2, size: 20 },
        { type: 'leaf', top: '60%', left: '10%', duration: 22, delay: 4, size: 28 },
        { type: 'leaf', top: '80%', left: '90%', duration: 18, delay: 1, size: 18 },
        { type: 'leaf', top: '45%', left: '50%', duration: 24, delay: 3, size: 22 },

        // Clouds
        { type: 'cloud', top: '15%', left: '70%', duration: 30, delay: 0, size: 40 },
        { type: 'cloud', top: '25%', left: '20%', duration: 35, delay: 5, size: 35 },
        { type: 'cloud', top: '70%', left: '60%', duration: 28, delay: 2, size: 38 },

        // Dust particles
        { type: 'dust', top: '20%', left: '40%', duration: 15, delay: 0, size: 8 },
        { type: 'dust', top: '50%', left: '75%', duration: 12, delay: 1, size: 6 },
        { type: 'dust', top: '65%', left: '25%', duration: 18, delay: 3, size: 10 },
        { type: 'dust', top: '35%', left: '65%', duration: 14, delay: 2, size: 7 },
    ];

    return (
        <div className="floating-elements pointer-events-none fixed inset-0 z-[1] overflow-hidden">
            {elements.map((element, index) => {
                const Icon = element.type === 'leaf' ? Leaf : Cloud;

                return (
                    <motion.div
                        key={index}
                        className="absolute"
                        style={{
                            top: element.top,
                            left: element.left,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            x: [0, element.type === 'cloud' ? 50 : 20, 0],
                            rotate: element.type === 'leaf' ? [0, 360] : [0, 10, 0],
                            opacity: element.type === 'dust' ? [0.2, 0.5, 0.2] : [0.15, 0.25, 0.15],
                        }}
                        transition={{
                            duration: element.duration,
                            delay: element.delay,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    >
                        {element.type === 'dust' ? (
                            <div
                                className="rounded-full bg-gradient-to-br from-primary-green/30 to-golden-accent/30 blur-sm"
                                style={{
                                    width: element.size,
                                    height: element.size,
                                }}
                            />
                        ) : (
                            <Icon
                                className="text-primary-green/10 dark:text-primary-green/5"
                                style={{ width: element.size, height: element.size }}
                            />
                        )}
                    </motion.div>
                );
            })}

            {/* Farm equipment silhouettes */}
            <motion.div
                className="absolute opacity-[0.03]"
                style={{ top: '40%', right: '-100px' }}
                animate={{
                    x: [0, -50, 0],
                    rotate: [0, -5, 0],
                }}
                transition={{
                    duration: 40,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            >
                <svg width="200" height="200" viewBox="0 0 200 200" fill="currentColor" className="text-earth-brown">
                    <path d="M40 120 L60 80 L140 80 L160 120 L140 140 L60 140 Z" />
                    <circle cx="70" cy="150" r="20" />
                    <circle cx="130" cy="150" r="20" />
                </svg>
            </motion.div>
        </div>
    );
}
