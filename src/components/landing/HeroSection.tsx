'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { scrollY } = useScroll();

  const currentFrame = useRef(0);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      const loadedImages: HTMLImageElement[] = [];
      const totalFrames = 295;

      // Load all 295 frames
      const promises = Array.from({ length: totalFrames }, (_, i) => {
        return new Promise<HTMLImageElement | null>((resolve) => {
          const img = new Image();
          const paddedIndex = (i + 1).toString().padStart(3, '0');
          img.src = `/images/hero-sequence/ezgif-frame-${paddedIndex}.jpg`;
          img.onload = () => resolve(img);
          img.onerror = () => {
            console.error(`Failed to load frame ${paddedIndex}`);
            resolve(null);
          };
        });
      });

      const results = await Promise.all(promises);
      results.forEach(img => {
        if (img) loadedImages.push(img);
      });

      setImages(loadedImages);
      setIsLoaded(true);
    };

    loadImages();
  }, []);

  useEffect(() => {
    if (!isLoaded || !canvasRef.current || images.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    const render = () => {
      const img = images[currentFrame.current];
      // Check if image is complete and not broken
      if (img && img.complete && img.naturalWidth > 0) {
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (canvas.width - img.width * ratio) / 2;
        const centerShift_y = (canvas.height - img.height * ratio) / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
      }
    };

    let lastTime = 0;
    const fps = 12; // Slowed down from 15 for a more cinematic feel
    const interval = 1000 / fps;

    const animate = (currentTime: number) => {
      requestRef.current = requestAnimationFrame(animate);

      const delta = currentTime - lastTime;
      if (delta > interval) {
        render();
        currentFrame.current = (currentFrame.current + 1) % images.length;
        lastTime = currentTime - (delta % interval);
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isLoaded, images]);

  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.1]);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black text-white">
      {/* Canvas Background with Parallax Scale */}
      <motion.div style={{ scale }} className="absolute inset-0 z-0">
        <canvas ref={canvasRef} className="w-full h-full object-cover opacity-70 transition-opacity duration-1000" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
      </motion.div>

      {/* Premium Content Overlay */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 flex items-center gap-4 pl-4 border-l-2 border-golden-accent/50"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-golden-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-golden-accent"></span>
          </span>
          <span className="text-sm font-black text-white/80 tracking-[0.3em] uppercase" style={{ fontFamily: 'DM Mono, monospace' }}>The New Standard of Agriculture</span>
        </motion.div>

        {/* Cinematic Headline with Bebas Neue */}
        <div className="mb-10">
          <motion.h1
            className="text-[3rem] md:text-[6rem] lg:text-[8rem] font-black uppercase leading-[0.85] tracking-[0.015em]"
            style={{
              fontFamily: 'Bebas Neue, Impact, sans-serif',
              textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(255,255,255,0.1)'
            }}
          >
            {/* Staggered Word Animations */}
            <motion.span
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="block text-white"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Rent.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="block text-white"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Farm.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="block"
              style={{
                background: 'linear-gradient(135deg, #2E7D32 0%, #FFD700 50%, #ffffff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Dominating.
            </motion.span>
          </motion.h1>
        </div>

        {/* Subheadline with Keyword Highlights */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
          className="text-base md:text-2xl max-w-4xl mb-16 leading-relaxed font-medium"
          style={{
            fontFamily: 'Inter, Poppins, sans-serif',
            color: '#E5E5E5'
          }}
        >
          Unrivaled access to{' '}
          <motion.span
            animate={{
              color: ['#E5E5E5', '#FFD700', '#E5E5E5'],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="font-semibold"
          >
            elite machinery
          </motion.span>
          {' '}and master-class labor. The platform that{' '}
          <motion.span
            animate={{
              color: ['#E5E5E5', '#FFD700', '#E5E5E5'],
            }}
            transition={{ duration: 2, delay: 1, repeat: Infinity, ease: "easeInOut" }}
            className="font-semibold"
          >
            farmers
          </motion.span>
          {' '}trust at scale.
        </motion.p>

        {/* Premium Buttons with Montserrat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-6"
        >
          <Link href="/auth/signup">
            <motion.button
              whileHover={{
                scale: 1.05,
                background: 'linear-gradient(135deg, #2E7D32 0%, #FFD700 100%)',
              }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 text-base md:text-lg font-semibold uppercase tracking-wide rounded-full transition-all duration-300 shadow-[0_0_40px_rgba(46,125,50,0.4)] hover:shadow-[0_0_60px_rgba(255,215,0,0.6)]"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                background: '#2E7D32',
                color: 'white',
                border: 'none'
              }}
            >
              Get Started
              <ArrowRight className="inline ml-2 w-5 h-5" />
            </motion.button>
          </Link>
          <Link href="/equipment">
            <motion.button
              whileHover={{
                scale: 1.05,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderColor: 'rgba(255, 255, 255, 1)'
              }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 text-base md:text-lg font-semibold uppercase tracking-wide rounded-full transition-all duration-300 backdrop-blur-xl"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                backgroundColor: 'transparent',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              Explore Equipment
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator with DM Mono */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0] }}
        transition={{ delay: 2, duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-4"
      >
        <span
          className="text-[0.9rem] uppercase tracking-[0.3em]"
          style={{
            fontFamily: 'DM Mono, Montserrat, monospace',
            color: 'rgba(255, 255, 255, 0.4)'
          }}
        >
          Discover More
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-8 h-8 text-golden-accent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
