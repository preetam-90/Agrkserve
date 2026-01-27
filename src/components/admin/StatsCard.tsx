import {
    TrendingUp,
    TrendingDown,
    Users,
    DollarSign,
    Calendar,
    Archive
} from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: any;
    trend?: {
        value: number;
        isUp: boolean;
    };
    color: 'green' | 'blue' | 'yellow' | 'purple';
}

export default function StatsCard({ title, value, icon: Icon, trend, color }: StatsCardProps) {
    const colorMap = {
        green: 'from-green-500 to-emerald-600',
        blue: 'from-blue-500 to-indigo-600',
        yellow: 'from-amber-400 to-orange-500',
        purple: 'from-purple-500 to-fuchsia-600',
    };

    const bgMap = {
        green: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
        yellow: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
    };

    return (
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${bgMap[color]} transition-colors`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend.isUp ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                            {trend.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {trend.value}%
                        </div>
                    )}
                </div>

                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
                </div>
            </div>

            {/* Decorative gradient blob */}
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br ${colorMap[color]} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />
        </div>
    );
}
