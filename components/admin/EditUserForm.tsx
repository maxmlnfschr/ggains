"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

const editUserSchema = z.object({
  email: z.string().email("Email inválido"),
  fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  role: z.enum(["athlete", "coach"]),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
});

export default function EditUserForm({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof editUserSchema>>({
    defaultValues: {}
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/admin/users/${userId}`);
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error);
        
        setUser(data.user);
        reset({
          email: data.user.email,
          fullName: data.user.user_metadata.full_name,
          role: data.user.user_metadata.role,
        });
      } catch (error) {
        console.error("Error al cargar usuario:", error);
        toast.error("Error al cargar usuario");
        router.push("/admin");
      }
    };

    fetchUser();
  }, [userId, reset, router]);

  const onSubmit = async (data: z.infer<typeof editUserSchema>) => {
    try {
      setLoading(true);

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al actualizar usuario");
      }

      toast.success("Usuario actualizado exitosamente");
      router.push("/admin");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Error al actualizar usuario");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold">Editar Usuario</h1>
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
              <label className="block text-sm font-medium mb-1">
                Nueva Contraseña (opcional)
              </label>
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
                onClick={() => router.push("/admin")}
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
                {loading ? "Actualizando..." : "Actualizar Usuario"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 