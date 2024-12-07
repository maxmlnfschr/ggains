"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { Equipment, Category, Exercise, ExerciseBasic } from "@/types/exercise";
import { Plus, X } from "lucide-react";

interface EditExerciseFormProps {
  exercise: Exercise;
}

export default function EditExerciseForm({ exercise }: EditExerciseFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [formData, setFormData] = useState({
    ...exercise,
    alternative_names: exercise.alternative_names || [],
    video_links: exercise.video_links || [],
    images: exercise.images || [],
    equipment_ids: exercise.equipment_ids || [],
    alternative_equipment_ids: exercise.alternative_equipment_ids || [],
    muscle_ids: exercise.muscle_ids || [],
    variant_ids: exercise.variant_ids || [],
  });

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [muscles, setMuscles] = useState<Equipment[]>([]);
  const [exercises, setExercises] = useState<ExerciseBasic[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const { data: equipmentData, error: equipmentError } = await supabase
          .from("equipment")
          .select("*");
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*");
        const { data: musclesData, error: musclesError } = await supabase
          .from("muscles")
          .select("*");
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('exercises')
          .select('id, name');

        if (equipmentError) throw equipmentError;
        if (categoriesError) throw categoriesError;
        if (musclesError) throw musclesError;
        if (exercisesError) throw exercisesError;

        setEquipment(
          equipmentData?.map((item) => ({
            id: item.id as string,
            name: item.name as string,
          })) || []
        );

        setCategories(
          categoriesData?.map((item) => ({
            id: item.id as string,
            name: item.name as string,
          })) || []
        );

        setMuscles(
          musclesData?.map((item) => ({
            id: item.id as string,
            name: item.name as string,
          })) || []
        );

        setExercises(
          exercisesData?.map((item) => ({
            id: item.id as string,
            name: item.name as string,
          })) || []
        );
      } catch (error) {
        console.error("Error fetching options:", error);
        toast.error("Error al cargar opciones");
      }
    };

    fetchOptions();
  }, []);

  const handleArrayAdd = (field: keyof Pick<Exercise, "alternative_names" | "video_links">) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), ""]
    }));
  };

  const handleArrayRemove = (field: keyof Pick<Exercise, "alternative_names" | "video_links">, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleArrayChange = (field: keyof Pick<Exercise, "alternative_names" | "video_links">, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item: string, i: number) => i === index ? value : item)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No hay sesión");

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `exercises/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("exercises")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("exercises")
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, publicUrl]
      }));

      toast.success("Imagen subida exitosamente");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Error al subir la imagen");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`/api/admin/exercises/${exercise.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al actualizar ejercicio");
      }

      toast.success("Ejercicio actualizado exitosamente");
      router.push("/admin/exercises");
      router.refresh();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Error al actualizar ejercicio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-500">
          Nombre del ejercicio
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="mt-1 w-full p-2 border rounded-md"
          disabled={loading}
          required
        />
      </div>

      {/* Nombres alternativos */}
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-2">
          Nombres alternativos
        </label>
        {formData.alternative_names.map((name, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={name}
              onChange={(e) => handleArrayChange("alternative_names", index, e.target.value)}
              className="flex-1 p-2 border rounded-md"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => handleArrayRemove("alternative_names", index)}
              className="p-2 text-red-500 hover:text-red-700"
              disabled={loading}
            >
              <X size={20} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleArrayAdd("alternative_names")}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
          disabled={loading}
        >
          <Plus size={16} /> Añadir nombre alternativo
        </button>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-500">
          Descripción
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="mt-1 w-full p-2 border rounded-md"
          rows={4}
          disabled={loading}
        />
      </div>

      {/* Categoría */}
      <div>
        <label className="block text-sm font-medium text-gray-500">
          Categoría
        </label>
        <select
          value={formData.category_id}
          onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
          className="mt-1 w-full p-2 border rounded-md"
          disabled={loading}
          required
        >
          <option value="">Selecciona una categoría</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Músculos involucrados */}
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-2">
          Músculos involucrados
        </label>
        <div className="space-y-2">
          {formData.muscle_ids.map((muscleId, index) => (
            <div key={index} className="flex gap-2">
              <select
                value={muscleId}
                onChange={(e) => {
                  const newMuscles = [...formData.muscle_ids];
                  newMuscles[index] = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    muscle_ids: newMuscles,
                  }));
                }}
                className="flex-1 p-2 border rounded-md"
                disabled={loading}
              >
                <option value="">Selecciona un músculo</option>
                {muscles.map((muscle) => (
                  <option key={muscle.id} value={muscle.id}>
                    {muscle.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const newMuscles = formData.muscle_ids.filter(
                    (_, i) => i !== index
                  );
                  setFormData((prev) => ({
                    ...prev,
                    muscle_ids: newMuscles,
                  }));
                }}
                className="p-2 text-red-500 hover:text-red-700"
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                muscle_ids: [...prev.muscle_ids, ""],
              }));
            }}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            <Plus size={16} /> Añadir músculo
          </button>
        </div>
      </div>

      {/* Pasos detallados */}
      <div>
        <label className="block text-sm font-medium text-gray-500">
          Pasos detallados
        </label>
        <textarea
          value={formData.detailed_steps}
          onChange={(e) => setFormData(prev => ({ ...prev, detailed_steps: e.target.value }))}
          className="mt-1 w-full p-2 border rounded-md"
          rows={6}
          disabled={loading}
          placeholder="Describe los pasos detallados del ejercicio..."
        />
      </div>

      {/* Tips de ejecución */}
      <div>
        <label className="block text-sm font-medium text-gray-500">
          Tips de ejecución
        </label>
        <textarea
          value={formData.execution_tips}
          onChange={(e) => setFormData(prev => ({ ...prev, execution_tips: e.target.value }))}
          className="mt-1 w-full p-2 border rounded-md"
          rows={4}
          disabled={loading}
          placeholder="Escribe los tips para una correcta ejecución..."
        />
      </div>

      {/* Errores comunes */}
      <div>
        <label className="block text-sm font-medium text-gray-500">
          Errores comunes
        </label>
        <textarea
          value={formData.common_mistakes}
          onChange={(e) => setFormData(prev => ({ ...prev, common_mistakes: e.target.value }))}
          className="mt-1 w-full p-2 border rounded-md"
          rows={4}
          disabled={loading}
          placeholder="Describe los errores comunes a evitar..."
        />
      </div>

      {/* Equipo necesario */}
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-2">
          Equipo necesario
        </label>
        <div className="space-y-2">
          {formData.equipment_ids.map((equipmentId, index) => (
            <div key={index} className="flex gap-2">
              <select
                value={equipmentId}
                onChange={(e) => {
                  const newEquipment = [...formData.equipment_ids];
                  newEquipment[index] = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    equipment_ids: newEquipment,
                  }));
                }}
                className="flex-1 p-2 border rounded-md"
                disabled={loading}
              >
                <option value="">Selecciona un equipo</option>
                {equipment.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const newEquipment = formData.equipment_ids.filter(
                    (_, i) => i !== index
                  );
                  setFormData((prev) => ({
                    ...prev,
                    equipment_ids: newEquipment,
                  }));
                }}
                className="p-2 text-red-500 hover:text-red-700"
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                equipment_ids: [...prev.equipment_ids, ""],
              }));
            }}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            <Plus size={16} /> Añadir equipo
          </button>
        </div>
      </div>

      {/* Equipo alternativo */}
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-2">
          Equipo alternativo
        </label>
        <div className="space-y-2">
          {formData.alternative_equipment_ids.map((equipmentId, index) => (
            <div key={index} className="flex gap-2">
              <select
                value={equipmentId}
                onChange={(e) => {
                  const newEquipment = [...formData.alternative_equipment_ids];
                  newEquipment[index] = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    alternative_equipment_ids: newEquipment,
                  }));
                }}
                className="flex-1 p-2 border rounded-md"
                disabled={loading}
              >
                <option value="">Selecciona un equipo alternativo</option>
                {equipment.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const newEquipment = formData.alternative_equipment_ids.filter(
                    (_, i) => i !== index
                  );
                  setFormData((prev) => ({
                    ...prev,
                    alternative_equipment_ids: newEquipment,
                  }));
                }}
                className="p-2 text-red-500 hover:text-red-700"
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                alternative_equipment_ids: [...prev.alternative_equipment_ids, ""],
              }));
            }}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            <Plus size={16} /> Añadir equipo alternativo
          </button>
        </div>
      </div>

      {/* Variantes del ejercicio */}
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-2">
          Variantes del ejercicio
        </label>
        <div className="space-y-2">
          {formData.variant_ids.map((variantId, index) => (
            <div key={index} className="flex gap-2">
              <select
                value={variantId}
                onChange={(e) => {
                  const newVariants = [...formData.variant_ids];
                  newVariants[index] = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    variant_ids: newVariants,
                  }));
                }}
                className="flex-1 p-2 border rounded-md"
                disabled={loading}
              >
                <option value="">Selecciona un ejercicio</option>
                {exercises
                  .filter(ex => ex.id !== exercise.id)
                  .map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const newVariants = formData.variant_ids.filter(
                    (_, i) => i !== index
                  );
                  setFormData((prev) => ({
                    ...prev,
                    variant_ids: newVariants,
                  }));
                }}
                className="p-2 text-red-500 hover:text-red-700"
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                variant_ids: [...prev.variant_ids, ""],
              }));
            }}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            <Plus size={16} /> Añadir variante
          </button>
        </div>
      </div>

      {/* Series y repeticiones */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-500">
            Series (min-max)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={formData.series_min}
              onChange={(e) => setFormData(prev => ({ ...prev, series_min: parseInt(e.target.value) }))}
              className="mt-1 w-full p-2 border rounded-md"
              min="1"
              max={formData.series_max}
              disabled={loading}
            />
            <input
              type="number"
              value={formData.series_max}
              onChange={(e) => setFormData(prev => ({ ...prev, series_max: parseInt(e.target.value) }))}
              className="mt-1 w-full p-2 border rounded-md"
              min={formData.series_min}
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500">
            Repeticiones (min-max)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={formData.reps_min}
              onChange={(e) => setFormData(prev => ({ ...prev, reps_min: parseInt(e.target.value) }))}
              className="mt-1 w-full p-2 border rounded-md"
              min="1"
              max={formData.reps_max}
              disabled={loading}
            />
            <input
              type="number"
              value={formData.reps_max}
              onChange={(e) => setFormData(prev => ({ ...prev, reps_max: parseInt(e.target.value) }))}
              className="mt-1 w-full p-2 border rounded-md"
              min={formData.reps_min}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Descanso */}
      <div>
        <label className="block text-sm font-medium text-gray-500">
          Descanso (segundos)
        </label>
        <input
          type="number"
          value={formData.rest_seconds}
          onChange={(e) => setFormData(prev => ({ ...prev, rest_seconds: parseInt(e.target.value) }))}
          className="mt-1 w-full p-2 border rounded-md"
          min="0"
          step="5"
          disabled={loading}
        />
      </div>

      {/* RIR y RPE */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-500">
            RIR (min-max)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={formData.rir_min}
              onChange={(e) => setFormData(prev => ({ ...prev, rir_min: parseInt(e.target.value) }))}
              className="mt-1 w-full p-2 border rounded-md"
              min="0"
              max={formData.rir_max}
              disabled={loading}
            />
            <input
              type="number"
              value={formData.rir_max}
              onChange={(e) => setFormData(prev => ({ ...prev, rir_max: parseInt(e.target.value) }))}
              className="mt-1 w-full p-2 border rounded-md"
              min={formData.rir_min}
              max="5"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500">
            RPE (min-max)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={formData.rpe_min}
              onChange={(e) => setFormData(prev => ({ ...prev, rpe_min: parseInt(e.target.value) }))}
              className="mt-1 w-full p-2 border rounded-md"
              min="5"
              max={formData.rpe_max}
              disabled={loading}
            />
            <input
              type="number"
              value={formData.rpe_max}
              onChange={(e) => setFormData(prev => ({ ...prev, rpe_max: parseInt(e.target.value) }))}
              className="mt-1 w-full p-2 border rounded-md"
              min={formData.rpe_min}
              max="10"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Imágenes */}
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-2">
          Imágenes
        </label>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="flex-1"
              disabled={loading}
            />
          </div>
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {formData.images.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Ejercicio ${index + 1}`}
                    className="w-full h-40 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index),
                      }));
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={loading}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Enlaces de video */}
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-2">
          Enlaces de video
        </label>
        {formData.video_links.map((link, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="url"
              value={link}
              onChange={(e) => handleArrayChange("video_links", index, e.target.value)}
              className="flex-1 p-2 border rounded-md"
              placeholder="https://..."
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => handleArrayRemove("video_links", index)}
              className="p-2 text-red-500 hover:text-red-700"
              disabled={loading}
            >
              <X size={20} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleArrayAdd("video_links")}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
          disabled={loading}
        >
          <Plus size={16} /> Añadir video
        </button>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-4 pt-6">
        <button
          type="button"
          onClick={() => router.push("/admin/exercises")}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Actualizando..." : "Actualizar Ejercicio"}
        </button>
      </div>
    </form>
  );
} 