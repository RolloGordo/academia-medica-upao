// src/components/landing/Hero.tsx
'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Play, Star, Users } from 'lucide-react'
import Link from 'next/link'

export default function Hero() {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Fondo animado */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50" />
        <div className="absolute top-20 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute top-20 -right-4 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Contenido Izquierdo */}
          <div className="text-center lg:text-left animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-[#6B46C1]/20 mb-6">
              <Star className="h-4 w-4 text-[#FDB833] fill-[#FDB833]" />
              <span className="text-sm font-semibold text-gray-700">
                Academia Médica #1 de UPAO
              </span>
            </div>

            {/* Título Principal */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              <span className="bg-gradient-to-r from-[#6B46C1] to-[#5BC0EB] bg-clip-text text-transparent">
                Domina la
              </span>
              <br />
              <span className="text-gray-900">Medicina con</span>
              <br />
              <span className="bg-gradient-to-r from-[#6B46C1] to-[#5BC0EB] bg-clip-text text-transparent">
                Excelencia
              </span>
            </h1>

            {/* Descripción */}
            <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
              Plataforma educativa diseñada para estudiantes de medicina de la UPAO. 
              Aprende con videos de alta calidad, seguimiento de progreso y el respaldo 
              de los mejores docentes.
            </p>

            {/* Estadísticas */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-8">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#6B46C1]/10 rounded-lg">
                  <Users className="h-5 w-5 text-[#6B46C1]" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-gray-900">500+</p>
                  <p className="text-sm text-gray-600">Estudiantes</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#5BC0EB]/10 rounded-lg">
                  <Play className="h-5 w-5 text-[#5BC0EB]" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-gray-900">32+</p>
                  <p className="text-sm text-gray-600">Cursos</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/login">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-[#6B46C1] to-[#5BC0EB] hover:opacity-90 text-white text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all group"
                >
                  Comienza Ahora
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#cursos">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-[#6B46C1] text-[#6B46C1] hover:bg-[#6B46C1] hover:text-white text-lg px-8 py-6 transition-all"
                >
                  Ver Cursos
                </Button>
              </a>
            </div>
          </div>

          {/* Imagen Derecha */}
          <div 
            className="relative animate-fade-in-up lg:block hidden"
            style={{ animationDelay: '200ms' }}
          >
            {/* Círculo de fondo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#6B46C1]/20 to-[#5BC0EB]/20 blur-3xl" />
            </div>

            {/* Imagen principal (placeholder) */}
            <div className="relative z-10">
              <div className="relative w-[550px] h-[550px] mx-auto">
                {/* Círculo con gradiente */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#6B46C1] to-[#5BC0EB] p-2">
                  <div className="w-full h-full rounded-full bg-white p-4">
                    {/* Aquí iría la imagen del estudiante/doctor */}
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#6B46C1] to-[#5BC0EB] flex items-center justify-center">
                          <GraduationCap className="h-16 w-16 text-white" />
                        </div>
                        <p className="text-gray-600 font-medium">Tu Foto Aquí</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Elementos flotantes decorativos */}
                <div className="absolute top-10 -left-10 p-4 bg-white rounded-2xl shadow-xl animate-float">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Star className="h-6 w-6 text-green-600 fill-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Excelente</p>
                      <p className="text-xs text-gray-600">Calificación</p>
                    </div>
                  </div>
                </div>

                <div 
                  className="absolute bottom-10 -right-10 p-4 bg-white rounded-2xl shadow-xl animate-float"
                  style={{ animationDelay: '1s' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Play className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">100+ Videos</p>
                      <p className="text-xs text-gray-600">Disponibles</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Onda decorativa en la parte inferior */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="white"
          />
        </svg>
      </div>
    </section>
  )
}

import { GraduationCap } from 'lucide-react'