// src/components/landing/Features.tsx
'use client'

import { Video, TrendingUp, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function Features() {
  const features = [
    {
      icon: Video,
      title: 'Videos de Alta Calidad',
      description: 'Contenido educativo grabado por profesionales médicos expertos, disponible 24/7.',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: TrendingUp,
      title: 'Seguimiento de Progreso',
      description: 'Monitorea tu avance en tiempo real con estadísticas detalladas y gráficas interactivas.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Clock,
      title: 'Aprende a Tu Ritmo',
      description: 'Accede al contenido cuando quieras, donde quieras. 100% online, sin horarios fijos.',
      gradient: 'from-orange-500 to-red-500'
    }
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            ¿Cómo te ayudará{' '}
            <span className="bg-gradient-to-r from-[#6B46C1] to-[#5BC0EB] bg-clip-text text-transparent">
              MedMind?
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre las herramientas que te convertirán en un profesional de excelencia
          </p>
        </div>

        {/* Grid de Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className={`
                group cursor-pointer overflow-hidden transition-all duration-300
                hover:shadow-2xl hover:-translate-y-2
                bg-white border-2 border-gray-100 hover:border-[#6B46C1]
                animate-fade-in-up
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                {/* Icono */}
                <div className="mb-4">
                  <div className={`
                    inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient}
                    group-hover:scale-110 transition-transform duration-300
                  `}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                </div>

                {/* Título */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#6B46C1] transition-colors">
                  {feature.title}
                </h3>

                {/* Descripción */}
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}