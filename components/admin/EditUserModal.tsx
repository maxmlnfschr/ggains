"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

const editUserSchema = z.object({
  email: z.string().email("Email inválido"),
  fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  role: z.enum(["athlete", "coach"]),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
});

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
}

export default function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof editUserSchema>>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      email: user?.email,
      fullName: user?.user_metadata?.full_name,
      role: user?.user_metadata?.role,
    },
  });

  const onSubmit = async (data: z.infer<typeof editUserSchema>) => {
    if (!user) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar usuario');
      }

      toast.success("Usuario actualizado exitosamente");
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Error al actualizar usuario");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Editar Usuario</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* ... campos similares a CreateUserModal ... */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
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
  );
} 