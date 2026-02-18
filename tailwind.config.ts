// tailwind.config.ts
// Configuración actualizada con colores MedMind

import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      // ============================================
      // COLORES PERSONALIZADOS MEDMIND
      // ============================================
      colors: {
        // Colores de la paleta MedMind
        medmind: {
          purple: '#6B46C1',
          'purple-light': '#B8A4D9',
          'purple-dark': '#5A3BA0',
          cyan: '#5BC0EB',
          orange: '#FDB833',
        },
        
        // Colores de shadcn/ui (mantener)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },

      // ============================================
      // ANIMACIONES PERSONALIZADAS MEDMIND
      // ============================================
      keyframes: {
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'wave': {
          '0%': {
            transform: 'translateX(0)',
          },
          '100%': {
            transform: 'translateX(-100%)',
          },
        },
        'shimmer': {
          '0%': {
            backgroundPosition: '-1000px 0',
          },
          '100%': {
            backgroundPosition: '1000px 0',
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(107, 70, 193, 0.7)',
          },
          '50%': {
            boxShadow: '0 0 0 10px rgba(107, 70, 193, 0)',
          },
        },
        'badge-pop': {
          '0%': {
            transform: 'scale(0)',
          },
          '70%': {
            transform: 'scale(1.1)',
          },
          '100%': {
            transform: 'scale(1)',
          },
        },
        // Animaciones de shadcn/ui (mantener)
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        // Animaciones MedMind
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'wave': 'wave 10s linear infinite',
        'shimmer': 'shimmer 2s infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
        'badge-pop': 'badge-pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        
        // Animaciones shadcn/ui (mantener)
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },

      // ============================================
      // UTILIDADES ADICIONALES
      // ============================================
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      
      // Sombras personalizadas
      boxShadow: {
        'purple': '0 10px 30px -10px rgba(107, 70, 193, 0.3)',
        'purple-lg': '0 20px 40px -15px rgba(107, 70, 193, 0.4)',
      },

      // Gradientes predefinidos
      backgroundImage: {
        'gradient-purple': 'linear-gradient(135deg, #6B46C1 0%, #5BC0EB 100%)',
        'gradient-purple-soft': 'linear-gradient(135deg, #f5f3ff 0%, #e0f2fe 100%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config