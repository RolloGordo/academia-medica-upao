// src/components/auth/LoginForm.tsx
// Formulario de inicio de sesión

'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertCircle } from 'lucide-react'

export function LoginForm() {
  const { login, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validaciones básicas
    if (!email || !password) {
      setError('Por favor completa todos los campos')
      return
    }

    if (!email.endsWith('@upao.edu.pe')) {
      setError('Debes usar tu correo institucional de UPAO')
      return
    }

    // Intentar login
    const result = await login(email, password)

    if (!result.success) {
      setError(result.error || 'Error al iniciar sesión')
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Iniciar Sesión
        </CardTitle>
        <CardDescription className="text-center">
          Ingresa con tu correo institucional de UPAO
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mensaje de error */}
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Campo de Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Correo Institucional</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu.nombre@upao.edu.pe"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              autoComplete="email"
              className="w-full"
            />
          </div>

          {/* Campo de Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              autoComplete="current-password"
              className="w-full"
            />
          </div>

          {/* Botón de Login */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
        </form>

        {/* Información adicional */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>¿Problemas para acceder?</p>
          <p className="mt-1">
            Contacta al administrador
          </p>
        </div>
      </CardContent>
    </Card>
  )
}