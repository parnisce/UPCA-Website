import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// One shared animation language: fade-up reveals, staggered groups, and subtle parallax.
//   data-reveal    -> single element fades up
//   data-stagger   -> its children fade up in sequence
//   data-parallax  -> image drifts slowly (desktop only)
// All of it is skipped under prefers-reduced-motion.
export function useReveal(scope) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add({ ok: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 768px)' }, (ctx) => {
        if (!ctx.conditions.ok) return
        const trig = (el, start = 'top 88%') => ({ trigger: el, start, once: true })

        gsap.utils.toArray('[data-reveal]').forEach((el) =>
          gsap.from(el, { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: trig(el) }),
        )
        gsap.utils.toArray('[data-stagger]').forEach((el) =>
          gsap.from(el.children, { y: 50, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12, scrollTrigger: trig(el, 'top 85%') }),
        )
        if (ctx.conditions.wide) {
          gsap.utils.toArray('[data-parallax]').forEach((el) =>
            gsap.fromTo(
              el,
              { yPercent: -7 },
              { yPercent: 7, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } },
            ),
          )
        }
      })
      const refresh = () => ScrollTrigger.refresh()
      window.addEventListener('load', refresh)
      return () => window.removeEventListener('load', refresh)
    },
    { scope },
  )
}
