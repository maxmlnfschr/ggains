'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { RoutineCard } from './routine-card'
import { RoutineWithExercises } from '@/types/routine'
import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { Database } from '@/types/supabase'

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<RoutineWithExercises[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: routinesData, error: routinesError } = await supabase
        .from('routines')
        .select(`
          *,
          routine_exercises (
            *,
            exercise:exercises(*)
          )
        `)
        .order('created_at', { ascending: false })

      if (routinesError) throw routinesError
      setRoutines(
        (routinesData || []).map(routine => ({
          ...routine,
          routine_exercises: (routine.routine_exercises || []).map(re => ({
            ...re,
            exercise: re.exercise?.[0] || {} 
          }))
        })) as RoutineWithExercises[]
      )
    } catch (error) {
      console.error('Error loading routines:', error)
      toast.error('Error al cargar las rutinas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="container py-6">
        <div className="text-center">
          Cargando rutinas...
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Mis Rutinas</h1>
        <Button asChild>
          <Link href="/routines/new">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Rutina
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {routines.map((routine) => (
          <RoutineCard key={routine.id} routine={routine} />
        ))}
      </div>

      {routines.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No tienes rutinas aún</h3>
          <p className="text-muted-foreground mb-4">
            Crea tu primera rutina para comenzar a organizar tus ejercicios
          </p>
          <Button asChild>
            <Link href="/routines/new">
              <Plus className="w-4 h-4 mr-2" />
              Crear Rutina
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
