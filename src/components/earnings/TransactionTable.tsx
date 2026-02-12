'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { Earning, EarningStatus } from '@/types/earnings';

interface TransactionTableProps {
  transactions: Earning[];
  loading?: boolean;
}

export function TransactionTable({ transactions, loading }: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | EarningStatus>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      const matchesStatus = statusFilter === 'all' || txn.status === statusFilter;
      const normalizedSearch = searchTerm.trim().toLowerCase();

      if (!normalizedSearch) {
        return matchesStatus;
      }

      const haystack =
        `${txn.description ?? ''} ${txn.id} ${txn.customer_name ?? ''}`.toLowerCase();
      return matchesStatus && haystack.includes(normalizedSearch);
    });
  }, [transactions, searchTerm, statusFilter]);

  const getStatusColor = (status: EarningStatus) => {
    switch (status) {
      case 'Paid':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Pending':
        return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'Processing':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Failed':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <Card className="border-emerald-500/20 bg-[#0c1a13]/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <CardTitle className="text-xl text-white">Real Transactions</CardTitle>
            <CardDescription className="text-gray-400">
              Supabase-backed earnings entries only
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                className="w-[220px] border-emerald-500/20 bg-[#08120d] pl-9 text-white focus:ring-emerald-500/50 md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as 'all' | EarningStatus)}
            >
              <SelectTrigger className="w-[150px] border-emerald-500/20 bg-[#08120d] text-gray-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="border-emerald-500/20 bg-[#08120d] text-gray-200">
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-emerald-500/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#08120d] text-xs font-semibold uppercase text-gray-400">
              <tr>
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/10">
              {loading ? (
                // Skeleton loading rows
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 w-32 rounded bg-gray-800"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 rounded bg-gray-800"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-20 rounded-full bg-gray-800"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="ml-auto h-4 w-16 rounded bg-gray-800"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="ml-auto h-8 w-8 rounded bg-gray-800"></div>
                    </td>
                  </tr>
                ))
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="transition-colors hover:bg-emerald-500/5">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{txn.description}</div>
                      <div className="mt-1 text-xs text-gray-500">
                        {txn.id}
                        {txn.customer_name ? ` - ${txn.customer_name}` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(txn.created_at).toLocaleDateString()}
                      <div className="text-xs text-gray-500">
                        {new Date(txn.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(txn.status)}`}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-white">
                      ₹{txn.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-gray-400">Recorded</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No real earnings transactions found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!loading && (
          <p className="mt-4 text-sm text-gray-400">
            Showing {filteredTransactions.length} of {transactions.length} recorded transactions.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
