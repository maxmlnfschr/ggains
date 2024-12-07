"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Si el usuario está autenticado, redirigir según su rol
        const userRole = user.user_metadata?.role;
        if (userRole === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        // Si no está autenticado, redirigir al login
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  // Mostrar un estado de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  // Este return nunca se mostrará realmente debido a las redirecciones
  return null;
} 