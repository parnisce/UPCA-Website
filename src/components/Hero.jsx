import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ArrowRight, Play, MapPin, ChevronDown } from 'lucide-react'
import Icon from './icons'
import Img from './Img'
import HeroScene from './HeroScene'
import GridOverlay from './GridOverlay'
import { IMG, TRUST, CONTACT } from '../data/siteContent'

// Invisible landing spots for the property cards (see FeaturedProperties): the cards start here and travel down on scroll.
const slotPos = [
  'right-10 top-32 w-72 xl:right-14',
  'left-[calc(50%+4.36rem)] top-[345px] w-[253px]',
  'right-10 bottom-40 w-72 xl:right-14',
]

export default function Hero() {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        tl.from('[data-hero-photo]', { scale: 1.12, opacity: 0, duration: 1.6, ease: 'power2.out' })
          .from('[data-hero-eyebrow]', { y: 20, opacity: 0, duration: 0.7 }, 0.3)
          .from('[data-hero-line] > span', { yPercent: 110, duration: 1, stagger: 0.14 }, 0.4)
          .from('[data-hero-fade]', { y: 24, opacity: 0, duration: 0.8, stagger: 0.1 }, 0.9)
          .from('[data-hero-pill]', { xPercent: 40, opacity: 0, scale: 0.85, duration: 1, ease: 'back.out(1.5)' }, 1.6)
          .from('[data-pill-city]', { y: 14, opacity: 0, stagger: 0.12, duration: 0.6 }, 2)
        // pin bob, a light sweep across the pill, and a gold highlight that walks through the three cities
        gsap.to('[data-pill-pin]', { y: -4, duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: -1 })
        gsap.fromTo('[data-pill-shine]', { xPercent: 0 }, { xPercent: 700, duration: 1.6, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.5, delay: 3 })
        const walk = gsap.timeline({ repeat: -1, delay: 3 })
        gsap.utils.toArray('[data-pill-city]').forEach((c) => walk.to(c, { color: '#fbb82a', scale: 1.12, duration: 0.35 }).to(c, { color: '#ffffff', scale: 1, duration: 0.35 }, '+=0.7'))
      })
    },
    { scope: root },
  )

  const lines = [['Make Every'], ['Listing ', { gold: 'Impossible' }], ['to Ignore.']]

  return (
    <section id="top" ref={root} className="relative overflow-hidden bg-navy-deep text-white pb-16 pt-28 md:pt-36 lg:min-h-[52rem] lg:pb-32">
      <div className="relative z-[1] mx-auto max-w-[1440px] px-5 md:px-10 xl:px-14">
        <div className="max-w-xl lg:max-w-[38rem]">
          <p data-hero-eyebrow className="eyebrow !text-white/70">Real Estate Marketing &amp; Media</p>
          <h1 className="display mt-5 text-[2.4rem] leading-[1] text-white sm:text-6xl lg:text-[3.6rem]">
            {lines.map((parts, i) => (
              <span key={i} data-hero-line className="block overflow-hidden pb-1">
                <span className="block">
                  {parts.map((p, j) => (typeof p === 'string' ? p : <span key={j} className="text-gold">{p.gold}</span>))}
                </span>
              </span>
            ))}
          </h1>
          <p data-hero-fade className="glass mt-6 max-w-md rounded-2xl p-5 text-[0.95rem] leading-relaxed text-white/80 md:text-base">
            Professional real estate photography, cinematic video tours, drone media, agent websites and full-service marketing for Niagara, Hamilton, Burlington and surrounding areas.
          </p>
          <div data-hero-fade className="mt-8 flex flex-wrap items-center gap-5">
            <a href={CONTACT.consultationHref} className="btn-gold">Book a Free Consultation <ArrowRight size={15} aria-hidden="true" /></a>
            <a href="#work" className="group flex items-center gap-3 text-left">
              <span className="grid size-11 place-items-center rounded-full border border-gold bg-white/10 text-gold backdrop-blur transition group-hover:bg-gold group-hover:text-navy"><Play size={16} fill="currentColor" aria-hidden="true" /></span>
              <span className="text-xs font-bold uppercase leading-tight tracking-wider text-white">Watch Our Showreel<span className="block font-normal normal-case tracking-normal text-white/60">See the difference</span></span>
            </a>
          </div>
          <ul data-hero-fade className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {TRUST.map((t) => (
              <li key={t.title} className="flex items-center gap-3">
                <Icon name={t.icon} size={26} strokeWidth={1.6} className="shrink-0 text-gold" />
                <span className="text-[0.68rem] leading-tight text-white/60"><b className="block text-white">{t.title}</b>{t.sub}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* photo: right side on desktop, banner on mobile */}
      <div className="relative mt-10 h-[26rem] sm:h-[30rem] lg:absolute lg:inset-0 lg:mt-0 lg:h-auto">
        <div data-hero-photo className="absolute inset-0 overflow-hidden">
          <Img src={IMG.hero} alt="Modern luxury glass home with pool at sunset" eager fetchPriority="high" />
          <HeroScene src={IMG.hero} />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/60 via-transparent to-transparent lg:hidden" />
        </div>
        <div className="absolute inset-0 hidden bg-gradient-to-r from-navy-deep via-navy-deep/90 via-[30%] to-transparent to-[62%] lg:block" />
        <div className="absolute inset-x-0 bottom-0 hidden h-40 bg-gradient-to-t from-navy-deep/90 to-transparent lg:block" />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[12] mx-auto hidden max-w-[1440px] lg:block">
        {slotPos.map((p) => <div key={p} data-hero-slot aria-hidden="true" className={`absolute aspect-[4/3] ${p}`} />)}
        <div data-hero-pill className="absolute bottom-14 right-10 hidden items-center gap-5 overflow-hidden rounded-full bg-navy px-9 py-5 text-lg font-bold text-white shadow-2xl shadow-navy/40 ring-1 ring-white/15 xl:right-14 lg:flex">
          <span className="relative grid size-11 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-gold/40" />
            <span data-pill-pin className="relative grid size-11 place-items-center rounded-full bg-gold/15 text-gold"><MapPin size={24} aria-hidden="true" /></span>
          </span>
          {['Niagara', 'Hamilton', 'Burlington'].map((c, i) => (
            <span key={c} className="flex items-center gap-5">
              {i > 0 && <i className="size-1.5 rounded-full bg-gold/70" />}
              <span data-pill-city className="relative">{c}</span>
            </span>
          ))}
          <span aria-hidden="true" data-pill-shine className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </div>
      <GridOverlay className="z-[2]" />
      <a href="#work" className="group absolute bottom-8 left-5 z-[13] hidden items-center gap-4 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-white/70 md:flex md:left-10 xl:left-14">
        <span className="grid size-11 place-items-center rounded-full border border-white/30 transition group-hover:border-gold group-hover:text-gold"><ChevronDown size={18} className="animate-bounce" aria-hidden="true" /></span>
        Scroll to continue
      </a>
    </section>
  )
}

