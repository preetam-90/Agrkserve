import { Card, CardContent } from '@/components/ui/card';
import { EarningStats } from '@/types/earnings';
import { IndianRupee, TrendingUp, Calendar, ArrowUpRight, Clock, Battery, Wallet } from 'lucide-react';

interface StatsCardsProps {
    stats: EarningStats;
    loading?: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-gray-800/50 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    const cards = [
        {
            label: 'Total Earnings',
            amount: stats.total_earnings,
            change: `+${stats.growth_rate}%`,
            trend: 'up',
            icon: Wallet,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
            border: 'border-emerald-500/20',
        },
        {
            label: 'This Month',
            amount: stats.monthly_earnings,
            change: 'vs last month',
            trend: 'neutral',
            icon: Calendar,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            border: 'border-blue-500/20',
        },
        {
            label: 'Pending Payouts',
            amount: stats.pending_payouts,
            change: 'Processing',
            trend: 'neutral',
            icon: Clock,
            color: 'text-orange-400',
            bg: 'bg-orange-400/10',
            border: 'border-orange-500/20',
        },
        {
            label: 'Avg Job Value',
            amount: stats.avg_job_value,
            change: `${stats.completed_jobs} jobs`,
            trend: 'up',
            icon: TrendingUp,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
            border: 'border-purple-500/20',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card, index) => (
                <Card
                    key={index}
                    className={`bg-[#0c1a13]/50 backdrop-blur-sm border ${card.border} hover:border-opacity-50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-900/10 group`}
                >
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${card.bg} group-hover:scale-110 transition-transform duration-300`}>
                                <card.icon className={`h-6 w-6 ${card.color}`} />
                            </div>
                            {card.trend === 'up' && (
                                <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium bg-emerald-400/10 px-2 py-1 rounded-full">
                                    <ArrowUpRight className="h-3 w-3" />
                                    {card.change}
                                </div>
                            )}
                            {card.trend === 'neutral' && (
                                <div className="flex items-center gap-1 text-gray-400 text-xs font-medium bg-gray-400/10 px-2 py-1 rounded-full">
                                    {card.change}
                                </div>
                            )}
                        </div>

                        <div>
                            <p className="text-gray-400 text-sm font-medium mb-1">{card.label}</p>
                            <h3 className="text-2xl font-bold text-white flex items-center">
                                <IndianRupee className="h-5 w-5 mr-1 text-gray-400" />
                                {card.amount.toLocaleString('en-IN')}
                            </h3>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
