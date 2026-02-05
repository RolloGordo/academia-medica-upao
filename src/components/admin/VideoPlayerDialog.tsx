// src/components/admin/VideoPlayerDialog.tsx
// Reproductor de video en modal

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import type { Video } from '@/types'

interface VideoPlayerDialogProps {
  video: Video | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VideoPlayerDialog({ video, open, onOpenChange }: VideoPlayerDialogProps) {
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (video && open) {
      loadVideoUrl()
    }
  }, [video, open])

  const loadVideoUrl = async () => {
    if (!video) return

    setLoading(true)
    try {
      // Extraer el path del video desde la URL
      const urlParts = video.video_url.split('/videos/')
      if (urlParts.length < 2) {
        setVideoUrl(video.video_url)
        return
      }

      const filePath = urlParts[1]

      // Crear URL firmada que expira en 2 horas
      const { data, error } = await supabase.storage
        .from('videos')
        .createSignedUrl(filePath, 7200) // 2 horas

      if (error) {
        console.error('Error al generar URL firmada:', error)
        setVideoUrl(video.video_url)
        return
      }

      setVideoUrl(data.signedUrl)
    } catch (error) {
      console.error('Error al cargar video:', error)
      setVideoUrl(video.video_url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>{video?.title || 'Reproducir Video'}</DialogTitle>
        </DialogHeader>

        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          ) : videoUrl ? (
            <video
              controls
              autoPlay
              className="w-full h-full"
              controlsList="nodownload"
            >
              <source src={videoUrl} type="video/mp4" />
              Tu navegador no soporta el elemento de video.
            </video>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              Error al cargar el video
            </div>
          )}
        </div>

        {video?.description && (
          <div className="mt-4">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Descripción</h4>
            <p className="text-sm text-gray-600">{video.description}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}