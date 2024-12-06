"use client";

import LogoutButton from "@/components/auth/LogoutButton";
import { useAuth } from "@/providers/AuthProvider";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold">Mi Perfil</h1>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre completo</label>
                <p className="mt-1 text-lg">{user?.user_metadata.full_name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-lg">{user?.email}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Rol</label>
                <p className="mt-1 text-lg capitalize">
                  {user?.user_metadata.role === 'athlete' ? 'Atleta' : 
                   user?.user_metadata.role === 'coach' ? 'Entrenador' : 
                   user?.user_metadata.role === 'admin' ? 'Administrador' : ''}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 