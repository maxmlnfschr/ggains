"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  refreshSession: () => Promise<Session | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  error: null,
  refreshSession: async () => null
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = getSupabaseClient();

  const refreshSession = async () => {
    console.log('🔄 Intentando refrescar sesión...');
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    console.log('📦 Sesión obtenida:', currentSession ? 'Válida' : 'Nula');
    setSession(currentSession);
    setUser(currentSession?.user ?? null);
    return currentSession;
  };

  useEffect(() => {
    console.log('🚀 Inicializando AuthProvider...');
    refreshSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      console.log('🔔 Cambio en el estado de autenticación:', _event);
      console.log('👤 Nueva sesión:', currentSession ? 'Válida' : 'Nula');
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, loading, error, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
