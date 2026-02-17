// src/app/(dashboard)/docente/estudiantes/page.tsx
// Vista de estudiantes para docentes - Muestra todos los estudiantes inscritos en sus cursos

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase/client'
import { Search, Users, GraduationCap, BookOpen, TrendingUp } from 'lucide-react'
import type { Course, UserProfile, Enrollment } from '@/types'

interface StudentWithProgress {
  id: string
  email: string
  full_name: string
  courses: {
    id: string
    name: string
    code: string
    color: string
  }[]
  total_videos: number
  completed_videos: number
  progress_percentage: number
  last_activity: string | null
}

export default function DocenteEstudiantesPage() {
  const [students, setStudents] = useState<StudentWithProgress[]>([])
  const [filteredStudents, setFilteredStudents] = useState<StudentWithProgress[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageProgress: 0,
    activeStudents: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [selectedCourse, searchQuery, students])

  const loadData = async () => {
    try {
      setLoading(true)

      // Obtener usuario actual (docente)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Obtener cursos asignados al docente
      const { data: assignmentsData } = await supabase
        .from('teacher_assignments')
        .select('course_id')
        .eq('teacher_id', user.id)
        .eq('active', true)

      const courseIds = (assignmentsData || []).map((a: any) => a.course_id)

      if (courseIds.length === 0) {
        setLoading(false)
        return
      }

      // 2. Obtener información de los cursos
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .in('id', courseIds)
        .eq('active', true)

      setCourses(coursesData || [])

      // 3. Obtener inscripciones activas de estudiantes en esos cursos
      const { data: enrollmentsData } = await supabase
        .from('enrollments')
        .select(`
          user_id,
          course_id,
          courses (
            id,
            name,
            code,
            color
          )
        `)
        .in('course_id', courseIds)
        .eq('active', true)

      // 4. Obtener información de los estudiantes únicos
      const uniqueStudentIds = [...new Set((enrollmentsData || []).map((e: any) => e.user_id))]

      const { data: studentsData } = await supabase
        .from('user_profiles')
        .select('*')
        .in('id', uniqueStudentIds)
        .eq('role', 'estudiante')
        .eq('active', true)

      // 5. Obtener todos los videos de los cursos del docente
      const { data: videosData } = await supabase
        .from('videos')
        .select('id, course_id')
        .in('course_id', courseIds)
        .eq('active', true)

      // 6. Obtener progreso de todos los estudiantes
      const { data: progressData } = await supabase
        .from('progress')
        .select('*')
        .in('user_id', uniqueStudentIds)

      // 7. Procesar datos
      const studentsWithProgress: StudentWithProgress[] = (studentsData || []).map((student: any) => {
        // Cursos en los que está inscrito este estudiante
        const studentEnrollments = (enrollmentsData || []).filter(
          (e: any) => e.user_id === student.id
        )
        const studentCourses = studentEnrollments.map((e: any) => ({
          id: e.courses.id,
          name: e.courses.name,
          code: e.courses.code,
          color: e.courses.color || '#3B82F6',
        }))

        // Videos totales de sus cursos
        const studentCourseIds = studentCourses.map(c => c.id)
        const totalVideos = (videosData || []).filter((v: any) =>
          studentCourseIds.includes(v.course_id)
        ).length

        // Videos que ha completado
        const progressRecords = (progressData || []) as any[]
        const studentProgress = progressRecords.filter(
          (p: any) => p.user_id === student.id && p.completed
        )
        const completedVideos = studentProgress.length

        // Última actividad
        const lastActivity = studentProgress.length > 0
          ? (studentProgress.reduce((latest: any, current: any) => {
              return new Date(current.last_watched_at) > new Date(latest.last_watched_at)
                ? current
                : latest
            }) as any).last_watched_at
          : null

        // Calcular porcentaje
        const progressPercentage = totalVideos > 0
          ? Math.round((completedVideos / totalVideos) * 100)
          : 0

        return {
          id: student.id,
          email: student.email,
          full_name: student.full_name,
          courses: studentCourses,
          total_videos: totalVideos,
          completed_videos: completedVideos,
          progress_percentage: progressPercentage,
          last_activity: lastActivity,
        }
      })

      setStudents(studentsWithProgress)

      // Calcular estadísticas
      const totalStudents = studentsWithProgress.length
      const averageProgress = totalStudents > 0
        ? Math.round(
            studentsWithProgress.reduce((sum, s) => sum + s.progress_percentage, 0) / totalStudents
          )
        : 0

      // Estudiantes activos (que han completado al menos 1 video en los últimos 7 días)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const activeStudents = studentsWithProgress.filter(
        s => s.last_activity && new Date(s.last_activity) >= sevenDaysAgo
      ).length

      setStats({
        totalStudents,
        averageProgress,
        activeStudents,
      })
    } catch (error) {
      console.error('Error al cargar estudiantes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterStudents = () => {
    let filtered = [...students]

    // Filtrar por curso
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(student =>
        student.courses.some(course => course.id === selectedCourse)
      )
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        student =>
          student.full_name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query)
      )
    }

    setFilteredStudents(filtered)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const formatLastActivity = (dateString: string | null) => {
    if (!dateString) return 'Sin actividad'

    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Ayer'
    if (diffDays < 7) return `Hace ${diffDays} días`
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600 bg-green-50'
    if (percentage >= 50) return 'text-blue-600 bg-blue-50'
    if (percentage >= 25) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const statsCards = [
    {
      title: 'Total Estudiantes',
      value: stats.totalStudents,
      description: 'En todos tus cursos',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Progreso Promedio',
      value: `${stats.averageProgress}%`,
      description: 'De todos los estudiantes',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Estudiantes Activos',
      value: stats.activeStudents,
      description: 'Últimos 7 días',
      icon: GraduationCap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Estudiantes</h1>
        <p className="text-gray-600 mt-2">
          Monitorea el progreso de tus estudiantes inscritos
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
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Estudiantes</CardTitle>
          <CardDescription>
            Filtra por curso y busca estudiantes específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Selector de curso */}
            <div className="flex-1">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por curso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los cursos</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Barra de búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabla de estudiantes */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Cargando estudiantes...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">
                No se encontraron estudiantes
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {students.length === 0
                  ? 'Aún no hay estudiantes inscritos en tus cursos'
                  : 'Intenta con otros filtros de búsqueda'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Estudiante</TableHead>
                    <TableHead>Cursos</TableHead>
                    <TableHead className="text-center">Progreso</TableHead>
                    <TableHead className="text-center">Videos</TableHead>
                    <TableHead className="text-right">Última actividad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      {/* Estudiante */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                              {getInitials(student.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">
                              {student.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Cursos */}
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {student.courses.map((course) => (
                            <Badge
                              key={course.id}
                              variant="outline"
                              style={{
                                borderColor: course.color,
                                color: course.color,
                              }}
                            >
                              {course.code}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>

                      {/* Progreso */}
                      <TableCell>
                        <div className="flex flex-col items-center gap-2">
                          <Progress
                            value={student.progress_percentage}
                            className="w-full h-2"
                          />
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${getProgressColor(
                              student.progress_percentage
                            )}`}
                          >
                            {student.progress_percentage}%
                          </span>
                        </div>
                      </TableCell>

                      {/* Videos completados */}
                      <TableCell className="text-center">
                        <div className="font-medium text-gray-900">
                          {student.completed_videos}/{student.total_videos}
                        </div>
                        <div className="text-xs text-gray-500">completados</div>
                      </TableCell>

                      {/* Última actividad */}
                      <TableCell className="text-right">
                        <div className="text-sm text-gray-600">
                          {formatLastActivity(student.last_activity)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Contador de resultados */}
          {!loading && filteredStudents.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Mostrando {filteredStudents.length} de {students.length} estudiantes
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}