import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: {
      getItem: (key) => {
        if (typeof window !== 'undefined') {
          return window.localStorage.getItem(key);
        }
        return null;
      },
      setItem: (key, value) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
      },
      removeItem: (key) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
      },
    },
  },
  global: {
    headers: {
      'x-application-name': 'ggains',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    timeout: 60000,
  },
  httpClient: {
    fetch: (url, options) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options?.headers,
          'Cache-Control': 'no-cache',
        },
        cache: 'no-store',
        keepalive: true,
        signal: AbortSignal.timeout(30000),
      });
    },
  },
});
