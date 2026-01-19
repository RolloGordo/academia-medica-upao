// src/lib/utils.ts
// Funciones utilitarias para toda la aplicación

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina clases de Tailwind CSS de manera inteligente
 * Útil para componentes con clases condicionales
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea duración en segundos a formato legible (HH:MM:SS o MM:SS)
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * Formatea tamaño de archivo en bytes a formato legible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Formatea fecha a formato legible en español
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Formatea fecha con hora
 */
export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Calcula porcentaje de progreso
 */
export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

/**
 * Valida si un email es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida si un email es de UPAO
 */
export function isUpaoEmail(email: string): boolean {
  return email.endsWith('@upao.edu.pe')
}

/**
 * Trunca texto a una longitud máxima
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

/**
 * Genera color aleatorio para cursos
 */
export function generateCourseColor(): string {
  const colors = [
    '#3B82F6', // blue
    '#8B5CF6', // violet
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#06B6D4', // cyan
    '#F97316', // orange
    '#EC4899', // pink
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Debounce para optimizar búsquedas
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Calcula fecha de expiración (por defecto 14 semanas desde hoy)
 */
export function calculateExpirationDate(weeks: number = 14): Date {
  const date = new Date()
  date.setDate(date.getDate() + weeks * 7)
  return date
}

/**
 * Verifica si una fecha ya expiró
 */
export function isExpired(expirationDate: string | Date): boolean {
  return new Date(expirationDate) < new Date()
}

/**
 * Obtiene días restantes hasta una fecha
 */
export function getDaysRemaining(expirationDate: string | Date): number {
  const now = new Date()
  const expiration = new Date(expirationDate)
  const diffTime = expiration.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}