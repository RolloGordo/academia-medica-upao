// src/app/(dashboard)/estudiante/page.tsx
// Dashboard principal del estudiante - VERSIÓN MEJORADA con animaciones y fondos dinámicos

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase/client'
import { 
  BookOpen, 
  PlayCircle, 
  Trophy, 
  Clock,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Video,
  Zap
} from 'lucide-react'
import type { Course, Video as VideoType } from '@/types'

interface EnrolledCourse {
  id: string
  name: string
  code: string
  description: string
  color: string
  cycle: number
  total_videos: number
  completed_videos: number
  progress_percentage: number
  last_watched_video: {
    id: string
    title: string
    last_position: number
    duration: number
  } | null
}

interface RecentVideo {
  id: string
  title: string
  course_name: string
  course_color: string
  watched_at: string
  completed: boolean
}

export default function EstudianteDashboard() {
  const router = useRouter()
  const [courses, setCourses] = useState<EnrolledCourse[]>([])
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedVideos: 0,
    totalHours: 0,
    averageProgress: 0,
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      const { data: userData } = await supabase.auth.getUser() as any
      const user = userData?.user
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await ((supabase
        .from('user_profiles') as any)
        .select('full_name')
        .eq('id', user.id)
        .single()) as any

      if (profile) {
        setUserName(profile.full_name)
      }

      const { data: enrollmentsData } = await ((supabase
        .from('enrollments') as any)
        .select(`
          course_id,
          courses (
            id,
            name,
            code,
            description,
            color,
            cycle
          )
        `)
        .eq('user_id', user.id)
        .eq('active', true)
      ) as any

      if (!enrollmentsData || enrollmentsData.length === 0) {
        setLoading(false)
        return
      }

      const courseIds = enrollmentsData.map((e: any) => e.course_id)

      const { data: videosData } = await ((supabase
        .from('videos') as any)
        .select('*')
        .in('course_id', courseIds)
        .eq('active', true)
      ) as any

      const { data: progressData } = await ((supabase
        .from('progress') as any)
        .select('*')
        .eq('user_id', user.id)
      ) as any

      const coursesWithProgress: EnrolledCourse[] = enrollmentsData.map((enrollment: any) => {
        const course = enrollment.courses
        
        const courseVideos = (videosData || []).filter((v: any) => v.course_id === course.id)
        const totalVideos = courseVideos.length

        const courseProgress = (progressData || []).filter((p: any) => 
          courseVideos.some((v: any) => v.id === p.video_id)
        )

        const completedVideos = courseProgress.filter((p: any) => p.completed).length
        const progressPercentage = totalVideos > 0 
          ? Math.round((completedVideos / totalVideos) * 100) 
          : 0

        let lastWatchedVideo = null
        if (courseProgress.length > 0) {
          const lastProgress = courseProgress.reduce((latest: any, current: any) => 
            new Date(current.last_watched_at) > new Date(latest.last_watched_at) 
              ? current 
              : latest
          )

          const videoInfo = courseVideos.find((v: any) => v.id === lastProgress.video_id)
          if (videoInfo) {
            lastWatchedVideo = {
              id: videoInfo.id,
              title: videoInfo.title,
              last_position: lastProgress.last_position || 0,
              duration: videoInfo.duration || 0,
            }
          }
        }

        return {
          id: course.id,
          name: course.name,
          code: course.code,
          description: course.description || '',
          color: course.color || '#6B46C1',
          cycle: course.cycle || 2,
          total_videos: totalVideos,
          completed_videos: completedVideos,
          progress_percentage: progressPercentage,
          last_watched_video: lastWatchedVideo,
        }
      })

      setCourses(coursesWithProgress)

      const recentProgressData = (progressData || [])
        .sort((a: any, b: any) => 
          new Date(b.last_watched_at).getTime() - new Date(a.last_watched_at).getTime()
        )
        .slice(0, 5)

      const recentVideosData: RecentVideo[] = recentProgressData.map((progress: any) => {
        const video = (videosData || []).find((v: any) => v.id === progress.video_id)
        const course = coursesWithProgress.find((c: EnrolledCourse) => 
          (videosData || []).some((v: any) => v.id === progress.video_id && v.course_id === c.id)
        )

        return {
          id: progress.video_id,
          title: video?.title || 'Video',
          course_name: course?.name || 'Curso',
          course_color: course?.color || '#6B46C1',
          watched_at: progress.last_watched_at,
          completed: progress.completed,
        }
      })

      setRecentVideos(recentVideosData)

      const totalCompleted = coursesWithProgress.reduce((sum, c) => sum + c.completed_videos, 0)
      const totalVideos = coursesWithProgress.reduce((sum, c) => sum + c.total_videos, 0)
      const averageProgress = coursesWithProgress.length > 0
        ? Math.round(coursesWithProgress.reduce((sum, c) => sum + c.progress_percentage, 0) / coursesWithProgress.length)
        : 0

      const totalHours = Math.round((totalCompleted * 10) / 60)

      setStats({
        totalCourses: coursesWithProgress.length,
        completedVideos: totalCompleted,
        totalHours,
        averageProgress,
      })

    } catch (error) {
      console.error('Error al cargar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '¡Buenos días'
    if (hour < 19) return '¡Buenas tardes'
    return '¡Buenas noches'
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays === 1) return 'Ayer'
    return `Hace ${diffDays} días`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="relative">
            <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-[#6B46C1] border-r-transparent"></div>
            <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full bg-[#6B46C1] opacity-20"></div>
          </div>
          <p className="mt-6 text-lg text-gray-700 font-medium">Cargando tu espacio de aprendizaje...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo animado con formas orgánicas */}
      <div className="fixed inset-0 -z-10">
        {/* Gradiente base */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50" />
        
        {/* Blobs animados */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
        
        {/* Patrón de puntos */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, #6B46C1 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con saludo personalizado - MEJORADO */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#6B46C1] via-[#8B5FDB] to-[#5BC0EB] rounded-3xl p-8 mb-8 shadow-2xl group">
          {/* Animación de ondas REAL */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute bottom-0 left-0 right-0 h-full">
              <svg className="absolute bottom-0 w-full h-32" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path 
                  fill="white" 
                  fillOpacity="1" 
                  d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                  className="animate-wave"
                />
              </svg>
              <svg className="absolute bottom-0 w-full h-32" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path 
                  fill="white" 
                  fillOpacity="0.5" 
                  d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,112C672,107,768,149,864,165.3C960,181,1056,171,1152,149.3C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                  className="animate-wave-slow"
                />
              </svg>
            </div>
          </div>

          {/* Efecto de brillo al pasar el mouse */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 animate-fade-in-up">
                  {getGreeting()}, {userName.split(' ')[0]}! 👋
                </h1>
                <p className="text-white/90 text-lg md:text-xl animate-fade-in-up animation-delay-200">
                  Continúa tu camino hacia la excelencia médica
                </p>
              </div>
              <div className="hidden md:block animate-bounce-slow">
                <Sparkles className="h-20 w-20 text-[#FDB833]" />
              </div>
            </div>

            {/* Estadísticas rápidas - MEJORADAS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { label: 'Cursos Activos', value: stats.totalCourses, icon: BookOpen, delay: '300' },
                { label: 'Videos Completados', value: stats.completedVideos, icon: Video, delay: '400' },
                { label: 'Horas de Estudio', value: `${stats.totalHours}h`, icon: Clock, delay: '500' },
                { label: 'Progreso General', value: `${stats.averageProgress}%`, icon: TrendingUp, delay: '600' },
              ].map((stat, index) => (
                <div 
                  key={stat.label}
                  className={`bg-white/25 backdrop-blur-md rounded-2xl p-4 border border-white/40 hover:bg-white/35 hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer animate-fade-in-up`}
                  style={{ animationDelay: `${stat.delay}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white/80 text-sm font-medium">{stat.label}</div>
                    <stat.icon className="h-5 w-5 text-white/60" />
                  </div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Continuar viendo - MEJORADO */}
        {courses.some(c => c.last_watched_video) && (
          <div className="mb-8 animate-fade-in-up animation-delay-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#6B46C1] to-[#5BC0EB] rounded-xl">
                  <PlayCircle className="h-6 w-6 text-white" />
                </div>
                Continuar Viendo
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses
                .filter(c => c.last_watched_video)
                .slice(0, 2)
                .map((course, index) => (
                  <Card 
                    key={course.id}
                    className={`group cursor-pointer hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-transparent hover:border-[#6B46C1] hover:-translate-y-2 animate-fade-in-up`}
                    style={{ animationDelay: `${800 + index * 100}ms` }}
                    onClick={() => router.push(`/estudiante/curso/${course.id}/video/${course.last_watched_video?.id}`)}
                  >
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden">
                        {/* Banner del curso con efecto parallax */}
                        <div 
                          className="h-40 flex items-center justify-center relative transition-transform duration-500 group-hover:scale-110"
                          style={{ 
                            background: `linear-gradient(135deg, ${course.color} 0%, ${course.color}CC 100%)`
                          }}
                        >
                          <Video className="h-16 w-16 text-white/80 transition-all duration-500 group-hover:scale-125" />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-500" />
                          
                          {/* Efecto de brillo */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                          </div>
                        </div>

                        {/* Play button overlay con animación */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="bg-white rounded-full p-5 shadow-2xl transform scale-0 group-hover:scale-100 transition-transform duration-300">
                            <PlayCircle className="h-10 w-10 text-[#6B46C1]" />
                          </div>
                        </div>

                        {/* Pulso en el borde */}
                        <div className="absolute inset-0 rounded-t-xl border-4 border-[#6B46C1] opacity-0 group-hover:opacity-100 animate-pulse-border" />
                      </div>

                      <div className="p-6">
                        <Badge 
                          className="mb-3 animate-badge-pop"
                          style={{ 
                            backgroundColor: `${course.color}25`,
                            color: course.color,
                            borderColor: course.color
                          }}
                        >
                          {course.code}
                        </Badge>

                        <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1 group-hover:text-[#6B46C1] transition-colors">
                          {course.name}
                        </h3>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {course.last_watched_video?.title}
                        </p>

                        {course.last_watched_video && course.last_watched_video.duration > 0 && (
                          <div className="mb-4">
                            <Progress 
                              value={(course.last_watched_video.last_position / course.last_watched_video.duration) * 100}
                              className="h-2"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                              <span>
                                {Math.floor(course.last_watched_video.last_position / 60)}:
                                {(course.last_watched_video.last_position % 60).toString().padStart(2, '0')}
                              </span>
                              <span>
                                {Math.floor(course.last_watched_video.duration / 60)}:
                                {(course.last_watched_video.duration % 60).toString().padStart(2, '0')}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-100">
                          <span className="text-gray-600">Progreso del curso</span>
                          <span className="font-bold text-[#6B46C1] text-lg">
                            {course.progress_percentage}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Mis Cursos - MEJORADO */}
        <div className="mb-8 animate-fade-in-up animation-delay-1000">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#6B46C1] to-[#5BC0EB] rounded-xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              Mis Cursos
            </h2>
            <button
              onClick={() => router.push('/estudiante/mis-cursos')}
              className="group text-[#6B46C1] hover:text-[#5BC0EB] font-semibold flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-purple-50 transition-all duration-300"
            >
              Ver todos
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>

          {courses.length === 0 ? (
            <Card className="p-16 text-center bg-white/80 backdrop-blur-sm shadow-xl">
              <div className="inline-flex p-6 bg-purple-100 rounded-full mb-6">
                <BookOpen className="h-16 w-16 text-[#6B46C1]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">
                No tienes cursos asignados
              </h3>
              <p className="text-gray-500 text-lg">
                Contacta al administrador para que te inscriba en tus cursos
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <Card
                  key={course.id}
                  className={`group cursor-pointer hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-gray-100 hover:border-[#6B46C1] hover:-translate-y-3 animate-fade-in-up bg-white/80 backdrop-blur-sm`}
                  style={{ animationDelay: `${1100 + index * 100}ms` }}
                  onClick={() => router.push(`/estudiante/curso/${course.id}`)}
                >
                  <CardContent className="p-0">
                    {/* Banner del curso con patrones animados */}
                    <div 
                      className="h-44 p-6 flex flex-col justify-between relative overflow-hidden"
                      style={{ 
                        background: `linear-gradient(135deg, ${course.color} 0%, ${course.color}DD 50%, ${course.color}BB 100%)`
                      }}
                    >
                      {/* Patrones decorativos animados */}
                      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                      <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white/10 -ml-14 -mb-14 group-hover:scale-150 transition-transform duration-700" />
                      <div className="absolute top-1/2 left-1/2 w-20 h-20 rounded-full bg-white/5 -ml-10 -mt-10 group-hover:rotate-180 transition-transform duration-1000" />

                      {/* Efecto de brillo */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      </div>

                      <div className="relative z-10">
                        <Badge className="bg-white/30 text-white border-white/50 backdrop-blur-sm hover:bg-white/40 transition-colors">
                          {course.code}
                        </Badge>
                      </div>

                      <div className="relative z-10">
                        <h3 className="text-xl font-bold text-white line-clamp-2 group-hover:scale-105 transition-transform duration-300">
                          {course.name}
                        </h3>
                      </div>
                    </div>

                    {/* Información del curso */}
                    <div className="p-6">
                      {/* Progreso con animación */}
                      <div className="mb-5">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-semibold text-gray-700">Progreso</span>
                          <span className="text-sm font-bold text-[#6B46C1] text-xl">
                            {course.progress_percentage}%
                          </span>
                        </div>
                        <div className="relative">
                          <Progress 
                            value={course.progress_percentage} 
                            className="h-3 bg-gray-200"
                          />
                          {/* Brillo en la barra de progreso */}
                          <div 
                            className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-all duration-500"
                            style={{ 
                              width: `${course.progress_percentage}%`,
                              opacity: course.progress_percentage > 0 ? 0.5 : 0
                            }}
                          />
                        </div>
                      </div>

                      {/* Estadísticas */}
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-5 pb-5 border-b border-gray-100">
                        <div className="flex items-center gap-2 group-hover:scale-110 transition-transform duration-300">
                          <Video className="h-4 w-4 text-[#6B46C1]" />
                          <span className="font-medium">{course.total_videos} videos</span>
                        </div>
                        <div className="flex items-center gap-2 group-hover:scale-110 transition-transform duration-300">
                          <Trophy className="h-4 w-4 text-[#FDB833]" />
                          <span className="font-medium">{course.completed_videos} completados</span>
                        </div>
                      </div>

                      {/* Botón de acción mejorado */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/estudiante/curso/${course.id}`)
                        }}
                        className="w-full bg-gradient-to-r from-[#6B46C1] to-[#5BC0EB] hover:from-[#5BC0EB] hover:to-[#6B46C1] text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 group/button"
                      >
                        <Zap className="h-4 w-4 group-hover/button:animate-pulse" />
                        {course.progress_percentage > 0 ? 'Continuar' : 'Comenzar'}
                        <ArrowRight className="h-4 w-4 group-hover/button:translate-x-1 transition-transform duration-300" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Actividad Reciente - MEJORADA */}
        {recentVideos.length > 0 && (
          <div className="animate-fade-in-up animation-delay-1500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#6B46C1] to-[#5BC0EB] rounded-xl">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                Actividad Reciente
              </h2>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-2 border-gray-100">
              <CardContent className="p-6">
                <div className="space-y-3">
                  {recentVideos.map((video, index) => (
                    <div
                      key={video.id}
                      className={`flex items-center gap-4 p-4 rounded-xl hover:bg-purple-50 cursor-pointer transition-all duration-300 group hover:scale-[1.02] hover:shadow-md animate-fade-in-up`}
                      style={{ animationDelay: `${1600 + index * 100}ms` }}
                      onClick={() => router.push(`/estudiante/curso/${courses.find(c => c.name === video.course_name)?.id}/video/${video.id}`)}
                    >
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md"
                        style={{ backgroundColor: `${video.course_color}25` }}
                      >
                        <PlayCircle 
                          className="h-7 w-7"
                          style={{ color: video.course_color }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-[#6B46C1] transition-colors">
                          {video.title}
                        </h4>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {video.course_name}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
                          {formatTimeAgo(video.watched_at)}
                        </span>
                        {video.completed && (
                          <div className="bg-green-100 text-green-700 rounded-full p-2 group-hover:scale-110 transition-transform duration-300">
                            <TrendingUp className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}