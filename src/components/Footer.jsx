import { Mail, Phone } from 'lucide-react'
import Logo from './Logo'
import { NAV, CONTACT, FOOTER_SERVICES, AREAS } from '../data/siteContent'

const SOCIAL_PATHS = {
  instagram: 'M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 5.5A4.5 4.5 0 1012 16.5 4.5 4.5 0 0012 7.5zm5.2-2.2a1.1 1.1 0 100 2.2 1.1 1.1 0 000-2.2z',
  facebook: 'M14 8V6.5c0-.8.2-1.3 1.4-1.3H17V2.2C16.7 2.2 15.8 2 14.700 2 12.400 2 10.800 3.400 10.800 6V8H8v3.300h2.800V22H14V11.300h2.600L17 8z',
  youtube: 'M21.600 7.200a2.500 2.500 0 00-1.800-1.800C18.200 5 12 5 12 5s-6.200 0-7.800.4A2.500 2.500 0 002.400 7.200C2 8.800 2 12 2 12s0 3.200.4 4.800a2.500 2.500 0 001.800 1.800C5.800 19 12 19 12 19s6.200 0 7.800-.4a2.500 2.500 0 001.800-1.800C22 15.200 22 12 22 12s0-3.200-.4-4.800zM10 15V9l5.200 3z',
}

export default function Footer() {
  const socials = Object.entries(CONTACT.social).filter(([, url]) => url)
  return (
    <footer id="contact" className="relative bg-navy-deep pb-8 pt-16 text-white">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 xl:px-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
          <div>
            <span className="inline-block rounded-2xl bg-white px-4 py-2.5 shadow-lg shadow-black/20"><Logo className="h-11" /></span>
            <p className="mt-4 max-w-[16rem] text-xs leading-relaxed text-white/60">Real estate photography, video and marketing for Niagara, Hamilton, Burlington and surrounding areas.</p>
          </div>
          <FooterCol title="Services" items={FOOTER_SERVICES.map((s) => ({ label: s, href: '#services' }))} />
          <FooterCol title="Navigate" items={NAV} />
          <FooterCol title="Areas" items={AREAS.slice(0, 7).map((a) => ({ label: a }))} />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gold">Contact</h3>
            <ul className="mt-4 space-y-3 text-xs text-white/70">
              {CONTACT.email && <li><a className="flex items-center gap-2 hover:text-gold" href={`mailto:${CONTACT.email}`}><Mail size={14} aria-hidden="true" />{CONTACT.email}</a></li>}
              {CONTACT.phone && <li><a className="flex items-center gap-2 hover:text-gold" href={`tel:${CONTACT.phone}`}><Phone size={14} aria-hidden="true" />{CONTACT.phone}</a></li>}
              {!CONTACT.email && !CONTACT.phone && <li className="text-white/50">Contact details coming soon.</li>}
            </ul>
            {socials.length > 0 && (
              <ul className="mt-5 flex gap-3">
                {socials.map(([name, url]) => (
                  <li key={name}>
                    <a href={url} aria-label={name} target="_blank" rel="noreferrer" className="grid size-10 place-items-center rounded-full border border-white/20 text-white transition hover:border-gold hover:text-gold">
                      <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true"><path d={SOCIAL_PATHS[name]} /></svg>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <p className="mt-12 border-t border-white/10 pt-6 text-[0.7rem] text-white/45">© {new Date().getFullYear()} UPCA Real Estate Marketing &amp; Media. All rights reserved.</p>
      </div>
    </footer>
  )
}

function FooterCol({ title, items }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-widest text-gold">{title}</h3>
      <ul className="mt-4 space-y-2.5 text-xs text-white/70">
        {items.map((i) => (
          <li key={i.label}>{i.href ? <a href={i.href} className="transition hover:text-gold">{i.label}</a> : i.label}</li>
        ))}
      </ul>
    </div>
  )
}
