import { RoleGuard } from "@/components/auth/RoleGuard";
import { CreateExerciseForm } from "@/components/admin/exercises";

export default function NewExercisePage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold">Crear Nuevo Ejercicio</h1>
            </div>
            
            <div className="p-6">
              <CreateExerciseForm />
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
} 