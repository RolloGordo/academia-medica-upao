// src/app/api/users/create/route.ts
// API para crear nuevos usuarios (requiere privilegios de admin)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, role } = body

    // Validaciones
    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el usuario que hace la petición sea admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single<{ role: string }>()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permisos para crear usuarios' },
        { status: 403 }
      )
    }

    // Crear usuario con el cliente de servicio (tiene permisos de admin)
    const serviceClient = createServiceClient()

    const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar email
    })

    if (authError) {
      console.error('Error al crear usuario en auth:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Error al crear usuario' },
        { status: 500 }
      )
    }

    // Crear perfil del usuario
    const { error: profileError } = await serviceClient
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role,
        active: true,
      } as any)

    if (profileError) {
      console.error('Error al crear perfil:', profileError)
      
      // Si falla el perfil, eliminar el usuario de auth
      await serviceClient.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json(
        { error: 'Error al crear perfil de usuario' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email,
        fullName,
        role,
      },
    })
  } catch (error) {
    console.error('Error en POST /api/users/create:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}