"use client";

import { useAuth } from "@/providers/AuthProvider";

export default function SessionTest() {
  const { session, user, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="font-bold">Estado de la Sesión:</h2>
      <pre className="mt-2 p-2 bg-white rounded">
        {JSON.stringify({ 
          sessionActive: !!session,
          userEmail: user?.email,
          userId: user?.id
        }, null, 2)}
      </pre>
    </div>
  );
} 