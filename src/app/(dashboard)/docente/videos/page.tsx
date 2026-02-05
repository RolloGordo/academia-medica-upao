// src/app/(dashboard)/docente/videos/page.tsx
// Gestión de videos para docentes

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Trash2, Play, Video as VideoIcon } from 'lucide-react'
import { UploadVideoDialog } from '@/components/admin/UploadVideoDialog'
import { VideoPlayerDialog } from '@/components/admin/VideoPlayerDialog'
import { toast } from 'sonner'
import type { Video, Course } from '@/types'
import { formatDuration, formatFileSize } from '@/lib/utils'

interface VideoWithCourse extends Video {
  course?: Course
}

export default function DocenteVideosPage() {
  const [videos, setVideos] = useState<VideoWithCourse[]>([])
  const [filteredVideos, setFilteredVideos] = useState<VideoWithCourse[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<string>('all')
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Filtrar videos
    let filtered = videos

    if (searchTerm) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCourse !== 'all') {
      filtered = filtered.filter(video => video.course_id === selectedCourse)
    }

    setFilteredVideos(filtered)
  }, [searchTerm, selectedCourse, videos])

  const loadData = async () => {
    try {
      setLoading(true)

      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Cargar cursos
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .eq('active', true)
        .order('name')

      setCourses((coursesData as any) || [])

      // Cargar solo los videos del docente
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('uploaded_by', user.id)
        .order('created_at', { ascending: false })

      if (videosError) throw videosError

      // Mapear cursos
      const videosArray = (videosData as Video[]) || []
      const coursesArray = (coursesData as Course[]) || []
      const videosWithCourse: VideoWithCourse[] = videosArray.map(video => ({
        ...video,
        course: coursesArray.find((c: Course) => c.id === video.course_id)
      }))

      setVideos(videosWithCourse)
      setFilteredVideos(videosWithCourse)
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast.error('Error al cargar videos')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteVideo = async (video: Video) => {
    if (!confirm(`¿Estás seguro de eliminar el video "${video.title}"?`)) {
      return
    }

    try {
      // Extraer el path del video
      const videoPath = video.video_url.split('/videos/')[1]

      // Eliminar archivo de storage
      if (videoPath) {
        const { error: storageError } = await supabase.storage
          .from('videos')
          .remove([videoPath])

        if (storageError) {
          console.error('Error al eliminar archivo:', storageError)
        }
      }

      // Eliminar registro de BD
      const { error: dbError } = await (supabase
        .from('videos') as any)
        .delete()
        .eq('id', video.id)

      if (dbError) throw dbError

      toast.success('Video eliminado correctamente')
      loadData()
    } catch (error) {
      console.error('Error al eliminar video:', error)
      toast.error('Error al eliminar video')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Videos</h1>
          <p className="text-gray-600 mt-2">
            Gestiona el contenido que has subido
          </p>
        </div>
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Subir Video
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="border rounded-md px-3 py-2 bg-white"
            >
              <option value="all">Todos los cursos</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {videos.length}
            </div>
            <p className="text-sm text-gray-600">Videos Subidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {formatFileSize(videos.reduce((sum, v) => sum + (v.file_size || 0), 0))}
            </div>
            <p className="text-sm text-gray-600">Almacenamiento</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {formatDuration(videos.reduce((sum, v) => sum + (v.duration || 0), 0))}
            </div>
            <p className="text-sm text-gray-600">Duración Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de videos */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Videos ({filteredVideos.length})</CardTitle>
          <CardDescription>
            Lista de videos que has subido
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando videos...</div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No se encontraron videos' : 'Aún no has subido videos'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50"
                >
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-32 h-20 bg-gray-200 rounded flex items-center justify-center">
                    <VideoIcon className="h-8 w-8 text-gray-400" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {video.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="font-medium" style={{ color: video.course?.color ?? undefined }}>
                        {video.course?.name || 'Sin curso'}
                      </span>
                      <span>•</span>
                      <span>Semana {video.week}</span>
                      <span>•</span>
                      <span>{formatDuration(video.duration)}</span>
                      <span>•</span>
                      <span>{formatFileSize(video.file_size)}</span>
                    </div>
                  </div>

                  {/* Estado */}
                  <Badge variant={video.active ? 'default' : 'secondary'}>
                    {video.active ? 'Activo' : 'Inactivo'}
                  </Badge>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPlayingVideo(video)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteVideo(video)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <UploadVideoDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        courses={courses}
        onSuccess={loadData}
      />

      <VideoPlayerDialog
        video={playingVideo}
        open={!!playingVideo}
        onOpenChange={(open) => !open && setPlayingVideo(null)}
      />
    </div>
  )
}