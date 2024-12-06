import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  // Si no hay sesión y trata de acceder a rutas protegidas
  if (['/admin', '/dashboard', '/profile'].includes(req.nextUrl.pathname)) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Si hay sesión y trata de acceder a login/register
  if (['/login', '/register'].includes(req.nextUrl.pathname)) {
    if (session) {
      // Redirigir según el rol
      const userRole = session.user?.user_metadata?.role;
      const redirectUrl = userRole === 'admin' ? '/admin' : '/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
  }

  // Si trata de acceder al dashboard siendo admin
  if (req.nextUrl.pathname === '/dashboard') {
    const userRole = session?.user?.user_metadata?.role;
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin', '/dashboard', '/profile', '/login', '/register']
} 