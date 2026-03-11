import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PrimeLoader from "./PrimeLoader";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles = ["superadmin", "staff"],
}) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return <PrimeLoader isLoading={true} />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    if (user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
