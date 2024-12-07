"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export const RoleGuard = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || !allowedRoles.includes(user.user_metadata?.role)) {
      toast.error("No tienes permiso para acceder a esta página");
      router.push('/');
    }
  }, [user, router, allowedRoles]);

  if (!user || !allowedRoles.includes(user.user_metadata?.role)) {
    return null;
  }

  return <>{children}</>;
}; 