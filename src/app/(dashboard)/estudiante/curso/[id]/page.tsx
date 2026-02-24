// src/app/(dashboard)/estudiante/curso/[id]/page.tsx
// Vista individual de curso - Diseño MedMind

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase/client'
import { 
  ArrowLeft,
  PlayCircle, 
  CheckCircle2,
  Clock,
  Video,
  BookOpen,
  Trophy,
  Target,
  Lock
} from 'lucide-react'

interface VideoItem {
  id: string
  title: string
  description: string | null
  duration: number
  week_number: number
  order_in_week: number
  thumbnail_url: string | null
  completed: boolean
  last_position: number
  progress_percentage: number
}

interface WeekVideos {
  week_number: number
  videos: VideoItem[]
}

interface CourseData {
  id: string
  name: string
  code: string
  description: string | null
  color: string
  cycle: number
  total_videos: number
  completed_videos: number
  progress_percentage: number
  estimated_hours: number
}

export default function CursoIndividualPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params?.id as string

  const [course, setCourse] = useState<CourseData | null>(null)
  const [weeklyVideos, setWeeklyVideos] = useState<WeekVideos[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (courseId) {
      loadCourseData()
    }
  }, [courseId])

  const loadCourseData = async () => {
    try {
      setLoading(true)

      // Obtener usuario actual
      const { data: userData } = await supabase.auth.getUser() as any
      const user = userData?.user
      if (!user) {
        router.push('/login')
        return
      }

      // Obtener información del curso
      const { data: courseData, error: courseError } = await ((supabase
        .from('courses') as any)
        .select('*')
        .eq('id', courseId)
        .single()) as any

      if (courseError || !courseData) {
        console.error('Error al cargar curso:', courseError)
        router.push('/estudiante')
        return
      }

      // Obtener videos del curso
      const { data: videosData } = await ((supabase
        .from('videos') as any)
        .select('*')
        .eq('course_id', courseId)
        .eq('active', true)
        .order('week_number', { ascending: true })
        .order('order_in_week', { ascending: true })
      ) as any

      // Obtener progreso del estudiante
      const { data: progressData } = await ((supabase
        .from('progress') as any)
        .select('*')
        .eq('user_id', user.id)
      ) as any

      // Procesar videos con progreso
      const videosWithProgress: VideoItem[] = (videosData || []).map((video: any) => {
        const progress = (progressData || []).find((p: any) => p.video_id === video.id)
        const progressPercentage = progress && video.duration > 0
          ? Math.round((progress.last_position / video.duration) * 100)
          : 0

        return {
          id: video.id,
          title: video.title,
          description: video.description,
          duration: video.duration || 0,
          week_number: video.week_number || 1,
          order_in_week: video.order_in_week || 0,
          thumbnail_url: video.thumbnail_url,
          completed: progress?.completed || false,
          last_position: progress?.last_position || 0,
          progress_percentage: progressPercentage,
        }
      })

      // Organizar videos por semana
      const videosByWeek: { [key: number]: VideoItem[] } = {}
      videosWithProgress.forEach(video => {
        if (!videosByWeek[video.week_number]) {
          videosByWeek[video.week_number] = []
        }
        videosByWeek[video.week_number].push(video)
      })

      const weeklyData: WeekVideos[] = Object.keys(videosByWeek)
        .map(week => ({
          week_number: parseInt(week),
          videos: videosByWeek[parseInt(week)]
        }))
        .sort((a, b) => a.week_number - b.week_number)

      setWeeklyVideos(weeklyData)

      // Calcular estadísticas del curso
      const totalVideos = videosWithProgress.length
      const completedVideos = videosWithProgress.filter(v => v.completed).length
      const progressPercentage = totalVideos > 0 
        ? Math.round((completedVideos / totalVideos) * 100)
        : 0
      const estimatedHours = Math.round((totalVideos * 10) / 60) // 10 min por video

      setCourse({
        id: courseData.id,
        name: courseData.name,
        code: courseData.code,
        description: courseData.description,
        color: courseData.color || '#6B46C1',
        cycle: courseData.cycle || 2,
        total_videos: totalVideos,
        completed_videos: completedVideos,
        progress_percentage: progressPercentage,
        estimated_hours: estimatedHours,
      })

    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleVideoClick = (videoId: string) => {
    router.push(`/estudiante/curso/${courseId}/video/${videoId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-solid border-[#6B46C1] border-r-transparent animate-spin" />
            <div className="absolute inset-0 rounded-full bg-[#6B46C1] opacity-20 animate-ping" />
          </div>
          <p className="mt-6 text-lg text-gray-700 font-medium">Cargando curso...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Curso no encontrado</h3>
          <button
            onClick={() => router.push('/estudiante')}
            className="text-[#6B46C1] hover:text-[#5BC0EB] font-medium"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    )
  }

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
        {/* Botón volver */}
        <button
          onClick={() => router.push('/estudiante')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-[#6B46C1] transition-colors font-medium"
        >
          <ArrowLeft className="h-5 w-5" />
          Volver al dashboard
        </button>

        {/* Header del curso */}
        <div 
          className="relative overflow-hidden rounded-3xl p-8 mb-8 shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${course.color} 0%, ${course.color}DD 50%, ${course.color}BB 100%)`
          }}
        >
          {/* Patrones decorativos */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 -ml-24 -mb-24" />

          <div className="relative z-10">
            <Badge className="bg-white/30 text-white border-white/50 backdrop-blur-sm mb-4">
              {course.code}
            </Badge>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {course.name}
            </h1>
            
            {course.description && (
              <p className="text-white/90 text-lg max-w-3xl">
                {course.description}
              </p>
            )}
          </div>
        </div>

        {/* Estadísticas del curso */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { 
              label: 'Total Videos', 
              value: course.total_videos, 
              icon: Video,
              color: 'from-blue-500 to-blue-600'
            },
            { 
              label: 'Completados', 
              value: course.completed_videos, 
              icon: CheckCircle2,
              color: 'from-green-500 to-green-600'
            },
            { 
              label: 'Horas Estimadas', 
              value: `${course.estimated_hours}h`, 
              icon: Clock,
              color: 'from-orange-500 to-orange-600'
            },
            { 
              label: 'Progreso', 
              value: `${course.progress_percentage}%`, 
              icon: Target,
              color: 'from-purple-500 to-purple-600'
            },
          ].map((stat, index) => (
            <Card 
              key={stat.label}
              className={`bg-white/80 backdrop-blur-sm border-2 border-gray-100 hover:border-[#6B46C1] hover:shadow-xl transition-all duration-300 animate-fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">{stat.label}</span>
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Barra de progreso general */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-2 border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#FDB833]" />
                <span className="font-semibold text-gray-900">Progreso General del Curso</span>
              </div>
              <span className="text-2xl font-bold text-[#6B46C1]">{course.progress_percentage}%</span>
            </div>
            <Progress value={course.progress_percentage} className="h-3" />
            <p className="text-sm text-gray-600 mt-2">
              {course.completed_videos} de {course.total_videos} videos completados
            </p>
          </CardContent>
        </Card>

        {/* Videos por semana */}
        <div className="space-y-8">
          {weeklyVideos.map((week, weekIndex) => (
            <div 
              key={week.week_number}
              className="animate-fade-in-up"
              style={{ animationDelay: `${(weekIndex + 4) * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-[#6B46C1] to-[#5BC0EB] rounded-xl">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Semana {week.week_number}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent" />
              </div>

              <div className="grid gap-4">
                {week.videos.map((video, videoIndex) => {
                  const isLocked = false // Puedes implementar lógica de bloqueo aquí
                  const Icon = video.completed ? CheckCircle2 : video.progress_percentage > 0 ? PlayCircle : Lock

                  return (
                    <Card
                      key={video.id}
                      onClick={() => !isLocked && handleVideoClick(video.id)}
                      className={`
                        group overflow-hidden transition-all duration-300
                        ${isLocked 
                          ? 'opacity-60 cursor-not-allowed' 
                          : 'cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-[#6B46C1]'
                        }
                        ${video.completed ? 'bg-green-50/50' : 'bg-white/80'}
                        backdrop-blur-sm border-2 border-gray-100
                      `}
                    >
                      <CardContent className="p-0">
                        <div className="flex gap-4 p-4">
                          {/* Thumbnail */}
                          <div className="relative flex-shrink-0 w-40 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                            {video.thumbnail_url ? (
                              <img 
                                src={video.thumbnail_url} 
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Video 
                                  className="h-8 w-8 text-gray-400"
                                  style={{ color: course.color }}
                                />
                              </div>
                            )}
                            
                            {/* Overlay con ícono */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-white rounded-full p-3">
                                <PlayCircle 
                                  className="h-6 w-6"
                                  style={{ color: course.color }}
                                />
                              </div>
                            </div>

                            {/* Duración */}
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {formatDuration(video.duration)}
                            </div>
                          </div>

                          {/* Info del video */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900 group-hover:text-[#6B46C1] transition-colors line-clamp-2">
                                {video.title}
                              </h3>
                              <div 
                                className={`p-2 rounded-full ${
                                  video.completed 
                                    ? 'bg-green-100 text-green-600' 
                                    : video.progress_percentage > 0
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-gray-100 text-gray-400'
                                }`}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                            </div>

                            {video.description && (
                              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                {video.description}
                              </p>
                            )}

                            {/* Barra de progreso del video */}
                            {video.progress_percentage > 0 && !video.completed && (
                              <div className="mb-2">
                                <Progress 
                                  value={video.progress_percentage} 
                                  className="h-1.5 mb-1"
                                />
                                <span className="text-xs text-gray-500">
                                  {video.progress_percentage}% completado
                                </span>
                              </div>
                            )}

                            {/* Estado */}
                            <div className="flex items-center gap-4 text-sm">
                              {video.completed && (
                                <span className="flex items-center gap-1 text-green-600 font-medium">
                                  <CheckCircle2 className="h-4 w-4" />
                                  Completado
                                </span>
                              )}
                              {!video.completed && video.progress_percentage > 0 && (
                                <span className="flex items-center gap-1 text-blue-600 font-medium">
                                  <PlayCircle className="h-4 w-4" />
                                  En progreso
                                </span>
                              )}
                              {!video.completed && video.progress_percentage === 0 && (
                                <span className="flex items-center gap-1 text-gray-500">
                                  <PlayCircle className="h-4 w-4" />
                                  Sin iniciar
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje si no hay videos */}
        {weeklyVideos.length === 0 && (
          <Card className="p-16 text-center bg-white/80 backdrop-blur-sm">
            <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay videos disponibles
            </h3>
            <p className="text-gray-500">
              Este curso aún no tiene contenido publicado
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}