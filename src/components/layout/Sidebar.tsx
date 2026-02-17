// src/components/layout/Sidebar.tsx
// Barra lateral de navegación

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { AuthUser } from '@/types'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Video,
  UserCog,
  GraduationCap,
  PlayCircle,
  BarChart3,
} from 'lucide-react'

interface SidebarProps {
  user: AuthUser
}

// Rutas según el rol
const navigationByRole = {
  admin: [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      name: 'Usuarios',
      href: '/admin/usuarios',
      icon: Users,
    },
    {
      name: 'Cursos',
      href: '/admin/cursos',
      icon: BookOpen,
    },
    {
      name: 'Videos',
      href: '/admin/videos',
      icon: Video,
    },
    {
      name: 'Inscripciones',
      href: '/admin/inscripciones',
      icon: UserCog,
    },
  ],
  docente: [
    {
      name: 'Dashboard',
      href: '/docente',
      icon: LayoutDashboard,
    },
    {
      name: 'Mis Cursos',
      href: '/docente/mis-cursos',
      icon: BookOpen,
    },
    {
      name: 'Videos',
      href: '/docente/videos',
      icon: Video,
    },
    {
      name: 'Estudiantes',
      href: '/docente/estudiantes',
      icon: GraduationCap,
    },
  ],
  estudiante: [
    {
      name: 'Mis Cursos',
      href: '/estudiante',
      icon: BookOpen,
    },
    {
      name: 'Videos',
      href: '/estudiante/videos',
      icon: PlayCircle,
    },
    {
      name: 'Mi Progreso',
      href: '/estudiante/progreso',
      icon: BarChart3,
    },
  ],
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const navigation = navigationByRole[user.role] || []

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
        {/* Logo/Título */}
        <div className="flex items-center flex-shrink-0 px-6">
          <h1 className="text-2xl font-bold text-blue-600">
            MedMind
          </h1>
        </div>

        {/* Info del usuario */}
        <div className="mt-6 px-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user.full_name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user.role}
              </p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="mt-8 flex-1 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive
                      ? 'text-blue-600'
                      : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 pb-4 text-xs text-gray-500">
          <p>© 2026 MedMind</p>
          <p>Academia Médica </p>
        </div>
      </div>
    </div>
  )
}