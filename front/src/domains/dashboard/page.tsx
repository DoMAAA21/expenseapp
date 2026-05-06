import { MonthlyCashFlowChart } from './_components/monthly-cash-flow-chart';
import { MonthlyTrendLineChart } from './_components/monthly-trend-line-chart';
import { NetBalanceBarChart } from './_components/net-balance-bar-chart';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Snapshot of your money this month.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly cash flow</CardTitle>
            <CardDescription>
              Income vs expenses for the current calendar month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyCashFlowChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income &amp; expense trend</CardTitle>
            <CardDescription>Last six months, based on transaction dates.</CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyTrendLineChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Net balance by month</CardTitle>
            <CardDescription>Income minus expenses per month (green positive, red negative).</CardDescription>
          </CardHeader>
          <CardContent>
            <NetBalanceBarChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
