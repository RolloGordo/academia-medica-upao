// src/components/landing/Footer.tsx
'use client'

import Link from 'next/link'
import { GraduationCap, Facebook, Instagram, Youtube, Mail } from 'lucide-react'

export default function Footer() {
  const links = {
    pages: [
      { name: 'Inicio', href: '#inicio' },
      { name: 'Cursos', href: '#cursos' },
      { name: 'Sobre Nosotros', href: '#nosotros' },
      { name: 'Contacto', href: '#contacto' },
    ],
    legal: [
      { name: 'Términos y Condiciones', href: '#' },
      { name: 'Política de Privacidad', href: '#' },
      { name: 'Política de Cookies', href: '#' },
    ],
    social: [
      { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/medmind', color: '#1877F2' },
      { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/medmind', color: '#E4405F' },
      { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/medmind', color: '#FF0000' },
    ]
  }

  return (
    <footer className="bg-gradient-to-br from-[#4338CA] via-[#6B46C1] to-[#5BC0EB] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Contenido Principal */}
        <div className="py-12 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Columna 1: Logo y Descripción */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">MedMind</h3>
                <p className="text-sm text-white/80">Academia Médica UPAO</p>
              </div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed mb-4">
              Estamos ayudando a la nueva generación de profesionales en medicina 
              a alcanzar la excelencia académica.
            </p>
            {/* Redes Sociales */}
            <div className="flex gap-3">
              {links.social.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                  title={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Columna 2: Páginas */}
          <div>
            <h4 className="text-lg font-bold mb-4">Páginas</h4>
            <ul className="space-y-2">
              {links.pages.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Legal */}
          <div>
            <h4 className="text-lg font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              {links.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-white/80">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:contacto@medmind.pe" className="hover:text-white transition-colors">
                  contacto@medmind.pe
                </a>
              </li>
              <li className="flex items-start gap-2 text-white/80">
                <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <a href="https://wa.me/51937788854" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  +51 937 788 854
                </a>
              </li>
              <li className="text-white/80">
                Universidad Privada Antenor Orrego<br />
                Trujillo, Perú
              </li>
            </ul>
          </div>
        </div>

        {/* Línea Divisoria */}
        <div className="border-t border-white/20" />

        {/* Copyright */}
        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/80">
          <p>
            © 2025 MedMind. Todos los derechos reservados.
          </p>
          <p>
            Desarrollado con ❤️ para estudiantes de medicina UPAO
          </p>
        </div>
      </div>
    </footer>
  )
}