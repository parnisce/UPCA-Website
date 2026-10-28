import { useEffect, useState } from 'react'
import { ArrowRight, X } from 'lucide-react'
import Logo from './Logo'
import { NAV, CONTACT } from '../data/siteContent'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.body.style.overflow = open ? 'hidden' : ''
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled ? 'bg-navy-deep/85 backdrop-blur-md' : ''}`}>
        <nav aria-label="Main" className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-10 xl:px-14">
          <a href="#top" aria-label="UPCA home" className="rounded-xl bg-white px-3 py-1.5 shadow-lg shadow-black/20"><Logo className="h-9 md:h-10" /></a>
          <div className="flex items-center gap-3">
            <a href={CONTACT.consultationHref} className="btn-gold hidden !py-2.5 !text-xs sm:inline-flex">
              Book a Free Consultation <ArrowRight size={14} aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="site-menu"
              className="glass inline-flex min-h-11 items-center gap-2.5 rounded-full px-6 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:border-gold hover:text-gold"
            >
              <span className="size-1.5 rounded-full bg-gold" /> Menu
            </button>
          </div>
        </nav>
      </header>

      <div
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={`fixed inset-0 z-[60] bg-navy-deep text-white transition-all duration-500 ${open ? 'visible opacity-100' : 'invisible opacity-0'}`}
      >
        <div className="mx-auto flex h-full max-w-[1440px] flex-col px-5 md:px-10 xl:px-14">
          <div className="flex h-20 items-center justify-between">
            <span className="rounded-xl bg-white px-3 py-1.5"><Logo className="h-9 md:h-10" /></span>
            <button type="button" onClick={() => setOpen(false)} className="glass inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-xs font-bold uppercase tracking-[0.18em] hover:border-gold hover:text-gold">
              Close <X size={14} aria-hidden="true" />
            </button>
          </div>
          <ul className="flex flex-1 flex-col justify-center gap-2 md:gap-3">
            {NAV.map((n, i) => (
              <li key={n.href} className="overflow-hidden">
                <a
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="display group flex items-baseline gap-5 py-1 text-[2.6rem] text-white transition hover:text-gold sm:text-6xl md:text-7xl lg:text-8xl"
                  style={{ transform: open ? 'none' : 'translateY(100%)', transition: `transform .7s cubic-bezier(.2,.8,.2,1) ${0.08 * i}s, color .3s` }}
                >
                  <span className="font-mono text-xs font-normal tracking-[0.2em] text-gold">0{i + 1}</span>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 text-xs uppercase tracking-[0.2em] text-white/50">
            <span>Real Estate Marketing &amp; Media</span>
            <span>Niagara · Hamilton · Burlington</span>
          </div>
        </div>
      </div>
    </>
  )
}
