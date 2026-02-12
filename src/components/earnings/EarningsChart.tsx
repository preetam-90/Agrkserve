'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { EarningChartData } from '@/types/earnings';

interface EarningsChartProps {
  data: EarningChartData[];
  onRangeChange: (range: 'week' | 'month' | 'year') => void;
  loading?: boolean;
}

export function EarningsChart({ data, onRangeChange, loading }: EarningsChartProps) {
  const [activeRange, setActiveRange] = useState<'week' | 'month' | 'year'>('week');
  const ranges: Array<'week' | 'month' | 'year'> = ['week', 'month', 'year'];

  const handleRangeChange = (range: 'week' | 'month' | 'year') => {
    setActiveRange(range);
    onRangeChange(range);
  };

  if (loading) {
    return <div className="h-[400px] w-full animate-pulse rounded-xl bg-gray-800/50" />;
  }

  return (
    <Card className="h-full border-emerald-500/20 bg-[#0c1a13]/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-8">
        <div>
          <CardTitle className="text-xl text-white">Earnings Analytics</CardTitle>
          <CardDescription className="text-gray-400">Revenue trends over time</CardDescription>
        </div>
        <div className="flex gap-2 rounded-lg border border-emerald-500/10 bg-[#08120d] p-1">
          {ranges.map((range) => (
            <button
              key={range}
              onClick={() => handleRangeChange(range)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                activeRange === range
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                  : 'text-gray-400 hover:bg-emerald-500/10 hover:text-white'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value}`}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0c1a13',
                  border: '1px solid #10b98133',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                itemStyle={{ color: '#10b981' }}
                formatter={(value: number | undefined) => [
                  `₹${(value ?? 0).toLocaleString('en-IN')}`,
                  'Earnings',
                ]}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorEarnings)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
