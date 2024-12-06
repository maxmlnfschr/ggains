const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Variables de entorno no encontradas');
  process.exit(1);
}

async function createAdmin(email: string, password: string, fullName: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'admin'
      }
    });

    if (authError) throw authError;

    console.log('Administrador creado exitosamente:', authData.user);

  } catch (error) {
    console.error('Error al crear administrador:', error);
    process.exit(1);
  }
}

const email = process.argv[2];
const password = process.argv[3];
const fullName = process.argv[4];

if (!email || !password || !fullName) {
  console.error('Uso: npx ts-node scripts/create-admin.ts <email> <password> "Nombre Completo"');
  process.exit(1);
}

createAdmin(email, password, fullName); 