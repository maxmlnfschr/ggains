import { Database } from './supabase'

export type Routine = Database['public']['Tables']['routines']['Row']
export type RoutineExercise = Database['public']['Tables']['routine_exercises']['Row']

export type RoutineWithExercises = Routine & {
  routine_exercises: (RoutineExercise & {
    exercise: Database['public']['Tables']['exercises']['Row']
  })[]
}

export type CreateRoutineInput = {
  name: string
}

export type AddExerciseToRoutineInput = {
  routineId: string
  exerciseId: string
  sets: number
  reps: number
  order_index: number
}
