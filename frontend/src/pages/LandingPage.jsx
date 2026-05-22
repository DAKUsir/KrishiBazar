import { useState, useEffect } from 'react'
import CustomCursor from '../components/landing/CustomCursor'
import Preloader from '../components/landing/Preloader'
import HeroSection from '../components/landing/HeroSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import MandiRatesSection from '../components/landing/MandiRatesSection'
import DiseaseDetectionSection from '../components/landing/DiseaseDetectionSection'
import MarketplaceSection from '../components/landing/MarketplaceSection'
import StatsSection from '../components/landing/StatsSection'
import TestimonialsSection from '../components/landing/TestimonialsSection'
import AppSection from '../components/landing/AppSection'
import Footer from '../components/landing/Footer'

export default function LandingPage() {
  const [isPreloaderActive, setIsPreloaderActive] = useState(true)
  const [startHeroAnimation, setStartHeroAnimation] = useState(false)

  // Magnetic hover effect
  useEffect(() => {
    if (isPreloaderActive) return

    const handleMouseMove = (e) => {
      document.querySelectorAll('[data-magnetic]').forEach(el => {
        const rect = el.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dx = e.clientX - cx
        const dy = e.clientY - cy
        const dist = Math.hypot(dx, dy)
        if (dist < 80) {
          const s = (1 - dist / 80) * 0.3
          el.style.transform = `translate(${dx * s}px, ${dy * s}px)`
        } else {
          el.style.transform = ''
        }
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isPreloaderActive])

  // Cursor light
  useEffect(() => {
    if (isPreloaderActive) return

    const move = (e) => {
      const el = document.getElementById('cursor-light')
      if (el) { el.style.left = `${e.clientX}px`; el.style.top = `${e.clientY}px` }
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [isPreloaderActive])

  const handlePreloaderComplete = () => {
    setIsPreloaderActive(false)
    setStartHeroAnimation(true)
  }

  return (
    <div className={`relative bg-white min-h-screen ${isPreloaderActive ? 'h-screen overflow-hidden' : 'overflow-x-hidden'}`}>
      {/* Sprouting Seedling Preloader overlay */}
      {isPreloaderActive && <Preloader onComplete={handlePreloaderComplete} />}

      <CustomCursor />

      {/* Cursor ambient light */}
      <div
        id="cursor-light"
        className="fixed pointer-events-none z-0"
        style={{
          width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
          transition: 'left 0.15s ease, top 0.15s ease',
          display: isPreloaderActive ? 'none' : 'block'
        }}
      />

      <HeroSection startAnimation={startHeroAnimation} />
      <FeaturesSection />
      <StatsSection />
      <MandiRatesSection />
      <DiseaseDetectionSection />
      <MarketplaceSection />
      <TestimonialsSection />
      <AppSection />
      <Footer />

      <style>{`html { scroll-behavior: smooth; }`}</style>
    </div>
  )
}
