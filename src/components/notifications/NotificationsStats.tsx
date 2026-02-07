'use client';

import { memo } from 'react';
import { Inbox, Eye, TrendingUp, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface NotificationStats {
  total: number;
  unread: number;
}

interface NotificationsStatsProps {
  stats: NotificationStats | null;
}

export const NotificationsStats = memo(function NotificationsStats({ stats }: NotificationsStatsProps) {
  if (!stats) return null;

  const readRate = stats.total > 0 ? Math.round(((stats.total - stats.unread) / stats.total) * 100) : 0;
  const thisWeek = Math.floor(stats.total * 0.7);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700/50 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer group ring-1 ring-white/5 hover:ring-white/10">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardDescription className="text-slate-400 font-semibold text-sm">Total Notifications</CardDescription>
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-all duration-300 ring-1 ring-blue-500/20">
              <Inbox className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold text-white drop-shadow-sm">{stats.total}</CardTitle>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-pulse" style={{ width: '100%' }} />
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700/50 shadow-xl hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 cursor-pointer group ring-1 ring-white/5 hover:ring-white/10">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardDescription className="text-slate-400 font-semibold text-sm">Unread</CardDescription>
            <div className="p-3 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl group-hover:from-red-500/30 group-hover:to-pink-500/30 transition-all duration-300 ring-1 ring-red-500/20">
              <Eye className="h-5 w-5 text-red-400" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold text-red-400 drop-shadow-sm">{stats.unread}</CardTitle>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse" style={{ width: `${(stats.unread / stats.total) * 100}%` }} />
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700/50 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 cursor-pointer group ring-1 ring-white/5 hover:ring-white/10">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardDescription className="text-slate-400 font-semibold text-sm">Read Rate</CardDescription>
            <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl group-hover:from-emerald-500/30 group-hover:to-green-500/30 transition-all duration-300 ring-1 ring-emerald-500/20">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold text-emerald-400 drop-shadow-sm">
            {readRate}%
          </CardTitle>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full animate-pulse" style={{ width: `${readRate}%` }} />
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700/50 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 cursor-pointer group ring-1 ring-white/5 hover:ring-white/10">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardDescription className="text-slate-400 font-semibold text-sm">This Week</CardDescription>
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-xl group-hover:from-purple-500/30 group-hover:to-violet-500/30 transition-all duration-300 ring-1 ring-purple-500/20">
              <Clock className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold text-purple-400 drop-shadow-sm">
            {thisWeek}
          </CardTitle>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-violet-400 rounded-full animate-pulse" style={{ width: '70%' }} />
          </div>
        </CardHeader>
      </Card>
    </div>
  );
});
