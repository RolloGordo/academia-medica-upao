// src/types/database.types.ts
// Tipos generados automáticamente desde el schema de Supabase

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'docente' | 'estudiante'
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'docente' | 'estudiante'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'admin' | 'docente' | 'estudiante'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          name: string
          description: string | null
          code: string
          cycle: number
          credits: number | null
          color: string | null
          active: boolean
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          code: string
          cycle: number
          credits?: number | null
          color?: string | null
          active?: boolean
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          code?: string
          cycle?: number
          credits?: number | null
          color?: string | null
          active?: boolean
          created_at?: string
          created_by?: string | null
        }
      }
      videos: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          video_url: string
          thumbnail_url: string | null
          week: number
          order_index: number
          duration: number
          file_size: number
          uploaded_by: string | null
          active: boolean
          available_from: string
          available_until: string | null
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          video_url: string
          thumbnail_url?: string | null
          week: number
          order_index?: number
          duration?: number
          file_size?: number
          uploaded_by?: string | null
          active?: boolean
          available_from?: string
          available_until?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          video_url?: string
          thumbnail_url?: string | null
          week?: number
          order_index?: number
          duration?: number
          file_size?: number
          uploaded_by?: string | null
          active?: boolean
          available_from?: string
          available_until?: string | null
          created_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          enrolled_at: string
          expires_at: string
          payment_verified: boolean
          active: boolean
          created_by: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          enrolled_at?: string
          expires_at: string
          payment_verified?: boolean
          active?: boolean
          created_by?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          enrolled_at?: string
          expires_at?: string
          payment_verified?: boolean
          active?: boolean
          created_by?: string | null
          notes?: string | null
        }
      }
      progress: {
        Row: {
          id: string
          user_id: string
          video_id: string
          completed: boolean
          watch_time: number
          last_position: number
          completed_at: string | null
          last_watched_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          completed?: boolean
          watch_time?: number
          last_position?: number
          completed_at?: string | null
          last_watched_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_id?: string
          completed?: boolean
          watch_time?: number
          last_position?: number
          completed_at?: string | null
          last_watched_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_course_access: {
        Args: {
          p_course_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}