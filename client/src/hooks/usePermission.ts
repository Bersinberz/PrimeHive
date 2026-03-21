import { useAuth } from "../context/AuthContext";
import type { Permissions } from "../services/authService";

/**
 * Returns true if the current user has the given permission.
 * Superadmin always returns true.
 * Staff must have the specific module+action set to true.
 */
export const usePermission = (
  module: keyof Permissions,
  action: string
): boolean => {
  const { user } = useAuth();
  if (!user) return false;
  if (user.role === "superadmin") return true;
  if (!user.permissions) return false;
  const modulePerms = user.permissions[module] as Record<string, boolean> | undefined;
  return modulePerms?.[action] === true;
};

/**
 * Returns the full permissions object, or null for superadmin (treat as all-access).
 */
export const usePermissions = () => {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === "superadmin") return null; // null = superadmin = all access
  return user.permissions ?? null;
};
