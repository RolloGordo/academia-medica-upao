// src/components/landing/Navbar.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, GraduationCap } from 'lucide-react'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Inicio', href: '#inicio' },
    { name: 'Cursos', href: '#cursos' },
    { name: 'Sobre Nosotros', href: '#nosotros' },
    { name: 'Contacto', href: '#contacto' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#6B46C1] to-[#5BC0EB] rounded-xl">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#6B46C1] to-[#5BC0EB] bg-clip-text text-transparent">
                MedMind
              </h1>
              <p className="text-xs text-gray-600">Academia Médica</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-[#6B46C1] font-medium transition-colors"
              >
                {item.name}
              </a>
            ))}
            <Link href="/login">
              <Button className="bg-gradient-to-r from-[#6B46C1] to-[#5BC0EB] hover:opacity-90 text-white px-6">
                Iniciar Sesión
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-6 space-y-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-700 hover:text-[#6B46C1] font-medium py-2"
              >
                {item.name}
              </a>
            ))}
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-gradient-to-r from-[#6B46C1] to-[#5BC0EB] hover:opacity-90 text-white">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}