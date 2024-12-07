import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      
      // Obtener la sesión actual para el token
      const { data: { session } } = await supabase.auth.getSession();

      // Usar el endpoint que ya tiene configurada la service role key
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener usuarios');
      }

      setUsers(data.users);
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      setError(err instanceof Error ? err : new Error('Error al obtener usuarios'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, refetch: fetchUsers };
} 