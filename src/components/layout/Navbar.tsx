// src/components/layout/Navbar.tsx
// Barra superior de navegación - CORREGIDA con z-index alto

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
import { LogOut, User, ChevronDown } from 'lucide-react'

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
    <div className="sticky top-0 z-50 flex-shrink-0 flex h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="flex-1 px-6 flex justify-between items-center">
        {/* Título de la página */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#6B46C1] to-[#5BC0EB] bg-clip-text text-transparent">
            Dashboard
          </h2>
        </div>

        {/* Acciones del usuario */}
        <div className="ml-4 flex items-center md:ml-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative flex items-center gap-2 hover:bg-purple-50 transition-colors"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#6B46C1] to-[#5BC0EB] flex items-center justify-center text-white font-semibold text-sm shadow-md">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user.full_name}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.full_name}</p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {user.role === 'estudiante' ? 'Estudiante' : user.role === 'docente' ? 'Docente' : 'Administrador'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-purple-50"
                onClick={handleNavigateToProfile}
              >
                <User className="mr-2 h-4 w-4 text-[#6B46C1]" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-50"
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