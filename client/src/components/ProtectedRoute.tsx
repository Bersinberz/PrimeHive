import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PrimeLoader from "./PrimeLoader";
import AccessDenied from "./AccessDenied";
import type { Permissions } from "../services/authService";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
    /** If provided, staff must have this view permission to access the page */
    permission?: keyof Permissions;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles = ["superadmin", "staff"],
    permission,
}) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) return <PrimeLoader isLoading={true} />;
    if (!isAuthenticated) return <Navigate to="/auth" replace />;
    if (user && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

    // Page-level permission check for staff
    if (permission && user?.role === "staff") {
        const modulePerms = user.permissions?.[permission] as Record<string, boolean> | undefined;
        if (!modulePerms?.view) return <AccessDenied />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
