import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Variables de entorno no encontradas');
  process.exit(1);
}

async function updateAdmin(userId: string, updates: {
  email?: string;
  password?: string;
  full_name?: string;
}) {
  const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError) throw userError;
    
    if (userData.user.user_metadata.role !== 'admin') {
      throw new Error('El usuario no es un administrador');
    }

    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        email: updates.email,
        password: updates.password,
        user_metadata: {
          ...userData.user.user_metadata,
          full_name: updates.full_name || userData.user.user_metadata.full_name
        }
      }
    );

    if (updateError) throw updateError;

    console.log('Administrador actualizado exitosamente:', {
      id: updatedUser.user.id,
      email: updatedUser.user.email,
      full_name: updatedUser.user.user_metadata.full_name
    });

  } catch (error) {
    console.error('Error al actualizar administrador:', error);
    process.exit(1);
  }
}

const userId = process.argv[2];
const email = process.argv[3];
const password = process.argv[4];
const fullName = process.argv[5];

if (!userId) {
  console.error('Uso: npx ts-node scripts/update-admin.ts <userId> [email] [password] "Nuevo Nombre"');
  process.exit(1);
}

updateAdmin(userId, {
  email,
  password,
  full_name: fullName
}); 