// src/app/(dashboard)/layout.tsx
// Layout compartido para admin, docente y estudiante - CON FONDOS PERSONALIZADOS

'use client'

import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
// import { Loader2 } from 'lucide-react' (removed — no usado)
import { redirect } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()

  // Mostrar loader mientras carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="relative">
            <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-[#6B46C1] border-r-transparent"></div>
            <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full bg-[#6B46C1] opacity-20"></div>
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
  // Estudiante: Sin fondo (el dashboard tiene su propio fondo animado)
  // Admin/Docente: Fondo gris tradicional
  const backgroundClass = user.role === 'estudiante' 
    ? '' // Sin fondo, cada página lo define
    : 'bg-gray-50' // Fondo gris para admin/docente

  return (
    <div className={cn("min-h-screen", backgroundClass)}>
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Contenido principal */}
      <div className="lg:pl-64">
        {/* Navbar */}
        <Navbar user={user} />

        {/* Contenido de la página */}
        <main className={cn(
          /* Añadimos `pt-16` para compensar la altura del `Navbar` sticky
             y evitar que el contenido quede detrás. Mantener `p-6` para
             admin/docente. */
          user.role === 'estudiante' ? 'pt-16' : 'pt-16 p-6'
        )}>
          {children}
        </main>
      </div>
    </div>
  )
}