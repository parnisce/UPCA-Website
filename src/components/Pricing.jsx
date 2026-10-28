import { Check, ArrowRight } from 'lucide-react'
import Icon from './icons'
import GridOverlay from './GridOverlay'
import { PACKAGES, CONTACT } from '../data/siteContent'

export default function Pricing() {
  return (
    <section id="packages" className="relative bg-navy-deep pb-20 pt-24 text-white md:pb-28 md:pt-32">
      <GridOverlay />
      <div className="relative mx-auto max-w-[1240px] px-5 md:px-10 xl:px-14">
        <div data-reveal className="text-center">
          <p className="eyebrow !text-white/70">Our Packages</p>
          <h2 className="display mt-3 text-3xl md:text-4xl">Flexible Packages for Every Listing</h2>
          <p className="mt-4 text-sm text-white/70 md:text-base">Choose the right package for your property. Custom packages are also available.</p>
        </div>

        <ul data-stagger className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
          {PACKAGES.map((p) => (
            <li key={p.name}>
              <article
                className={`relative flex h-full flex-col rounded-[2rem] p-5 transition duration-300 hover:-translate-y-1 ${
                  p.popular ? 'border-2 border-gold bg-navy shadow-2xl shadow-gold/20' : 'glass'
                }`}
              >
                {p.popular && <span className="absolute right-6 top-0 -translate-y-1/2 rounded-full bg-gold px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-navy">Most Popular</span>}

                <header className="px-2 pt-3 text-center">
                  <span className="mx-auto grid size-14 place-items-center rounded-full bg-navy-deep text-gold ring-1 ring-white/10"><Icon name={p.icon} size={26} strokeWidth={1.5} /></span>
                  <h3 className="display mt-4 text-2xl">{p.name}</h3>
                  <p className="mt-2 text-xs text-white/70">{p.tag}</p>
                </header>

                <div className="mt-5 border-t border-white/15 pt-5">
                  <p className="bg-gold py-2 text-center text-sm font-extrabold uppercase tracking-wide text-navy">{p.band}</p>
                  <p className="mt-4 text-center text-sm text-white/80">Starting From</p>
                  <p className="display mt-2 text-center text-5xl">{p.price}</p>
                </div>

                {p.includes ? (
                  <p className="mt-5 flex items-center justify-center gap-2 border-y border-white/15 py-4 text-sm font-extrabold uppercase">
                    <Icon name="sparkles" size={16} className="text-gold" /> {p.includes}
                  </p>
                ) : (
                  <div className="mt-5 border-t border-white/15" />
                )}

                <div className="mt-5 flex-1 space-y-6 px-1">
                  {p.groups.map((g) => (
                    <div key={g.title} className="flex gap-4">
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-navy-deep text-gold ring-1 ring-white/10"><Icon name={g.icon} size={19} strokeWidth={1.6} /></span>
                      <div className="min-w-0">
                        <h4 className="pt-2 text-sm font-extrabold uppercase">{g.title}</h4>
                        <ul className="mt-3 space-y-2">
                          {g.items.map((it) => (
                            <li key={it} className="flex items-start gap-2 text-sm text-white/85">
                              <Check size={15} strokeWidth={3} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
                              {it}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-7 border-t border-white/15 pt-5">
                  <a href={CONTACT.consultationHref} className="btn-gold w-full justify-center !rounded-xl !py-3.5 !text-base">
                    {p.cta} <ArrowRight size={16} aria-hidden="true" />
                  </a>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
