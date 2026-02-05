// src/components/admin/CreateEnrollmentDialog.tsx
// Diálogo para inscribir estudiantes a cursos

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
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
import { calculateExpirationDate } from '@/lib/utils'
import type { UserProfile, Course } from '@/types'

interface CreateEnrollmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  students: UserProfile[]
  courses: Course[]
  onSuccess: () => void
}

export function CreateEnrollmentDialog({
  open,
  onOpenChange,
  students,
  courses,
  onSuccess,
}: CreateEnrollmentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    weeks: 14, // Duración típica de un ciclo académico
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.studentId || !formData.courseId) {
        toast.error('Debes seleccionar un estudiante y un curso')
        return
      }

      // Verificar si ya existe una inscripción activa
      const { data: existing } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', formData.studentId)
        .eq('course_id', formData.courseId)
        .eq('active', true)
        .single()

      if (existing) {
        toast.error('Este estudiante ya está inscrito en este curso')
        return
      }

      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()

      // Calcular fecha de expiración
      const expiresAt = calculateExpirationDate(formData.weeks)

      // Crear inscripción
      const { error } = await (supabase
        .from('enrollments') as any)
        .insert({
          user_id: formData.studentId,
          course_id: formData.courseId,
          expires_at: expiresAt.toISOString(),
          payment_verified: false,
          active: true,
          created_by: user?.id,
          notes: formData.notes || null,
        })

      if (error) throw error

      toast.success('Inscripción creada correctamente')
      
      // Resetear formulario
      setFormData({
        studentId: '',
        courseId: '',
        weeks: 14,
        notes: '',
      })
      
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      console.error('Error al crear inscripción:', error)
      toast.error(error.message || 'Error al crear inscripción')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nueva Inscripción</DialogTitle>
          <DialogDescription>
            Inscribe a un estudiante en un curso
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Estudiante */}
            <div className="space-y-2">
              <Label htmlFor="student">Estudiante *</Label>
              <Select
                value={formData.studentId}
                onValueChange={(value) => setFormData({ ...formData, studentId: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estudiante" />
                </SelectTrigger>
                <SelectContent>
                  {students.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No hay estudiantes disponibles
                    </SelectItem>
                  ) : (
                    students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name} ({student.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Curso */}
            <div className="space-y-2">
              <Label htmlFor="course">Curso *</Label>
              <Select
                value={formData.courseId}
                onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No hay cursos disponibles
                    </SelectItem>
                  ) : (
                    courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: course.color || '#3B82F6' }}
                          />
                          {course.name}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Duración */}
            <div className="space-y-2">
              <Label htmlFor="weeks">Duración (semanas)</Label>
              <Input
                id="weeks"
                type="number"
                min="1"
                max="52"
                value={formData.weeks}
                onChange={(e) => setFormData({ ...formData, weeks: parseInt(e.target.value) })}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Típicamente 14 semanas por ciclo académico
              </p>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Input
                id="notes"
                placeholder="Información adicional..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                disabled={loading}
              />
            </div>

            {/* Fecha de expiración calculada */}
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-900">
                <strong>Fecha de expiración:</strong>{' '}
                {calculateExpirationDate(formData.weeks).toLocaleDateString('es-PE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
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
                'Crear Inscripción'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}