// src/components/layout/Navbar.tsx
// Barra superior de navegación

'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AuthUser } from '@/types'
import { LogOut, User } from 'lucide-react'

interface NavbarProps {
  user: AuthUser
}

export function Navbar({ user }: NavbarProps) {
  const { logout } = useAuth()
  const router = useRouter()

  const handleNavigateToProfile = () => {
    router.push(`/${user.role}/perfil`)
  }

  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200">
      <div className="flex-1 px-6 flex justify-between items-center">
        {/* Título de la página (se puede hacer dinámico después) */}
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-900">
            Dashboard
          </h2>
        </div>

        {/* Acciones del usuario */}
        <div className="ml-4 flex items-center md:ml-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user.full_name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={handleNavigateToProfile}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={() => logout()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}