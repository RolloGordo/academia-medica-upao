// src/components/admin/CreateUserDialog.tsx
// Diálogo para crear nuevos usuarios

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import type { Course } from '@/types'

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateUserDialog({ open, onOpenChange, onSuccess }: CreateUserDialogProps) {
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'estudiante' as 'admin' | 'docente' | 'estudiante',
  })

  useEffect(() => {
    if (open) {
      loadCourses()
    }
  }, [open])

  const loadCourses = async () => {
    const { data } = await supabase
      .from('courses')
      .select('id, name, code, color')
      .eq('active', true)
      .order('name')
    
    setCourses((data as any) || [])
  }

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validaciones
      if (!formData.email.endsWith('@upao.edu.pe')) {
        toast.error('El email debe ser institucional (@upao.edu.pe)')
        return
      }

      if (formData.password.length < 6) {
        toast.error('La contraseña debe tener al menos 6 caracteres')
        return
      }

      if (formData.role === 'docente' && selectedCourses.length === 0) {
        toast.error('Debes seleccionar al menos un curso para el docente')
        return
      }

      // Llamar a la API para crear el usuario
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          selectedCourses: formData.role === 'docente' ? selectedCourses : [],
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear usuario')
      }

      toast.success('Usuario creado correctamente')
      
      // Resetear formulario
      setFormData({
        email: '',
        password: '',
        fullName: '',
        role: 'estudiante',
      })
      setSelectedCourses([])
      
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      console.error('Error al crear usuario:', error)
      toast.error(error.message || 'Error al crear usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value as any })
    // Limpiar cursos seleccionados si cambia a no-docente
    if (value !== 'docente') {
      setSelectedCourses([])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Registra un nuevo estudiante, docente o administrador en la plataforma
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Nombre completo */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                placeholder="Ej: Juan Pérez García"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Institucional</Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre.apellido@upao.edu.pe"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Debe ser un correo institucional de UPAO
              </p>
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            {/* Rol */}
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={formData.role}
                onValueChange={handleRoleChange}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="estudiante">Estudiante</SelectItem>
                  <SelectItem value="docente">Docente</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Asignación de cursos (solo para docentes) */}
            {formData.role === 'docente' && (
              <div className="space-y-2">
                <Label>Cursos Asignados *</Label>
                <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-2">
                  {courses.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay cursos disponibles</p>
                  ) : (
                    courses.map((course) => (
                      <div key={course.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={course.id}
                          checked={selectedCourses.includes(course.id)}
                          onCheckedChange={() => handleCourseToggle(course.id)}
                          disabled={loading}
                        />
                        <label
                          htmlFor={course.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: course.color || '#3B82F6' }}
                          />
                          {course.name} ({course.code})
                        </label>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Selecciona los cursos que este docente podrá gestionar
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Usuario'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}