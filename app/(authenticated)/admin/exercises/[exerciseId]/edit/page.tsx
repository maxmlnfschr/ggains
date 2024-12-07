"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { Exercise } from "@/types/exercise";
import { EditExerciseForm } from "@/components/admin/exercises";

export default function EditExercisePage({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const resolvedParams = await params;
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`/api/admin/exercises/${resolvedParams.exerciseId}`, {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Error al cargar el ejercicio");
        }

        const data = await response.json();
        setExercise(data);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Error al cargar el ejercicio");
        router.push("/admin/exercises");
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [params, router, supabase.auth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  if (!exercise) return null;

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold">Editar Ejercicio</h1>
            </div>
            <div className="p-6">
              <EditExerciseForm exercise={exercise} />
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
} 