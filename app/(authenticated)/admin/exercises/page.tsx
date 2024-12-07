"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { Exercise, Category, Equipment } from "@/types/exercise";
import { Plus, RefreshCw, Trash2, Edit2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [muscles, setMuscles] = useState<Equipment[]>([]);
  const [filters, setFilters] = useState({
    category: "",
    muscle: "",
    search: ""
  });
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  
  const router = useRouter();
  const supabase = getSupabaseClient();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Obtener ejercicios
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('exercises')
        .select(`
          *,
          category:categories(*),
          muscles:exercise_muscles(muscle:muscles(*)),
          equipment:exercise_equipment(equipment:equipment(*))
        `) as { data: Exercise[]; error: any };

      if (exercisesError) throw exercisesError;

      // Obtener categorías
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*') as { data: Category[] };

      // Obtener músculos
      const { data: musclesData } = await supabase
        .from('muscles')
        .select('*') as { data: Equipment[] };

      setExercises(exercisesData || []);
      setCategories(categoriesData || []);
      setMuscles(musclesData || []);
    } catch (error) {
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este ejercicio?")) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Usar la API para asegurar la eliminación correcta
      const response = await fetch(`/api/admin/exercises/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al eliminar ejercicio");
      }

      toast.success("Ejercicio eliminado exitosamente");
      fetchData(); // Recargar datos
      setIsDeleteMode(false); // Salir del modo eliminación
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Error al eliminar el ejercicio");
    }
  };

  const filteredExercises = exercises.filter(exercise => {
    const searchTerm = filters.search.toLowerCase();
    const matchesSearch = 
      exercise.name.toLowerCase().includes(searchTerm) || 
      exercise.alternative_names?.some(name => 
        name.toLowerCase().includes(searchTerm)
      );
    const matchesCategory = !filters.category || exercise.category_id === filters.category;
    const matchesMuscle = !filters.muscle || exercise.muscles?.some(m => m.muscle?.id === filters.muscle);
    
    return matchesSearch && matchesCategory && matchesMuscle;
  });

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Ejercicios</h1>
          </div>

          {/* Controles */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => router.push("/admin/exercises/new")}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
            >
              Crear
            </button>
            <button
              onClick={() => setIsDeleteMode(!isDeleteMode)}
              className={`px-4 py-2 ${
                isDeleteMode 
                  ? "bg-red-100 hover:bg-red-200" 
                  : "bg-gray-100 hover:bg-gray-200"
              } rounded`}
            >
              {isDeleteMode ? "Cancelar" : "Eliminar"}
            </button>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
            >
              Actualizar
            </button>
          </div>

          {/* Búsqueda y filtros */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="px-4 py-2 border rounded"
            />
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-4 py-2 border rounded"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={filters.muscle}
              onChange={(e) => setFilters(prev => ({ ...prev, muscle: e.target.value }))}
              className="px-4 py-2 border rounded"
            >
              <option value="">Todos los músculos</option>
              {muscles.map(muscle => (
                <option key={muscle.id} value={muscle.id}>
                  {muscle.name}
                </option>
              ))}
            </select>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Mostrando {filteredExercises.length} de {exercises.length} ejercicios
          </p>

          {/* Tabla */}
          {loading ? (
            <div className="text-center py-4">Cargando ejercicios...</div>
          ) : filteredExercises.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              {filters.search ? (
                "No se encontraron ejercicios que coincidan con la búsqueda"
              ) : (filters.category !== "" || filters.muscle !== "") ? (
                "No se encontraron ejercicios con los filtros seleccionados"
              ) : (
                "No hay ejercicios disponibles"
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombres alternativos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Músculos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipo necesario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipo alternativo</th>
                    {isDeleteMode && <th></th>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExercises.map((exercise) => (
                    <tr key={exercise.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          href={`/admin/exercises/${exercise.id}`} 
                          className="text-blue-600 hover:text-blue-900 hover:underline"
                        >
                          {exercise.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {exercise.alternative_names?.join(", ") || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {exercise.muscles?.map(m => m.muscle?.name).join(", ")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {exercise.category?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {exercise.equipment?.filter(e => !e.equipment?.is_alternative).map(e => e.equipment?.name).join(", ")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {exercise.equipment?.filter(e => e.equipment?.is_alternative).map(e => e.equipment?.name).join(", ") || "-"}
                      </td>
                      {isDeleteMode && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(exercise.id);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
} 