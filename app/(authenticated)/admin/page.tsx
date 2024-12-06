"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/providers/AuthProvider";

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Información del Administrador</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Email:</span> {user?.email}</p>
              <p><span className="font-medium">Nombre:</span> {user?.user_metadata.full_name}</p>
              <p><span className="font-medium">Rol:</span> {user?.user_metadata.role}</p>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
} 