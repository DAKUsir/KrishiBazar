import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef(null)
  const dotRef = useRef(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const dot = dotRef.current
    let mouseX = 0, mouseY = 0
    let cursorX = 0, cursorY = 0

    const moveCursor = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.left = `${mouseX}px`
      dot.style.top = `${mouseY}px`
    }

    const animateCursor = () => {
      const speed = 0.12
      cursorX += (mouseX - cursorX) * speed
      cursorY += (mouseY - cursorY) * speed
      cursor.style.left = `${cursorX}px`
      cursor.style.top = `${cursorY}px`
      requestAnimationFrame(animateCursor)
    }

    const handleHover = () => cursor.classList.add('cursor-hover')
    const handleLeave = () => cursor.classList.remove('cursor-hover')

    window.addEventListener('mousemove', moveCursor)
    animateCursor()

    const interactables = document.querySelectorAll('a, button, [data-magnetic]')
    interactables.forEach(el => {
      el.addEventListener('mouseenter', handleHover)
      el.addEventListener('mouseleave', handleLeave)
    })

    return () => {
      window.removeEventListener('mousemove', moveCursor)
    }
  }, [])

  return (
    <>
      <style>{`
        * { cursor: none !important; }
        .custom-cursor {
          position: fixed; pointer-events: none; z-index: 99999;
          width: 40px; height: 40px;
          transform: translate(-50%, -50%);
          transition: width 0.3s, height 0.3s, opacity 0.3s;
        }
        .custom-cursor.cursor-hover {
          width: 60px; height: 60px;
        }
        .cursor-dot {
          position: fixed; pointer-events: none; z-index: 99999;
          width: 6px; height: 6px;
          background: #4ade80;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: background 0.2s;
        }
        @media (hover: none) { * { cursor: auto !important; } .custom-cursor, .cursor-dot { display: none; } }
      `}</style>

      <div ref={cursorRef} className="custom-cursor">
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" stroke="rgba(74,222,128,0.4)" strokeWidth="1.5" fill="rgba(5,46,22,0.5)" />
          {/* Leaf shape */}
          <path d="M20 10 C26 10 30 15 28 22 C26 28 20 30 20 30 C20 30 14 28 12 22 C10 15 14 10 20 10Z"
            fill="rgba(74,222,128,0.8)" stroke="#4ade80" strokeWidth="0.5" />
          <path d="M20 10 L20 30" stroke="#052e16" strokeWidth="1" strokeLinecap="round" />
          <path d="M20 18 L15 14" stroke="#052e16" strokeWidth="0.8" strokeLinecap="round" />
          <path d="M20 22 L25 18" stroke="#052e16" strokeWidth="0.8" strokeLinecap="round" />
        </svg>
      </div>
      <div ref={dotRef} className="cursor-dot" />
    </>
  )
}
