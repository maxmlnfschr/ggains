"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseClient } from '@/lib/supabase';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseClient();

  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      toast.success("Sesión cerrada correctamente");
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
