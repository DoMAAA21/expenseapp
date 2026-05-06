import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { getApiErrorMessage } from '@/lib/http-error';
import { useRecentMonthlySummaries } from '@/hooks/use-recent-monthly-summaries';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

const chartConfig = {
  income: {
    label: 'Income',
    theme: {
      light: 'oklch(0.5 0.14 155)',
      dark: 'oklch(0.65 0.14 155)',
    },
  },
  expenses: {
    label: 'Expenses',
    theme: {
      light: 'oklch(0.52 0.18 15)',
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

export function MonthlyTrendLineChart() {
  const { chartData, isLoading, error } = useRecentMonthlySummaries(6);

  if (error) {
    return (
      <p className="text-sm text-destructive">
        {getApiErrorMessage(error, 'Could not load trend data')}
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
      <LineChart data={chartData} margin={{ left: 8, right: 8, top: 8 }}>
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
        <ChartTooltip
          cursor={{ className: 'stroke-border' }}
          content={<ChartTooltipContent />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          type="monotone"
          dataKey="income"
          stroke="var(--color-income)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke="var(--color-expenses)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ChartContainer>
  );
}
