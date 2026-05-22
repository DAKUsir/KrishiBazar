import { useEffect, useRef } from 'react'

export default function Preloader({ onComplete }) {
  const containerRef = useRef(null)
  const stemRef = useRef(null)
  const leftLeafRef = useRef(null)
  const rightLeafRef = useRef(null)
  const sunRef = useRef(null)
  const brandRef = useRef(null)
  const textRef = useRef(null)
  const progressRef = useRef(null)

  useEffect(() => {
    const { gsap } = window
    if (!gsap) {
      // Fallback if GSAP is not loaded for some reason
      const timer = setTimeout(() => {
        onComplete()
      }, 2000)
      return () => clearTimeout(timer)
    }

    // Set initial states
    gsap.set(stemRef.current, { strokeDashoffset: 150, strokeDasharray: 150 })
    gsap.set([leftLeafRef.current, rightLeafRef.current], { scale: 0, transformOrigin: 'bottom center' })
    gsap.set(sunRef.current, { scale: 0, opacity: 0, transformOrigin: 'center center' })
    gsap.set(brandRef.current, { filter: 'blur(10px)', opacity: 0, y: 15 })
    gsap.set(textRef.current, { opacity: 0 })
    gsap.set(progressRef.current, { width: '0%' })

    const tl = gsap.timeline({
      onComplete: () => {
        // Exit animation
        gsap.to(containerRef.current, {
          yPercent: -100,
          duration: 1.1,
          ease: 'power4.inOut',
          onComplete: onComplete
        })
      }
    })

    // 1. Progress Bar animation
    tl.to(progressRef.current, {
      width: '100%',
      duration: 2.0,
      ease: 'power1.inOut'
    }, 0)

    // Sun glows
    tl.to(sunRef.current, {
      scale: 1,
      opacity: 0.15,
      duration: 1.2,
      ease: 'back.out(1.5)'
    }, 0.2)

    // Stem grows
    tl.to(stemRef.current, {
      strokeDashoffset: 0,
      duration: 1.2,
      ease: 'power1.out'
    }, 0.3)

    // Leaves scale and tilt
    tl.to(leftLeafRef.current, {
      scale: 1,
      rotation: -10,
      duration: 0.8,
      ease: 'elastic.out(1, 0.5)'
    }, 0.9)

    tl.to(rightLeafRef.current, {
      scale: 1,
      rotation: 10,
      duration: 0.8,
      ease: 'elastic.out(1, 0.5)'
    }, 1.0)

    // Glow effect
    tl.to([leftLeafRef.current, rightLeafRef.current], {
      filter: 'drop-shadow(0 0 8px rgba(74, 222, 128, 0.6))',
      duration: 0.5
    }, 1.3)

    // Brand Name Blur Reveal
    tl.to(brandRef.current, {
      filter: 'blur(0px)',
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power2.out'
    }, 1.1)

    tl.to(textRef.current, {
      opacity: 0.6,
      duration: 0.5
    }, 1.5)

  }, [onComplete])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-green-950 via-emerald-950 to-black select-none overflow-hidden"
    >
      {/* Sun/Light Aura in Background */}
      <div
        ref={sunRef}
        className="absolute w-80 h-80 rounded-full bg-amber-400 blur-[80px] pointer-events-none opacity-0"
        style={{ transform: 'translateY(-20px)' }}
      />

      <div className="relative flex flex-col items-center gap-8">
        {/* Soil & Sprouting Seedling SVG */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Ground / Soil Mound */}
            <path
              d="M15 80 C 35 74, 65 74, 85 80 L 85 85 L 15 85 Z"
              fill="url(#soilGradient)"
              className="opacity-90"
            />
            
            {/* Seed under soil */}
            <ellipse cx="50" cy="78" rx="6" ry="4" fill="#854d0e" />

            {/* Stem Path */}
            <path
              ref={stemRef}
              d="M50 78 C 50 65, 46 52, 50 38"
              stroke="url(#stemGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="150"
              strokeDashoffset="150"
            />

            {/* Left Leaf */}
            <path
              ref={leftLeafRef}
              d="M50 48 C 38 48, 30 38, 38 32 C 44 32, 48 38, 50 48"
              fill="url(#leafGradient)"
              stroke="#22c55e"
              strokeWidth="1"
            />

            {/* Right Leaf */}
            <path
              ref={rightLeafRef}
              d="M50 42 C 62 42, 70 32, 62 26 C 56 26, 52 32, 50 42"
              fill="url(#leafGradient)"
              stroke="#22c55e"
              strokeWidth="1"
            />

            {/* Gradients */}
            <defs>
              <linearGradient id="soilGradient" x1="50" y1="74" x2="50" y2="85" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#713f12" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>
              <linearGradient id="stemGradient" x1="50" y1="78" x2="50" y2="38" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#15803d" />
                <stop offset="100%" stopColor="#4ade80" />
              </linearGradient>
              <linearGradient id="leafGradient" x1="45" y1="30" x2="55" y2="50" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#86efac" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Text Area */}
        <div className="text-center flex flex-col gap-2 z-10">
          <h1
            ref={brandRef}
            className="text-3xl md:text-4xl font-extrabold tracking-wide text-white font-display flex items-center justify-center gap-3 drop-shadow-md"
          >
            <span className="bg-gradient-to-r from-green-400 to-amber-300 bg-clip-text text-transparent">
              Krishi Bazar
            </span>
          </h1>
          <p ref={textRef} className="text-sm font-medium tracking-widest uppercase text-green-300/80">
            Nurturing Indian Agriculture
          </p>
        </div>
      </div>

      {/* Modern, sleek linear progress indicator at the bottom */}
      <div className="absolute bottom-12 w-64 h-1 bg-white/10 rounded-full overflow-hidden">
        <div ref={progressRef} className="h-full bg-gradient-to-r from-green-500 to-amber-400 rounded-full" />
      </div>
    </div>
  )
}
