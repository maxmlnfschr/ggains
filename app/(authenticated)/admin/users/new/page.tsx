"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  role: z.enum(["athlete", "coach"]),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export default function NewUserPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
  });

  const onSubmit = async (data: z.infer<typeof createUserSchema>) => {
    try {
      setLoading(true);

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear usuario');
      }

      toast.success("Usuario creado exitosamente");
      router.push('/admin');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Error al crear usuario");
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
              <h1 className="text-2xl font-bold">Crear Nuevo Usuario</h1>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre completo</label>
                <input
                  {...register("fullName")}
                  className="w-full p-2 border rounded-md"
                  disabled={loading}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full p-2 border rounded-md"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rol</label>
                <select
                  {...register("role")}
                  className="w-full p-2 border rounded-md"
                  disabled={loading}
                >
                  <option value="athlete">Atleta</option>
                  <option value="coach">Entrenador</option>
                </select>
                {errors.role && (
                  <p className="text-red-500 text-sm">{errors.role.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Contraseña</label>
                <input
                  {...register("password")}
                  type="password"
                  className="w-full p-2 border rounded-md"
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => router.push('/admin')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading ? "Creando..." : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
} 