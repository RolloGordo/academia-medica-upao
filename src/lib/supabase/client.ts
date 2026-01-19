// src/lib/supabase/client.ts
// Cliente de Supabase para uso en el navegador (client-side)

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

/**
 * Crea un cliente de Supabase para uso en componentes de cliente
 * Este cliente es seguro para usar en el navegador
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Cliente singleton de Supabase para uso en componentes de cliente
 * Úsalo directamente en tus componentes React
 */
export const supabase = createClient()
