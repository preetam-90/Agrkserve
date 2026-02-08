'use client';

import { motion } from 'framer-motion';
import {
  HardDrive,
  Image as ImageIcon,
  Film,
  TrendingUp,
  Activity,
  Zap,
  Database,
} from 'lucide-react';
import type { MediaAnalytics, UserMediaSummary } from '@/lib/types/cloudinary-admin';

interface MediaAnalyticsDashboardProps {
  analytics: MediaAnalytics & { usersWithMedia: UserMediaSummary[] };
  isLoading?: boolean;
}

export function MediaAnalyticsDashboard({ analytics, isLoading }: MediaAnalyticsDashboardProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-[#1a1a1a]" />
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Storage',
      value: formatBytes(analytics.totalStorageBytes),
      icon: HardDrive,
      color: 'emerald',
      trend: '+12%',
    },
    {
      label: 'Total Assets',
      value: analytics.totalAssets.toLocaleString(),
      icon: ImageIcon,
      color: 'blue',
      subtext: `${analytics.imageCount} images, ${analytics.videoCount} videos`,
    },
    {
      label: 'Transformations',
      value: analytics.transformationsCount?.toLocaleString() || 'N/A',
      icon: Zap,
      color: 'purple',
      subtext: 'API calls',
    },
    {
      label: 'Bandwidth',
      value: analytics.bandwidthUsed ? formatBytes(analytics.bandwidthUsed) : 'N/A',
      icon: Activity,
      color: 'orange',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-xl border border-[#262626] bg-[#0f0f0f] p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-400">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-white">{stat.value}</p>
                {stat.subtext && <p className="mt-1 text-xs text-neutral-500">{stat.subtext}</p>}
                {stat.trend && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    {stat.trend} this month
                  </div>
                )}
              </div>
              <div className={`rounded-xl bg-${stat.color}-500/10 p-3`}>
                <stat.icon className={`h-5 w-5 text-${stat.color}-400`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Monthly Uploads Chart - Enhanced */}
      <div className="rounded-xl border border-[#262626] bg-[#0f0f0f] p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Upload Trends</h3>
            <p className="text-sm text-neutral-400">Monthly asset uploads breakdown</p>
          </div>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-neutral-400">Images</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-neutral-400">Videos</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-6 flex h-64 items-end gap-3">
          {analytics.monthlyUploads.map((month, index) => {
            const maxValue =
              Math.max(...analytics.monthlyUploads.map((m) => m.imageCount + m.videoCount)) || 1;
            const total = month.imageCount + month.videoCount;
            const imageHeight = maxValue > 0 ? (month.imageCount / maxValue) * 100 : 0;
            const videoHeight = maxValue > 0 ? (month.videoCount / maxValue) * 100 : 0;

            return (
              <div
                key={month.month}
                className="group relative flex flex-1 flex-col items-center gap-3"
              >
                {/* Stacked bars */}
                <div className="relative flex h-full w-full flex-col justify-end">
                  {/* Video bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${videoHeight}%` }}
                    transition={{ delay: index * 0.05, duration: 0.6 }}
                    className="w-full rounded-t-lg bg-blue-500"
                    style={{ minHeight: month.videoCount > 0 ? '4px' : '0' }}
                  />
                  {/* Image bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${imageHeight}%` }}
                    transition={{ delay: index * 0.05 + 0.1, duration: 0.6 }}
                    className="w-full rounded-t-lg bg-emerald-500"
                    style={{ minHeight: month.imageCount > 0 ? '4px' : '0' }}
                  />
                </div>

                {/* Tooltip on hover */}
                <div className="invisible absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-[#262626] bg-[#0a0a0a] px-3 py-2 text-xs shadow-xl group-hover:visible">
                  <div className="mb-1 font-semibold text-white">{month.month}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span>{month.imageCount} images</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-400">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span>{month.videoCount} videos</span>
                    </div>
                    <div className="mt-1 border-t border-[#262626] pt-1 text-neutral-300">
                      Total: {total}
                    </div>
                  </div>
                </div>

                {/* Month label */}
                <span className="text-xs font-medium text-neutral-400">{month.month}</span>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 border-t border-[#262626] pt-6">
          <div className="rounded-lg bg-[#1a1a1a] p-4">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Database className="h-4 w-4" />
              Total Uploads
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
              {analytics.monthlyUploads.reduce((sum, m) => sum + m.imageCount + m.videoCount, 0)}
            </p>
            <p className="mt-1 text-xs text-neutral-500">Last 6 months</p>
          </div>

          <div className="rounded-lg bg-[#1a1a1a] p-4">
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ImageIcon className="h-4 w-4" />
              Avg. Images/Month
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
              {Math.round(
                analytics.monthlyUploads.reduce((sum, m) => sum + m.imageCount, 0) /
                  (analytics.monthlyUploads.length || 1)
              )}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {((analytics.imageCount / analytics.totalAssets) * 100).toFixed(1)}% of total
            </p>
          </div>

          <div className="rounded-lg bg-[#1a1a1a] p-4">
            <div className="flex items-center gap-2 text-xs text-blue-400">
              <Film className="h-4 w-4" />
              Avg. Videos/Month
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
              {Math.round(
                analytics.monthlyUploads.reduce((sum, m) => sum + m.videoCount, 0) /
                  (analytics.monthlyUploads.length || 1)
              )}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {((analytics.videoCount / analytics.totalAssets) * 100).toFixed(1)}% of total
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
