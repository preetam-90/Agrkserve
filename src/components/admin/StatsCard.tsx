'use client';

import { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'green' | 'blue' | 'purple' | 'yellow' | 'red' | 'cyan';
  trend?: {
    value: number;
    isUp: boolean;
  };
}

const colorMap = {
  green: {
    bg: 'rgba(0, 255, 157, 0.1)',
    border: 'rgba(0, 255, 157, 0.3)',
    text: '#00ff9d',
    glow: 'rgba(0, 255, 157, 0.3)',
  },
  blue: {
    bg: 'rgba(0, 212, 255, 0.1)',
    border: 'rgba(0, 212, 255, 0.3)',
    text: '#00d4ff',
    glow: 'rgba(0, 212, 255, 0.3)',
  },
  purple: {
    bg: 'rgba(255, 0, 255, 0.1)',
    border: 'rgba(255, 0, 255, 0.3)',
    text: '#ff00ff',
    glow: 'rgba(255, 0, 255, 0.3)',
  },
  yellow: {
    bg: 'rgba(255, 170, 0, 0.1)',
    border: 'rgba(255, 170, 0, 0.3)',
    text: '#ffaa00',
    glow: 'rgba(255, 170, 0, 0.3)',
  },
  red: {
    bg: 'rgba(255, 0, 85, 0.1)',
    border: 'rgba(255, 0, 85, 0.3)',
    text: '#ff0055',
    glow: 'rgba(255, 0, 85, 0.3)',
  },
  cyan: {
    bg: 'rgba(0, 255, 255, 0.1)',
    border: 'rgba(0, 255, 255, 0.3)',
    text: '#00ffff',
    glow: 'rgba(0, 255, 255, 0.3)',
  },
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color = 'green',
  trend,
}: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="admin-stat-card group cursor-pointer"
      whileHover={{ y: -4 }}
    >
      {/* Icon Container */}
      <div className="admin-stat-card-content">
        <div className="mb-4 flex items-start justify-between">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
            style={{
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              boxShadow: `0 0 20px ${colors.glow}`,
            }}
          >
            <Icon className="h-6 w-6" style={{ color: colors.text }} />
          </div>

          {/* Trend Indicator */}
          {trend && (
            <div className={`admin-stat-trend ${trend.isUp ? 'up' : 'down'}`}>
              {trend.isUp ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{trend.value}%</span>
            </div>
          )}
        </div>

        {/* Value */}
        <div
          className="admin-stat-value"
          style={{
            background: `linear-gradient(135deg, ${colors.text}, ${colors.text}dd)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {value}
        </div>

        {/* Label */}
        <div className="admin-stat-label font-['Fira_Sans']">{title}</div>

        {/* Decorative line */}
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-[var(--admin-bg-elevated)]">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${colors.text}, transparent)`,
            }}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </div>
      </div>

      {/* Holographic overlay on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${colors.glow}, transparent 70%)`,
        }}
      />
    </motion.div>
  );
}
