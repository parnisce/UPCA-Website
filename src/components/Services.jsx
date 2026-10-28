import Icon from './icons'
import AutoVideo from './AutoVideo'
import GridOverlay from './GridOverlay'
import { ArrowRight } from 'lucide-react'
import { SERVICES } from '../data/siteContent'

export default function Services() {
  return (
    <section id="services" className="relative overflow-hidden bg-navy-deep text-white pb-24 pt-24 md:pb-32 md:pt-36">
      <GridOverlay />
      {/* soft shared shape that carries the eye into the next section */}
      <div aria-hidden="true" className="absolute -right-40 top-0 h-[28rem] w-[40rem] rounded-full bg-gold/10 blur-3xl" />
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10 xl:px-14">
        <div data-reveal className="max-w-xl">
          <p className="eyebrow !text-white/70">Our Services</p>
          <h2 className="mt-3 display text-3xl font-bold leading-tight md:text-4xl">Complete Real Estate Marketing Solutions</h2>
          <p className="mt-4 text-sm text-white/70 md:text-base">High-quality media and marketing services to help you showcase properties, attract more buyers and grow your real estate business.</p>
        </div>

        <ul data-stagger className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 lg:grid-cols-3 lg:gap-8">
          {SERVICES.map((s) => (
            <li key={s.title} className="w-[17rem] shrink-0 snap-start md:w-auto">
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl glass transition duration-300 hover:-translate-y-2 hover:border-gold hover:shadow-xl hover:shadow-gold/20">
                <div className="aspect-[16/10] overflow-hidden"><AutoVideo src={s.video} poster={s.img} label={s.title} className="transition duration-700 group-hover:scale-110" /></div>
                <div className="relative flex flex-1 flex-col px-6 pb-6 pt-9">
                  <span className="absolute -top-6 left-6 grid size-12 place-items-center rounded-xl border border-gold/50 bg-navy-deep text-gold shadow-lg"><Icon name={s.icon} size={19} /></span>
                  <h3 className="text-lg font-bold leading-snug">{s.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/70">{s.text}</p>
                  <a href="#contact" className="mt-4 inline-flex min-h-6 items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-white group-hover:text-gold">Learn More <ArrowRight size={12} className="transition group-hover:translate-x-1" aria-hidden="true" /></a>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
