import LoginForm from "@/components/auth/LoginForm";
import SessionTest from "@/components/SessionTest";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <SessionTest />
        <div className="text-center">
          <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
          <p className="text-gray-600">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="text-black hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
} 