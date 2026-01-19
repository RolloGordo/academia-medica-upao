// src/lib/supabase/server.ts
// Cliente de Supabase para uso en el servidor (server-side)

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

/**
 * Crea un cliente de Supabase para uso en Server Components y API Routes
 * Este cliente maneja automáticamente las cookies de autenticación
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // La función `setAll` fue llamada desde un Server Component.
            // Esto puede ser ignorado si tienes middleware refrescando las cookies.
          }
        },
      },
    }
  )
}

/**
 * Crea un cliente de Supabase con privilegios de servicio (admin)
 * SOLO usar en server-side, NUNCA exponer al cliente
 */
export function createServiceClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // No hacer nada
        },
      },
    }
  )
}