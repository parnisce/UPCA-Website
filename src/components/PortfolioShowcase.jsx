import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { BadgeCheck, HandCoins, MapPin, AlarmClockCheck } from 'lucide-react'
import Img from './Img'
import GridOverlay from './GridOverlay'
import { IMG, FEATURES, FEATURES_INTRO } from '../data/siteContent'

gsap.registerPlugin(ScrollTrigger)

const ICONS = { quality: BadgeCheck, packages: HandCoins, local: MapPin, fast: AlarmClockCheck }

export default function PortfolioShowcase() {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-feature]', { y: 50, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.14, scrollTrigger: { trigger: '[data-features]', start: 'top 82%', once: true } })
        gsap.from('[data-feature-icon]', { scale: 0.6, duration: 0.7, ease: 'back.out(2)', stagger: 0.14, scrollTrigger: { trigger: '[data-features]', start: 'top 82%', once: true } })
      })
    },
    { scope: root },
  )

  return (
    <section id="about" ref={root} className="relative overflow-hidden bg-navy-deep py-24 text-white md:py-32">
      {/* photo sits behind the copy and melts into the page colour above and below, so the page keeps scrolling as one piece */}
      <div className="absolute inset-0">
        <Img src={IMG.showcase} alt="" parallax />
        <div className="absolute inset-0 bg-navy-deep/85" />
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-navy-deep to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-navy-deep to-transparent" />
      </div>
      <GridOverlay />

      <div className="relative mx-auto max-w-[1240px] px-5 md:px-10 xl:px-14">
        <div data-reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow !text-white/70">Why UPCA</p>
          <h2 className="display mt-4 text-3xl md:text-5xl">
            Marketing That Makes Your <span className="text-gold">Listing Stand Out</span>
          </h2>
          <p className="mt-5 text-base text-white/75">{FEATURES_INTRO}</p>
        </div>

        <ul data-features className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {FEATURES.map((f) => {
            const Icon = ICONS[f.icon]
            return (
              <li key={f.title} data-feature className="text-center">
                <span data-feature-icon className="mx-auto grid size-24 place-items-center rounded-full bg-gold text-white shadow-xl shadow-gold/20">
                  <Icon size={38} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-lg font-bold">{f.title}</h3>
                <p className="mx-auto mt-3 max-w-[17rem] text-sm leading-relaxed text-white/70">{f.text}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
