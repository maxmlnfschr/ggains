'use client'

import { createClient } from '@/lib/supabase/client'
import { CreateRoutineInput, AddExerciseToRoutineInput, RoutineWithExercises } from '@/types/routine'
import { Database } from '@/types/supabase'

export async function createRoutine(data: CreateRoutineInput) {
  const supabase = createClient()

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  const { data: routine, error } = await supabase
    .from('routines')
    .insert({
      name: data.name,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw error
  return routine
}

export async function getRoutines() {
  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('No autenticado')

  const { data: routines, error } = await supabase
    .from('routines')
    .select(`
      *,
      routine_exercises (
        *,
        exercise: exercises (*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return routines as RoutineWithExercises[]
}

export async function getRoutine(id: string) {
  try {
    console.log('Fetching routine with id:', id);
    const supabase = createClient()

    const { data: session } = await supabase.auth.getSession()
    if (!session) {
      console.error('No session found');
      throw new Error('Authentication required');
    }

    if (!session.session?.user.id) {
      throw new Error('User not authenticated');
    }

    const { data: routine, error } = await supabase
      .from('routines')
      .select(`
        *,
        routine_exercises (
          *,
          exercise: exercises (*)
        )
      `)
      .eq('id', id)
      .eq('user_id', session.session.user.id)
      .single()

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!routine) {
      console.error('No routine found with id:', id);
      throw new Error('Routine not found');
    }

    console.log('Successfully fetched routine:', routine);
    return routine;
  } catch (error) {
    console.error('Error in getRoutine:', error);
    throw error;
  }
}

export async function addExerciseToRoutine(data: AddExerciseToRoutineInput) {
  const supabase = createClient()

  const { data: routineExercise, error } = await supabase
    .from('routine_exercises')
    .insert({
      routine_id: data.routineId,
      exercise_id: data.exerciseId,
      sets: data.sets,
      reps: data.reps,
      order_index: data.order_index,
    })
    .select()
    .single()

  if (error) throw error
  return routineExercise
}

export async function updateRoutine(id: string, data: CreateRoutineInput) {
  const supabase = createClient()

  const { data: routine, error } = await supabase
    .from('routines')
    .update({
      name: data.name,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return routine
}

export async function deleteRoutine(id: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('routines')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function removeExerciseFromRoutine(routineExerciseId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('routine_exercises')
    .delete()
    .eq('id', routineExerciseId)

  if (error) throw error
}
