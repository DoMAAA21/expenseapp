import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { getApiErrorMessage } from '@/lib/http-error';
import { useMonthlySummary } from '@/hooks/use-monthly-summary';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

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

export function MonthlyCashFlowChart() {
  const { data, isLoading, error, periodLabel } = useMonthlySummary();

  if (error) {
    return (
      <p className="text-sm text-destructive">
        {getApiErrorMessage(error, 'Could not load chart data')}
      </p>
    );
  }

  if (isLoading) {
    return (
      <div
        className="h-[280px] w-full animate-pulse rounded-lg bg-muted/40"
        aria-hidden
      />
    );
  }

  const income = data?.income ?? 0;
  const expenses = data?.expenses ?? 0;
  const chartData = [{ period: periodLabel, income, expenses }];

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[280px] w-full max-w-full"
    >
      <BarChart accessibilityLayer data={chartData} margin={{ left: 8, right: 8 }}>
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
          cursor={{ className: 'fill-muted/40' }}
          content={<ChartTooltipContent />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="income"
          fill="var(--color-income)"
          radius={[6, 6, 0, 0]}
          maxBarSize={56}
        />
        <Bar
          dataKey="expenses"
          fill="var(--color-expenses)"
          radius={[6, 6, 0, 0]}
          maxBarSize={56}
        />
      </BarChart>
    </ChartContainer>
  );
}
