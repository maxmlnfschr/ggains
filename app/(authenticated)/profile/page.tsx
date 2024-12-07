"use client";

import LogoutButton from "@/components/auth/LogoutButton";
import { useAuth } from "@/providers/AuthProvider";
import { useState, useEffect } from "react";
import { Edit2 } from "lucide-react";
import { toast } from "sonner";
import { getSupabaseClient } from "@/lib/supabase";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { profile, loading, error, refetch } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.user_metadata.full_name || "",
    email: profile?.email || "",
    password: "",
    confirmPassword: "",
  });
  const { user, session, refreshSession } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const supabase = getSupabaseClient();
        let profileData;

        if (profile?.id) {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", profile.id)
            .single();

          profileData = data;
          if (error) throw error;
        }

        if (profile && profileData) {
          setFormData({
            fullName: profileData.full_name || "",
            email: profile.email || "",
            password: "",
            confirmPassword: "",
          });
        }
      } catch (error) {
        console.error("Error al cargar perfil:", error);
        toast.error("Error al cargar datos del perfil");
      }
    };

    if (profile?.id) {
      fetchUserProfile();
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log('📝 Iniciando actualización...');

    try {
      const supabase = getSupabaseClient();
      
      // Verificar sesión actual
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔍 Sesión actual:', session);

      if (!session) {
        console.log('⚠️ Sin sesión, redirigiendo...');
        router.push('/login');
        return;
      }

      // Validar contraseñas si se están actualizando
      if (formData.password) {
        console.log('🔒 Validando contraseñas...');
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Las contraseñas no coinciden");
        }
        if (formData.password.length < 6) {
          throw new Error("La contraseña debe tener al menos 6 caracteres");
        }
      }

      // Actualizar usuario
      console.log('✨ Actualizando datos...');
      const updateData: {
        email: string;
        data: { full_name: string; role: string };
        password?: string;
      } = {
        email: formData.email,
        data: {
          full_name: formData.fullName,
          role: profile?.user_metadata.role,
        }
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      console.log('📝 Datos a actualizar:', updateData);

      // 1. Primero actualizar auth
      const { error: authError } = await supabase.auth.updateUser(updateData);
      console.log('📊 Resultado auth:', authError ? `Error: ${authError.message}` : 'Éxito');

      if (authError) throw authError;

      // 2. Luego actualizar profiles con los mismos datos
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: profile?.id,
          full_name: formData.fullName,
          role: profile?.user_metadata.role,
          updated_at: new Date().toISOString(),
        });

      console.log('📊 Resultado profiles:', profileError ? `Error: ${profileError.message}` : 'Éxito');

      await refetch();
      await refreshSession();

      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));

      toast.success("Perfil actualizado exitosamente");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Error al actualizar perfil");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b flex justify-between items-center">
            <h1 className="text-2xl font-bold">Mi Perfil</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
            )}
          </div>

          <div className="p-6 space-y-6">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    className="mt-1 w-full p-2 border rounded-md"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="mt-1 w-full p-2 border rounded-md"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Rol
                  </label>
                  <p className="mt-1 text-lg capitalize">
                    {profile?.user_metadata.role === "athlete"
                      ? "Atleta"
                      : profile?.user_metadata.role === "coach"
                      ? "Entrenador"
                      : profile?.user_metadata.role === "admin"
                      ? "Administrador"
                      : ""}
                  </p>
                </div>

                {isEditing && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Nueva contraseña
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        className="mt-1 w-full p-2 border rounded-md"
                        placeholder="Dejar en blanco para mantener la actual"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Confirmar contraseña
                      </label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        className="mt-1 w-full p-2 border rounded-md"
                        placeholder="Confirmar nueva contraseña"
                        disabled={isSubmitting}
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nombre completo
                  </label>
                  <p className="mt-1 text-lg">
                    {profile?.user_metadata.full_name}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="mt-1 text-lg">{profile?.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Rol
                  </label>
                  <p className="mt-1 text-lg capitalize">
                    {profile?.user_metadata.role === "athlete"
                      ? "Atleta"
                      : profile?.user_metadata.role === "coach"
                      ? "Entrenador"
                      : profile?.user_metadata.role === "admin"
                      ? "Administrador"
                      : ""}
                  </p>
                </div>
              </div>
            )}

            <div className="pt-6 border-t">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
