"use client";

import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const isAdmin = user?.user_metadata?.role === 'admin';

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-4">
            {!isAdmin && (
              <Link 
                href="/dashboard" 
                className={`inline-flex items-center px-4 text-sm font-medium ${
                  isActive('/dashboard') ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAdmin && (
              <Link 
                href="/admin" 
                className={`inline-flex items-center px-4 text-sm font-medium ${
                  isActive('/admin') ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'
                }`}
              >
                Panel de control
              </Link>
            )}
            <Link 
              href="/profile" 
              className={`inline-flex items-center px-4 text-sm font-medium ${
                isActive('/profile') ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'
              }`}
            >
              Perfil
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 