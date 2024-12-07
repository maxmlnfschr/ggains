"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { Exercise } from "@/types/exercise";
import { Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function ExerciseDetailPage({ params }: { params: Promise<{ exerciseId: string }> }) {
  const resolvedParams = use(params);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const { data, error } = await supabase
          .from('exercises')
          .select(`
            *,
            category:categories(*),
            muscles:exercise_muscles(muscle:muscles(*)),
            equipment:exercise_equipment(equipment:equipment(*))
          `)
          .eq('id', resolvedParams.exerciseId)
          .single() as { data: Exercise; error: any };

        if (error) throw error;
        setExercise(data);
      } catch (error) {
        toast.error("Error al cargar el ejercicio");
        router.push("/admin/exercises");
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [resolvedParams.exerciseId, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!exercise) return null;

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b flex justify-between items-center">
              <h1 className="text-2xl font-bold">{exercise.name}</h1>
              <div className="flex gap-2">
                <Link
                  href={`/admin/exercises/${exercise.id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                  <Edit2 size={20} /> Editar
                </Link>
                <button
                  onClick={async () => {
                    if (!confirm("¿Estás seguro de eliminar este ejercicio?")) return;

                    try {
                      const { data: { session } } = await supabase.auth.getSession();
                      const response = await fetch(`/api/admin/exercises/${exercise.id}`, {
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
                      router.push("/admin/exercises");
                    } catch (error: any) {
                      console.error('Error:', error);
                      toast.error(error.message || "Error al eliminar el ejercicio");
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <Trash2 size={20} /> Eliminar
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Información básica */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Información Básica</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Categoría</p>
                    <p>{exercise.category?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nombres alternativos</p>
                    <p>{exercise.alternative_names?.join(", ") || "Ninguno"}</p>
                  </div>
                </div>
              </div>

              {/* Descripción y detalles */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Descripción y Detalles</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Descripción</p>
                    <p className="whitespace-pre-wrap">{exercise.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pasos detallados</p>
                    <p className="whitespace-pre-wrap">{exercise.detailed_steps}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tips de ejecución</p>
                    <p className="whitespace-pre-wrap">{exercise.execution_tips}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Errores comunes</p>
                    <p className="whitespace-pre-wrap">{exercise.common_mistakes}</p>
                  </div>
                </div>
              </div>

              {/* Músculos y equipamiento */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Músculos y Equipamiento</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Músculos trabajados</p>
                    <p>{exercise.muscles?.map(m => m.muscle?.name).join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Equipo necesario</p>
                    <p>{exercise.equipment?.filter(e => !e.equipment?.is_alternative).map(e => e.equipment?.name).join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Equipo alternativo</p>
                    <p>{exercise.equipment?.filter(e => e.equipment?.is_alternative).map(e => e.equipment?.name).join(", ") || "Ninguno"}</p>
                  </div>
                </div>
              </div>

              {/* Parámetros de entrenamiento */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Parámetros de Entrenamiento</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Series</p>
                    <p>{exercise.series_min} - {exercise.series_max}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Repeticiones</p>
                    <p>{exercise.reps_min} - {exercise.reps_max}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Descanso</p>
                    <p>{exercise.rest_seconds}s</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">RIR</p>
                    <p>{exercise.rir_min} - {exercise.rir_max}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">RPE</p>
                    <p>{exercise.rpe_min} - {exercise.rpe_max}</p>
                  </div>
                </div>
              </div>

              {/* Multimedia */}
              {(exercise.images?.length > 0 || exercise.video_links?.length > 0) && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Multimedia</h2>
                  {exercise.images?.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {exercise.images.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`${exercise.name} ${index + 1}`}
                          className="w-full h-48 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  )}
                  {exercise.video_links?.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Enlaces de video</p>
                      <ul className="list-disc list-inside">
                        {exercise.video_links.map((url, index) => (
                          <li key={index}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
} 