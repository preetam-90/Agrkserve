'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  CheckCircle,
  Tractor,
  Shield,
  Clock,
  Zap,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function FinalCTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubscribe = async () => {
    setErrorMessage('');

    if (!email) {
      setErrorMessage('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setStatus('success');
    setEmail('');
  };

  // Generate floating particles for depth - deterministic for SSR
  const particles = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: `${(i * 6.67) % 100}%`,
      top: `${(i * 6.67 + 5) % 100}%`,
      size: 1 + (i % 4),
      delay: (i * 0.13) % 2,
      duration: 4 + (i % 4),
    }));
  }, []);

  // Generate neon grid lines
  const neonLines = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      angle: 12 + i * 8,
      delay: i * 0.5,
    }));
  }, []);

  const benefits = [
    { icon: Tractor, text: 'Wide range of farming equipment' },
    { icon: Zap, text: 'Quick and easy booking process' },
    { icon: Shield, text: 'Verified providers & quality gear' },
    { icon: Clock, text: 'Rent by hour, day, or season' },
  ];

  return (
    <section ref={ref} className="relative w-full max-w-full overflow-hidden py-24 lg:py-32">
      {/* Seamless continuation from TimelineSection (#0A0F0C) */}
      <div className="absolute inset-0 bg-[#0A0F0C]" />

      {/* Neon Tilted Grid Lines */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {neonLines.map((line) => (
          <motion.div
            key={line.id}
            className="absolute left-[-25%] h-[1px] w-[150%]"
            style={{
              top: `${25 + line.id * 12}%`,
              transform: `rotate(${line.angle}deg)`,
              background:
                'linear-gradient(90deg, transparent 0%, rgba(34, 197, 94, 0.35) 50%, transparent 100%)',
              boxShadow: '0 0 15px rgba(34, 197, 94, 0.7)',
            }}
            animate={{
              x: ['-25%', '25%', '-25%'],
              opacity: [0.35, 0.65, 0.35],
            }}
            transition={{
              duration: 10 + line.id,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: line.delay,
            }}
          />
        ))}
      </div>

      {/* Animated gradient orbs for depth */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.06) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1.3, 1, 1.3],
            x: [0, -50, 0],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 3,
          }}
        />
      </div>

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-emerald-400/20"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
          }}
        />
      ))}

      {/* Refined noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Very subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 backdrop-blur-sm"
            >
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-300">Join 50,000+ Farmers</span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl"
            >
              Ready to Grow
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Your Farm?
              </span>
            </motion.h2>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mb-8 max-w-lg text-lg text-gray-300"
            >
              Start renting premium equipment today and boost your productivity with our trusted
              network of verified providers.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mb-10 flex flex-col gap-4 sm:flex-row"
            >
              <Link href="/equipment" className="flex-1 sm:flex-initial">
                <Button
                  size="lg"
                  className="group relative w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-6 text-lg text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 hover:from-emerald-400 hover:to-teal-400 hover:shadow-emerald-500/40 sm:w-auto"
                >
                  <span className="flex items-center gap-2">
                    Get Started Now
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>

              <Link href="/provider/equipment" className="flex-1 sm:flex-initial">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-xl border-2 border-emerald-500/40 px-8 py-6 text-lg text-emerald-300 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-200 sm:w-auto"
                >
                  List Your Equipment
                </Button>
              </Link>
            </motion.div>

            {/* Email Signup */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="max-w-md"
            >
              <div className="relative h-20">
                <AnimatePresence mode="wait">
                  {status === 'success' ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      className="absolute inset-0 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 text-emerald-300"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Subscribed!</p>
                        <p className="text-xs text-emerald-200/70">Welcome to the community.</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute inset-0"
                    >
                      <div
                        className={`flex gap-2 rounded-xl border p-1.5 backdrop-blur-xl transition-colors ${errorMessage ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/5 focus-within:border-emerald-500/50'}`}
                      >
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errorMessage) setErrorMessage('');
                          }}
                          disabled={status === 'loading'}
                          onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                          className="flex-1 border-none bg-transparent text-sm text-white placeholder:text-gray-500 focus:ring-0"
                        />
                        <Button
                          onClick={handleSubscribe}
                          disabled={status === 'loading'}
                          className={`w-28 rounded-lg px-5 text-sm font-medium text-white transition-all ${errorMessage ? 'bg-red-500/20 hover:bg-red-500/30' : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400'}`}
                        >
                          {status === 'loading' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Subscribe'
                          )}
                        </Button>
                      </div>
                      <p
                        className={`ml-1 mt-2 text-xs transition-colors ${errorMessage ? 'font-medium text-red-400' : 'text-gray-400'}`}
                      >
                        {errorMessage || 'Get updates on new equipment and exclusive offers'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Benefits Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative"
          >
            {/* Glass Card */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl lg:p-10">
              {/* Card Glow */}
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-emerald-500/20 blur-[80px]" />
              <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-teal-500/20 blur-[80px]" />

              <div className="relative z-10">
                <h3 className="mb-6 text-xl font-semibold text-white">Why Choose AgriRent?</h3>

                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={benefit.text}
                      initial={{ opacity: 0, x: 20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                      className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:border-emerald-500/30 hover:bg-white/10"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 transition-all group-hover:from-emerald-500/30 group-hover:to-teal-500/30">
                        <benefit.icon className="h-5 w-5 text-emerald-400" />
                      </div>
                      <span className="font-medium text-gray-200">{benefit.text}</span>
                      <CheckCircle className="ml-auto h-5 w-5 text-emerald-400 opacity-0 transition-opacity group-hover:opacity-100" />
                    </motion.div>
                  ))}
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 border-t border-white/10 pt-8">
                  <p className="mb-4 text-center text-sm text-gray-400">
                    Trusted by farming communities across India
                  </p>
                  <div className="flex justify-center gap-6">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Shield className="h-5 w-5" />
                      <span className="text-sm font-medium">Secure Payments</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">Verified Users</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Decorative Elements */}
            <motion.div
              className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-emerald-500/10 blur-xl"
              animate={{ y: [0, -10, 0], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-teal-500/10 blur-xl"
              animate={{ y: [0, 10, 0], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
