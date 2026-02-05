// src/app/(dashboard)/admin/inscripciones/page.tsx
// Gestión de inscripciones de estudiantes a cursos

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Trash2, Calendar, UserCheck } from 'lucide-react'
import { CreateEnrollmentDialog } from '@/components/admin/CreateEnrollmentDialog'
import { toast } from 'sonner'
import type { Enrollment, UserProfile, Course } from '@/types'
import { formatDate, getDaysRemaining } from '@/lib/utils'

interface EnrollmentWithDetails extends Enrollment {
  student?: UserProfile
  course?: Course
}

export default function InscripcionesPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([])
  const [filteredEnrollments, setFilteredEnrollments] = useState<EnrollmentWithDetails[]>([])
  const [students, setStudents] = useState<UserProfile[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Filtrar inscripciones
    let filtered = enrollments

    if (searchTerm) {
      filtered = filtered.filter(enrollment =>
        enrollment.student?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.course?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus === 'active') {
      filtered = filtered.filter(e => e.active && new Date(e.expires_at) > new Date())
    } else if (filterStatus === 'expired') {
      filtered = filtered.filter(e => !e.active || new Date(e.expires_at) <= new Date())
    }

    setFilteredEnrollments(filtered)
  }, [searchTerm, filterStatus, enrollments])

  const loadData = async () => {
    try {
      setLoading(true)

      // Cargar estudiantes
      const { data: studentsData } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, role')
        .eq('role', 'estudiante')
        .eq('active', true)
        .order('full_name')

      setStudents((studentsData as any) || [])

      // Cargar cursos
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, name, code, color, cycle')
        .eq('active', true)
        .order('name')

      setCourses((coursesData as any) || [])

      // Cargar inscripciones
      const { data: enrollmentsData, error } = await supabase
        .from('enrollments')
        .select('*')
        .order('enrolled_at', { ascending: false })

      if (error) throw error

      // Mapear datos manualmente
      const typedEnrollments = (enrollmentsData as any[]) || []
      const typedStudents = (studentsData as any[]) || []
      const typedCourses = (coursesData as any[]) || []

      const enrollmentsWithDetails: EnrollmentWithDetails[] = typedEnrollments.map((enrollment) => ({
        id: enrollment.id,
        user_id: enrollment.user_id,
        course_id: enrollment.course_id,
        enrolled_at: enrollment.enrolled_at,
        expires_at: enrollment.expires_at,
        payment_verified: enrollment.payment_verified,
        active: enrollment.active,
        created_by: enrollment.created_by,
        notes: enrollment.notes,
        student: typedStudents.find(s => s.id === enrollment.user_id),
        course: typedCourses.find(c => c.id === enrollment.course_id),
      }))

      setEnrollments(enrollmentsWithDetails)
      setFilteredEnrollments(enrollmentsWithDetails)
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast.error('Error al cargar inscripciones')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEnrollment = async (enrollmentId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta inscripción?')) {
      return
    }

    try {
      const { error } = await (supabase
        .from('enrollments') as any)
        .delete()
        .eq('id', enrollmentId)

      if (error) throw error

      toast.success('Inscripción eliminada correctamente')
      loadData()
    } catch (error) {
      console.error('Error al eliminar inscripción:', error)
      toast.error('Error al eliminar inscripción')
    }
  }

  const toggleEnrollmentStatus = async (enrollmentId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus

      const { error } = await (supabase
        .from('enrollments') as any)
        .update({ active: newStatus })
        .eq('id', enrollmentId)

      if (error) throw error

      toast.success(`Inscripción ${newStatus ? 'activada' : 'desactivada'} correctamente`)
      loadData()
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      toast.error('Error al cambiar estado de la inscripción')
    }
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) <= new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Inscripciones</h1>
          <p className="text-gray-600 mt-2">
            Asigna cursos a estudiantes y gestiona sus accesos
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Inscripción
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por estudiante o curso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="border rounded-md px-3 py-2 bg-white"
            >
              <option value="all">Todas</option>
              <option value="active">Activas</option>
              <option value="expired">Expiradas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {enrollments.length}
            </div>
            <p className="text-sm text-gray-600">Total Inscripciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {enrollments.filter(e => e.active && !isExpired(e.expires_at)).length}
            </div>
            <p className="text-sm text-gray-600">Activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {enrollments.filter(e => !isExpired(e.expires_at) && getDaysRemaining(e.expires_at) <= 7).length}
            </div>
            <p className="text-sm text-gray-600">Por Vencer (7 días)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {enrollments.filter(e => isExpired(e.expires_at)).length}
            </div>
            <p className="text-sm text-gray-600">Expiradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de inscripciones */}
      <Card>
        <CardHeader>
          <CardTitle>Inscripciones ({filteredEnrollments.length})</CardTitle>
          <CardDescription>
            Lista de todas las inscripciones de estudiantes a cursos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando inscripciones...</div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No se encontraron inscripciones' : 'No hay inscripciones registradas'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Estudiante</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Curso</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Fecha Inscripción</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Expira</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnrollments.map((enrollment) => {
                    const expired = isExpired(enrollment.expires_at)
                    const daysRemaining = getDaysRemaining(enrollment.expires_at)
                    const expiringSoon = daysRemaining <= 7 && daysRemaining > 0

                    return (
                      <tr key={enrollment.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {enrollment.student?.full_name || 'Sin nombre'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {enrollment.student?.email || 'Sin email'}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: enrollment.course?.color || '#3B82F6' }}
                            />
                            <span className="font-medium">
                              {enrollment.course?.name || 'Sin curso'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {formatDate(enrollment.enrolled_at)}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-gray-900">
                              {formatDate(enrollment.expires_at)}
                            </p>
                            {!expired && (
                              <p className={`text-xs ${expiringSoon ? 'text-orange-600' : 'text-gray-500'}`}>
                                {daysRemaining} días restantes
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              enrollment.active && !expired
                                ? 'default'
                                : 'secondary'
                            }
                            className={
                              expiringSoon && enrollment.active
                                ? 'bg-orange-100 text-orange-800'
                                : ''
                            }
                          >
                            {expired ? 'Expirada' : enrollment.active ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleEnrollmentStatus(enrollment.id, enrollment.active)}
                              title={enrollment.active ? 'Desactivar' : 'Activar'}
                            >
                              {enrollment.active ? '🔒' : '🔓'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEnrollment(enrollment.id)}
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para crear inscripción */}
      <CreateEnrollmentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        students={students}
        courses={courses}
        onSuccess={loadData}
      />
    </div>
  )
}