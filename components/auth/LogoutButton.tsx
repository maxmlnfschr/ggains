"use client";

import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function LogoutButton() {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error al cerrar sesión");
    } else {
      toast.success("Sesión cerrada correctamente");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
    >
      Cerrar Sesión
    </button>
  );
}
