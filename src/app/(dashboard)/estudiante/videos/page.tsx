// src/app/(dashboard)/estudiante/videos/page.tsx
// Página de Videos - Diseño MedMind

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase/client'
import { 
  Search,
  Video as VideoIcon,
  PlayCircle,
  CheckCircle2,
  Clock,
  Filter,
  X,
  BookOpen
} from 'lucide-react'

interface VideoWithCourse {
  id: string
  title: string
  description: string | null
  duration: number
  week: number
  thumbnail_url: string | null
  course_id: string
  course_name: string
  course_code: string
  course_color: string
  completed: boolean
  progress_percentage: number
  last_position: number
}

export default function VideosPage() {
  const router = useRouter()
  const [videos, setVideos] = useState<VideoWithCourse[]>([])
  const [filteredVideos, setFilteredVideos] = useState<VideoWithCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [courses, setCourses] = useState<Array<{ id: string; name: string; code: string; color: string }>>([])

  useEffect(() => {
    loadVideos()
  }, [])

  useEffect(() => {
    filterVideos()
  }, [searchTerm, selectedCourse, selectedStatus, videos])

  const loadVideos = async () => {
    try {
      setLoading(true)

      // Obtener usuario
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
      const coursesInfo = (enrollmentsData || []).map((e: any) => ({
        id: e.courses.id,
        name: e.courses.name,
        code: e.courses.code,
        color: e.courses.color || '#6B46C1'
      }))
      setCourses(coursesInfo)

      if (courseIds.length === 0) {
        setLoading(false)
        return
      }

      // Obtener todos los videos de esos cursos
      const { data: videosData } = await ((supabase
        .from('videos') as any)
        .select(`
          *,
          courses (
            id,
            name,
            code,
            color
          )
        `)
        .in('course_id', courseIds)
        .eq('active', true)
        .order('created_at', { ascending: false })) as any

      // Obtener progreso del estudiante
      const { data: progressData } = await ((supabase
        .from('progress') as any)
        .select('*')
        .eq('user_id', user.id)) as any

      // Combinar datos
      const videosWithProgress: VideoWithCourse[] = (videosData || []).map((video: any) => {
        const progress = (progressData || []).find((p: any) => p.video_id === video.id)
        const progressPercentage = progress && video.duration > 0
          ? Math.round((progress.last_position / video.duration) * 100)
          : 0

        return {
          id: video.id,
          title: video.title,
          description: video.description,
          duration: video.duration || 0,
          week: video.week || 1,
          thumbnail_url: video.thumbnail_url,
          course_id: video.course_id,
          course_name: video.courses?.name || 'Curso',
          course_code: video.courses?.code || '',
          course_color: video.courses?.color || '#6B46C1',
          completed: progress?.completed || false,
          progress_percentage: progressPercentage,
          last_position: progress?.last_position || 0
        }
      })

      setVideos(videosWithProgress)

    } catch (error) {
      console.error('Error al cargar videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterVideos = () => {
    let filtered = [...videos]

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.course_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por curso
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(video => video.course_id === selectedCourse)
    }

    // Filtrar por estado
    if (selectedStatus === 'completed') {
      filtered = filtered.filter(video => video.completed)
    } else if (selectedStatus === 'in-progress') {
      filtered = filtered.filter(video => !video.completed && video.progress_percentage > 0)
    } else if (selectedStatus === 'not-started') {
      filtered = filtered.filter(video => video.progress_percentage === 0)
    }

    setFilteredVideos(filtered)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleVideoClick = (video: VideoWithCourse) => {
    router.push(`/estudiante/curso/${video.course_id}/video/${video.id}`)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCourse('all')
    setSelectedStatus('all')
  }

  const hasActiveFilters = searchTerm || selectedCourse !== 'all' || selectedStatus !== 'all'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-solid border-[#6B46C1] border-r-transparent animate-spin" />
            <div className="absolute inset-0 rounded-full bg-[#6B46C1] opacity-20 animate-ping" />
          </div>
          <p className="mt-6 text-lg text-gray-700 font-medium">Cargando videos...</p>
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
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-[#6B46C1] to-[#5BC0EB] rounded-2xl">
              <VideoIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Todos los Videos</h1>
          </div>
          <p className="text-gray-600 ml-16">
            Explora y continúa viendo tus videos de todos los cursos
          </p>
        </div>

        {/* Filtros y búsqueda */}
        <div 
          className="bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-2xl p-6 mb-8 shadow-lg animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200 focus:border-[#6B46C1]"
                />
              </div>
            </div>

            {/* Filtro por curso */}
            <div>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B46C1] text-sm"
              >
                <option value="all">Todos los cursos</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por estado */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B46C1] text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="not-started">Sin iniciar</option>
                <option value="in-progress">En progreso</option>
                <option value="completed">Completados</option>
              </select>
            </div>
          </div>

          {/* Botón limpiar filtros */}
          {hasActiveFilters && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''} encontrado{filteredVideos.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#6B46C1] transition-colors"
              >
                <X className="h-4 w-4" />
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Grid de videos */}
        {filteredVideos.length === 0 ? (
          <Card className="p-16 text-center bg-white/80 backdrop-blur-sm">
            <VideoIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No se encontraron videos
            </h3>
            <p className="text-gray-500 mb-4">
              {hasActiveFilters
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no tienes videos disponibles'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[#6B46C1] hover:text-[#5BC0EB] font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video, index) => (
              <Card
                key={video.id}
                onClick={() => handleVideoClick(video)}
                className={`
                  group cursor-pointer overflow-hidden transition-all duration-300
                  hover:shadow-2xl hover:-translate-y-2 hover:border-[#6B46C1]
                  bg-white/80 backdrop-blur-sm border-2 border-gray-100
                  animate-fade-in-up
                `}
                style={{ animationDelay: `${(index % 9) * 50 + 200}ms` }}
              >
                <CardContent className="p-0">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <VideoIcon
                          className="h-12 w-12 text-gray-400"
                          style={{ color: video.course_color }}
                        />
                      </div>
                    )}

                    {/* Overlay con play button */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white rounded-full p-4">
                        <PlayCircle
                          className="h-8 w-8"
                          style={{ color: video.course_color }}
                        />
                      </div>
                    </div>

                    {/* Badge de estado */}
                    <div className="absolute top-3 right-3">
                      {video.completed ? (
                        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Completado
                        </div>
                      ) : video.progress_percentage > 0 ? (
                        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          {video.progress_percentage}%
                        </div>
                      ) : null}
                    </div>

                    {/* Duración */}
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    {/* Badge del curso */}
                    <Badge
                      className="mb-2 text-white border-0"
                      style={{ backgroundColor: video.course_color }}
                    >
                      {video.course_code}
                    </Badge>

                    {/* Título */}
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#6B46C1] transition-colors line-clamp-2 mb-2">
                      {video.title}
                    </h3>

                    {/* Descripción */}
                    {video.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {video.description}
                      </p>
                    )}

                    {/* Info adicional */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>Semana {video.week}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{video.course_name}</span>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    {video.progress_percentage > 0 && !video.completed && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{
                              width: `${video.progress_percentage}%`,
                              backgroundColor: video.course_color
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Resumen al final */}
        {filteredVideos.length > 0 && (
          <div 
            className="mt-8 text-center text-sm text-gray-600 animate-fade-in-up"
            style={{ animationDelay: '400ms' }}
          >
            Mostrando {filteredVideos.length} de {videos.length} videos totales
          </div>
        )}
      </div>
    </div>
  )
}