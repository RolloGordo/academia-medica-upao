// src/app/(dashboard)/layout.tsx
// Layout compartido para admin, docente y estudiante

'use client'

import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { Loader2 } from 'lucide-react'
import { redirect } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()

  // Mostrar loader mientras carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Si no hay usuario, redirigir a login
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Contenido principal */}
      <div className="lg:pl-64">
        {/* Navbar */}
        <Navbar user={user} />

        {/* Contenido de la página */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}