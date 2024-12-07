"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { useState, useEffect, use } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const resolvedParams = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/admin/users/${resolvedParams.userId}`);
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error);
        
        setUser(data.user);
      } catch (error) {
        toast.error("Error al cargar usuario");
        router.push("/admin");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [resolvedParams.userId, router]);

  const handleDelete = async () => {
    if (!confirm("¿Estás COMPLETAMENTE seguro? Esta acción no se puede deshacer.")) return;

    try {
      const response = await fetch(`/api/admin/users/${resolvedParams.userId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar usuario");

      toast.success("Usuario eliminado exitosamente");
      router.push("/admin");
    } catch (error) {
      toast.error("Error al eliminar usuario");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!user) {
    return <div>Usuario no encontrado</div>;
  }

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b flex justify-between items-center">
              <h1 className="text-2xl font-bold">{user.user_metadata?.full_name || "Usuario sin nombre"}</h1>
              <div className="flex gap-4">
                <Link
                  href={`/admin/users/${user.id}/edit`}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Correo</h3>
                <p className="mt-1">{user.email}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Rol</h3>
                <p className="mt-1 capitalize">{user.user_metadata?.role || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                <p className="mt-1">
                  {user.email_confirmed_at ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Verificado
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pendiente
                    </span>
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Último acceso</h3>
                <p className="mt-1">
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleString()
                    : "Nunca"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
} 