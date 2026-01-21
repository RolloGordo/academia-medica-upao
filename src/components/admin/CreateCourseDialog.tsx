// src/components/admin/CreateCourseDialog.tsx
// Diálogo para crear nuevos cursos

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { generateCourseColor } from '@/lib/utils'

interface CreateCourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateCourseDialog({ open, onOpenChange, onSuccess }: CreateCourseDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    cycle: 2,
    credits: 3,
    color: generateCourseColor(),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validaciones
      if (!formData.name || !formData.code) {
        toast.error('Nombre y código son requeridos')
        return
      }

      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await (supabase
        .from('courses') as any)
        .insert({
          name: formData.name,
          code: formData.code.toUpperCase(),
          description: formData.description || null,
          cycle: formData.cycle,
          credits: formData.credits,
          color: formData.color,
          created_by: user?.id,
          active: true,
        })

      if (error) throw error

      toast.success('Curso creado correctamente')
      
      // Resetear formulario
      setFormData({
        name: '',
        code: '',
        description: '',
        cycle: 2,
        credits: 3,
        color: generateCourseColor(),
      })
      
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      console.error('Error al crear curso:', error)
      if (error.code === '23505') {
        toast.error('Ya existe un curso con ese código')
      } else {
        toast.error('Error al crear curso')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Curso</DialogTitle>
          <DialogDescription>
            Registra un nuevo curso en la plataforma
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Nombre del curso */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Curso *</Label>
              <Input
                id="name"
                placeholder="Ej: Locomotor"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            {/* Código */}
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                placeholder="Ej: LOC-2024"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Código único para identificar el curso
              </p>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Breve descripción del curso..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
                rows={3}
              />
            </div>

            {/* Ciclo y Créditos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cycle">Ciclo *</Label>
                <Select
                  value={formData.cycle.toString()}
                  onValueChange={(value) => setFormData({ ...formData, cycle: parseInt(value) })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Primer Ciclo</SelectItem>
                    <SelectItem value="2">Segundo Ciclo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="credits">Créditos</Label>
                <Input
                  id="credits"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label htmlFor="color">Color del Curso</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  disabled={loading}
                  className="w-20 h-10"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData({ ...formData, color: generateCourseColor() })}
                  disabled={loading}
                >
                  Aleatorio
                </Button>
                <div 
                  className="flex-1 rounded border"
                  style={{ backgroundColor: formData.color }}
                />
              </div>
            </div>
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
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Curso'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}