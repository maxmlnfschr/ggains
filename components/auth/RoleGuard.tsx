"use client";

import { usePermissions } from "@/hooks/usePermissions";
import { type UserRole } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackPath = '/dashboard' 
}: RoleGuardProps) {
  const { role } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!allowedRoles.includes(role)) {
      toast.error("No tienes permiso para acceder a esta página");
      router.push(fallbackPath);
    }
  }, [role, allowedRoles, router, fallbackPath]);

  if (!allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
} 