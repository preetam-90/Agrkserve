'use server';

import { createClient } from '@/lib/supabase/server';
import { Earning, EarningStats, EarningChartData, EarningStatus } from '@/types/earnings';

type QueryError = {
  code?: string;
  message?: string;
};

type EarningsComputationRow = {
  id: string;
  amount: number;
  created_at: string;
  status?: string | null;
  job_id?: string;
  description?: string;
  customer_name?: string;
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}

function isSchemaError(error: QueryError | null): boolean {
  if (!error) {
    return false;
  }

  const code = error.code ?? '';
  const message = (error.message ?? '').toLowerCase();

  if (code === '42P01' || code === '42703' || code === 'PGRST204') {
    return true;
  }

  return (
    message.includes('does not exist') ||
    message.includes('could not find') ||
    message.includes('column') ||
    message.includes('relation')
  );
}

function emptyStats(): EarningStats {
  return {
    total_earnings: 0,
    today_earnings: 0,
    weekly_earnings: 0,
    monthly_earnings: 0,
    pending_payouts: 0,
    completed_jobs: 0,
    avg_job_value: 0,
    growth_rate: 0,
  };
}

function emptyChartData(range: 'week' | 'month' | 'year'): EarningChartData[] {
  const now = new Date();

  if (range === 'year') {
    return Array.from({ length: 12 }, (_, index) => {
      const bucketDate = new Date(now.getFullYear(), now.getMonth() - (11 - index), 1);
      return {
        date: formatMonthLabel(bucketDate),
        amount: 0,
      };
    });
  }

  const totalDays = range === 'week' ? 7 : 30;
  return Array.from({ length: totalDays }, (_, index) => {
    const bucketDate = startOfDay(
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - (totalDays - 1 - index))
    );
    return {
      date: formatDayLabel(bucketDate),
      amount: 0,
    };
  });
}

function computeStatsFromRows(
  rows: EarningsComputationRow[],
  hasStatusColumn: boolean
): EarningStats {
  const isRevenueStatus = (status?: string | null): boolean => {
    if (!status) {
      return true;
    }

    const normalized = status.toLowerCase();
    return (
      normalized === 'paid' ||
      normalized === 'success' ||
      normalized === 'completed' ||
      normalized === 'confirmed' ||
      normalized === 'in_progress'
    );
  };

  const now = new Date();
  const startOfToday = startOfDay(now);
  const startOfWeek = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const earnedRows = rows.filter((row) => isRevenueStatus(row.status));

  const total_earnings = earnedRows.reduce(
    (acc, curr) => acc + (curr.amount > 0 ? Number(curr.amount) : 0),
    0
  );
  const today_earnings = earnedRows
    .filter((e) => new Date(e.created_at) >= startOfToday)
    .reduce((acc, curr) => acc + (curr.amount > 0 ? Number(curr.amount) : 0), 0);
  const weekly_earnings = earnedRows
    .filter((e) => new Date(e.created_at) >= startOfWeek)
    .reduce((acc, curr) => acc + (curr.amount > 0 ? Number(curr.amount) : 0), 0);
  const monthly_earnings = earnedRows
    .filter((e) => new Date(e.created_at) >= startOfMonth)
    .reduce((acc, curr) => acc + (curr.amount > 0 ? Number(curr.amount) : 0), 0);

  const lastMonthEarnings = earnedRows
    .filter((e) => {
      const earningDate = new Date(e.created_at);
      return earningDate >= startOfLastMonth && earningDate < startOfMonth;
    })
    .reduce((acc, curr) => acc + (curr.amount > 0 ? Number(curr.amount) : 0), 0);

  const growth_rate =
    lastMonthEarnings > 0
      ? Number((((monthly_earnings - lastMonthEarnings) / lastMonthEarnings) * 100).toFixed(2))
      : monthly_earnings > 0
        ? 100
        : 0;

  const pending_payouts = hasStatusColumn
    ? rows
        .filter((e) => {
          const normalized = (e.status ?? '').toLowerCase();
          return (
            normalized === 'pending' || normalized === 'processing' || normalized === 'approved'
          );
        })
        .reduce((acc, curr) => acc + Number(curr.amount), 0)
    : 0;

  return {
    total_earnings,
    today_earnings,
    weekly_earnings,
    monthly_earnings,
    pending_payouts,
    completed_jobs: earnedRows.length,
    avg_job_value: total_earnings / (earnedRows.length || 1),
    growth_rate,
  };
}

