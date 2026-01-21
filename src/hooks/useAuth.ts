// src/hooks/useAuth.ts
// Hook personalizado para manejar autenticación en componentes

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import * as authService from '@/services/authService'
import type { AuthUser } from '@/types'

interface UseAuthReturn {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

/**
 * Hook personalizado para manejar autenticación
 * Úsalo en cualquier componente que necesite información del usuario
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Cargar usuario al montar el componente
  useEffect(() => {
    loadUser()

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await loadUser()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  /**
   * Carga la información del usuario actual
   */
  const loadUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Error al cargar usuario:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Inicia sesión
   */
  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await authService.login({ email, password })
      
      if (response.success && response.user) {
        setUser(response.user)
        // Redirigir según el rol
        router.push(`/${response.user.role}`)
        return { success: true }
      }

      return {
        success: false,
        error: response.error || 'Error al iniciar sesión',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error inesperado',
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cierra sesión
   */
  const logout = async () => {
    setLoading(true)
    try {
      await authService.logout()
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  }
}