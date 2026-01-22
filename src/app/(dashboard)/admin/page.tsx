// src/app/(dashboard)/admin/page.tsx
// Dashboard principal del administrador

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { Users, BookOpen, Video, UserCog } from 'lucide-react'

interface DashboardStats {
  totalStudents: number
  totalCourses: number
  totalVideos: number
  activeEnrollments: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalCourses: 0,
    totalVideos: 0,
    activeEnrollments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)

      // Usar Promise.all para hacer todas las consultas en paralelo
      const [studentsResult, coursesResult, videosResult, enrollmentsResult] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'estudiante')
          .eq('active', true),
        
        supabase
          .from('courses')
          .select('id', { count: 'exact', head: true })
          .eq('active', true),
        
        supabase
          .from('videos')
          .select('id', { count: 'exact', head: true })
          .eq('active', true),
        
        supabase
          .from('enrollments')
          .select('id', { count: 'exact', head: true })
          .eq('active', true)
      ])

      setStats({
        totalStudents: studentsResult.count || 0,
        totalCourses: coursesResult.count || 0,
        totalVideos: videosResult.count || 0,
        activeEnrollments: enrollmentsResult.count || 0,
      })
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: 'Estudiantes Activos',
      value: stats.totalStudents,
      description: 'Total de estudiantes registrados',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Cursos Disponibles',
      value: stats.totalCourses,
      description: 'Cursos activos en la plataforma',
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Videos Subidos',
      value: stats.totalVideos,
      description: 'Total de videos disponibles',
      icon: Video,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Inscripciones Activas',
      value: stats.activeEnrollments,
      description: 'Estudiantes inscritos actualmente',
      icon: UserCog,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bienvenido al panel de administración de SynaMed
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accede a las funciones más utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Users className="h-6 w-6 text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Crear Usuario</h3>
              <p className="text-sm text-gray-600 mt-1">
                Registrar nuevo estudiante o docente
              </p>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Video className="h-6 w-6 text-purple-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Subir Video</h3>
              <p className="text-sm text-gray-600 mt-1">
                Agregar nuevo contenido educativo
              </p>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <UserCog className="h-6 w-6 text-orange-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Gestionar Inscripciones</h3>
              <p className="text-sm text-gray-600 mt-1">
                Asignar cursos a estudiantes
              </p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}