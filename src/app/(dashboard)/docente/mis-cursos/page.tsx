
// src/app/(dashboard)/docente/mis-cursos/page.tsx
// Vista de cursos para docentes

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Video, Users } from 'lucide-react'
import { toast } from 'sonner'
import type { Course } from '@/types'

interface CourseWithStats extends Course {
  video_count: number
  student_count: number
}

export default function DocenteCursosPage() {
  const [courses, setCourses] = useState<CourseWithStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)

      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Cargar todos los cursos activos
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .eq('active', true)
        .order('cycle')
        .order('name')

      if (!coursesData) return

      // Cargar videos del docente
      const { data: videosData } = await supabase
        .from('videos')
        .select('id, course_id')
        .eq('uploaded_by', user.id)

      // Cargar inscripciones
      const { data: enrollmentsData } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('active', true)

      // Calcular estadísticas
      const coursesWithStats: CourseWithStats[] = (coursesData as any[]).map((course: any) => {
        const videoCount = (videosData as any[] || []).filter((v: any) => v.course_id === course.id).length
        const studentCount = (enrollmentsData as any[] || []).filter((e: any) => e.course_id === course.id).length

        return {
          ...course,
          video_count: videoCount,
          student_count: studentCount,
        }
      })

      setCourses(coursesWithStats)
    } catch (error) {
      console.error('Error al cargar cursos:', error)
      toast.error('Error al cargar cursos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Cursos</h1>
        <p className="text-gray-600 mt-2">
          Gestiona el contenido de cada curso
        </p>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {courses.length}
            </div>
            <p className="text-sm text-gray-600">Cursos Disponibles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {courses.reduce((sum, c) => sum + c.video_count, 0)}
            </div>
            <p className="text-sm text-gray-600">Videos Totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {courses.reduce((sum, c) => sum + c.student_count, 0)}
            </div>
            <p className="text-sm text-gray-600">Estudiantes Inscritos</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid de cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Cargando cursos...
          </div>
        ) : courses.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No hay cursos disponibles
          </div>
        ) : (
          courses.map((course) => (
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
                  <Badge className="bg-white/20 text-white border-white/30">
                    Ciclo {course.cycle}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {/* Estadísticas */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Video className="h-4 w-4" />
                      <span>Videos:</span>
                    </div>
                    <span className="font-medium">{course.video_count}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Estudiantes:</span>
                    </div>
                    <span className="font-medium">{course.student_count}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <BookOpen className="h-4 w-4" />
                      <span>Créditos:</span>
                    </div>
                    <span className="font-medium">{course.credits || 'N/A'}</span>
                  </div>

                  {/* Descripción */}
                  {course.description && (
                    <p className="text-gray-600 text-xs mt-2 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}