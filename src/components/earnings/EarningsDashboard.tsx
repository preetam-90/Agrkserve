'use client';

import { useEffect, useState } from 'react';
import { StatsCards } from './StatsCards';
import { EarningsChart } from './EarningsChart';
import { TransactionTable } from './TransactionTable';
import { getEarnings, getEarningsStats, getEarningsChartData } from '@/app/actions/earnings';
import { Earning, EarningStats, EarningChartData } from '@/types/earnings';

interface EarningsDashboardProps {
  role: 'provider' | 'labour';
}

export default function EarningsDashboard({ role }: EarningsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EarningStats | null>(null);
  const [transactions, setTransactions] = useState<Earning[]>([]);
  const [chartData, setChartData] = useState<EarningChartData[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [statsResult, earningsResult, chartResult] = await Promise.allSettled([
        getEarningsStats(role),
        getEarnings(role),
        getEarningsChartData(role, 'week'),
      ]);

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value);
      } else {
        console.error('Failed to fetch earnings stats', statsResult.reason);
        setStats({
          total_earnings: 0,
          today_earnings: 0,
          weekly_earnings: 0,
          monthly_earnings: 0,
          pending_payouts: 0,
          completed_jobs: 0,
          avg_job_value: 0,
          growth_rate: 0,
        });
      }

      if (earningsResult.status === 'fulfilled') {
        setTransactions(earningsResult.value.earnings);
      } else {
        console.error('Failed to fetch earnings transactions', earningsResult.reason);
        setTransactions([]);
      }

      if (chartResult.status === 'fulfilled') {
        setChartData(chartResult.value);
      } else {
        console.error('Failed to fetch earnings chart', chartResult.reason);
        setChartData([]);
      }

      setLoading(false);
    }

    fetchData();
  }, [role]);

  const handleRangeChange = async (range: 'week' | 'month' | 'year') => {
    try {
      const newChartData = await getEarningsChartData(role, range);
      setChartData(newChartData);
    } catch (error) {
      console.error('Failed to fetch earnings chart', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#050b07] pb-20 text-gray-100">
      <div className="pointer-events-none absolute left-0 top-0 h-[300px] w-full bg-gradient-to-b from-emerald-900/10 to-transparent" />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">Earnings Dashboard</h1>
          <p className="mt-2 text-gray-400">
            Live earnings calculated from your recorded {role} work.
          </p>
        </div>

        {stats && <StatsCards stats={stats} loading={loading} />}

        <div className="mb-8">
          <EarningsChart data={chartData} onRangeChange={handleRangeChange} loading={loading} />
        </div>

        <div className="grid grid-cols-1 gap-8">
          <TransactionTable transactions={transactions} loading={loading} />
        </div>
      </div>
    </div>
  );
}
