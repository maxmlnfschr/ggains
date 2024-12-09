import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface UpdateUserData {
  email: string;
  user_metadata: {
    full_name: string;
    role: string;
  };
  password?: string;
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const resolvedParams = await params;

  try {
    const userId = resolvedParams.userId;
    // 1. Eliminar de profiles (opcional si tienes ON DELETE CASCADE)
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) throw profileError;

    // 2. Eliminar usuario de auth.users
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authError) throw authError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const resolvedParams = await params;
  const userId = resolvedParams.userId;

  try {
    const body = await request.json();

    // 1. Actualizar el usuario en auth
    const { data: userData, error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        email: body.email,
        user_metadata: {
          full_name: body.fullName,
          role: body.role
        }
      }
    );

    if (updateError) throw updateError;

    // 2. Actualizar la tabla profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: body.fullName,
        role: body.role,
        updated_at: new Date().toISOString()
      });

    if (profileError) throw profileError;

    return NextResponse.json({ user: userData.user });
  } catch (error: any) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const resolvedParams = await params;

  try {
    const { data: { user }, error } = await supabase.auth.admin.getUserById(resolvedParams.userId);
    
    if (error) throw error;

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Crear usuario en auth.users
    const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        full_name: body.fullName,
        role: body.role
      }
    });

    if (authError) throw authError;

    // 2. Crear entrada en profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUser.user.id,
        full_name: body.fullName,
        role: body.role
      });

    if (profileError) throw profileError;

    return NextResponse.json({ user: newUser.user });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 });
  }
}