"use client"

import { useForm, ControllerRenderProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { createRoutine, updateRoutine } from '@/app/actions/routines'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Routine } from '@/types/routine'

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre de la rutina debe tener al menos 2 caracteres.",
  }),
})

type FormSchemaType = z.infer<typeof FormSchema>

interface RoutineFormProps {
  routine?: Routine
}

export function RoutineForm({ routine }: RoutineFormProps) {
  const router = useRouter()
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: routine?.name || '',
    },
  })

  async function onSubmit(values: FormSchemaType) {
    try {
      if (routine) {
        await updateRoutine(routine.id, values)
        toast.success('Rutina actualizada')
      } else {
        await createRoutine(values)
        toast.success('Rutina creada')
      }
      router.push('/routines')
      router.refresh()
    } catch (error) {
      toast.error('Ocurrió un error')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la rutina</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Mi rutina de pecho" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">
          {routine ? 'Actualizar rutina' : 'Crear rutina'}
        </Button>
      </form>
    </Form>
  )
}
