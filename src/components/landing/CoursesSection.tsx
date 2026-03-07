// src/components/landing/CoursesSection.tsx
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Video } from 'lucide-react'

export default function CoursesSection() {
  const courses = [
    {
      title: 'Locomotor',
      description: 'Estudio del sistema locomotor humano, incluyendo huesos, articulaciones, músculos y su funcionamiento integrado.',
      color: '#EF4444'
    },
    {
      title: 'Excretor',
      description: 'Comprensión del sistema excretor, enfocándose en la función renal y los procesos de eliminación de desechos.',
      color: '#3B82F6'
    },
    {
      title: 'Bioquímica',
      description: 'Procesos químicos y moleculares fundamentales en medicina y su aplicación clínica.',
      color: '#10B981'
    },
    {
      title: 'Casos I',
      description: 'Análisis de casos clínicos reales para integrar conocimientos y desarrollar razonamiento médico.',
      color: '#F59E0B'
    },
    {
      title: 'Biología Molecular',
      description: 'Fundamentos moleculares de los procesos biológicos y su relevancia en la medicina moderna.',
      color: '#8B5CF6'
    }
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
            5 cursos diseñados para reforzar tu conocimiento en los primeros ciclos de medicina
          </p>
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
              {/* Imagen/Color Header */}
              <div className="relative h-48 overflow-hidden">
                <div 
                  className="w-full h-full flex items-center justify-center text-white text-4xl font-bold"
                  style={{ background: `linear-gradient(135deg, ${course.color}dd, ${course.color}99)` }}
                >
                  {course.title}
                </div>
                
                {/* Overlay en hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-white text-center">
                    <Video className="h-12 w-12 mx-auto mb-2" />
                    <p className="font-semibold">Ver Curso</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Título */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#6B46C1] transition-colors">
                  {course.title}
                </h3>

                {/* Descripción */}
                <p className="text-gray-600 leading-relaxed">
                  {course.description}
                </p>
              </CardContent>
            </Card>
          ))}

          {/* Card vacía para balance visual */}
          <Card
            className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center min-h-[300px] animate-fade-in-up"
            style={{ animationDelay: '500ms' }}
          >
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#6B46C1] to-[#5BC0EB] flex items-center justify-center">
                <span className="text-3xl text-white">+</span>
              </div>
              <p className="text-gray-600 font-medium">
                Más cursos próximamente
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}