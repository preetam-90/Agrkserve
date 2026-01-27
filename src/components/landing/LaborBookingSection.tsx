'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Search } from 'lucide-react';

export function LaborBookingSection() {
    return (
        <section className="py-24 bg-primary-green-dark relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div className="container-custom relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            Need Skilled Hands for Your Farm?
                        </h2>
                        <p className="text-lg text-emerald-100 mb-8 leading-relaxed">
                            Don't let labor shortages delay your harvest.
                            Find and book experienced farm workers instantly.
                            Verified profiles, transparent pricing, and reliable service.
                        </p>

                        <div className="flex gap-4 mb-8">
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-golden-accent">5000+</span>
                                <span className="text-emerald-200 text-sm">Active Workers</span>
                            </div>
                            <div className="w-px bg-emerald-500/50" />
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-golden-accent">98%</span>
                                <span className="text-emerald-200 text-sm">Satisfaction Rate</span>
                            </div>
                        </div>

                        <Button size="lg" className="bg-golden-accent text-primary-green-dark hover:bg-white font-bold text-lg px-8 h-14 rounded-xl">
                            Start Hiring Now
                        </Button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl"
                    >
                        <h3 className="text-2xl font-bold text-white mb-6">Quick Book Labor</h3>

                        <form className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-emerald-100">Skill Type</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <select className="w-full bg-white/90 border-0 h-12 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-golden-accent text-gray-800 appearance-none">
                                        <option>Harvesting</option>
                                        <option>Planting</option>
                                        <option>Irrigation Management</option>
                                        <option>Tractor Driving</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-emerald-100">Duration</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <select className="w-full bg-white/90 border-0 h-12 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-golden-accent text-gray-800 appearance-none">
                                            <option>1 Day</option>
                                            <option>3 Days</option>
                                            <option>1 Week</option>
                                            <option>Custom</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-emerald-100">Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input type="date" className="w-full bg-white/90 border-0 h-12 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-golden-accent text-gray-800" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-emerald-100">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="text" placeholder="Enter farm location" className="w-full bg-white/90 border-0 h-12 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-golden-accent text-gray-800" />
                                </div>
                            </div>

                            <Button className="w-full bg-primary-green hover:bg-green-600 text-white font-bold h-12 rounded-xl mt-4">
                                Check Availability
                            </Button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
