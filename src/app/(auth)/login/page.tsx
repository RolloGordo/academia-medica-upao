// src/app/(auth)/login/page.tsx
// Página de inicio de sesión

import { LoginForm } from '@/components/auth/LoginForm'
// Image import removed — no se está usando en este archivo

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Título */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            MedMind
          </h1>
          <p className="text-gray-600">
            Plataforma educativa para estudiantes de medicina
          </p>
        </div>

        {/* Formulario de Login */}
        <LoginForm />

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2026 MedMind</p>
          <p className="mt-1">Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  )
}

// Metadata de la página
export const metadata = {
  title: 'Login | MedMind',
  description: 'Inicia sesión en la plataforma educativa de MedMind',
}