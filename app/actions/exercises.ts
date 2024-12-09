'use server'

import { createClient } from '@/lib/supabase/server'

export async function getExercises() {
  const supabase = createClient()

  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return exercises
}
