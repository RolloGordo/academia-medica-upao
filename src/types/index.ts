// src/types/index.ts
// Tipos principales de la aplicación

import { Database } from './database.types'

// Tipos de las tablas
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type Course = Database['public']['Tables']['courses']['Row']
export type Video = Database['public']['Tables']['videos']['Row']
export type Enrollment = Database['public']['Tables']['enrollments']['Row']
export type Progress = Database['public']['Tables']['progress']['Row']

// Tipos para insertar
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type CourseInsert = Database['public']['Tables']['courses']['Insert']
export type VideoInsert = Database['public']['Tables']['videos']['Insert']
export type EnrollmentInsert = Database['public']['Tables']['enrollments']['Insert']
export type ProgressInsert = Database['public']['Tables']['progress']['Insert']

// Tipos para actualizar
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']
export type CourseUpdate = Database['public']['Tables']['courses']['Update']
export type VideoUpdate = Database['public']['Tables']['videos']['Update']
export type EnrollmentUpdate = Database['public']['Tables']['enrollments']['Update']
export type ProgressUpdate = Database['public']['Tables']['progress']['Update']

// Enum de roles
export type UserRole = 'admin' | 'docente' | 'estudiante'

// Tipo para usuario autenticado con perfil
export interface AuthUser {
  id: string
  email: string
  role: UserRole
  full_name: string
  active: boolean
}

// Tipo para curso con progreso
export interface CourseWithProgress extends Course {
  total_videos: number
  completed_videos: number
  progress_percentage: number
}

// Tipo para video con progreso
export interface VideoWithProgress extends Video {
  completed: boolean
  watch_time: number
  last_position: number
}

// Tipo para estadísticas del dashboard
export interface DashboardStats {
  total_students: number
  total_courses: number
  total_videos: number
  active_enrollments: number
}

// Tipo para respuestas de API
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Tipo para errores de formularios
export interface FormErrors {
  [key: string]: string | undefined
}