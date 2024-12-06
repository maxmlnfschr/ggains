"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getSupabaseClient } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const registerSchema = z.object({
  fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["athlete", "coach"]).default("athlete"),
});

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    try {
      setLoading(true);

      // 1. Registramos al usuario
      const { data: authData, error: signUpError } = await getSupabaseClient().auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: data.role,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        console.error("Error en el registro:", signUpError);
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario');
      }

      // 2. Mostramos mensaje de éxito y redirigimos
      toast.success(
        "¡Registro exitoso! Por favor, verifica tu email para activar tu cuenta.",
        { duration: 5000 }
      );

      // 3. Redirigimos al login después de un pequeño delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (error: any) {
      console.error("Error completo:", error);
      
      let errorMessage = "Error al registrar usuario";
      
      if (error.message?.includes('already registered')) {
        errorMessage = "Este email ya está registrado.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nombre completo</label>
        <input
          {...register("fullName")}
          type="text"
          className="w-full p-2 border rounded-md"
          placeholder="Tu nombre completo"
          disabled={loading}
        />
        {errors.fullName && (
          <p className="text-red-500 text-sm">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <input
          {...register("email")}
          type="email"
          className="w-full p-2 border rounded-md"
          placeholder="tu@email.com"
          disabled={loading}
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Contraseña</label>
        <input
          {...register("password")}
          type="password"
          className="w-full p-2 border rounded-md"
          placeholder="******"
          disabled={loading}
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Rol</label>
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

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white p-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Registrando..." : "Registrarse"}
      </button>
    </form>
  );
}
