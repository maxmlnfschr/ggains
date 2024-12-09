import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Inicio de sesión</h1>
          <p className="text-gray-600">
            ¿No tenés una cuenta?{" "}
            <Link href="/register" className="text-black hover:underline">
              Registrate
            </Link>
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
} 