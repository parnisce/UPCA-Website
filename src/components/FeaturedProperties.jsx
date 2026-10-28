import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import Img from './Img'
import { PROPERTIES } from '../data/siteContent'

gsap.registerPlugin(ScrollTrigger)

// Untransformed document position of an element (offsetLeft/Top ignore transforms).
function docPos(el) {
  let x = 0
  let y = 0
  for (let n = el; n; n = n.offsetParent) {
    x += n.offsetLeft
    y += n.offsetTop
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight }
}

export default function FeaturedProperties() {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add({ ok: '(prefers-reduced-motion: no-preference)', desk: '(min-width: 1024px)' }, (ctx) => {
        if (!ctx.conditions.ok) return
        const cards = gsap.utils.toArray('[data-prop-card]')

        if (!ctx.conditions.desk) {
          gsap.from(cards, { y: 50, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12, scrollTrigger: { trigger: root.current, start: 'top 80%', once: true } })
          return
        }

        // Cards start as small floating cards on the hero photo, then travel down into the grid as you scroll.
        const slots = Array.from(document.querySelectorAll('[data-hero-slot]'))
        if (slots.length < cards.length) return
        // left-most grid card takes the left-most hero slot, and so on, so paths never cross
        const order = slots.map((s) => ({ s, x: docPos(s).x })).sort((a, b) => a.x - b.x)
        const delta = (i) => {
          const t = docPos(order[i].s)
          const c = docPos(cards[i])
          return { dx: t.x + t.w / 2 - (c.x + c.w / 2), dy: t.y + t.h / 2 - (c.y + c.h / 2), s: t.w / c.w }
        }

        gsap.fromTo(
          cards,
          { x: (i) => delta(i).dx, y: (i) => delta(i).dy, scale: (i) => delta(i).s },
          {
            x: 0,
            y: 0,
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: document.body,
              start: 0,
              end: () => docPos(root.current).y - window.innerHeight * 0.3,
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          },
        )
        gsap.from(cards, { opacity: 0, duration: 0.9, stagger: 0.15, delay: 0.8, ease: 'power2.out' })
      })
    },
    { scope: root },
  )

  return (
    <section id="work" ref={root} className="relative z-20 bg-navy-deep pb-16 pt-6 text-white md:pt-10">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 xl:px-14">
        <div data-reveal className="relative z-30 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow !text-white/70">Featured Work</p>
            <h2 className="mt-3 display text-3xl font-bold md:text-4xl">Recent Properties</h2>
            <p className="mt-4 max-w-md text-sm text-white/70 md:text-base">A look at some of our recent real estate media projects across Niagara, Hamilton and Burlington.</p>
          </div>
          <a href="#work" className="group inline-flex min-h-11 items-center gap-2 text-xs font-bold">View More Projects <ArrowRight size={14} className="transition group-hover:translate-x-1" aria-hidden="true" /></a>
        </div>

        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {PROPERTIES.map((p) => (
            <li key={p.title} data-prop-card className="relative will-change-transform">
              <a href="#contact" className="group relative block aspect-[4/3] overflow-hidden rounded-2xl shadow-xl shadow-navy/20">
                <Img src={p.img} alt={`${p.title} in ${p.location}`} className="transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-white">
                  <div>
                    <h3 className="text-xl font-bold md:text-2xl">{p.title}</h3>
                    <p className="text-sm text-white/80 md:text-base">{p.location}</p>
                  </div>
                  <span className="grid size-12 place-items-center rounded-full bg-white text-navy transition duration-300 group-hover:bg-gold group-hover:rotate-45">
                    <ArrowUpRight size={22} aria-hidden="true" />
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
