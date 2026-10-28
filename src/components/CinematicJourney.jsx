import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createJourney, DWELL_P } from '../three/journey'
import { SCENES } from '../data/siteContent'

gsap.registerPlugin(ScrollTrigger)

const PIN_QUERY = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)'
const SCROLL_VH = 7 // total scroll distance of the tour, in viewport heights
const pad = (n) => String(n).padStart(2, '0')
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

function Photo({ scene, className = '', ...rest }) {
  return (
    <picture className="block h-full w-full">
      <source srcSet={scene.webp} type="image/webp" />
      <img src={scene.png} alt={scene.alt} width="1672" height="941" className={`h-full w-full object-cover ${className}`} {...rest} />
    </picture>
  )
}

export default function CinematicJourney() {
  // Three.js camera tour on desktop; plain stacked photos on mobile, reduced motion, or without WebGL
  const [mode, setMode] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(PIN_QUERY).matches && hasWebGL() ? 'tour' : 'stacked',
  )

  useEffect(() => {
    const mq = window.matchMedia(PIN_QUERY)
    const on = () => setMode(mq.matches && hasWebGL() ? 'tour' : 'stacked')
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  return (
    <section id="journey" className="relative bg-navy-deep text-white">
      {mode === 'tour' ? <CameraTour onFail={() => setMode('stacked')} /> : <StackedJourney />}
    </section>
  )
}

function CameraTour({ onFail }) {
  const root = useRef(null)
  const stage = useRef(null)
  const texts = useRef([])
  const fills = useRef([])
  const cue = useRef(null)
  const failRef = useRef(onFail)
  failRef.current = onFail

  useEffect(() => {
    let journey
    try {
      journey = createJourney(stage.current, {
        // runs every frame with the smoothed progress: drives the HTML copy and progress bar
        onFrame: (p) => {
          DWELL_P.forEach((pd, k) => {
            const el = texts.current[k]
            if (!el) return
            const a = smooth(pd - 0.075, pd - 0.035, p) * (k < DWELL_P.length - 1 ? 1 - smooth(pd + 0.035, pd + 0.075, p) : 1)
            el.style.opacity = a
            el.style.transform = `translate3d(0, ${(1 - a) * (p < pd ? 26 : -26)}px, 0)`
            el.style.visibility = a > 0.01 ? 'visible' : 'hidden'
            const start = k === 0 ? 0 : DWELL_P[k] - 0.075
            const end = k === DWELL_P.length - 1 ? 1 : DWELL_P[k + 1] - 0.075
            fills.current[k]?.style.setProperty('transform', `scaleX(${Math.min(1, Math.max(0, (p - start) / (end - start)))})`)
          })
          if (cue.current) cue.current.style.opacity = 1 - smooth(0.005, 0.04, p)
        },
      })
    } catch {
      failRef.current()
      return
    }

    // Scroll -> camera: the section is pinned and its scroll progress is the camera's progress. No wheel hijacking.
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * SCROLL_VH)}`,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => journey.setProgress(self.progress),
    })
    return () => {
      st.kill()
      journey.dispose()
    }
  }, [])

  return (
    <div ref={root} className="relative h-screen overflow-hidden bg-navy-deep">
      <div ref={stage} className="absolute inset-0" />
      {/* vignette keeps the copy readable and the frame cinematic */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_65%_50%,transparent_45%,rgb(6_19_48/0.75)_100%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[42%] bg-gradient-to-r from-navy-deep/85 via-navy-deep/40 to-transparent" />

      <div className="pointer-events-none absolute inset-0 mx-auto max-w-[1440px] px-10 pt-24 xl:px-14">
        <div className="relative h-full">
          <div className="absolute left-0 top-1/2 w-[30%] min-w-[19rem] -translate-y-1/2">
            <div className="relative h-[22rem]">
              {SCENES.map((s, i) => (
                <div key={s.id} ref={(el) => (texts.current[i] = el)} className="absolute inset-x-0 top-0" style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? 'visible' : 'hidden' }}>
                  <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                    <span className="display text-2xl normal-case tracking-normal text-gold">{pad(i + 1)}</span>
                    <span className="text-white/40">/ {pad(SCENES.length)}</span>
                    <span className="ml-2">{s.kicker}</span>
                  </p>
                  <h2 className="mt-5 display text-[1.8rem] leading-[1.08] xl:text-[2.1rem]">{s.title}</h2>
                  <p className="mt-5 max-w-sm text-base leading-relaxed text-white/75">{s.text}</p>
                </div>
              ))}
            </div>
            <ol aria-label="Journey progress" className="mt-2 grid grid-cols-6 gap-2">
              {SCENES.map((s, i) => (
                <li key={s.id}>
                  <span className="mb-2 block text-[0.65rem] font-bold text-white/40">{pad(i + 1)}</span>
                  <span className="block h-[3px] overflow-hidden rounded-full bg-white/15">
                    <span ref={(el) => (fills.current[i] = el)} className="block h-full origin-left bg-gold" style={{ transform: 'scaleX(0)' }} />
                  </span>
                </li>
              ))}
            </ol>
            <div ref={cue} className="mt-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              <span className="relative h-9 w-px overflow-hidden bg-white/20"><span className="absolute inset-x-0 top-0 h-3 animate-[cue_1.6s_ease-in-out_infinite] bg-gold" /></span>
              Scroll to explore
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Mobile / reduced-motion / no-WebGL: no pinning, every scene readable top to bottom.
function StackedJourney() {
  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-20 md:px-10 lg:pt-28">
      <ol className="grid gap-12 md:gap-16">
        {SCENES.map((s, i) => (
          <li key={s.id} data-reveal className="grid items-center gap-6 lg:grid-cols-[minmax(0,30%)_minmax(0,1fr)] lg:gap-12">
            <div className="lg:order-1">
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                <span className="display text-2xl normal-case tracking-normal text-gold">{pad(i + 1)}</span>
                <span className="text-white/40">/ {pad(SCENES.length)}</span>
                <span className="ml-2">{s.kicker}</span>
              </p>
              <h2 className="mt-4 display text-3xl font-bold leading-tight">{s.title}</h2>
              <p className="mt-4 text-base leading-relaxed text-white/75">{s.text}</p>
            </div>
            <div className="aspect-video overflow-hidden rounded-2xl shadow-xl shadow-black/40 ring-1 ring-white/10 lg:order-2">
              <Photo scene={s} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
