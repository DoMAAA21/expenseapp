import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { getApiErrorMessage } from '@/lib/http-error';
import { useRecentMonthlySummaries } from '@/hooks/use-recent-monthly-summaries';
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, XAxis, YAxis } from 'recharts';

const chartConfig = {
  positive: {
    label: 'Net positive',
    theme: {
      light: 'oklch(0.5 0.14 155)',
      dark: 'oklch(0.65 0.14 155)',
    },
  },
  negative: {
    label: 'Net negative',
    theme: {
      light: 'oklch(0.5 0.18 15)',
      dark: 'oklch(0.58 0.16 15)',
    },
  },
} satisfies ChartConfig;

const moneyCompact = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function NetBalanceBarChart() {
  const { chartData, isLoading, error } = useRecentMonthlySummaries(6);

  if (error) {
    return (
      <p className="text-sm text-destructive">
        {getApiErrorMessage(error, 'Could not load balance history')}
      </p>
    );
  }

  if (isLoading || !chartData) {
    return (
      <div
        className="h-[260px] w-full animate-pulse rounded-lg bg-muted/40"
        aria-hidden
      />
    );
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[260px] w-full max-w-full"
    >
      <BarChart data={chartData} margin={{ left: 8, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="period"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-muted-foreground"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-muted-foreground"
          tickFormatter={(v: number) => moneyCompact.format(v)}
        />
        <ReferenceLine y={0} className="stroke-border" strokeDasharray="3 3" />
        <ChartTooltip
          cursor={{ className: 'fill-muted/40' }}
          content={<ChartTooltipContent />}
        />
        <Bar dataKey="balance" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {chartData.map((row) => (
            <Cell
              key={row.period}
              fill={
                row.balance >= 0 ? 'var(--color-positive)' : 'var(--color-negative)'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
