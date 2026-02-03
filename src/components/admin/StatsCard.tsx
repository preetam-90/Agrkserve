import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, Archive } from 'lucide-react';

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
    green: {
      gradient: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      glow: 'shadow-emerald-500/20',
    },
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      glow: 'shadow-blue-500/20',
    },
    yellow: {
      gradient: 'from-amber-400 to-amber-500',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      glow: 'shadow-amber-500/20',
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      glow: 'shadow-purple-500/20',
    },
  };

  const colors = colorMap[color];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-card group relative overflow-hidden rounded-2xl border border-[#262626] p-6 transition-all duration-300 hover:border-emerald-500/20"
    >
      {/* Animated gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-5`}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div
            className={`rounded-xl p-3 ${colors.bg} ${colors.text} transition-all duration-300 group-hover:scale-110`}
          >
            <Icon className="h-6 w-6" />
          </div>
          {trend && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold ${
                trend.isUp
                  ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                  : 'border border-red-500/20 bg-red-500/10 text-red-400'
              }`}
            >
              {trend.isUp ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {trend.value}%
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            {title}
          </p>
          <h3 className="text-3xl font-bold tracking-tight text-white">{value}</h3>
        </div>
      </div>

      {/* Decorative gradient blob */}
      <div
        className={`absolute -bottom-6 -right-6 h-32 w-32 bg-gradient-to-br ${colors.gradient} rounded-full opacity-10 blur-3xl transition-opacity duration-500 group-hover:opacity-20`}
      />

      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </motion.div>
  );
}
