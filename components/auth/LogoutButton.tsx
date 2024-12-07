"use client";

import { useAuth } from "@/providers/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LogoutButton() {
  const { refreshSession } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      console.log('🚪 Iniciando proceso de logout...');
      const supabase = getSupabaseClient();
      
      // Primero verificamos la sesión actual
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔍 Sesión actual:', session);

      if (!session) {
        console.log('⚠️ No hay sesión, redirigiendo...');
        router.push('/login');
        return;
      }

      // Intentamos cerrar sesión
      console.log('🔑 Intentando cerrar sesión...');
      const { error } = await supabase.auth.signOut({
        scope: 'local' // Especificamos que es solo local
      });
      
      console.log('📤 Resultado:', error ? `Error: ${error.message}` : 'Éxito');

      if (error) throw error;

      toast.success("Sesión cerrada exitosamente");
      router.push('/login');
    } catch (error: any) {
      console.error('❌ Error detallado:', error);
      toast.error(error.message || "Error al cerrar sesión");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-red-600 hover:text-red-800"
    >
      Cerrar sesión
    </button>
  );
}
