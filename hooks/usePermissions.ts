import { useAuth } from "@/providers/AuthProvider";
import { ROLE_PERMISSIONS, type UserRole, type RolePermissions } from "@/types/auth";

export function usePermissions() {
  const { user } = useAuth();
  const userRole = (user?.user_metadata?.role || 'athlete') as UserRole;
  const permissions = ROLE_PERMISSIONS[userRole];

  const hasPermission = (permission: keyof RolePermissions): boolean => {
    return !!permissions[permission];
  };

  return {
    role: userRole,
    permissions,
    hasPermission,
    isAdmin: userRole === 'admin',
    isCoach: userRole === 'coach',
    isAthlete: userRole === 'athlete',
  };
} 