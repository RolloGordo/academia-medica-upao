// src/app/(dashboard)/admin/cursos/page.tsx
// Gestión de cursos

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Pencil, Trash2, BookOpen } from 'lucide-react'
import { CreateCourseDialog } from '@/components/admin/CreateCourseDialog'
import { EditCourseDialog } from '@/components/admin/EditCourseDialog'
import { toast } from 'sonner'
import type { Course } from '@/types'

export default function CursosPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  useEffect(() => {
    loadCourses()
  }, [])

  useEffect(() => {
    // Filtrar cursos según búsqueda
    const filtered = courses.filter(course =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredCourses(filtered)
  }, [searchTerm, courses])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('cycle', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      setCourses(data || [])
      setFilteredCourses(data || [])
    } catch (error) {
      console.error('Error al cargar cursos:', error)
      toast.error('Error al cargar cursos')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('¿Estás seguro de eliminar este curso? Esta acción eliminará también todos sus videos.')) {
      return
    }

    try {
      const { error } = await (supabase
        .from('courses') as any)
        .delete()
        .eq('id', courseId)

      if (error) throw error

      toast.success('Curso eliminado correctamente')
      loadCourses()
    } catch (error) {
      console.error('Error al eliminar curso:', error)
      toast.error('Error al eliminar curso')
    }
  }

  const toggleCourseStatus = async (courseId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus

      const { error } = await (supabase
        .from('courses') as any)
        .update({ active: newStatus })
        .eq('id', courseId)

      if (error) throw error

      toast.success(`Curso ${newStatus ? 'activado' : 'desactivado'} correctamente`)
      loadCourses()
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      toast.error('Error al cambiar estado del curso')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Cursos</h1>
          <p className="text-gray-600 mt-2">
            Administra los cursos disponibles en la plataforma
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Crear Curso
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {courses.filter(c => c.active).length}
            </div>
            <p className="text-sm text-gray-600">Cursos Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {courses.filter(c => c.cycle === 2).length}
            </div>
            <p className="text-sm text-gray-600">Segundo Ciclo</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {courses.filter(c => c.cycle === 1).length}
            </div>
            <p className="text-sm text-gray-600">Primer Ciclo</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid de cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Cargando cursos...
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            {searchTerm ? 'No se encontraron cursos' : 'No hay cursos registrados'}
          </div>
        ) : (
          filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader
                className="pb-3"
                style={{ backgroundColor: course.color || '#3B82F6' }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg">
                      {course.name}
                    </CardTitle>
                    <p className="text-white/90 text-sm mt-1">
                      {course.code}
                    </p>
                  </div>
                  <Badge
                    variant={course.active ? 'default' : 'secondary'}
                    className="bg-white/20 text-white border-white/30"
                  >
                    {course.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ciclo:</span>
                    <span className="font-medium">
                      {course.cycle === 1 ? 'Primer Ciclo' : 'Segundo Ciclo'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Créditos:</span>
                    <span className="font-medium">{course.credits || 'N/A'}</span>
                  </div>
                  {course.description && (
                    <p className="text-gray-600 text-xs mt-2 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setEditingCourse(course)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleCourseStatus(course.id, course.active)}
                  >
                    {course.active ? '🔒' : '🔓'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialogs */}
      <CreateCourseDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={loadCourses}
      />

      {editingCourse && (
        <EditCourseDialog
          course={editingCourse}
          open={!!editingCourse}
          onOpenChange={(open) => !open && setEditingCourse(null)}
          onSuccess={loadCourses}
        />
      )}
    </div>
  )
}