"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { useEffect, useState } from "react";
import { Exercise } from "@/types/exercise";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch('/api/admin/exercises', {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        });
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error);
        
        setExercises(data.exercises);
      } catch (error: any) {
        console.error('Error:', error);
        toast.error("Error al cargar ejercicios");
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b flex justify-between items-center">
              <h1 className="text-2xl font-bold">Ejercicios</h1>
              <Link
                href="/admin/exercises/new"
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Crear Ejercicio
              </Link>
            </div>
            
            <div className="p-6">
              {exercises.length === 0 ? (
                <p className="text-center text-gray-500">
                  No hay ejercicios creados aún
                </p>
              ) : (
                <div className="divide-y">
                  {exercises.map((exercise) => (
                    <div 
                      key={exercise.id} 
                      className="py-4 flex justify-between items-center"
                    >
                      <span className="text-lg">{exercise.name}</span>
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/exercises/${exercise.id}/edit`}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Editar
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
} 