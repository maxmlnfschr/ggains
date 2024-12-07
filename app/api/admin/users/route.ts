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

export async function GET() {
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;

    console.log('Usuarios obtenidos:', users); // Para debugging
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        full_name: body.fullName,
        role: body.role,
        email_verified: true,
        phone_verified: false,
        phone: ''
      }
    });

    if (authError) {
      console.error('Error al crear usuario en auth:', authError);
      throw authError;
    }

    if (!newUser.user) {
      throw new Error('No se pudo crear el usuario');
    }

    // 2. Crear/Actualizar entrada en profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: newUser.user.id,
        full_name: body.fullName,
        role: body.role
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error('Error al crear perfil:', profileError);
      await supabase.auth.admin.deleteUser(newUser.user.id);
      throw profileError;
    }

    return NextResponse.json({ user: newUser.user });
  } catch (error) {
    console.error('Error completo al crear usuario:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear usuario' },
      { status: 500 }
    );
  }
} 