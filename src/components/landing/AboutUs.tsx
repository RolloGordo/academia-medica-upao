// src/components/landing/AboutUs.tsx
'use client'

import { Target, Heart, Lightbulb, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function AboutUs() {
  const values = [
    {
      icon: Target,
      title: 'Misión',
      description: 'Formar profesionales médicos de excelencia mediante educación de calidad, accesible y actualizada.'
    },
    {
      icon: Heart,
      title: 'Compromiso',
      description: 'Dedicados al éxito académico de cada estudiante con contenido relevante y soporte continuo.'
    },
    {
      icon: Lightbulb,
      title: 'Innovación',
      description: 'Utilizamos tecnología educativa de vanguardia para optimizar el proceso de aprendizaje.'
    },
    {
      icon: Shield,
      title: 'Calidad',
      description: 'Todo nuestro contenido es revisado y respaldado por profesionales médicos expertos.'
    }
  ]

  return (
    <section id="nosotros" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Contenido Izquierdo */}
          <div className="animate-fade-in-up">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Sobre{' '}
              <span className="bg-gradient-to-r from-[#6B46C1] to-[#5BC0EB] bg-clip-text text-transparent">
                MedMind
              </span>
            </h2>
            
            <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
              <p>
                <strong className="text-gray-900">MedMind</strong> es una plataforma educativa 
                diseñada específicamente para reforzar el conocimiento de estudiantes de los primeros ciclos de medicina.
              </p>
              
              <p>
                Nuestro objetivo es revolucionar la forma en que los estudiantes aprenden medicina, 
                proporcionando acceso a contenido de alta calidad, herramientas de seguimiento de progreso 
                que facilitan el camino hacia la excelencia profesional.
              </p>
              
              <p>
                Trabajamos con profesionales médicos expertos para garantizar que 
                cada video, cada recurso y cada herramienta estén alineados con los más altos 
                estándares académicos.
              </p>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 gap-6 mt-10">
              <div className="text-center">
                <p className="text-4xl font-bold bg-gradient-to-r from-[#6B46C1] to-[#5BC0EB] bg-clip-text text-transparent">
                  5
                </p>
                <p className="text-sm text-gray-600 mt-1">Cursos</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold bg-gradient-to-r from-[#6B46C1] to-[#5BC0EB] bg-clip-text text-transparent">
                  100%
                </p>
                <p className="text-sm text-gray-600 mt-1">Online</p>
              </div>
            </div>
          </div>

          {/* Valores - Derecha */}
          <div 
            className="grid gap-6 animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            {values.map((value, index) => (
              <Card
                key={value.title}
                className="border-2 border-gray-100 hover:border-[#6B46C1] transition-all hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-[#6B46C1] to-[#5BC0EB] rounded-xl">
                      <value.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {value.title}
                      </h3>
                      <p className="text-gray-600">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sección de Visión */}
        <div className="mt-20 text-center bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-12">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Nuestra Visión
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Convertirnos en la plataforma líder de reforzamiento académico para estudiantes de medicina, 
              proporcionando herramientas digitales que potencien el aprendizaje y preparen a los futuros 
              profesionales para los desafíos del mundo médico.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}