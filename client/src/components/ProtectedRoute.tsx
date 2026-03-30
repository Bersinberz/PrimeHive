import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PrimeLoader from "./PrimeLoader";
import AccessDenied from "./AccessDenied";
import type { Permissions } from "../services/authService";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
    permission?: keyof Permissions;
}

// Permissions that admin_staff always has (no toggle needed)
const ADMIN_STAFF_ALWAYS_ALLOWED: Array<keyof Permissions> = ["dashboard", "products", "categories"];

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles = ["superadmin", "staff", "admin_staff"],
    permission,
}) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) return <PrimeLoader isLoading={true} />;
    if (!isAuthenticated) return <Navigate to="/auth" replace />;

    // Delivery partners → redirect to delivery panel
    if (user?.role === "delivery_partner" && !allowedRoles.includes("delivery_partner")) {
        return <Navigate to="/delivery" replace />;
    }

    // Role not in allowed list → home
    if (user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    // ── staff (seller) permission check ──────────────────────
    if (permission && user?.role === "staff") {
        const modulePerms = user.permissions?.[permission] as Record<string, boolean> | undefined;
        if (!modulePerms?.view) return <AccessDenied />;
    }

    // ── admin_staff permission check ─────────────────────────
    if (permission && user?.role === "admin_staff") {
        // Always allowed pages
        if (ADMIN_STAFF_ALWAYS_ALLOWED.includes(permission)) return <>{children}</>;

        // Check adminStaffPermissions — if missing, allow (server enforces)
        const adminPerms = (user as any).adminStaffPermissions as Record<string, any> | null | undefined;
        if (!adminPerms) return <>{children}</>;

        const modulePerms = adminPerms[permission as string] as Record<string, boolean> | undefined;
        if (!modulePerms?.view) return <AccessDenied />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
