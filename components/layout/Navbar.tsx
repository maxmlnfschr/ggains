"use client";

import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link 
              href="/dashboard" 
              className={`inline-flex items-center px-4 text-sm font-medium ${
                isActive('/dashboard') ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'
              }`}
            >
              Dashboard
            </Link>
          </div>

          <div className="flex items-center">
            {user?.user_metadata.role === 'admin' && (
              <Link 
                href="/admin" 
                className={`inline-flex items-center px-4 text-sm font-medium ${
                  isActive('/admin') ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'
                }`}
              >
                Admin
              </Link>
            )}
            <Link 
              href="/profile" 
              className={`inline-flex items-center px-4 text-sm font-medium ${
                isActive('/profile') ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'
              }`}
            >
              Mi Perfil
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 