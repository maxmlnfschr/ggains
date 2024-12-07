import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { exerciseId: string } }
) {
  const segments = request.nextUrl.pathname.split('/');
  const exerciseId = segments[segments.length - 1];

  try {
    // Obtener el ejercicio principal
    const { data: exercise, error: exerciseError } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', exerciseId)
      .single();

    if (exerciseError) throw exerciseError;

    // Obtener músculos relacionados
    const { data: muscles, error: musclesError } = await supabase
      .from('exercise_muscles')
      .select('muscle_id')
      .eq('exercise_id', exerciseId);

    if (musclesError) throw musclesError;

    // Obtener equipo relacionado
    const { data: equipment, error: equipmentError } = await supabase
      .from('exercise_equipment')
      .select('equipment_id, is_alternative')
      .eq('exercise_id', exerciseId);

    if (equipmentError) throw equipmentError;

    // Obtener variantes relacionadas
    const { data: variants, error: variantsError } = await supabase
      .from('exercise_variants')
      .select('variant_id')
      .eq('exercise_id', exerciseId);

    if (variantsError) throw variantsError;

    // Combinar toda la información
    const completeExercise = {
      ...exercise,
      muscle_ids: muscles.map(m => m.muscle_id),
      equipment_ids: equipment
        .filter(e => !e.is_alternative)
        .map(e => e.equipment_id),
      alternative_equipment_ids: equipment
        .filter(e => e.is_alternative)
        .map(e => e.equipment_id),
      variant_ids: variants.map(v => v.variant_id)
    };

    return NextResponse.json(completeExercise);
  } catch (error: any) {
    console.error('Error al obtener ejercicio:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener ejercicio' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { exerciseId: string } }
) {
  const segments = request.nextUrl.pathname.split('/');
  const exerciseId = segments[segments.length - 1];

  try {
    const body = await request.json();
    
    // Actualizar ejercicio principal
    const { error: exerciseError } = await supabase
      .from('exercises')
      .update({
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
      })
      .eq('id', exerciseId);

    if (exerciseError) throw exerciseError;

    // Actualizar músculos
    await supabase
      .from('exercise_muscles')
      .delete()
      .eq('exercise_id', exerciseId);

    if (body.muscle_ids.length > 0) {
      await supabase
        .from('exercise_muscles')
        .insert(
          body.muscle_ids.map(muscleId => ({
            exercise_id: exerciseId,
            muscle_id: muscleId
          }))
        );
    }

    // Actualizar equipo
    await supabase
      .from('exercise_equipment')
      .delete()
      .eq('exercise_id', exerciseId);

    if (body.equipment_ids.length > 0) {
      await supabase
        .from('exercise_equipment')
        .insert(
          body.equipment_ids.map(equipmentId => ({
            exercise_id: exerciseId,
            equipment_id: equipmentId,
            is_alternative: false
          }))
        );
    }

    if (body.alternative_equipment_ids.length > 0) {
      await supabase
        .from('exercise_equipment')
        .insert(
          body.alternative_equipment_ids.map(equipmentId => ({
            exercise_id: exerciseId,
            equipment_id: equipmentId,
            is_alternative: true
          }))
        );
    }

    // Actualizar variantes
    await supabase
      .from('exercise_variants')
      .delete()
      .eq('exercise_id', exerciseId);

    if (body.variant_ids.length > 0) {
      await supabase
        .from('exercise_variants')
        .insert(
          body.variant_ids.map(variantId => ({
            exercise_id: exerciseId,
            variant_id: variantId
          }))
        );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error al actualizar ejercicio:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar ejercicio' },
      { status: 500 }
    );
  }
} 