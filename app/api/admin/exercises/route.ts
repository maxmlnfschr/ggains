import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 1. Crear el ejercicio principal
    const { data: exercise, error: exerciseError } = await supabase
      .from('exercises')
      .insert({
        name: body.name,
        alternative_names: body.alternative_names,
        description: body.description,
        detailed_steps: body.detailed_steps,
        execution_tips: body.execution_tips,
        common_mistakes: body.common_mistakes,
        images: body.images,
        video_links: body.video_links,
        category_id: body.category_id,
        series_min: body.series_min,
        series_max: body.series_max,
        reps_min: body.reps_min,
        reps_max: body.reps_max,
        rest_seconds: body.rest_seconds,
        rir_min: body.rir_min,
        rir_max: body.rir_max,
        rpe_min: body.rpe_min,
        rpe_max: body.rpe_max,
        created_by: user.id
      })
      .select()
      .single();

    if (exerciseError) throw exerciseError;

    // 2. Crear relaciones con músculos
    if (body.muscle_ids.length > 0) {
      const { error: musclesError } = await supabase
        .from('exercise_muscles')
        .insert(
          body.muscle_ids.map(muscleId => ({
            exercise_id: exercise.id,
            muscle_id: muscleId
          }))
        );

      if (musclesError) throw musclesError;
    }

    // 3. Crear relaciones con equipo principal
    if (body.equipment_ids.length > 0) {
      const { error: equipmentError } = await supabase
        .from('exercise_equipment')
        .insert(
          body.equipment_ids.map(equipmentId => ({
            exercise_id: exercise.id,
            equipment_id: equipmentId,
            is_alternative: false
          }))
        );

      if (equipmentError) throw equipmentError;
    }

    // 4. Crear relaciones con equipo alternativo
    if (body.alternative_equipment_ids.length > 0) {
      const { error: altEquipmentError } = await supabase
        .from('exercise_equipment')
        .insert(
          body.alternative_equipment_ids.map(equipmentId => ({
            exercise_id: exercise.id,
            equipment_id: equipmentId,
            is_alternative: true
          }))
        );

      if (altEquipmentError) throw altEquipmentError;
    }

    // 5. Crear relaciones con variantes
    if (body.variant_ids.length > 0) {
      const { error: variantsError } = await supabase
        .from('exercise_variants')
        .insert(
          body.variant_ids.map(variantId => ({
            exercise_id: exercise.id,
            variant_id: variantId
          }))
        );

      if (variantsError) throw variantsError;
    }

    return NextResponse.json(exercise);
  } catch (error: any) {
    console.error('Error al crear ejercicio:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear ejercicio' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ exercises: data });
  } catch (error: any) {
    console.error('Error al obtener ejercicios:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener ejercicios' },
      { status: 500 }
    );
  }
} 