import { useAuth } from "@/contexts/auth-context";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

export default  function ProtectedRoute({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}