export type EarningStatus = 'Paid' | 'Pending' | 'Failed' | 'Processing';
export type EarningRole = 'provider' | 'labour';

export interface Earning {
    id: string;
    user_id: string;
    role: EarningRole;
    amount: number;
    status: EarningStatus;
    job_id: string;
    description: string;
    customer_name?: string;
    created_at: string;
}

export interface EarningStats {
    total_earnings: number;
    today_earnings: number;
    weekly_earnings: number;
    monthly_earnings: number;
    pending_payouts: number;
    completed_jobs: number;
    avg_job_value: number;
    growth_rate: number;
}

export interface EarningChartData {
    date: string;
    amount: number;
}

export interface CategoryBreakdown {
    category: string;
    amount: number;
    percentage: number;
}
