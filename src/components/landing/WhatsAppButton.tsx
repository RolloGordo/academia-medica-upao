// src/components/landing/WhatsAppButton.tsx
'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'

export default function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  // Mostrar el botón después de scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Mostrar tooltip después de unos segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true)
      // Ocultar tooltip después de 5 segundos
      setTimeout(() => setShowTooltip(false), 5000)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const whatsappNumber = '51937788854'
  const message = encodeURIComponent('Hola, quiero más información sobre MedMind')
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`

  return (
    <>
      {/* Botón Flotante */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`
          fixed bottom-6 right-6 z-50
          bg-gradient-to-r from-green-500 to-green-600
          text-white rounded-full p-4 shadow-2xl
          hover:scale-110 active:scale-95
          transition-all duration-300
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
        `}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <MessageCircle className="h-8 w-8 animate-pulse" />
        
        {/* Badge de notificación */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-bounce">
          1
        </div>
      </a>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className={`
            fixed bottom-24 right-6 z-50
            bg-white text-gray-900 rounded-2xl shadow-2xl p-4 max-w-xs
            border-2 border-green-500
            animate-fade-in-up
          `}
        >
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full p-1 hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <MessageCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">
                ¿Necesitas ayuda?
              </h4>
              <p className="text-sm text-gray-600">
                ¡Chatea con nosotros! Te respondemos rápidamente.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}