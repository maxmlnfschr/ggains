"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getSupabaseClient } from '@/lib/supabase';
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const supabase = getSupabaseClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      setLoading(true);
      console.log("Intentando iniciar sesión...");

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error("Error de autenticación:", error);
        if (error.message.includes('Email not confirmed')) {
          toast.error("Por favor, verifica tu email antes de iniciar sesión");
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error("Email o contraseña incorrectos");
        } else {
          throw error;
        }
        return;
      }

      console.log("Sesión iniciada exitosamente:", authData);
      toast.success("¡Inicio de sesión exitoso!");

      const userRole = authData.user?.user_metadata?.role;
      if (userRole === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
      
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error);
      toast.error(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md">
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

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white p-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
      </button>
    </form>
  );
}
