import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const routineId = await Promise.resolve(params.id);
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

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
        .eq('user_id', session.user.id)
        .single(),
      supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true })
    ])

    if (routineError) {
      console.error('Supabase error:', routineError)
      return NextResponse.json(
        { error: routineError.message },
        { status: 500 }
      )
    }

    if (exercisesError) {
      console.error('Supabase error:', exercisesError)
      return NextResponse.json(
        { error: exercisesError.message },
        { status: 500 }
      )
    }

    if (!routine) {
      return NextResponse.json(
        { error: 'Routine not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      routine,
      exercises: exercises || []
    })
  } catch (error) {
    console.error('Error in routine route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
