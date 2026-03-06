// src/components/landing/Contact.tsx
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { MessageCircle, Mail, MapPin, Phone } from 'lucide-react'

export default function Contact() {
  const contactInfo = [
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      value: '+51 937 788 854',
      link: 'https://wa.me/51937788854',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'contacto@medmind.pe',
      link: 'mailto:contacto@medmind.pe',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: MapPin,
      title: 'Ubicación',
      value: 'UPAO - Trujillo, Perú',
      link: '#',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Phone,
      title: 'Teléfono',
      value: '+51 44 604100',
      link: 'tel:+5144604100',
      color: 'from-cyan-500 to-cyan-600'
    }
  ]

  return (
    <section id="contacto" className="py-24 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* Blobs decorativos */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            ¿Tienes{' '}
            <span className="bg-gradient-to-r from-[#6B46C1] to-[#5BC0EB] bg-clip-text text-transparent">
              Dudas?
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Estamos aquí para ayudarte. Contáctanos por cualquiera de estos medios
          </p>
        </div>

        {/* Cards de Contacto */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactInfo.map((info, index) => (
            <a
              key={info.title}
              href={info.link}
              target={info.link.startsWith('http') ? '_blank' : undefined}
              rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="block animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Card className="h-full border-2 border-gray-100 hover:border-[#6B46C1] hover:shadow-xl transition-all group cursor-pointer bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className={`
                    inline-flex p-4 rounded-2xl bg-gradient-to-r ${info.color} mb-4
                    group-hover:scale-110 transition-transform
                  `}>
                    <info.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {info.title}
                  </h3>
                  <p className="text-gray-600 group-hover:text-[#6B46C1] transition-colors">
                    {info.value}
                  </p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        {/* CTA Final */}
        <div 
          className="bg-gradient-to-r from-[#6B46C1] to-[#5BC0EB] rounded-3xl p-12 text-center text-white shadow-2xl animate-fade-in-up"
          style={{ animationDelay: '400ms' }}
        >
          <h3 className="text-3xl font-bold mb-4">
            ¿Listo para comenzar tu camino hacia la excelencia?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Únete a cientos de estudiantes que ya están transformando su educación médica
          </p>
          <a 
            href="https://wa.me/51937788854?text=Hola,%20quiero%20más%20información%20sobre%20MedMind"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#6B46C1] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
          >
            <MessageCircle className="h-6 w-6" />
            Contáctanos por WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}