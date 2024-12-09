'use client'

import { AddExerciseForm } from './add-exercise-form'
import { ExerciseList } from './exercise-list'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { useToast } from '@/components/ui/use-toast'

interface RoutinePageProps {
  params: {
    id: string
  }
}

export default function RoutinePage({ params }: RoutinePageProps) {
  const [routine, setRoutine] = useState<any>(null)
  const [exercises, setExercises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()
  const routineId = params.id

  useEffect(() => {
    if (routineId) {
      loadData()
    }
  }, [routineId])

  async function loadData() {
    try {
      const [{ data: routine, error: routineError }, { data: exercises, error: exercisesError }] = await Promise.all([
        supabase
          .from('routines')
          .select(`
            *,
            routine_exercises (
              *,
              exercise: exercises (*)
            )
          `)
          .eq('id', routineId)
          .single(),
        supabase
          .from('exercises')
          .select('*')
          .order('name', { ascending: true })
      ])

      if (routineError) throw routineError
      if (exercisesError) throw exercisesError

      setRoutine(routine)
      setExercises(exercises || [])
    } catch (err: any) {
      console.error('Error loading routine:', err)
      setError(err.message || 'Error loading routine')
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || 'Error loading routine'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="text-gray-600 mt-2">{error}</p>
      </div>
    )
  }

  if (!routine) {
    return (
      <div className="p-4 text-center">
        <h1 className="text-2xl font-bold text-red-600">Rutina no encontrada</h1>
        <p className="text-gray-600 mt-2">
          La rutina que buscas no existe o no tienes acceso a ella.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">{routine.name}</h1>
        <p className="text-sm text-muted-foreground">
          Creada el {new Date(routine.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold mb-4">Ejercicios en la rutina</h2>
          <ExerciseList routine={routine} onUpdate={loadData} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Agregar ejercicios</h2>
          <AddExerciseForm routineId={routine.id} exercises={exercises} onAdd={loadData} />
        </div>
      </div>
    </div>
  )
}
