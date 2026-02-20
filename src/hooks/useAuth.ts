// src/hooks/useAuth.ts
// Hook personalizado para manejar autenticación - CORREGIDO

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
    let mounted = true

    const loadUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        if (mounted) {
          setUser(currentUser)
        }
      } catch (error) {
        console.error('Error al cargar usuario:', error)
        if (mounted) {
          setUser(null)
        }
      } finally {
        // ✅ CRÍTICO: Siempre resolver el loading
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadUser()

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event)
        
        if (!mounted) return

        if (event === 'SIGNED_IN' && session) {
          try {
            const currentUser = await authService.getCurrentUser()
            if (mounted) {
              setUser(currentUser)
              setLoading(false)
            }
          } catch (error) {
            console.error('Error al cargar usuario después de login:', error)
            if (mounted) {
              setUser(null)
              setLoading(false)
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setUser(null)
            setLoading(false)
            router.push('/login')
          }
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed')
          // No recargar usuario en refresh de token
        }
      }
    )

    // ✅ CRÍTICO: Cleanup para evitar memory leaks
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router])

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
        router.refresh() // ✅ Refresh para limpiar cache
        return { success: true }
      }

      return {
        success: false,
        error: response.error || 'Error al iniciar sesión',
      }
    } catch (error) {
      console.error('Error en login:', error)
      return {
        success: false,
        error: 'Error inesperado',
      }
    } finally {
      // ✅ CRÍTICO: Siempre resolver el loading
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
      router.refresh() // ✅ Refresh para limpiar cache
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      // Incluso si falla, redirigir al login
      setUser(null)
      router.push('/login')
      router.refresh()
    } finally {
      // ✅ CRÍTICO: Siempre resolver el loading
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