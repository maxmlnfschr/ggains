import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';

export function useProfile() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/admin/users/' + session?.user?.id);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener perfil');
      }

      setProfile(data.user);
    } catch (err) {
      console.error('Error al obtener perfil:', err);
      setError(err instanceof Error ? err : new Error('Error al obtener perfil'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, error, refetch: fetchProfile };
} 