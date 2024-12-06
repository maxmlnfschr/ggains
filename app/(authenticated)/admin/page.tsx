"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { useUsers } from "@/hooks/useUsers";
import { useState } from "react";
import CreateUserModal from "@/components/admin/CreateUserModal";

export default function AdminPage() {
  const { users, loading, error, refetch } = useUsers();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
            <div className="flex gap-4">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Crear Usuario
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
                placeholder="Buscar por nombre o email..."
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
            <div className="text-center py-8">Cargando usuarios...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error al cargar usuarios: {error.message}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.user_metadata?.full_name || "-"}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <CreateUserModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={refetch}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