function mapStatusToEarningStatus(status?: string | null): EarningStatus {
  const normalized = (status ?? '').toLowerCase();

  if (normalized === 'paid' || normalized === 'success' || normalized === 'completed') {
    return 'Paid';
  }

  if (normalized === 'failed' || normalized === 'cancelled' || normalized === 'rejected') {
    return 'Failed';
  }

  if (normalized === 'pending' || normalized === 'approved') {
    return 'Pending';
  }

  return 'Processing';
}

function toEarningRecord(
  role: 'provider' | 'labour',
  userId: string,
  row: EarningsComputationRow
): Earning {
  return {
    id: row.id,
    user_id: userId,
    role,
    amount: Number(row.amount) || 0,
    status: mapStatusToEarningStatus(row.status),
    job_id: row.job_id ?? row.id,
    description: row.description ?? `${role === 'provider' ? 'Booking' : 'Labour job'} earning`,
    customer_name: row.customer_name,
    created_at: row.created_at,
  };
}

async function getBookingBasedEarningsRows(
  role: 'provider' | 'labour',
  userId: string
): Promise<EarningsComputationRow[]> {
  const supabase = await createClient();

  if (role === 'provider') {
    const { data, error } = await supabase
      .from('bookings')
      .select('id, total_amount, status, created_at, equipment:equipment!inner(owner_id, name)')
      .eq('equipment.owner_id', userId);

    if (error) {
      console.error('Provider fallback earnings query failed:', error);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      amount: Number(row.total_amount) || 0,
      status: row.status,
      created_at: row.created_at,
      job_id: row.id,
      description:
        row.equipment && typeof row.equipment === 'object' && 'name' in row.equipment
          ? `Booking: ${String(row.equipment.name)}`
          : 'Equipment booking earning',
    }));
  }

  const labourProfileResult = await supabase
    .from('labour_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (labourProfileResult.error || !labourProfileResult.data) {
    if (labourProfileResult.error) {
      console.error('Labour fallback profile query failed:', labourProfileResult.error);
    }
    return [];
  }

  const { data, error } = await supabase
    .from('labour_bookings')
    .select('id, total_amount, status, created_at')
    .eq('labour_id', labourProfileResult.data.id);

  if (error) {
    console.error('Labour fallback earnings query failed:', error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    amount: Number(row.total_amount) || 0,
    status: row.status,
    created_at: row.created_at,
    job_id: row.id,
    description: 'Labour booking earning',
  }));
}

function buildChartDataFromRows(
  rows: EarningsComputationRow[],
  range: 'week' | 'month' | 'year'
): EarningChartData[] {
  const now = new Date();
  const includeForChart = (status?: string | null): boolean => {
    if (!status) {
      return true;
    }
    const normalized = status.toLowerCase();
    return (
      normalized === 'paid' ||
      normalized === 'success' ||
      normalized === 'completed' ||
      normalized === 'confirmed' ||
      normalized === 'in_progress'
    );
  };

  if (range === 'year') {
    const totals = new Map<string, number>();
    const points: EarningChartData[] = [];

    for (let i = 11; i >= 0; i--) {
      const bucketDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${bucketDate.getFullYear()}-${bucketDate.getMonth()}`;
      totals.set(key, 0);
    }

    rows.forEach((item) => {
      const amount = Number(item.amount);
      if (amount <= 0 || !includeForChart(item.status)) {
        return;
      }

      const itemDate = new Date(item.created_at);
      const key = `${itemDate.getFullYear()}-${itemDate.getMonth()}`;

      if (totals.has(key)) {
        totals.set(key, (totals.get(key) || 0) + amount);
      }
    });

    for (let i = 11; i >= 0; i--) {
      const bucketDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${bucketDate.getFullYear()}-${bucketDate.getMonth()}`;
      points.push({
        date: formatMonthLabel(bucketDate),
        amount: totals.get(key) || 0,
      });
    }

    return points;
  }

  const totalDays = range === 'week' ? 7 : 30;
  const totals = new Map<string, number>();
  const points: EarningChartData[] = [];

  for (let i = totalDays - 1; i >= 0; i--) {
    const bucketDate = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i));
    const key = bucketDate.toISOString().slice(0, 10);
    totals.set(key, 0);
  }

  rows.forEach((item) => {
    const amount = Number(item.amount);
    if (amount <= 0 || !includeForChart(item.status)) {
      return;
    }

    const key = startOfDay(new Date(item.created_at)).toISOString().slice(0, 10);
    if (totals.has(key)) {
      totals.set(key, (totals.get(key) || 0) + amount);
    }
  });

  for (let i = totalDays - 1; i >= 0; i--) {
    const bucketDate = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i));
    const key = bucketDate.toISOString().slice(0, 10);
    points.push({
      date: formatDayLabel(bucketDate),
      amount: totals.get(key) || 0,
    });
  }

  return points;
}

