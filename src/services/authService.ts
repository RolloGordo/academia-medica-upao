// src/services/authService.ts
// Servicio para manejar toda la lógica de autenticación

import { supabase } from '@/lib/supabase/client'
import type { AuthUser } from '@/types'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  user?: AuthUser
  error?: string
}

/**
 * Inicia sesión con email y contraseña
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    // 1. Autenticar con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (authError) {
      return {
        success: false,
        error: authError.message === 'Invalid login credentials'
          ? 'Credenciales inválidas. Verifica tu email y contraseña.'
          : 'Error al iniciar sesión. Intenta nuevamente.',
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'No se pudo obtener la información del usuario.',
      }
    }

    // 2. Obtener el perfil del usuario (con el rol)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single<{
        id: string
        email: string
        full_name: string
        role: 'admin' | 'docente' | 'estudiante'
        active: boolean
      }>()

    if (profileError || !profile) {
      // Si no hay perfil, cerrar sesión
      await supabase.auth.signOut()
      return {
        success: false,
        error: 'Usuario no encontrado en el sistema. Contacta al administrador.',
      }
    }

    // 3. Verificar que el usuario esté activo
    if (!profile.active) {
      await supabase.auth.signOut()
      return {
        success: false,
        error: 'Tu cuenta está inactiva. Contacta al administrador.',
      }
    }

    // 4. Retornar usuario completo
    const user: AuthUser = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      active: profile.active,
    }

    return {
      success: true,
      user,
    }
  } catch (error) {
    console.error('Error en login:', error)
    return {
      success: false,
      error: 'Error inesperado. Intenta nuevamente.',
    }
  }
}

/**
 * Cierra la sesión del usuario actual
 */
export async function logout(): Promise<void> {
  try {
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Error en logout:', error)
  }
}

/**
 * Obtiene el usuario autenticado actual
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    // 1. Verificar sesión activa
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()

    if (sessionError || !user) {
      return null
    }

    // 2. Obtener perfil
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single<{
        id: string
        email: string
        full_name: string
        role: 'admin' | 'docente' | 'estudiante'
        active: boolean
      }>()

    if (profileError || !profile) {
      return null
    }

    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      active: profile.active,
    }
  } catch (error) {
    console.error('Error al obtener usuario actual:', error)
    return null
  }
}

/**
 * Verifica si hay una sesión activa
 */
export async function checkSession(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  } catch {
    return false
  }
}