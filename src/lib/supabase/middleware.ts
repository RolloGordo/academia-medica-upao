// src/lib/supabase/middleware.ts
// Middleware para refrescar la sesión de autenticación

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'

/**
 * Actualiza la sesión de autenticación del usuario
 * Este middleware se ejecuta en cada petición para mantener la sesión activa
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: Evita escribir lógica entre createServerClient y
  // supabase.auth.getUser(). Un simple error puede hacer que el servidor
  // no refresque la sesión del usuario.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rutas protegidas
  const protectedRoutes = ['/admin', '/docente', '/estudiante']
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Si no hay usuario y está intentando acceder a ruta protegida, redirigir al login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Si hay usuario y está en login, redirigir según su rol
  if (user && request.nextUrl.pathname === '/login') {
    // Obtener el rol del usuario
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single<{ role: string }>()

    if (profile && !error) {
      const url = request.nextUrl.clone()
      url.pathname = `/${profile.role}`
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}