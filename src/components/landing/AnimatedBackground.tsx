'use client';

import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
    variant?: 'hero' | 'section' | 'dark';
}

export function AnimatedBackground({ variant = 'section' }: AnimatedBackgroundProps) {
    const gradients = {
        hero: [
            'radial-gradient(circle at 0% 0%, rgba(46, 125, 50, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 100% 0%, rgba(255, 215, 0, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 100%, rgba(46, 125, 50, 0.2) 0%, transparent 50%)',
        ],
        section: [
            'radial-gradient(circle at 20% 30%, rgba(46, 125, 50, 0.08) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 70%, rgba(121, 85, 72, 0.05) 0%, transparent 50%)',
        ],
        dark: [
            'radial-gradient(circle at 40% 40%, rgba(46, 125, 50, 0.1) 0%, transparent 60%)',
            'radial-gradient(circle at 60% 60%, rgba(255, 215, 0, 0.05) 0%, transparent 60%)',
        ],
    };

    const selectedGradients = gradients[variant];

    return (
        <div className="animated-background pointer-events-none absolute inset-0 overflow-hidden">
            {selectedGradients.map((gradient, index) => (
                <motion.div
                    key={index}
                    className="absolute inset-0"
                    style={{
                        background: gradient,
                    }}
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 15 + index * 5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: index * 2,
                    }}
                />
            ))}

            {/* Mesh gradient overlay */}
            <motion.div
                className="absolute inset-0"
                style={{
                    background: `
            radial-gradient(at 27% 37%, hsla(125, 45%, 42%, 0.05) 0px, transparent 50%),
            radial-gradient(at 97% 21%, hsla(51, 100%, 59%, 0.03) 0px, transparent 50%),
            radial-gradient(at 52% 99%, hsla(24, 33%, 47%, 0.04) 0px, transparent 50%),
            radial-gradient(at 10% 29%, hsla(125, 45%, 42%, 0.06) 0px, transparent 50%)
          `,
                }}
                animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />
        </div>
    );
}
