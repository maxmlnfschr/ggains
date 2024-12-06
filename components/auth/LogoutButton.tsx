"use client";

import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      // Limpiamos cualquier dato de sesión que pudiera quedar
      await supabase.auth.clearSession();
      
      toast.success("Sesión cerrada correctamente");
      
      // Redirigimos y refrescamos para asegurar que se actualiza el estado
      router.push('/login');
      router.refresh();
      
    } catch (error: any) {
      console.error("Error al cerrar sesión:", error);
      toast.error(error.message || "Error al cerrar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
    >
      {loading ? "Cerrando sesión..." : "Cerrar Sesión"}
    </button>
  );
}
