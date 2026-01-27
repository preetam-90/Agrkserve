'use client';

import { motion } from 'framer-motion';
import { Star, Quote, Leaf } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
    {
        id: 1,
        name: 'Rajesh Kumar',
        role: 'Wheat Farmer, Punjab',
        content: 'AgriGo transformed how I manage my harvest. Renting a harvester was so easy and affordable.',
        rating: 5,
        image: '/images/avatar-rajesh.png'
    },
    {
        id: 2,
        name: 'Anita Singh',
        role: 'Organic Farmer, Maharashtra',
        content: 'Finding skilled labor during peak season was always a headache. Now I can book verified workers in minutes with AgriGo.',
        rating: 5,
        image: '/images/avatar-anita.png'
    },
    {
        id: 3,
        name: 'Vikram Patel',
        role: 'Equipment Owner, Gujarat',
        content: 'I earn steady income by renting out my tractor when I\'m not using it. Great passive income source through AgriGo!',
        rating: 4,
        image: '/images/avatar-vikram.png'
    }
];

export function TestimonialsSection() {
    return (
        <section className="py-32 bg-gradient-to-b from-stone-50 to-white dark:from-zinc-800 dark:to-zinc-900 relative overflow-hidden">
            {/* Floating Background Icons */}
            <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-20 left-10 text-primary-green/20"
            >
                <Leaf className="w-16 h-16" />
            </motion.div>
            <motion.div
                animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-20 right-10 text-earth-brown/20"
            >
                <Leaf className="w-24 h-24" />
            </motion.div>

            <div className="container-custom relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white"
                    >
                        Farmer Stories
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-stone-600 dark:text-zinc-300"
                    >
                        Trusted by thousands of farmers across India
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-zinc-800/50 dark:backdrop-blur-xl p-8 rounded-3xl shadow-lg dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative border border-gray-100 dark:border-zinc-700/50"
                        >
                            <Quote className="absolute top-8 right-8 w-10 h-10 text-primary-green/10" />

                            <div className="flex items-center gap-1 text-amber-500 mb-6">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'fill-current' : 'text-gray-300'}`} />
                                ))}
                            </div>

                            <p className="text-stone-600 dark:text-zinc-300 mb-8 leading-relaxed italic">
                                &quot;{testimonial.content}&quot;
                            </p>

                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 relative rounded-full overflow-hidden border-2 border-primary-green/20">
                                    <Image
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
                                    <p className="text-sm text-primary-green">{testimonial.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
