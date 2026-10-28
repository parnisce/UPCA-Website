import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ChevronRight } from 'lucide-react'
import Icon from './icons'
import GridOverlay from './GridOverlay'
import { PROCESS } from '../data/siteContent'

gsap.registerPlugin(ScrollTrigger)

export default function Process() {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add({ ok: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 768px)' }, (ctx) => {
        if (!ctx.conditions.ok) return
        const ol = root.current.querySelector('ol')
        const tiles = gsap.utils.toArray('[data-tile]')
        const badges = gsap.utils.toArray('[data-badge]')
        const titles = gsap.utils.toArray('[data-title]')

        // entrance: steps rise in, connectors pop
        const intro = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 70%', once: true } })
        intro
          .from('[data-step]', { y: 50, opacity: 0, duration: 0.8, stagger: 0.3, ease: 'power3.out' })
          .from('[data-badge]', { opacity: 0, y: -12, duration: 0.5, stagger: 0.3, ease: 'back.out(3)' }, 0.5)
          .from('[data-link]', { scale: 0, opacity: 0, duration: 0.5, stagger: 0.3, ease: 'back.out(2)' }, 0.6)

        // scroll-linked progress: a gold line draws through the steps and each one lights up as it is reached
        if (ctx.conditions.wide) {
          const track = ol.querySelector('[data-track]')
          const fill = ol.querySelector('[data-fill]')
          // layout position of an element's centre inside the <ol>, ignoring transforms (entrance/scale tweens)
          const centre = (el) => {
            let x = el.offsetWidth / 2
            let y = el.offsetHeight / 2
            for (let n = el; n && n !== ol; n = n.offsetParent) {
              x += n.offsetLeft
              y += n.offsetTop
            }
            return { x, y }
          }
          const place = () => {
            const a = centre(tiles[0])
            const b = centre(tiles[tiles.length - 1])
            ;[track, fill].forEach((el) => Object.assign(el.style, { left: `${a.x}px`, width: `${b.x - a.x}px`, top: `${a.y}px` }))
          }
          place()
          ScrollTrigger.addEventListener('refresh', place)

          const scrub = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: ol, start: 'top 72%', end: 'bottom 38%', scrub: 0.6 },
          })
          scrub.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: tiles.length - 1 }, 0)
          tiles.forEach((tile, i) => {
            const t = i // the line reaches step i at time i
            scrub
              .fromTo(tile, { borderColor: 'rgba(255,255,255,0.16)', boxShadow: '0 0 0 0 rgba(251,184,42,0)', scale: 1 }, { borderColor: '#fbb82a', boxShadow: '0 0 44px 4px rgba(251,184,42,0.35)', scale: 1.08, duration: 0.3, ease: 'power2.out' }, Math.max(0, t - 0.15))
              .fromTo(badges[i], { scale: 1 }, { scale: 1.2, duration: 0.3, yoyo: true, repeat: 1 }, Math.max(0, t - 0.15))
              .fromTo(titles[i], { color: '#ffffff' }, { color: '#fbb82a', duration: 0.3 }, Math.max(0, t - 0.15))
          })
          scrub.to({}, { duration: 0.4 }) // short rest after the last step

          return () => ScrollTrigger.removeEventListener('refresh', place)
        }
      })

      // ambient, per-icon motion (kept subtle, skipped for reduced motion)
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray('[data-tile]').forEach((el, i) =>
          gsap.to(el, { y: -4, duration: 1.6 + i * 0.25, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.3 }),
        )
        // 02: camera shutter flash
        gsap.timeline({ repeat: -1, repeatDelay: 2.6, delay: 1.5 })
          .fromTo('[data-flash]', { opacity: 0, scale: 0.7 }, { opacity: 0.85, scale: 1.1, duration: 0.12, ease: 'power2.out' })
          .to('[data-flash]', { opacity: 0, duration: 0.35 })
        // 03: rocket lifts off and drifts back
        gsap.timeline({ repeat: -1, repeatDelay: 1.8 })
          .to('[data-icon="rocket"]', { x: 7, y: -9, rotate: 6, duration: 0.7, ease: 'power2.in' })
          .to('[data-icon="rocket"]', { x: 0, y: 0, rotate: 0, duration: 0.9, ease: 'power2.out' })
        // connectors: arrows nudge forward
        gsap.to('[data-link] svg', { x: 6, duration: 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative overflow-hidden bg-navy-deep pb-20 pt-24 text-white md:pb-24 md:pt-36">
      <GridOverlay />
      <div className="relative mx-auto max-w-[1240px] px-5 md:px-10 xl:px-14">
        <div data-reveal className="text-center">
          <p className="eyebrow !text-white/70">How It Works</p>
          <h2 className="display mt-3 text-3xl md:text-4xl">A Simple Process, Amazing Results</h2>
        </div>
        <ol className="relative mt-12 grid items-start gap-10 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:gap-6">
          {/* progress line behind the tiles (desktop); positioned from the real tile centres in JS */}
          <span aria-hidden="true" data-track className="pointer-events-none absolute hidden h-px bg-white/10 md:block" />
          <span aria-hidden="true" data-fill className="pointer-events-none absolute hidden h-px origin-left scale-x-0 bg-gold shadow-[0_0_10px_rgba(251,184,42,0.7)] md:block" />
          {PROCESS.flatMap((s, i) => {
            const step = (
              <li key={s.title} data-step className="relative flex gap-4 md:block md:text-center">
                <div data-tile className="relative grid size-16 shrink-0 place-items-center rounded-2xl border border-white/15 bg-navy-deep text-gold md:mx-auto md:size-20">
                  <span aria-hidden="true" data-flash={s.icon === 'camera' ? '' : undefined} className={`pointer-events-none absolute inset-2 rounded-xl bg-white/70 opacity-0 ${s.icon === 'camera' ? '' : 'hidden'}`} />
                  <span data-icon={s.icon} className="relative block"><Icon name={s.icon} size={30} strokeWidth={1.4} /></span>
                  <span data-badge className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full bg-gold text-[0.7rem] font-black text-navy">0{i + 1}</span>
                </div>
                <div>
                  <h3 data-title className="text-base font-bold md:mt-5">{s.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/70 md:mx-auto md:max-w-[15rem]">{s.text}</p>
                </div>
              </li>
            )
            if (i === PROCESS.length - 1) return [step]
            return [
              step,
              <li key={`a${i}`} data-link aria-hidden="true" className="hidden items-center self-start pt-7 text-gold md:flex">
                <ChevronRight size={22} />
              </li>,
            ]
          })}
        </ol>
      </div>
    </section>
  )
}
