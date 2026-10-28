import { ArrowRight, Check, Clock, MapPin, ShieldCheck } from 'lucide-react'
import Img from './Img'
import GridOverlay from './GridOverlay'
import { AREAS, AREA_PINS, IMG, CONTACT } from '../data/siteContent'

const BADGES = [[Clock, 'Fast Response'], [ShieldCheck, 'No Obligation'], [MapPin, 'Niagara, Hamilton, Burlington']]

// "Areas We Serve" and "Ready to Elevate Your Listings?" are one composition: two photos and two curved navy panels
// that overlap each other (desktop). On smaller screens the pieces simply stack.
export default function AreasAndCTA() {
  return (
    <section id="areas" className="relative overflow-hidden bg-navy-deep text-white lg:h-[58rem]">
      {/* curved panel outlines (objectBoundingBox so they scale with the panel) */}
      <svg width="0" height="0" aria-hidden="true" className="absolute">
        <defs>
          <clipPath id="panel-areas" clipPathUnits="objectBoundingBox">
            <path d="M0 0H0.9C0.96 0.14 0.9 0.32 0.94 0.5C0.97 0.62 0.99 0.7 0.96 0.78C0.62 0.83 0.3 1 0 0.9Z" />
          </clipPath>
          <clipPath id="panel-cta" clipPathUnits="objectBoundingBox">
            <path d="M0.07 0.3C0.22 0.06 0.5 0.34 0.76 0.14C0.88 0.05 0.95 0.04 1 0V1H0Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="flex flex-col lg:block">
        {/* Niagara photo with location pins */}
        <div className="relative order-2 aspect-[16/10] w-full lg:absolute lg:right-0 lg:top-0 lg:h-[66%] lg:w-[70%] lg:aspect-auto">
          <Img src={IMG.areas} alt="Aerial view of Niagara Falls and the surrounding region" parallax />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/50 via-transparent to-navy-deep/20" />
          {AREA_PINS.map((p) => (
            <span key={p.name} style={p.style} className="absolute flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-full bg-gold text-navy shadow-lg shadow-black/40"><MapPin size={18} aria-hidden="true" /></span>
              <span className="rounded-lg bg-navy-deep/85 px-3 py-1.5 text-xs font-bold text-white backdrop-blur sm:text-sm">{p.name}</span>
            </span>
          ))}
        </div>

        {/* house photo, bottom left */}
        <div className="relative order-4 aspect-[16/10] w-full lg:absolute lg:bottom-0 lg:left-0 lg:h-[46%] lg:w-[48%] lg:aspect-auto">
          <Img src={IMG.cta} alt="Luxury home exterior lit at dusk" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-navy-deep/60" />
        </div>

        {/* Areas panel (top-left, overlaps both photos) */}
        <div className="relative order-1 bg-navy px-5 pb-12 pt-24 md:px-10 lg:absolute lg:left-0 lg:top-0 lg:h-[68%] lg:w-[49%] lg:pb-0 lg:pl-[max(3.5rem,calc((100vw_-_1440px)/2_+_3.5rem))] lg:pr-24 lg:pt-28 lg:[clip-path:url(#panel-areas)]">
          <GridOverlay className="opacity-60" />
          <div data-reveal className="relative">
            <p className="eyebrow !text-white/70">Areas We Serve</p>
            <h2 className="display mt-3 text-3xl md:text-4xl">Niagara, Hamilton &amp; Burlington</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70 md:text-base">
              We provide real estate media and marketing services across Niagara, Hamilton, Burlington and surrounding areas.
            </p>
            <ul className="mt-6 grid max-w-md grid-cols-2 gap-x-8 gap-y-3">
              {AREAS.map((a) => (
                <li key={a} className="flex items-center gap-2.5 text-sm font-medium">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-gold text-navy"><Check size={12} strokeWidth={3} aria-hidden="true" /></span>
                  {a}
                </li>
              ))}
            </ul>
            <a href={CONTACT.consultationHref} className="btn-outline mt-8 !px-7">Book a Free Consultation <ArrowRight size={14} aria-hidden="true" /></a>
          </div>
        </div>

        {/* CTA panel (bottom-right, curved top edge sweeps over the Niagara photo) */}
        <div className="relative order-3 bg-navy px-5 pb-16 pt-20 md:px-10 lg:absolute lg:bottom-0 lg:right-0 lg:h-[52%] lg:w-[64%] lg:pb-0 lg:pl-28 lg:pr-[max(3.5rem,calc((100vw_-_1440px)/2_+_3.5rem))] lg:pt-0 lg:[clip-path:url(#panel-cta)]">
          <div className="relative flex h-full flex-col justify-center gap-8 lg:pt-16">
            <div data-reveal className="grid items-center gap-8 xl:grid-cols-[1fr_auto]">
              <div>
                <p className="eyebrow !text-white/70">Ready to Elevate Your Listings?</p>
                <h2 className="display mt-3 text-3xl md:text-4xl xl:text-[2.6rem]">Turn Your Next Listing Into a Standout.</h2>
              </div>
              <a href={CONTACT.consultationHref} className="btn-gold justify-center !px-8 !py-4">Book a Free Consultation <ArrowRight size={15} aria-hidden="true" /></a>
            </div>
            <ul className="flex flex-wrap gap-x-8 gap-y-3 text-xs font-semibold text-white/85 xl:justify-end">
              {BADGES.map(([I, t]) => (
                <li key={t} className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-full bg-gold text-navy"><I size={14} aria-hidden="true" /></span>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
