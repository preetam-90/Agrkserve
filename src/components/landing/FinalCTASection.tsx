'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle, Tractor, Shield, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function FinalCTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [email, setEmail] = useState('');

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
    <section ref={ref} className="relative py-24 lg:py-32 overflow-hidden">
      {/* Seamless continuation from TimelineSection (#0A0F0C) */}
      <div className="absolute inset-0 bg-[#0A0F0C]" />
      
      {/* Neon Tilted Grid Lines */}
      <div className="absolute inset-0 overflow-hidden">
        {neonLines.map((line) => (
          <motion.div
            key={line.id}
            className="absolute w-[150%] h-[1px] left-[-25%]"
            style={{
              top: `${25 + line.id * 12}%`,
              transform: `rotate(${line.angle}deg)`,
              background: 'linear-gradient(90deg, transparent 0%, rgba(34, 197, 94, 0.35) 50%, transparent 100%)',
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
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full"
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
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
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
        className="absolute inset-0 opacity-[0.012] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Very subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/15 border border-emerald-400/30 rounded-full backdrop-blur-sm mb-6"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-300 font-medium">Join 50,000+ Farmers</span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
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
              className="text-lg text-gray-300 mb-8 max-w-lg"
            >
              Start renting premium equipment today and boost your productivity with our trusted network of verified providers.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 mb-10"
            >
              <Link href="/equipment" className="flex-1 sm:flex-initial">
                <Button
                  size="lg"
                  className="w-full sm:w-auto group relative bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5"
                >
                  <span className="flex items-center gap-2">
                    Get Started Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
              
              <Link href="/provider/equipment" className="flex-1 sm:flex-initial">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-400 hover:text-emerald-200 px-8 py-6 text-lg rounded-xl backdrop-blur-sm transition-all hover:-translate-y-0.5"
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
              <div className="flex gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-1.5 focus-within:border-emerald-500/50 transition-colors">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent border-none text-white placeholder:text-gray-500 focus:ring-0 text-sm"
                />
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-lg px-5 text-sm font-medium">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2 ml-1">
                Get updates on new equipment and exclusive offers
              </p>
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
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-10 overflow-hidden">
              {/* Card Glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-[80px]" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-teal-500/20 rounded-full blur-[80px]" />
              
              <div className="relative z-10">
                <h3 className="text-xl font-semibold text-white mb-6">
                  Why Choose AgriRent?
                </h3>
                
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={benefit.text}
                      initial={{ opacity: 0, x: 20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-emerald-500/30 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0 group-hover:from-emerald-500/30 group-hover:to-teal-500/30 transition-all">
                        <benefit.icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-gray-200 font-medium">{benefit.text}</span>
                      <CheckCircle className="w-5 h-5 text-emerald-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))}
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 pt-8 border-t border-white/10">
                  <p className="text-sm text-gray-400 text-center mb-4">Trusted by farming communities across India</p>
                  <div className="flex justify-center gap-6">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Shield className="w-5 h-5" />
                      <span className="text-sm font-medium">Secure Payments</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Verified Users</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Decorative Elements */}
            <motion.div
              className="absolute -top-4 -right-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl"
              animate={{ y: [0, -10, 0], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-4 -left-4 w-16 h-16 bg-teal-500/10 rounded-full blur-xl"
              animate={{ y: [0, 10, 0], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
