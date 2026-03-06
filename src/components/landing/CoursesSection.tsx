// src/components/landing/CoursesSection.tsx
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Video, TrendingUp } from 'lucide-react'

export default function CoursesSection() {
  const courses = [
    {
      title: 'Anatomía Humana',
      description: 'Estudio completo de la estructura del cuerpo humano',
      image: '/api/placeholder/400/250',
      cycle: 'Ciclos 1-3',
      videos: 24,
      hours: 18,
      color: '#EF4444',
      category: 'Básico'
    },
    {
      title: 'Fisiología',
      description: 'Funcionamiento de los sistemas del cuerpo humano',
      image: '/api/placeholder/400/250',
      cycle: 'Ciclos 4-6',
      videos: 28,
      hours: 22,
      color: '#3B82F6',
      category: 'Intermedio'
    },
    {
      title: 'Bioquímica Médica',
      description: 'Procesos químicos y moleculares en medicina',
      image: '/api/placeholder/400/250',
      cycle: 'Ciclos 2-4',
      videos: 20,
      hours: 16,
      color: '#10B981',
      category: 'Básico'
    },
    {
      title: 'Histología',
      description: 'Estudio microscópico de tejidos y células',
      image: '/api/placeholder/400/250',
      cycle: 'Ciclos 3-5',
      videos: 22,
      hours: 17,
      color: '#8B5CF6',
      category: 'Intermedio'
    },
    {
      title: 'Microbiología',
      description: 'Estudio de microorganismos y enfermedades',
      image: '/api/placeholder/400/250',
      cycle: 'Ciclos 5-7',
      videos: 26,
      hours: 20,
      color: '#F59E0B',
      category: 'Avanzado'
    },
    {
      title: 'Farmacología',
      description: 'Medicamentos y su efecto en el organismo',
      image: '/api/placeholder/400/250',
      cycle: 'Ciclos 6-8',
      videos: 30,
      hours: 24,
      color: '#EC4899',
      category: 'Avanzado'
    }
  ]

  const categories = [
    { name: 'Todos', value: 'all' },
    { name: 'Básico', value: 'Básico' },
    { name: 'Intermedio', value: 'Intermedio' },
    { name: 'Avanzado', value: 'Avanzado' }
  ]

  return (
    <section id="cursos" className="py-24 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* Blobs decorativos */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Explora Nuestros{' '}
            <span className="bg-gradient-to-r from-[#6B46C1] to-[#5BC0EB] bg-clip-text text-transparent">
              Cursos
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Más de 32 cursos diseñados específicamente para la carrera de medicina en la UPAO
          </p>
        </div>

        {/* Filtros (Opcional - simple) */}
        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.value}
              className="px-6 py-2 rounded-full bg-white hover:bg-[#6B46C1] hover:text-white border-2 border-gray-200 hover:border-[#6B46C1] font-medium transition-all"
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grid de Cursos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {courses.map((course, index) => (
            <Card
              key={course.title}
              className={`
                group cursor-pointer overflow-hidden transition-all duration-300
                hover:shadow-2xl hover:-translate-y-2
                bg-white/80 backdrop-blur-sm border-2 border-gray-100 hover:border-[#6B46C1]
                animate-fade-in-up
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Imagen */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                {/* Placeholder - aquí irían las imágenes reales */}
                <div 
                  className="w-full h-full flex items-center justify-center text-white text-4xl font-bold"
                  style={{ background: `linear-gradient(135deg, ${course.color}dd, ${course.color}99)` }}
                >
                  {course.title.split(' ')[0]}
                </div>
                
                {/* Overlay en hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-white text-center">
                    <Video className="h-12 w-12 mx-auto mb-2" />
                    <p className="font-semibold">Ver Curso</p>
                  </div>
                </div>

                {/* Badge de categoría */}
                <div className="absolute top-3 right-3">
                  <Badge 
                    className="text-white border-0"
                    style={{ backgroundColor: course.color }}
                  >
                    {course.category}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Ciclo */}
                <p className="text-sm text-gray-500 mb-2">{course.cycle}</p>

                {/* Título */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#6B46C1] transition-colors">
                  {course.title}
                </h3>

                {/* Descripción */}
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {course.description}
                </p>

                {/* Estadísticas */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    <span>{course.videos} videos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.hours}h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA para ver más */}
        <div className="text-center">
          <button className="px-8 py-4 bg-gradient-to-r from-[#6B46C1] to-[#5BC0EB] text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl">
            Ver Todos los Cursos
            <TrendingUp className="inline-block ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  )
}