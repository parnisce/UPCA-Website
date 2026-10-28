import { useEffect, useRef, useState } from 'react'

// Muted, looping, inline video. The (large) file is only requested once the card is near the viewport,
// and it plays only while visible. `poster` shows until the first frame is ready.
// Reduced-motion visitors get a still first frame instead of autoplay.
export default function AutoVideo({ src, poster, className = '', label }) {
  const ref = useRef(null)
  const [near, setNear] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true)
          if (!reduce) v.play().catch(() => {})
        } else {
          v.pause()
        }
      },
      { rootMargin: '300px 0px', threshold: 0.01 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  return (
    <video
      ref={ref}
      src={near ? src : undefined}
      poster={poster}
      muted
      loop
      autoPlay
      playsInline
      preload={near ? 'auto' : 'none'}
      aria-label={label}
      className={`h-full w-full object-cover ${className}`}
    />
  )
}
