export type UserRole = 'athlete' | 'coach' | 'admin';

export interface RolePermissions {
  canManageUsers?: boolean;
  canManageRoles?: boolean;
  canViewAthletes?: boolean;
  canEditAthletes?: boolean;
  canViewCoaches?: boolean;
  canEditCoaches?: boolean;
  // Agrega más permisos según necesites
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canManageUsers: true,
    canManageRoles: true,
    canViewAthletes: true,
    canEditAthletes: true,
    canViewCoaches: true,
    canEditCoaches: true,
  },
  coach: {
    canViewAthletes: true,
    canEditAthletes: true,
    canViewCoaches: false,
    canEditCoaches: false,
  },
  athlete: {
    canViewAthletes: false,
    canEditAthletes: false,
    canViewCoaches: true,
    canEditCoaches: false,
  },
}; 