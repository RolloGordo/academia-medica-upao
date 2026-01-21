// src/app/not-found.tsx
// Página 404 - No encontrado

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-900">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mt-4 mb-2">
          Página no encontrada
        </h2>
        <p className="text-gray-600 mb-8">
          La página que buscas no existe o ha sido movida.
        </p>
        <Button asChild>
          <Link href="/login">
            Volver al inicio
          </Link>
        </Button>
      </div>
    </div>
  )
}