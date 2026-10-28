import { Quote, Star } from 'lucide-react'
import GridOverlay from './GridOverlay'
import { TESTIMONIALS } from '../data/siteContent'

const initials = (n) => n.split(' ').map((w) => w[0]).slice(-2).join('')

function Card({ t, hidden }) {
  return (
    <figure
      aria-hidden={hidden || undefined}
      className="glass group/card flex w-[19rem] shrink-0 flex-col rounded-3xl p-6 transition duration-300 hover:border-gold/60 hover:bg-white/[0.09] sm:w-[22rem]"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full border border-gold/40 bg-gold/10 text-sm font-bold text-gold">{initials(t.name)}</span>
        <span className="min-w-0 flex-1 leading-tight">
          <b className="block truncate text-base text-white">{t.name}</b>
          <span className="block truncate text-sm text-white/60">{t.role}</span>
        </span>
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/15 text-white/70 transition group-hover/card:border-gold group-hover/card:text-gold"><Quote size={15} aria-hidden="true" /></span>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="flex gap-0.5 text-gold" aria-label="5 out of 5 stars">
          {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={13} fill="currentColor" aria-hidden="true" />)}
        </span>
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-white/45">Sample review</span>
      </div>
      <blockquote className="mt-4 text-[0.95rem] leading-relaxed text-white/80">{t.text}</blockquote>
    </figure>
  )
}

function Row({ items, reverse }) {
  // content is rendered twice so the track can loop seamlessly; the copy is hidden from screen readers
  return (
    <div className="marquee overflow-hidden">
      <div className={`marquee-track ${reverse ? 'marquee-rev' : ''}`}>
        {items.map((t) => <Card key={t.name} t={t} />)}
        {items.map((t) => <Card key={`${t.name}-2`} t={t} hidden />)}
      </div>
    </div>
  )
}

export default function Testimonials() {
  const half = Math.ceil(TESTIMONIALS.length / 2)
  return (
    <section className="relative overflow-hidden bg-navy-deep pb-24 pt-24 text-white md:pb-32 md:pt-32">
      <GridOverlay />
      <div className="relative mx-auto max-w-[1240px] px-5 md:px-10 xl:px-14">
        <div data-reveal>
          <p className="eyebrow !text-white/70">What Our Clients Say</p>
          <h2 className="display mt-3 text-3xl md:text-5xl">Trusted by <span className="text-gold">Real Estate Professionals</span></h2>
        </div>
      </div>
      <div data-reveal className="relative mt-12 grid gap-4">
        <Row items={TESTIMONIALS.slice(0, half)} />
        <Row items={TESTIMONIALS.slice(half)} reverse />
      </div>
    </section>
  )
}
