import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

const money = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
});

export type TransactionMonthSummaryProps = {
  periodLabel: string;
  income: number;
  expenses: number;
  balance: number;
  isLoading: boolean;
  error: Error | null;
};

export function TransactionMonthSummary({
  periodLabel,
  income,
  expenses,
  balance,
  isLoading,
  error,
}: TransactionMonthSummaryProps) {
  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        Could not load monthly totals: {error.message}
      </div>
    );
  }

  const netPositive = balance >= 0;

  return (
    <Card size="sm">
      <CardHeader className="pb-2">
        <CardTitle>This month</CardTitle>
        <CardDescription>{periodLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Income</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              {isLoading ? '—' : `+${money.format(income)}`}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Expenses</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">
              {isLoading ? '—' : `−${money.format(expenses)}`}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Net</dt>
            <dd
              className={cn(
                'mt-1 text-lg font-semibold tabular-nums',
                isLoading
                  ? 'text-muted-foreground'
                  : netPositive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400',
              )}
            >
              {isLoading
                ? '—'
                : `${netPositive ? '+' : '−'}${money.format(Math.abs(balance))}`}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
