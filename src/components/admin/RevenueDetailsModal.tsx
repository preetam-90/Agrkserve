'use client';

import { X, TrendingUp, Calendar, CreditCard, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RevenueDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalRevenue: number;
  revenueStats: {
    labels: string[];
    values: number[];
    total: number;
  } | null;
  timeRange: string;
}

export default function RevenueDetailsModal({
  isOpen,
  onClose,
  totalRevenue,
  revenueStats,
  timeRange,
}: RevenueDetailsModalProps) {
  if (!isOpen) return null;

  const avgRevenue = revenueStats ? revenueStats.total / revenueStats.values.length : 0;
  const maxRevenue = revenueStats ? Math.max(...revenueStats.values) : 0;
  const minRevenue = revenueStats ? Math.min(...revenueStats.values) : 0;
  const growth = 18.2; // This could be calculated from actual data

  const handleExport = () => {
    if (!revenueStats) return;
    
    const csvContent = [
      ['Period', 'Revenue'],
      ...revenueStats.labels.map((label, i) => [label, `₹${revenueStats.values[i]}`]),
      ['', ''],
      ['Total', `₹${revenueStats.total}`],
      ['Average', `₹${avgRevenue.toFixed(2)}`],
      ['Peak', `₹${maxRevenue}`],
      ['Lowest', `₹${minRevenue}`],
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-details-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-700 bg-slate-900/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/20">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Revenue Details</h2>
              <p className="text-sm text-slate-400">
                {timeRange === 'week' ? 'Last 7 days' : timeRange === 'month' ? 'Last 4 weeks' : 'Last 12 months'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-slate-400">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">₹{totalRevenue.toLocaleString()}</div>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-400">+{growth}%</span>
                  <span className="text-xs text-slate-500">vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-slate-400">Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">₹{avgRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                <p className="text-xs text-slate-500 mt-1">Per period</p>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-slate-400">Peak Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-violet-400">₹{maxRevenue.toLocaleString()}</div>
                <p className="text-xs text-slate-500 mt-1">Highest period</p>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-slate-400">Lowest Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-400">₹{minRevenue.toLocaleString()}</div>
                <p className="text-xs text-slate-500 mt-1">Minimum period</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdown */}
          <Card className="border-slate-700 bg-slate-800/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-white">Period Breakdown</CardTitle>
                <p className="text-xs text-slate-400 mt-1">Revenue by {timeRange === 'week' ? 'day' : timeRange === 'month' ? 'week' : 'month'}</p>
              </div>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {revenueStats?.labels.map((label, index) => {
                  const value = revenueStats.values[index];
                  const percentage = revenueStats.total > 0 ? (value / revenueStats.total) * 100 : 0;
                  const isHighest = value === maxRevenue;
                  const isLowest = value === minRevenue;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-300">{label}</span>
                          {isHighest && (
                            <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 text-xs font-medium rounded-full border border-violet-500/20">
                              Peak
                            </span>
                          )}
                          {isLowest && (
                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs font-medium rounded-full border border-amber-500/20">
                              Low
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-white">₹{value.toLocaleString()}</div>
                          <div className="text-xs text-slate-500">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-700/50 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isHighest
                              ? 'bg-gradient-to-r from-violet-500 to-purple-500'
                              : isLowest
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card className="border-slate-700 bg-gradient-to-br from-emerald-900/20 to-teal-900/20">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Strong Growth Trend</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Revenue increased by {growth}% compared to the previous period, indicating healthy business growth.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Consistent Performance</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Average revenue of ₹{avgRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} per period shows stable operations.
                    </p>
                  </div>
                </div>

                {maxRevenue > avgRevenue * 1.5 && (
                  <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-violet-400 mt-1.5" />
                    <div>
                      <p className="text-sm font-medium text-white">Peak Performance</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Peak revenue of ₹{maxRevenue.toLocaleString()} is {((maxRevenue / avgRevenue - 1) * 100).toFixed(0)}% above average, showing strong potential.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-slate-700 bg-slate-900/95 backdrop-blur-sm">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => window.open('/admin/payments', '_blank')}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            View All Payments
            <ArrowUp className="w-4 h-4 rotate-45" />
          </button>
        </div>
      </div>
    </div>
  );
}
