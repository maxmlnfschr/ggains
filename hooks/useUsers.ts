import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';

interface FormattedUser extends User {
  user_metadata: {
    full_name: string;
    role: string;
    email_verified: boolean;
    phone_verified: boolean;
    phone: string;
  }
}

export function useUsers() {
  const [users, setUsers] = useState<FormattedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al obtener usuarios');

      const normalizedUsers = data.users.map((user: { user_metadata?: any; email_confirmed_at?: string }) => ({
        ...user,
        user_metadata: {
          full_name: user.user_metadata?.full_name || '',
          role: user.user_metadata?.role || 'athlete',
          email_verified: user.email_confirmed_at ? true : false,
          phone_verified: user.user_metadata?.phone_verified || false,
          phone: user.user_metadata?.phone || ''
        }
      }));

      setUsers(normalizedUsers);
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