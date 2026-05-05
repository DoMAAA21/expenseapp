import { useRoutes, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import LoginPage from './domains/(auth)/login/page';
import { useAuth } from './contexts/auth-context';

function HomePage() {
    const { user, logout } = useAuth();

    return (
        <div className="flex min-h-screen items-center justify-center p-6">
            <div className="w-full max-w-lg rounded-lg border p-6">
                <h1 className="text-2xl font-bold">Budgetly</h1>
                <p className="mt-2 text-muted-foreground">
                    Signed in as {user?.email}
                </p>
                <button
                    className="mt-4 rounded bg-black px-4 py-2 text-white"
                    onClick={() => void logout()}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

export default function Routes() {  
    return useRoutes([
        {
            path: '/',
            element: (
                <ProtectedRoute>
                    <HomePage />
                </ProtectedRoute>
            ),
        },
        {
            path: '/login',
            element: <LoginPage />
        },
        {
            path: '*',
            element: <Navigate to="/" replace />,
        },
    ])
}