"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getSupabaseClient } from "@/lib/supabase";

export default function EditUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `/api/admin/users/${resolvedParams.userId}`
        );
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        setFormData({
          fullName: data.user.user_metadata.full_name || "",
          email: data.user.email || "",
          role: data.user.user_metadata.role || "",
          password: "",
          confirmPassword: "",
        });
      } catch (error) {
        toast.error("Error al cargar usuario");
        router.push("/admin");
      }
    };

    fetchUser();
  }, [resolvedParams.userId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.password) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Las contraseñas no coinciden");
        }
        if (formData.password.length < 6) {
          throw new Error("La contraseña debe tener al menos 6 caracteres");
        }
      }

      const response = await fetch(
        `/api/admin/users/${resolvedParams.userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            role: formData.role,
            password: formData.password || undefined,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al actualizar usuario");
      }

      toast.success("Usuario actualizado exitosamente");
      router.push("/admin");
      router.refresh(); // Forzar actualización de datos
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Error al actualizar usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold">Editar</h1>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    className="mt-1 w-full p-2 border rounded-md"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Correo
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="mt-1 w-full p-2 border rounded-md"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Rol
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, role: e.target.value }))
                    }
                    className="mt-1 w-full p-2 border rounded-md"
                    disabled={loading}
                  >
                    <option value="athlete">Atleta</option>
                    <option value="coach">Entrenador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="mt-1 w-full p-2 border rounded-md"
                    placeholder="Dejar en blanco para mantener la actual"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Confirmar contraseña
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="mt-1 w-full p-2 border rounded-md"
                    placeholder="Confirmar nueva contraseña"
                    disabled={loading}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => router.push("/admin")}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
