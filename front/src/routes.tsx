import MainLayout from '@/layouts/main-layout';
import ProtectedRoute from '@/lib/protected-route';
import LoginPage from '@/domains/(auth)/login/page';
import DashboardPage from '@/domains/dashboard/page';
import TransactionsPage from '@/domains/transactions/page';
import { useRoutes, Navigate } from 'react-router-dom';

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">This section is coming soon.</p>
    </div>
  );
}

export default function Routes() {
  return useRoutes([
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <DashboardPage />,
        },
        {
          path: 'transactions',
          element: <TransactionsPage />,
        },
        {
          path: 'budget',
          element: <PlaceholderPage title="Budget" />,
        },
        {
          path: 'reports',
          element: <PlaceholderPage title="Reports" />,
        },
        {
          path: 'settings',
          element: <PlaceholderPage title="Settings" />,
        },
      ],
    },
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ]);
}
