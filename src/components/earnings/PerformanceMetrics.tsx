'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { EarningStats } from '@/types/earnings';
import { MapPin, Briefcase, Star, Clock } from 'lucide-react';

interface PerformanceMetricsProps {
    stats: EarningStats;
}

export function PerformanceMetrics({ stats }: PerformanceMetricsProps) {
    // Mock data for breakdown - in real app, fetch from API
    const categoryData = [
        { name: 'Machine Rental', value: 65, color: 'bg-emerald-500' },
        { name: 'Labour Services', value: 25, color: 'bg-blue-500' },
        { name: 'Consulting', value: 10, color: 'bg-purple-500' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-[#0c1a13]/50 backdrop-blur-sm border-emerald-500/20 col-span-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle className="text-lg text-white">Revenue By Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {categoryData.map((cat, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-300 font-medium">{cat.name}</span>
                                    <span className="text-white font-bold">{cat.value}%</span>
                                </div>
                                <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.value}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#0c1a13]/50 backdrop-blur-sm border-emerald-500/20">
                <CardHeader>
                    <CardTitle className="text-lg text-white">Job Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 rounded-lg bg-[#08120d] border border-emerald-500/10">
                            <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
                                <Star className="w-5 h-5 fill-current" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Average Rating</p>
                                <p className="text-lg font-bold text-white">4.8 <span className="text-xs font-normal text-gray-500">/ 5.0</span></p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 rounded-lg bg-[#08120d] border border-emerald-500/10">
                            <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Job Completion</p>
                                <p className="text-lg font-bold text-white">98%</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 rounded-lg bg-[#08120d] border border-emerald-500/10">
                            <div className="bg-orange-500/10 p-2 rounded-lg text-orange-400">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">On-Time Rate</p>
                                <p className="text-lg font-bold text-white">92%</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
