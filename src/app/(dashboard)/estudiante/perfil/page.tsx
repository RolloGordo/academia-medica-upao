'use client'

import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, User } from 'lucide-react'

export default function EstudianteProfilePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center">
        <p className="text-gray-600">No se encontró información del usuario</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600 mt-1">Información de tu cuenta de estudiante</p>
      </div>

      {/* Información básica */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>Detalles de tu cuenta de estudiante</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-2xl">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-gray-600">Avatar del Usuario</p>
              <p className="text-gray-900 font-medium">{user.full_name.charAt(0).toUpperCase()}</p>
            </div>
          </div>

          {/* Nombre Completo */}
          <div className="border-t pt-6">
            <div className="flex items-center space-x-3 mb-2">
              <User className="h-5 w-5 text-gray-600" />
              <label className="text-sm font-medium text-gray-600">Nombre Completo</label>
            </div>
            <p className="text-lg text-gray-900 ml-8">{user.full_name}</p>
          </div>

          {/* Email */}
          <div className="border-t pt-6">
            <div className="flex items-center space-x-3 mb-2">
              <Mail className="h-5 w-5 text-gray-600" />
              <label className="text-sm font-medium text-gray-600">Email</label>
            </div>
            <p className="text-lg text-gray-900 ml-8">{user.email}</p>
          </div>

          {/* Rol */}
          <div className="border-t pt-6">
            <label className="text-sm font-medium text-gray-600 block mb-2">Rol</label>
            <div className="ml-8">
              <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                Estudiante
              </span>
            </div>
          </div>

          {/* Estado */}
          <div className="border-t pt-6">
            <label className="text-sm font-medium text-gray-600 block mb-2">Estado</label>
            <div className="ml-8">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                user.active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full"
            disabled
          >
            Cambiar Contraseña
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            disabled
          >
            Editar Perfil
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
