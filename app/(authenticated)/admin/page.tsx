"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { useUsers } from "@/hooks/useUsers";
import { useState } from "react";
import EditUserModal from "@/components/admin/EditUserModal";
import { Trash2, Edit2, User2 } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminPage() {
  const { users, loading, error, refetch } = useUsers();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteButtons, setShowDeleteButtons] = useState(false);
  const router = useRouter();

  // Filtrar usuarios por rol y término de búsqueda
  const filteredUsers = users.filter((user) => {
    const matchesRole = selectedRole
      ? user.user_metadata?.role === selectedRole
      : true;
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      user.user_metadata?.full_name?.toLowerCase().includes(searchTermLower) ||
      user.email?.toLowerCase().includes(searchTermLower);

    return matchesRole && matchesSearch;
  });

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) return;

    toast.promise(
      fetch(`/api/admin/users/${userId}`, { method: "DELETE" }).then(
        async (response) => {
          if (!response.ok) throw new Error("Error al eliminar usuario");
          refetch();
        }
      ),
      {
        loading: "Eliminando usuario...",
        success: "Usuario eliminado exitosamente",
        error: "Error al eliminar usuario",
        style: { background: "white", color: "black" },
      }
    );
  };

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Panel de control</h1>
            <div className="flex gap-4">
              <button
                onClick={() => router.push("/admin/users/new")}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Crear
              </button>
              <button
                onClick={() => setShowDeleteButtons(!showDeleteButtons)}
                className={`px-4 py-2 rounded-md ${
                  showDeleteButtons
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-black hover:bg-gray-800"
                } text-white`}
              >
                {showDeleteButtons ? "Cancelar" : "Eliminar"}
              </button>
              <select
                className="px-4 py-2 border rounded-md"
                onChange={(e) => setSelectedRole(e.target.value || null)}
                value={selectedRole || ""}
              >
                <option value="">Todos los roles</option>
                <option value="athlete">Atletas</option>
                <option value="coach">Entrenadores</option>
                <option value="admin">Administradores</option>
              </select>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Actualizar
              </button>
            </div>
          </div>

          <div className="mb-6 flex justify-between items-center">
            <div className="relative w-96">
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                className="w-full px-4 py-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-gray-600">
              Mostrando {filteredUsers.length} de {users.length} usuarios
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">Cargando usuarios...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No se encontraron usuarios que coincidan con la búsqueda
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Correo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Último acceso
                    </th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="hover:text-blue-600 hover:underline cursor-pointer"
                        >
                          {user.user_metadata?.full_name || "-"}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">
                        {user.user_metadata?.role || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email_confirmed_at ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Verificado
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.last_sign_in_at
                          ? new Date(user.last_sign_in_at).toLocaleString()
                          : "Nunca"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {showDeleteButtons && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1 hover:bg-gray-100 rounded text-red-600"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <EditUserModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setUserToEdit(null);
            }}
            onSuccess={refetch}
            user={userToEdit}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
