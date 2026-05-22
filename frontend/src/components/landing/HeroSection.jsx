import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, TrendingUp, Leaf } from 'lucide-react'

export default function HeroSection({ startAnimation }) {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const [isScrolled, setIsScrolled] = useState(false)
  
  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 600], [0, 180])
  const bgScale = useTransform(scrollY, [0, 600], [1, 1.12])
  const textY = useTransform(scrollY, [0, 400], [0, -80])

  // Scroll listener for sticky glass navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // GSAP Entrance Animations
  useEffect(() => {
    if (!startAnimation) return

    const { gsap } = window
    if (!gsap) return

    // Set initial hidden/blurred states to avoid Flash of Unstyled Content (FOUC)
    gsap.set('.gsap-reveal-nav-logo', { opacity: 0, x: -20 })
    gsap.set('.gsap-reveal-nav-link', { opacity: 0, y: -15 })
    gsap.set('.gsap-reveal-nav-btn', { opacity: 0, x: 20 })
    gsap.set('.gsap-reveal-pill', { filter: 'blur(8px)', opacity: 0, y: 15 })
    gsap.set('.gsap-reveal-title-line', { filter: 'blur(15px)', opacity: 0, y: 35 })
    gsap.set('.gsap-reveal-desc', { filter: 'blur(10px)', opacity: 0, y: 20 })
    gsap.set('.gsap-reveal-btn', { scale: 0.9, opacity: 0, y: 15 })
    gsap.set('.gsap-reveal-footer', { opacity: 0, y: 10 })

    const tl = gsap.timeline()

    // 1. Animate Navbar items
    tl.to('.gsap-reveal-nav-logo', {
      opacity: 1,
      x: 0,
      duration: 0.6,
      ease: 'power3.out'
    })

    tl.to('.gsap-reveal-nav-link', {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power3.out'
    }, '-=0.4')

    tl.to('.gsap-reveal-nav-btn', {
      opacity: 1,
      x: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power3.out'
    }, '-=0.4')

    // 2. Animate Category Pill
    tl.to('.gsap-reveal-pill', {
      filter: 'blur(0px)',
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.3')

    // 3. Animate Title lines with elegant blur-reveal
    tl.to('.gsap-reveal-title-line', {
      filter: 'blur(0px)',
      opacity: 1,
      y: 0,
      duration: 1.0,
      stagger: 0.18,
      ease: 'power4.out'
    }, '-=0.4')

    // 4. Animate Description paragraph
    tl.to('.gsap-reveal-desc', {
      filter: 'blur(0px)',
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.6')

    // 5. Animate CTA buttons
    tl.to('.gsap-reveal-btn', {
      scale: 1,
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'back.out(1.7)'
    }, '-=0.5')

    // 6. Animate Footer trust badges
    tl.to('.gsap-reveal-footer', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out'
    }, '-=0.4')

  }, [startAnimation])

  return (
    <section ref={heroRef} className="relative min-h-screen flex flex-col overflow-hidden pt-24">
      {/* Parallax bg — full bleed, no overlay */}
      <motion.div
        className="absolute inset-0 will-change-transform z-0"
        style={{ y: bgY, scale: bgScale }}
      >
        <img
          src="/hero-bg.png"
          alt="Farm landscape"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
      </motion.div>

      {/* Very light wash for text legibility only */}
      <div className="absolute inset-0 bg-white/20 z-0" />

      {/* Sticky, Glassmorphic Nav */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 transition-all duration-300 ${
          isScrolled
            ? 'py-3.5 bg-white/75 backdrop-blur-md border-b border-black/5 shadow-[0_4px_30px_rgba(0,0,0,0.03)]'
            : 'py-6 bg-transparent border-b border-transparent'
        }`}
      >
        {/* Logo */}
        <div className="gsap-reveal-nav-logo opacity-0 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/60 rounded-xl flex items-center justify-center border border-black/10 backdrop-blur-sm shadow-sm">
            <Leaf className="w-5 h-5 text-green-700 animate-pulse" />
          </div>
          <span className="text-black font-bold text-xl font-display drop-shadow-sm">Krishi Bazar</span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Mandi Rates', 'Marketplace', 'AI Detection'].map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              className="gsap-reveal-nav-link opacity-0 text-black/75 hover:text-green-700 transition-colors text-sm font-semibold drop-shadow-sm relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-green-600 hover:after:w-full after:transition-all after:duration-300"
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/auth')}
            className="gsap-reveal-nav-btn opacity-0 text-black/75 hover:text-green-700 transition-colors font-semibold text-sm hidden md:block"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="gsap-reveal-nav-btn opacity-0 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all hover:scale-105 text-sm shadow-lg shadow-green-600/10"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <motion.div
        className="relative z-10 flex-1 flex items-center justify-center px-6 md:px-12 pb-24 mt-8 md:mt-0"
        style={{ y: textY }}
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Pill Badge */}
          <div className="gsap-reveal-pill opacity-0 inline-flex items-center gap-2 bg-white/70 border border-black/10 rounded-full px-4 py-2 text-green-700 text-sm font-semibold mb-8 backdrop-blur-sm shadow-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            India's #1 Smart Agriculture Platform
          </div>

          {/* Heading with Blur-Reveal */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-black font-display leading-tight mb-6 drop-shadow-sm text-balance">
            <span className="gsap-reveal-title-line opacity-0 block">Empowering Farmers</span>
            <span className="gsap-reveal-title-line opacity-0 block bg-gradient-to-r from-green-700 via-emerald-600 to-green-800 bg-clip-text text-transparent drop-shadow-sm">
              with Smart Agriculture
            </span>
          </h1>

          {/* Subtitle with Blur-Reveal */}
          <p className="gsap-reveal-desc opacity-0 text-lg md:text-xl text-black/80 max-w-2xl mx-auto mb-10 leading-relaxed font-medium text-balance">
            Sell your crops directly online, check live mandi rates, detect diseases with AI — all in one powerful platform built for India's farmers.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/auth')}
              data-magnetic
              className="gsap-reveal-btn opacity-0 flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-green-600/20 text-lg group transition-all hover:scale-105 active:scale-95"
            >
              Start Selling
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById('mandi-rates')?.scrollIntoView({ behavior: 'smooth' })}
              data-magnetic
              className="gsap-reveal-btn opacity-0 flex items-center gap-3 bg-white/75 border border-black/10 text-black font-semibold px-8 py-4 rounded-2xl backdrop-blur-sm text-lg hover:bg-white/95 transition-all shadow-md hover:scale-105 active:scale-95"
            >
              <TrendingUp className="w-5 h-5 text-green-600" />
              Check Mandi Rates
            </button>
          </div>

          {/* Value Propositions */}
          <div className="flex items-center justify-center gap-6 mt-12 flex-wrap">
            {['No credit card required', 'Free forever plan', '18 Indian Languages'].map(item => (
              <div
                key={item}
                className="gsap-reveal-footer opacity-0 flex items-center gap-2 text-black/65 text-sm font-semibold"
              >
                <div className="w-4 h-4 rounded-full border border-green-600/50 flex items-center justify-center bg-white/50">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
