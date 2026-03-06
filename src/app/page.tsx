// src/app/page.tsx
// Landing Page Principal - MedMind

import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import CoursesSection from '@/components/landing/CoursesSection'
import AboutUs from '@/components/landing/AboutUs'
import Contact from '@/components/landing/Contact'
import Footer from '@/components/landing/Footer'
import WhatsAppButton from '@/components/landing/WhatsAppButton'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <Features />

      {/* Courses Section */}
      <CoursesSection />

      {/* About Us Section */}
      <AboutUs />

      {/* Contact Section */}
      <Contact />

      {/* Footer */}
      <Footer />

      {/* WhatsApp Button Flotante */}
      <WhatsAppButton />
    </div>
  )
}