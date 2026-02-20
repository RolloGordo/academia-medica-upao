// src/app/(dashboard)/layout.tsx
// Layout compartido - CORREGIDO con loader fullscreen y logout funcional

'use client'

import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { redirect } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()

  // Loader fullscreen que no se desalinea
  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          {/* Contenedor fijo para los círculos */}
          <div className="relative w-16 h-16 mx-auto">
            {/* Círculo que gira */}
            <div className="absolute inset-0 rounded-full border-4 border-solid border-[#6B46C1] border-r-transparent animate-spin" />
            {/* Círculo de fondo que parpadea */}
            <div className="absolute inset-0 rounded-full bg-[#6B46C1] opacity-20 animate-ping" />
          </div>
          <p className="mt-6 text-lg text-gray-700 font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario, redirigir a login
  if (!user) {
    redirect('/login')
  }

  // Determinar clase de fondo según el rol
  const backgroundClass = user.role === 'estudiante' 
    ? '' // Sin fondo, cada página lo define
    : 'bg-gray-50' // Fondo gris para admin/docente

  return (
    <div className={cn("min-h-screen", backgroundClass)}>
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Contenido principal */}
      <div className="lg:pl-64">
        {/* Navbar con z-index alto */}
        <Navbar user={user} />

        {/* Contenido de la página */}
        <main className={cn(
          user.role === 'estudiante' ? '' : 'p-6'
        )}>
          {children}
        </main>
      </div>
    </div>
  )
}