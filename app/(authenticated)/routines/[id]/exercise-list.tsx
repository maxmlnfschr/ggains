'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2 } from 'lucide-react'

interface ExerciseListProps {
  routine: any
  onUpdate?: () => Promise<void>
}

export function ExerciseList({ routine, onUpdate }: ExerciseListProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  async function handleRemoveExercise(routineExerciseId: string) {
    try {
      setLoading(routineExerciseId)
      const { error } = await supabase
        .from('routine_exercises')
        .delete()
        .eq('id', routineExerciseId)

      if (error) throw error

      toast({
        title: 'Ejercicio eliminado',
        description: 'El ejercicio ha sido eliminado de la rutina exitosamente.'
      })

      if (onUpdate) await onUpdate()
      router.refresh()
    } catch (error) {
      console.error('Error removing exercise:', error)
      toast({
        title: 'Error',
        description: 'Hubo un error al eliminar el ejercicio. Por favor, intenta de nuevo.',
        variant: 'destructive'
      })
    } finally {
      setLoading(null)
    }
  }

  if (!routine.routine_exercises?.length) {
    return (
      <div className="text-center p-4 border rounded-lg bg-muted">
        <p className="text-sm text-muted-foreground">
          No hay ejercicios en esta rutina aún.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ejercicio</TableHead>
            <TableHead>Series</TableHead>
            <TableHead>Repeticiones</TableHead>
            <TableHead>Orden</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routine.routine_exercises.map((routineExercise: any) => (
            <TableRow key={routineExercise.id}>
              <TableCell>{routineExercise.exercise.name}</TableCell>
              <TableCell>{routineExercise.sets}</TableCell>
              <TableCell>{routineExercise.reps}</TableCell>
              <TableCell>{routineExercise.order_index + 1}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveExercise(routineExercise.id)}
                  disabled={loading === routineExercise.id}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
