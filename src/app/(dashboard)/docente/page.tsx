// src/app/(dashboard)/docente/page.tsx
// Dashboard principal del docente

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { BookOpen, Video, Users, TrendingUp } from 'lucide-react'
import type { Course, Video as VideoType } from '@/types'

interface CourseWithStats extends Course {
  video_count: number
  student_count: number
}

export default function DocenteDashboard() {
  const [courses, setCourses] = useState<CourseWithStats[]>([])
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalVideos: 0,
    totalStudents: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Cargar asignaciones de cursos del docente
      const { data: assignmentsData } = await supabase
        .from('teacher_assignments')
        .select('course_id')
        .eq('teacher_id', user.id)
        .eq('active', true)

      const assignedCourseIds = (assignmentsData as any[] || []).map((a: any) => a.course_id)

      // Si no tiene cursos asignados, mostrar mensaje
      if (assignedCourseIds.length === 0) {
        setCourses([])
        setStats({ totalCourses: 0, totalVideos: 0, totalStudents: 0 })
        setLoading(false)
        return
      }

      // Cargar solo los cursos asignados al docente
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .in('id', assignedCourseIds)
        .eq('active', true)

      if (!coursesData) return

      // Cargar videos del docente
      const { data: videosData } = await supabase
        .from('videos')
        .select('id, course_id')
        .eq('uploaded_by', user.id)

      // Cargar inscripciones solo de sus cursos
      const { data: enrollmentsData } = await supabase
        .from('enrollments')
        .select('course_id, user_id')
        .in('course_id', assignedCourseIds)
        .eq('active', true)

      // Calcular estadísticas por curso
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

      // Calcular totales
      const uniqueStudents = new Set((enrollmentsData as any[] || []).map((e: any) => e.user_id)).size
      
      setStats({
        totalCourses: coursesWithStats.length,
        totalVideos: (videosData as any[] || []).length,
        totalStudents: uniqueStudents,
      })
    } catch (error) {
      console.error('Error al cargar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: 'Cursos Activos',
      value: stats.totalCourses,
      description: 'Cursos disponibles',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Videos Subidos',
      value: stats.totalVideos,
      description: 'Total de contenido',
      icon: Video,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Estudiantes',
      value: stats.totalStudents,
      description: 'Total en mis cursos',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Docente</h1>
        <p className="text-gray-600 mt-2">
          Bienvenido, gestiona tus cursos y contenido
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading ? '...' : stat.value}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Mis cursos */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Cursos Asignados</CardTitle>
          <CardDescription>
            Cursos que te han sido asignados para gestionar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando cursos...</div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No tienes cursos asignados</p>
              <p className="text-sm text-gray-500 mt-2">
                Contacta al administrador para que te asigne cursos
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div
                    className="h-24 p-4 flex items-center"
                    style={{ backgroundColor: course.color || '#3B82F6' }}
                  >
                    <h3 className="text-white font-semibold text-lg">
                      {course.name}
                    </h3>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Videos:</span>
                      <span className="font-medium">{course.video_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Estudiantes:</span>
                      <span className="font-medium">{course.student_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Código:</span>
                      <span className="font-medium">{course.code}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accede a las funciones más utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/docente/videos"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors block"
            >
              <Video className="h-6 w-6 text-purple-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Subir Video</h3>
              <p className="text-sm text-gray-600 mt-1">
                Agregar nuevo contenido educativo
              </p>
            </a>

            <a
              href="/docente/mis-cursos"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors block"
            >
              <BookOpen className="h-6 w-6 text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Ver Mis Cursos</h3>
              <p className="text-sm text-gray-600 mt-1">
                Gestionar contenido por curso
              </p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}