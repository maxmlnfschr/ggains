import RegisterForm from "@/components/auth/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Registro</h1>
          <p className="text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-black hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
        
        <RegisterForm />
      </div>
    </div>
  );
} 