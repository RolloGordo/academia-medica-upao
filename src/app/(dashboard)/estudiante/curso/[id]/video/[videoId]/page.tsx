// src/app/(dashboard)/estudiante/curso/[id]/video/[videoId]/page.tsx
// VERSIÓN CON PLAYER HTML5 NATIVO (más compatible)

'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { 
  ArrowLeft,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Video as VideoIcon,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward
} from 'lucide-react'

interface VideoData {
  id: string
  title: string
  description: string | null
  video_url: string
  signed_url: string
  duration: number
  week: number
  order_index: number
  course_id: string
  course_name: string
  course_code: string
  course_color: string
}

interface VideoProgress {
  completed: boolean
  last_position: number
  progress_percentage: number
}

interface CourseVideo {
  id: string
  title: string
  week: number
  order_index: number
  completed: boolean
  current: boolean
}

export default function VideoPlayerPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params?.id as string
  const videoId = params?.videoId as string

  const [video, setVideo] = useState<VideoData | null>(null)
  const [progress, setProgress] = useState<VideoProgress>({
    completed: false,
    last_position: 0,
    progress_percentage: 0
  })
  const [courseVideos, setCourseVideos] = useState<CourseVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [seeking, setSeeking] = useState(false)
  
  // ✅ REF para el video HTML5 nativo
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    if (courseId && videoId) {
      loadVideoData()
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      saveProgress()
    }
  }, [courseId, videoId])

  // Auto-guardar progreso cada 5 segundos
  useEffect(() => {
    if (playing && userId) {
      progressIntervalRef.current = setInterval(() => {
        saveProgress()
      }, 5000)

      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
        }
      }
    }
  }, [playing, userId])

  const getSignedVideoUrl = async (videoUrl: string): Promise<string> => {
    try {
      console.log('🔑 Generando URL firmada para:', videoUrl)

      const urlParts = videoUrl.split('/videos/')
      if (urlParts.length < 2) {
        console.log('⚠️ No se pudo extraer path, usando URL original')
        return videoUrl
      }

      const filePath = urlParts[1]
      console.log('📁 Path del archivo:', filePath)

      const { data, error } = await supabase.storage
        .from('videos')
        .createSignedUrl(filePath, 3600)

      if (error) {
        console.error('❌ Error al generar URL firmada:', error)
        return videoUrl
      }

      console.log('✅ URL firmada generada:', data.signedUrl)
      return data.signedUrl
    } catch (error) {
      console.error('❌ Error al obtener URL del video:', error)
      return videoUrl
    }
  }

  const loadVideoData = async () => {
    try {
      setLoading(true)

      const { data: userData } = await supabase.auth.getUser() as any
      const user = userData?.user
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)

      const { data: videoData, error: videoError } = await ((supabase
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
        .eq('id', videoId)
        .single()) as any

      if (videoError || !videoData) {
        console.error('Error al cargar video:', videoError)
        router.push(`/estudiante/curso/${courseId}`)
        return
      }

      const signedUrl = await getSignedVideoUrl(videoData.video_url)

      setVideo({
        id: videoData.id,
        title: videoData.title,
        description: videoData.description,
        video_url: videoData.video_url,
        signed_url: signedUrl,
        duration: videoData.duration || 0,
        week: videoData.week || 1,
        order_index: videoData.order_index || 0,
        course_id: videoData.course_id,
        course_name: videoData.courses?.name || 'Curso',
        course_code: videoData.courses?.code || '',
        course_color: videoData.courses?.color || '#6B46C1',
      })

      const { data: progressData } = await ((supabase
        .from('progress') as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('video_id', videoId)
        .single()) as any

      if (progressData && videoData.duration > 0) {
        const progressPercentage = (progressData.last_position / videoData.duration) * 100

        setProgress({
          completed: progressData.completed || false,
          last_position: progressData.last_position || 0,
          progress_percentage: progressPercentage
        })

        // Esperar a que el video esté listo para saltar
        setCurrentTime(progressData.last_position)
      }

      const { data: allVideosData } = await ((supabase
        .from('videos') as any)
        .select('id, title, week, order_index')
        .eq('course_id', courseId)
        .eq('active', true)
        .order('week', { ascending: true })
        .order('order_index', { ascending: true })
      ) as any

      const { data: allProgressData } = await ((supabase
        .from('progress') as any)
        .select('video_id, completed')
        .eq('user_id', user.id)
      ) as any

      const videosWithStatus: CourseVideo[] = (allVideosData || []).map((v: any) => ({
        id: v.id,
        title: v.title,
        week: v.week,
        order_index: v.order_index,
        completed: (allProgressData || []).some((p: any) => p.video_id === v.id && p.completed),
        current: v.id === videoId
      }))

      setCourseVideos(videosWithStatus)

    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveProgress = async () => {
    if (!userId || !videoId || !video || !videoRef.current) return

    try {
      const currentTime = videoRef.current.currentTime
      const videoDuration = videoRef.current.duration || video.duration
      const progressPercentage = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0
      const isCompleted = progressPercentage >= 90

      const { data: existing } = await ((supabase
        .from('progress') as any)
        .select('id')
        .eq('user_id', userId)
        .eq('video_id', videoId)
        .single()) as any

      const progressUpdate = {
        last_position: Math.floor(currentTime),
        watch_time: Math.floor(currentTime),
        completed: isCompleted,
        last_watched_at: new Date().toISOString()
      }

      if (existing) {
        await ((supabase
          .from('progress') as any)
          .update(progressUpdate)
          .eq('id', existing.id)) as any
      } else {
        await ((supabase
          .from('progress') as any)
          .insert({
            ...progressUpdate,
            user_id: userId,
            video_id: videoId,
          })) as any
      }

      if (isCompleted && !progress.completed) {
        setProgress(prev => ({ ...prev, completed: true }))
      }
    } catch (error) {
      console.error('Error al guardar progreso:', error)
    }
  }

  // ✅ Handlers del player HTML5
  const handleLoadedMetadata = () => {
    console.log('✅ Video metadata cargada')
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      // Saltar a última posición vista
      if (progress.last_position > 0) {
        videoRef.current.currentTime = progress.last_position
      }
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current && !seeking) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handlePlay = () => {
    setPlaying(true)
  }

  const handlePause = () => {
    setPlaying(false)
  }

  const handleEnded = () => {
    saveProgress()
    const currentIndex = courseVideos.findIndex(v => v.id === videoId)
    if (currentIndex < courseVideos.length - 1) {
      handleNextVideo()
    }
  }

  const togglePlayPause = () => {
    if (!videoRef.current) return
    
    if (playing) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }

  const handleSeek = (value: number) => {
    if (!videoRef.current) return
    const newTime = (value / 100) * duration
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value: number) => {
    setVolume(value)
    if (videoRef.current) {
      videoRef.current.volume = value
    }
  }

  const toggleMute = () => {
    setMuted(!muted)
    if (videoRef.current) {
      videoRef.current.muted = !muted
    }
  }

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate)
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
    }
  }

  const handleSkip = (seconds: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime += seconds
  }

  const toggleFullscreen = () => {
    const container = document.querySelector('.video-container')
    if (!container) return

    if (!document.fullscreenElement) {
      container.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const navigateToVideo = (targetVideoId: string) => {
    saveProgress()
    router.push(`/estudiante/curso/${courseId}/video/${targetVideoId}`)
  }

  const handlePreviousVideo = () => {
    const currentIndex = courseVideos.findIndex(v => v.id === videoId)
    if (currentIndex > 0) {
      navigateToVideo(courseVideos[currentIndex - 1].id)
    }
  }

  const handleNextVideo = () => {
    const currentIndex = courseVideos.findIndex(v => v.id === videoId)
    if (currentIndex < courseVideos.length - 1) {
      navigateToVideo(courseVideos[currentIndex + 1].id)
    }
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-solid border-[#6B46C1] border-r-transparent animate-spin" />
            <div className="absolute inset-0 rounded-full bg-[#6B46C1] opacity-20 animate-ping" />
          </div>
          <p className="mt-6 text-lg text-gray-700 font-medium">Cargando video...</p>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <VideoIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Video no encontrado</h3>
          <button
            onClick={() => router.push(`/estudiante/curso/${courseId}`)}
            className="text-[#6B46C1] hover:text-[#5BC0EB] font-medium"
          >
            Volver al curso
          </button>
        </div>
      </div>
    )
  }

  const currentVideoIndex = courseVideos.findIndex(v => v.id === videoId)
  const hasPrevious = currentVideoIndex > 0
  const hasNext = currentVideoIndex < courseVideos.length - 1
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/estudiante/curso/${courseId}`)}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Volver al curso
              </button>
              <div className="h-6 w-px bg-gray-600" />
              <div className="flex items-center gap-2 text-sm">
                <Badge 
                  className="text-white border-white/30"
                  style={{ backgroundColor: `${video.course_color}40` }}
                >
                  {video.course_code}
                </Badge>
                <span className="text-gray-400">•</span>
                <span className="text-gray-300">{video.course_name}</span>
              </div>
            </div>

            {progress.completed && (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Completado</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Video player */}
          <div className="lg:col-span-2 bg-black">
            <div className="aspect-video relative video-container">
              {/* ✅ VIDEO HTML5 NATIVO */}
              <video
                ref={videoRef}
                src={video.signed_url}
                className="w-full h-full"
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onPlay={handlePlay}
                onPause={handlePause}
                onEnded={handleEnded}
                crossOrigin="anonymous"
              />

              {/* Overlay de controles */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                {/* Barra de progreso */}
                <div className="mb-4">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={progressPercentage}
                    onChange={(e) => handleSeek(Number(e.target.value))}
                    onMouseDown={() => setSeeking(true)}
                    onMouseUp={() => setSeeking(false)}
                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer range-slider"
                  />
                </div>

                {/* Controles */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Skip back */}
                    <button
                      onClick={() => handleSkip(-10)}
                      className="text-white hover:text-[#5BC0EB] transition-colors"
                    >
                      <SkipBack className="h-6 w-6" />
                    </button>

                    {/* Play/Pause */}
                    <button
                      onClick={togglePlayPause}
                      className="text-white hover:text-[#5BC0EB] transition-colors"
                    >
                      {playing ? (
                        <PauseCircle className="h-8 w-8" />
                      ) : (
                        <PlayCircle className="h-8 w-8" />
                      )}
                    </button>

                    {/* Skip forward */}
                    <button
                      onClick={() => handleSkip(10)}
                      className="text-white hover:text-[#5BC0EB] transition-colors"
                    >
                      <SkipForward className="h-6 w-6" />
                    </button>

                    {/* Volume */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleMute}
                        className="text-white hover:text-[#5BC0EB] transition-colors"
                      >
                        {muted || volume === 0 ? (
                          <VolumeX className="h-5 w-5" />
                        ) : (
                          <Volume2 className="h-5 w-5" />
                        )}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.1}
                        value={volume}
                        onChange={(e) => handleVolumeChange(Number(e.target.value))}
                        className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Time */}
                    <div className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Playback rate */}
                    <select
                      value={playbackRate}
                      onChange={(e) => handlePlaybackRateChange(Number(e.target.value))}
                      className="bg-gray-700 text-white text-sm px-2 py-1 rounded border border-gray-600 focus:outline-none focus:border-[#5BC0EB]"
                    >
                      <option value={0.5}>0.5x</option>
                      <option value={0.75}>0.75x</option>
                      <option value={1}>Normal</option>
                      <option value={1.25}>1.25x</option>
                      <option value={1.5}>1.5x</option>
                      <option value={2}>2x</option>
                    </select>

                    {/* Fullscreen */}
                    <button
                      onClick={toggleFullscreen}
                      className="text-white hover:text-[#5BC0EB] transition-colors"
                    >
                      <Maximize className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Info del video */}
            <div className="bg-gray-800 p-6">
              <h1 className="text-2xl font-bold text-white mb-2">{video.title}</h1>
              {video.description && (
                <p className="text-gray-300 mb-4">{video.description}</p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <Button
                  onClick={handlePreviousVideo}
                  disabled={!hasPrevious}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Video Anterior
                </Button>

                <div className="text-sm text-gray-400">
                  Video {currentVideoIndex + 1} de {courseVideos.length}
                </div>

                <Button
                  onClick={handleNextVideo}
                  disabled={!hasNext}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#6B46C1] to-[#5BC0EB] hover:opacity-90"
                >
                  Siguiente Video
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de videos */}
          <div className="bg-gray-800 border-l border-gray-700 overflow-y-auto max-h-screen">
            <div className="p-6 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Contenido del Curso
              </h2>
            </div>

            <div className="p-4 space-y-2">
              {courseVideos.map((courseVideo, index) => (
                <button
                  key={courseVideo.id}
                  onClick={() => navigateToVideo(courseVideo.id)}
                  className={`
                    w-full text-left p-4 rounded-lg transition-all duration-200
                    ${courseVideo.current
                      ? 'bg-[#6B46C1] text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {courseVideo.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      ) : courseVideo.current ? (
                        <PlayCircle className="h-5 w-5" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-current" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs opacity-75 mb-1">
                        Video {index + 1} • Semana {courseVideo.week}
                      </div>
                      <div className="font-medium line-clamp-2">
                        {courseVideo.title}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .range-slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #5BC0EB;
          cursor: pointer;
        }
        
        .range-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #5BC0EB;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}