import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    
    console.log("Middleware - Path:", req.nextUrl.pathname);
    console.log("Middleware - Session:", !!session);
    
    if (['/dashboard'].includes(req.nextUrl.pathname)) {
      if (!session) {
        console.log("Middleware - Redirigiendo a login (no hay sesión)");
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    if (['/login', '/register'].includes(req.nextUrl.pathname)) {
      if (session) {
        console.log("Middleware - Redirigiendo a dashboard (sesión activa)");
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return res;
  } catch (error) {
    console.error("Middleware - Error crítico:", error);
    return res;
  }
}

export const config = {
  matcher: ['/dashboard', '/login', '/register']
} 