import http from '@/lib/http';
import type { MonthlySummaryData } from '@/hooks/use-monthly-summary';
import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

export type MonthPeriod = {
  month: number;
  year: number;
  shortLabel: string;
};

export function getRollingMonthPeriods(count: number): MonthPeriod[] {
  const out: MonthPeriod[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      shortLabel: d.toLocaleString(undefined, { month: 'short', year: '2-digit' }),
    });
  }
  return out;
}

export type TrendPoint = {
  period: string;
  income: number;
  expenses: number;
  balance: number;
};

export function useRecentMonthlySummaries(monthCount = 6) {
  const periods = useMemo(() => getRollingMonthPeriods(monthCount), [monthCount]);

  const results = useQueries({
    queries: periods.map((p) => ({
      queryKey: ['transactions', 'summary', p.month, p.year] as const,
      queryFn: async () => {
        const res = await http.get<{ data: MonthlySummaryData }>(
          '/transactions/summary',
          {
            params: { month: p.month, year: p.year },
          },
        );
        return res.data.data;
      },
    })),
  });

  const error = results.find((r) => r.error)?.error ?? null;
  const isLoading = results.some((r) => r.isPending);

  const chartData: TrendPoint[] | null =
    !error && results.every((r) => r.data != null)
      ? periods.map((p, i) => ({
          period: p.shortLabel,
          income: results[i].data!.income,
          expenses: results[i].data!.expenses,
          balance: results[i].data!.balance,
        }))
      : null;

  return { chartData, isLoading, error, periods };
}
