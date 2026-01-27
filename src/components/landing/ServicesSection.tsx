'use client';

import { motion } from 'framer-motion';
import { Tractor, Users, Truck, ArrowRight, Cog } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const services = [
    {
        id: 'equipment',
        title: 'Equipment Rental',
        description: 'Access a wide range of modern tractors, harvesters, and farming implements.',
        icon: Tractor,
        color: 'from-blue-600 to-cyan-500',
        glow: 'rgba(37, 99, 235, 0.2)',
        link: '/equipment',
    },
    {
        id: 'vehicle',
        title: 'Vehicle Rental',
        description: 'Rent trucks and utility vehicles for farm transportation needs.',
        icon: Truck,
        color: 'from-amber-600 to-orange-500',
        glow: 'rgba(217, 119, 6, 0.2)',
        link: '/vehicles',
    },
    {
        id: 'labor',
        title: 'Skilled Labor',
        description: 'Hire experienced farm workers for planting, harvesting, and maintenance.',
        icon: Users,
        color: 'from-emerald-600 to-green-500',
        glow: 'rgba(5, 150, 105, 0.2)',
        link: '/labour',
    },
    {
        id: 'specialty',
        title: 'Specialty Services',
        description: 'Expert consultation, soil testing, and precision farming solutions.',
        icon: Cog,
        color: 'from-purple-600 to-pink-500',
        glow: 'rgba(124, 58, 237, 0.2)',
        link: '/services',
    }
];

export function ServicesSection() {
    return (
        <section className="py-32 bg-gradient-to-b from-stone-50 to-white dark:from-zinc-900 dark:to-zinc-800 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
                <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-primary-green/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-earth-brown/5 rounded-full blur-[100px]" />
            </div>

            <div className="container-custom relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-primary-green dark:text-emerald-400 uppercase bg-primary-green/10 dark:bg-emerald-500/20 rounded-full"
                    >
                        Capabilities
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-6xl font-black mt-3 mb-8 tracking-tighter text-gray-900 dark:text-white"
                    >
                        Precision <span className="text-primary-green dark:text-emerald-400">Farming</span> Solutions
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-stone-600 dark:text-zinc-300 leading-relaxed"
                    >
                        Optimizing every acre with industry-leading machinery and expert human potential.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                            whileHover={{ y: -12 }}
                            className="group hover-trigger relative bg-white dark:bg-zinc-800/50 dark:backdrop-blur-xl rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-stone-200/60 dark:border-zinc-700/50 flex flex-col h-full transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] hover:dark:border-emerald-500/30 glow-effect"
                        >
                            {/* Animated Inner Glow */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                                style={{ background: `radial-gradient(circle at top right, ${service.glow}, transparent 70%)` }}
                            />

                            <div className="p-10 relative z-10 flex flex-col flex-grow">
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white mb-8 shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                                    <service.icon className="w-8 h-8" />
                                </div>

                                <h3 className="text-2xl font-bold mb-4 tracking-tight text-gray-900 dark:text-white group-hover:text-primary-green dark:group-hover:text-emerald-400 transition-colors">{service.title}</h3>
                                <p className="text-stone-600 dark:text-zinc-300 mb-10 leading-relaxed flex-grow text-[15px]">
                                    {service.description}
                                </p>

                                <Link href={service.link} className="mt-auto group/btn">
                                    <Button className="w-full h-12 bg-stone-100 dark:bg-zinc-700 text-stone-900 dark:text-white hover:bg-primary-green dark:hover:bg-emerald-500 hover:text-white border-0 transition-all font-bold tracking-tight rounded-xl flex items-center justify-center gap-2 group-hover/btn:shadow-lg group-hover/btn:shadow-primary-green/20">
                                        Book Now
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
