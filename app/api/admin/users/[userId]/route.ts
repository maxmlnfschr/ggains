import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
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
  const { userId } = await params;

  try {
    const body = await request.json();
    
    const updateData: {
      email: string;
      data: {
        full_name: string;
        role: string;
        email_verified: boolean;
        phone_verified: boolean;
        phone: string;
      };
      password?: string;
    } = {
      email: body.email,
      data: {
        full_name: body.fullName,
        role: body.role,
        email_verified: body.email_verified ?? false,
        phone_verified: body.phone_verified ?? false,
        phone: body.phone || ''
      }
    };

    if (body.password) {
      updateData.password = body.password;
    }

    const { data: { user }, error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      updateData
    );

    if (authError) {
      console.error('Error al actualizar auth:', authError);
      throw authError;
    }

    // 2. Actualizar profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: body.fullName,
        role: body.role,
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Error al actualizar profile:', profileError);
      throw profileError;
    }

    console.log('Usuario actualizado:', user);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error completo:', error);
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
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