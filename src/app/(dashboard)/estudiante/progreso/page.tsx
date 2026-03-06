// src/app/(dashboard)/estudiante/mi-progreso/page.tsx
// Página Mi Progreso - Diseño MedMind

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase/client'
import { 
  TrendingUp,
  BookOpen,
  Clock,
  CheckCircle2,
  Video,
  Award,
  Target,
  Calendar,
  Zap,
  BarChart3
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface CourseProgress {
  id: string
  name: string
  code: string
  color: string
  total_videos: number
  completed_videos: number
  progress_percentage: number
  total_duration: number
  watched_duration: number
}

interface ActivityDay {
  date: string
  videos_watched: number
  time_spent: number
}

interface Stats {
  total_courses: number
  completed_courses: number
  total_videos: number
  completed_videos: number
  total_hours: number
  current_streak: number
  best_streak: number
  videos_this_week: number
}

export default function MiProgresoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    total_courses: 0,
    completed_courses: 0,
    total_videos: 0,
    completed_videos: 0,
    total_hours: 0,
    current_streak: 0,
    best_streak: 0,
    videos_this_week: 0
  })
  const [coursesProgress, setCoursesProgress] = useState<CourseProgress[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityDay[]>([])

  useEffect(() => {
    loadProgressData()
  }, [])

  const loadProgressData = async () => {
    try {
      setLoading(true)

      const { data: userData } = await supabase.auth.getUser() as any
      const user = userData?.user
      if (!user) {
        router.push('/login')
        return
      }

      // Obtener cursos del estudiante
      const { data: enrollmentsData } = await ((supabase
        .from('enrollments') as any)
        .select(`
          course_id,
          courses (
            id,
            name,
            code,
            color
          )
        `)
        .eq('user_id', user.id)
        .eq('active', true)) as any

      const courseIds = (enrollmentsData || []).map((e: any) => e.course_id)

      if (courseIds.length === 0) {
        setLoading(false)
        return
      }

      // Obtener videos de esos cursos
      const { data: videosData } = await ((supabase
        .from('videos') as any)
        .select('*')
        .in('course_id', courseIds)
        .eq('active', true)) as any

      // Obtener todo el progreso del estudiante
      const { data: progressData } = await ((supabase
        .from('progress') as any)
        .select('*')
        .eq('user_id', user.id)) as any

      // Calcular progreso por curso
      const courseProgressMap: { [key: string]: CourseProgress } = {}

      enrollmentsData?.forEach((enrollment: any) => {
        const course = enrollment.courses
        const courseVideos = (videosData || []).filter((v: any) => v.course_id === course.id)
        const completedInCourse = (progressData || []).filter((p: any) => {
          const video = courseVideos.find((v: any) => v.id === p.video_id)
          return video && p.completed
        })

        const totalDuration = courseVideos.reduce((sum: number, v: any) => sum + (v.duration || 0), 0)
        const watchedDuration = (progressData || [])
          .filter((p: any) => courseVideos.some((v: any) => v.id === p.video_id))
          .reduce((sum: number, p: any) => sum + (p.watch_time || 0), 0)

        const progressPercentage = courseVideos.length > 0
          ? Math.round((completedInCourse.length / courseVideos.length) * 100)
          : 0

        courseProgressMap[course.id] = {
          id: course.id,
          name: course.name,
          code: course.code,
          color: course.color || '#6B46C1',
          total_videos: courseVideos.length,
          completed_videos: completedInCourse.length,
          progress_percentage: progressPercentage,
          total_duration: totalDuration,
          watched_duration: watchedDuration
        }
      })

      const coursesProgressArray = Object.values(courseProgressMap)
      setCoursesProgress(coursesProgressArray)

      // Calcular estadísticas generales
      const totalVideos = videosData?.length || 0
      const completedVideos = (progressData || []).filter((p: any) => p.completed).length
      const totalHours = Math.round((progressData || []).reduce((sum: number, p: any) => 
        sum + (p.watch_time || 0), 0) / 3600)
      const completedCourses = coursesProgressArray.filter(c => c.progress_percentage === 100).length

      // Calcular racha (simplificado - últimos 7 días con actividad)
      const today = new Date()
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        return date.toISOString().split('T')[0]
      })

      const activityByDay = last7Days.map(date => {
        const dayProgress = (progressData || []).filter((p: any) => {
          if (!p.last_watched_at) return false
          const progressDate = new Date(p.last_watched_at).toISOString().split('T')[0]
          return progressDate === date
        })
        return {
          date,
          videos_watched: dayProgress.length,
          time_spent: dayProgress.reduce((sum: number, p: any) => sum + (p.watch_time || 0), 0)
        }
      }).reverse()

      setRecentActivity(activityByDay)

      // Calcular racha actual
      let currentStreak = 0
      for (let i = activityByDay.length - 1; i >= 0; i--) {
        if (activityByDay[i].videos_watched > 0) {
          currentStreak++
        } else {
          break
        }
      }

      // Videos esta semana
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const videosThisWeek = (progressData || []).filter((p: any) => {
        if (!p.last_watched_at) return false
        return new Date(p.last_watched_at) >= weekAgo
      }).length

      setStats({
        total_courses: courseIds.length,
        completed_courses: completedCourses,
        total_videos: totalVideos,
        completed_videos: completedVideos,
        total_hours: totalHours,
        current_streak: currentStreak,
        best_streak: Math.max(currentStreak, 3), // Simplificado
        videos_this_week: videosThisWeek
      })

    } catch (error) {
      console.error('Error al cargar progreso:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-solid border-[#6B46C1] border-r-transparent animate-spin" />
            <div className="absolute inset-0 rounded-full bg-[#6B46C1] opacity-20 animate-ping" />
          </div>
          <p className="mt-6 text-lg text-gray-700 font-medium">Cargando tu progreso...</p>
        </div>
      </div>
    )
  }

  // Datos para gráfica de barras
  const chartData = coursesProgress.map(course => ({
    name: course.code,
    completados: course.completed_videos,
    total: course.total_videos,
    progreso: course.progress_percentage
  }))

  // Datos para gráfica de pie (general)
  const pieData = [
    { name: 'Completados', value: stats.completed_videos, color: '#10B981' },
    { name: 'Pendientes', value: stats.total_videos - stats.completed_videos, color: '#E5E7EB' }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo animado */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50" />
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-[#6B46C1] to-[#5BC0EB] rounded-2xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Progreso</h1>
          </div>
          <p className="text-gray-600 ml-16">
            Visualiza tu avance y estadísticas de aprendizaje
          </p>
        </div>

        {/* Stats Cards */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          {[
            {
              label: 'Videos Completados',
              value: `${stats.completed_videos}/${stats.total_videos}`,
              icon: CheckCircle2,
              color: 'from-green-500 to-green-600',
              bgColor: 'bg-green-50'
            },
            {
              label: 'Horas de Estudio',
              value: `${stats.total_hours}h`,
              icon: Clock,
              color: 'from-blue-500 to-blue-600',
              bgColor: 'bg-blue-50'
            },
            {
              label: 'Cursos Activos',
              value: `${stats.total_courses}`,
              icon: BookOpen,
              color: 'from-purple-500 to-purple-600',
              bgColor: 'bg-purple-50'
            },
            {
              label: 'Racha Actual',
              value: `${stats.current_streak} día${stats.current_streak !== 1 ? 's' : ''}`,
              icon: Zap,
              color: 'from-orange-500 to-orange-600',
              bgColor: 'bg-orange-50'
            }
          ].map((stat, index) => (
            <Card
              key={stat.label}
              className="bg-white/80 backdrop-blur-sm border-2 border-gray-100 hover:border-[#6B46C1] hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfica de progreso por curso */}
          <Card 
            className="bg-white/80 backdrop-blur-sm border-2 border-gray-100 animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#6B46C1]" />
                Progreso por Curso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="completados" fill="#6B46C1" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="total" fill="#E5E7EB" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#6B46C1]" />
                  <span className="text-gray-600">Completados</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                  <span className="text-gray-600">Total</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumen general */}
          <Card 
            className="bg-white/80 backdrop-blur-sm border-2 border-gray-100 animate-fade-in-up"
            style={{ animationDelay: '250ms' }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[#6B46C1]" />
                Resumen General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-6">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Videos Completados</span>
                  <span className="text-lg font-bold text-green-600">{stats.completed_videos}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Videos Pendientes</span>
                  <span className="text-lg font-bold text-gray-600">{stats.total_videos - stats.completed_videos}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Porcentaje General</span>
                  <span className="text-lg font-bold text-[#6B46C1]">
                    {stats.total_videos > 0 
                      ? Math.round((stats.completed_videos / stats.total_videos) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progreso detallado por curso */}
        <Card 
          className="bg-white/80 backdrop-blur-sm border-2 border-gray-100 mb-8 animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#6B46C1]" />
              Detalle por Curso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {coursesProgress.map((course, index) => (
                <div 
                  key={course.id}
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => router.push(`/estudiante/curso/${course.id}`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge 
                        className="text-white border-0"
                        style={{ backgroundColor: course.color }}
                      >
                        {course.code}
                      </Badge>
                      <span className="font-semibold text-gray-900">{course.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#6B46C1]">
                        {course.progress_percentage}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {course.completed_videos}/{course.total_videos} videos
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={course.progress_percentage} 
                    className="h-2"
                    style={{
                      ['--progress-background' as any]: course.color
                    }}
                  />
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{formatTime(course.watched_duration)} estudiados</span>
                    <span>{formatTime(course.total_duration)} total</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actividad reciente */}
        <Card 
          className="bg-white/80 backdrop-blur-sm border-2 border-gray-100 animate-fade-in-up"
          style={{ animationDelay: '350ms' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#6B46C1]" />
              Actividad de la Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {recentActivity.map((day, index) => (
                <div
                  key={day.date}
                  className="text-center"
                >
                  <div className="text-xs text-gray-500 mb-2">
                    {formatDate(day.date)}
                  </div>
                  <div 
                    className={`
                      h-20 rounded-lg flex flex-col items-center justify-center
                      ${day.videos_watched > 0 
                        ? 'bg-gradient-to-br from-[#6B46C1] to-[#5BC0EB] text-white' 
                        : 'bg-gray-100 text-gray-400'
                      }
                    `}
                  >
                    <Video className="h-5 w-5 mb-1" />
                    <span className="text-lg font-bold">{day.videos_watched}</span>
                  </div>
                  {day.time_spent > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {formatTime(day.time_spent)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}