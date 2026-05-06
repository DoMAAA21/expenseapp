import http from '@/lib/http';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export type MonthlySummaryData = {
  month: number;
  year: number;
  income: number;
  expenses: number;
  balance: number;
};

export function useMonthlySummary() {
  const now = new Date();
  const summaryMonth = now.getMonth() + 1;
  const summaryYear = now.getFullYear();

  const periodLabel = useMemo(
    () =>
      new Date(summaryYear, summaryMonth - 1, 1).toLocaleString(undefined, {
        month: 'long',
        year: 'numeric',
      }),
    [summaryMonth, summaryYear],
  );

  const query = useQuery({
    queryKey: ['transactions', 'summary', summaryMonth, summaryYear],
    queryFn: async () => {
      const res = await http.get<{ data: MonthlySummaryData }>(
        '/transactions/summary',
        {
          params: { month: summaryMonth, year: summaryYear },
        },
      );
      return res.data.data;
    },
  });

  return { ...query, periodLabel, summaryMonth, summaryYear };
}
