// src/components/admin/UploadVideoDialog.tsx
// Diálogo para subir videos con barra de progreso

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Upload, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { Course } from '@/types'

interface UploadVideoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courses: Course[]
  onSuccess: () => void
}

export function UploadVideoDialog({ open, onOpenChange, courses, onSuccess }: UploadVideoDialogProps) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    week: 1,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('video/')) {
        toast.error('Por favor selecciona un archivo de video válido')
        return
      }

      // Validar tamaño (máximo 500MB)
      const maxSize = 500 * 1024 * 1024 // 500MB en bytes
      if (file.size > maxSize) {
        toast.error('El archivo es demasiado grande. Máximo 500MB')
        return
      }

      setSelectedFile(file)
      
      // Auto-rellenar título si está vacío
      if (!formData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, '') // Quitar extensión
        setFormData({ ...formData, title: fileName })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      toast.error('Por favor selecciona un video')
      return
    }

    if (!formData.courseId) {
      toast.error('Por favor selecciona un curso')
      return
    }

    setLoading(true)
    setUploading(true)
    setUploadProgress(0)

    try {
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // Generar nombre único para el archivo
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${formData.courseId}/${fileName}`

      console.log('Iniciando subida de video:', filePath)

      // Simular progreso mientras se sube
      let progress = 0
      const progressInterval = setInterval(() => {
        progress += 5
        if (progress <= 85) {
          setUploadProgress(progress)
        }
      }, 300)

      // Subir archivo a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        })

      clearInterval(progressInterval)

      if (uploadError) {
        console.error('Error al subir archivo:', uploadError)
        throw uploadError
      }

      console.log('Archivo subido exitosamente:', uploadData)
      setUploadProgress(90)

      // Obtener URL pública del video
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath)

      console.log('URL pública generada:', urlData.publicUrl)
      setUploadProgress(95)

      // Crear registro en la base de datos
      const { error: dbError } = await (supabase
        .from('videos') as any)
        .insert({
          course_id: formData.courseId,
          title: formData.title,
          description: formData.description || null,
          video_url: urlData.publicUrl,
          week: formData.week,
          file_size: selectedFile.size,
          duration: 0,
          uploaded_by: user.id,
          active: true,
        })

      if (dbError) {
        console.error('Error al crear registro en BD:', dbError)
        // Si falla la BD, eliminar el archivo subido
        await supabase.storage.from('videos').remove([filePath])
        throw dbError
      }

      console.log('Registro creado en BD exitosamente')
      setUploadProgress(100)
      
      toast.success('Video subido correctamente')
      
      // Resetear formulario
      setFormData({
        title: '',
        description: '',
        courseId: '',
        week: 1,
      })
      setSelectedFile(null)
      
      // Delay para mostrar el 100%
      setTimeout(() => {
        setUploadProgress(0)
        setUploading(false)
        setLoading(false)
        onOpenChange(false)
        onSuccess()
      }, 1000)
      
    } catch (error: any) {
      console.error('Error completo al subir video:', error)
      toast.error(error.message || 'Error al subir video')
      setUploadProgress(0)
      setUploading(false)
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Subir Nuevo Video</DialogTitle>
          <DialogDescription>
            Sube contenido educativo para los estudiantes
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Archivo de video */}
            <div className="space-y-2">
              <Label htmlFor="video">Archivo de Video *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="flex-1"
                />
              </div>
              {selectedFile && (
                <div className="text-sm text-gray-600">
                  <p>📁 {selectedFile.name}</p>
                  <p>📊 {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Formatos: MP4, MOV, AVI, etc. Máximo 500MB
              </p>
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título del Video *</Label>
              <Input
                id="title"
                placeholder="Ej: Introducción al sistema locomotor"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Breve descripción del contenido..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
                rows={3}
              />
            </div>

            {/* Curso y Semana */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course">Curso *</Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="week">Semana</Label>
                <Input
                  id="week"
                  type="number"
                  min="1"
                  max="14"
                  value={formData.week}
                  onChange={(e) => setFormData({ ...formData, week: parseInt(e.target.value) })}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Barra de progreso */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subiendo video...</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
                {uploadProgress === 100 && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>Video subido correctamente</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !selectedFile}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Video
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}