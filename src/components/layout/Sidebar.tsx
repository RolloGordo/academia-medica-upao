// src/components/layout/Sidebar.tsx
// Barra lateral de navegación - MEJORADA CON COLORES MEDMIND

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
  Sparkles,
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
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto shadow-sm">
        {/* Logo/Título con gradiente MedMind */}
        <div className="flex items-center flex-shrink-0 px-6 mb-8">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-[#6B46C1] to-[#5BC0EB] rounded-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#6B46C1] to-[#5BC0EB] bg-clip-text text-transparent">
              MedMind
            </h1>
          </div>
        </div>

        {/* Info del usuario */}
        <div className="px-6 mb-6">
          <div className="flex items-center p-3 rounded-xl bg-gradient-to-br from-purple-50 to-cyan-50 border border-purple-100">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#6B46C1] to-[#5BC0EB] flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.full_name}
              </p>
              <p className="text-xs text-gray-600 capitalize font-medium">
                {user.role === 'estudiante' ? 'Estudiante' : user.role === 'docente' ? 'Docente' : 'Administrador'}
              </p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-[#6B46C1] to-[#5BC0EB] text-white shadow-lg shadow-purple-500/30'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-[#6B46C1]'
                )}
              >
                <Icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0 transition-all duration-200',
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 group-hover:text-[#6B46C1] group-hover:scale-110'
                  )}
                />
                <span className={cn(
                  'transition-all duration-200',
                  isActive && 'font-semibold'
                )}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 pt-4 mt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500 font-medium">© 2026 MedMind</p>
            <p className="text-xs text-gray-400">Academia Médica</p>
          </div>
        </div>
      </div>
    </div>
  )
}