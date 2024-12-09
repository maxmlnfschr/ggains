"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from '@/components/ui/use-toast'

const formSchema = z.object({
  exerciseId: z.string().min(1, 'Selecciona un ejercicio'),
  sets: z.coerce
    .number()
    .min(1, 'Mínimo 1 serie')
    .max(20, 'Máximo 20 series'),
  reps: z.coerce
    .number()
    .min(1, 'Mínimo 1 repetición')
    .max(100, 'Máximo 100 repeticiones'),
})

interface AddExerciseFormProps {
  routineId: string
  exercises: any[]
  onAdd: () => Promise<void>
}

export function AddExerciseForm({ routineId, exercises, onAdd }: AddExerciseFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exerciseId: '',
      sets: 3,
      reps: 12,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)

      // Get the current max order_index
      const { data: currentExercises } = await supabase
        .from('routine_exercises')
        .select('order_index')
        .eq('routine_id', routineId)
        .order('order_index', { ascending: false })
        .limit(1)

      const nextOrderIndex = currentExercises?.[0]?.order_index + 1 || 0

      const { error } = await supabase.from('routine_exercises').insert({
        routine_id: routineId,
        exercise_id: values.exerciseId,
        sets: values.sets,
        reps: values.reps,
        order_index: nextOrderIndex,
      })

      if (error) throw error

      form.reset()
      router.refresh()
      toast({
        title: 'Ejercicio agregado',
        description: 'El ejercicio ha sido agregado a la rutina exitosamente.',
      })
    } catch (error) {
      console.error('Error adding exercise:', error)
      toast({
        title: 'Error',
        description:
          'Hubo un error al agregar el ejercicio. Por favor, intenta de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="exerciseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ejercicio</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={loading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un ejercicio" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {exercises.map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sets"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Series</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  disabled={loading}
                  min={1}
                  max={20}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reps"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repeticiones</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  disabled={loading}
                  min={1}
                  max={100}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading ? 'Agregando...' : 'Agregar ejercicio'}
        </Button>
      </form>
    </Form>
  )
}