export async function getEarnings(
  role: 'provider' | 'labour',
  page: number = 1,
  limit: number = 10
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from('earnings')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('role', role)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching earnings:', error);
  }

  if (!error && (data ?? []).length > 0) {
    return {
      earnings: data as Earning[],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  const realRows = await getBookingBasedEarningsRows(role, user.id);
  const sortedRows = [...realRows].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const paginatedRows = sortedRows.slice(from, to + 1);

  return {
    earnings: paginatedRows.map((row) => toEarningRecord(role, user.id, row)),
    totalCount: sortedRows.length,
    totalPages: Math.ceil(sortedRows.length / limit),
  };
}

export async function getEarningsStats(role: 'provider' | 'labour'): Promise<EarningStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const statsQuery = supabase
    .from('earnings')
    .select('amount, status, created_at')
    .eq('user_id', user.id)
    .eq('role', role);

  const statsResult = await statsQuery;
  let data: Array<
    Pick<Earning, 'amount' | 'created_at'> & Partial<Pick<Earning, 'status'>>
  > | null = statsResult.data as Array<
    Pick<Earning, 'amount' | 'created_at'> & Partial<Pick<Earning, 'status'>>
  > | null;
  let error = statsResult.error;
  let hasStatusColumn = true;

  if (error && isSchemaError(error)) {
    hasStatusColumn = false;
    const fallback = await supabase
      .from('earnings')
      .select('amount, created_at')
      .eq('user_id', user.id)
      .eq('role', role);
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    console.error('Error fetching earnings stats:', error);
    const fallbackRows = await getBookingBasedEarningsRows(role, user.id);
    return computeStatsFromRows(fallbackRows, true);
  }

  const rows = (data ?? []).map((row, index) => ({
    id: `earnings-row-${index}`,
    amount: Number(row.amount) || 0,
    created_at: row.created_at,
    status: row.status,
  }));

  if (rows.length === 0) {
    const fallbackRows = await getBookingBasedEarningsRows(role, user.id);
    return computeStatsFromRows(fallbackRows, true);
  }

  return computeStatsFromRows(rows, hasStatusColumn);
}

export async function getEarningsChartData(
  role: 'provider' | 'labour',
  range: 'week' | 'month' | 'year'
): Promise<EarningChartData[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('earnings')
    .select('id, amount, created_at, status')
    .eq('user_id', user.id)
    .eq('role', role);

  if (error) {
    console.error('Error fetching chart data:', error);
    const fallbackRows = await getBookingBasedEarningsRows(role, user.id);
    return fallbackRows.length > 0
      ? buildChartDataFromRows(fallbackRows, range)
      : emptyChartData(range);
  }

  const rows = (data ?? []).map((row) => ({
    id: row.id,
    amount: Number(row.amount) || 0,
    created_at: row.created_at,
    status: row.status,
  }));

  if (rows.length === 0) {
    const fallbackRows = await getBookingBasedEarningsRows(role, user.id);
    return fallbackRows.length > 0
      ? buildChartDataFromRows(fallbackRows, range)
      : emptyChartData(range);
  }

  return buildChartDataFromRows(rows, range);
}
